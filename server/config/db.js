const mongoose = require('mongoose');
const dns = require('dns');

// Some ISPs, VPNs, and NAT64 networks expose a broken IPv6 route to Atlas.
// Prefer IPv4 so the driver does not intermittently reset TLS connections.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Older Node versions do not support this option; ignore.
}

let mongoMemoryServer = null;
let usingInMemoryDb = false;
let listenersAttached = false;
let isClosing = false;
let suppressConnectionWarnings = false;

const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'foodlink';
const DEFAULT_TIMEOUT_MS = Number(process.env.MONGODB_TIMEOUT_MS) || 8000;
const SOCKET_TIMEOUT_MS = Number(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000;
const MAX_POOL_SIZE = Number(process.env.MONGODB_MAX_POOL_SIZE) || 10;
const MAX_CONNECT_ATTEMPTS = Number(process.env.MONGODB_CONNECT_ATTEMPTS) || 3;
const RETRY_DELAY_MS = Number(process.env.MONGODB_RETRY_DELAY_MS) || 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hide the password before writing a connection string to logs.
 * Example: mongodb+srv://user:secret@host/db -> mongodb+srv://user:****@host/db
 */
const maskMongoUri = (uri) => {
  if (!uri) return '<not set>';
  return uri.replace(/\/\/([^:/?#@]+):([^@/?#]*)@/, '//$1:****@');
};

/**
 * Atlas connection strings copied from the dashboard often end with a bare "/"
 * (no database name) or default to "test". Ensure the canonical project database
 * name is permanently enforced across all operations.
 */
const withDefaultDatabase = (uri) => {
  const trimmed = (uri || '').trim();
  if (!/^mongodb(\+srv)?:\/\//i.test(trimmed)) return trimmed;

  const [base, query] = trimmed.split('?');
  const schemeEnd = base.indexOf('://') + 3;
  const rest = base.slice(schemeEnd);
  const slashIndex = rest.indexOf('/');

  if (slashIndex === -1) {
    return `${base}/${DEFAULT_DB_NAME}${query ? `?${query}` : ''}`;
  }

  const hostPart = rest.slice(0, slashIndex);
  let dbName = rest.slice(slashIndex + 1);

  if (!dbName || dbName.toLowerCase() === 'test') {
    dbName = DEFAULT_DB_NAME;
  }

  return `${base.slice(0, schemeEnd)}${hostPart}/${dbName}${query ? `?${query}` : ''}`;
};

const buildMongoOptions = () => ({
  dbName: DEFAULT_DB_NAME,
  serverSelectionTimeoutMS: DEFAULT_TIMEOUT_MS,
  connectTimeoutMS: DEFAULT_TIMEOUT_MS,
  socketTimeoutMS: SOCKET_TIMEOUT_MS,
  maxPoolSize: MAX_POOL_SIZE,
  minPoolSize: 0,
  // Recycle idle sockets so a NAT/firewall cannot silently drop them.
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
  // Force IPv4. This avoids the "socket disconnected before secure TLS
  // connection was established" error seen on some IPv6/NAT64 networks.
  family: 4,
  autoSelectFamily: false,
});

const attachConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('disconnected', () => {
    if (!isClosing && !suppressConnectionWarnings) {
      console.warn('⚠️  MongoDB disconnected. The driver will try to reconnect...');
    }
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err) => {
    if (!isClosing && !suppressConnectionWarnings) {
      console.error(`⚠️  MongoDB connection error: ${err.message}`);
    }
  });
};

const startInMemoryDB = async () => {
  console.log('🔄 Starting embedded local in-memory database...');
  const { MongoMemoryServer } = require('mongodb-memory-server');

  mongoMemoryServer = await MongoMemoryServer.create({
    instance: { dbName: DEFAULT_DB_NAME },
    binary: { version: process.env.MONGODB_MEMORY_VERSION || '4.4.29' },
  });

  const memoryUri = mongoMemoryServer.getUri();
  const conn = await mongoose.connect(memoryUri);
  usingInMemoryDb = true;

  console.log(`✅ Embedded database running at: ${maskMongoUri(memoryUri)}`);
  console.log('⚠️  In-memory data is temporary and will be lost when the server stops.');
  return conn;
};

const getErrorText = (err) => {
  const parts = [err && err.message];

  if (err && err.reason) parts.push(err.reason.message);
  if (err && Array.isArray(err.errors)) {
    err.errors.forEach((inner) => parts.push(inner && inner.message));
  }

  return parts.filter(Boolean).join(' | ');
};

const isAuthError = (err, text) => {
  if (err && err.code === 18) return true;
  if (err && err.reason && err.reason.code === 18) return true;
  if (err && Array.isArray(err.errors)) {
    return err.errors.some(
      (inner) => inner && (inner.code === 18 || /bad auth|authentication failed/i.test(inner.message || ''))
    );
  }
  return /bad auth|authentication failed|SCRAM/i.test(text);
};

const isTransientNetworkError = (err, text) =>
  !isAuthError(err, text) &&
  /ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|ENOTFOUND|EAI_AGAIN|socket disconnected|secure TLS|server selection|topology|network/i.test(
    text
  );

const explainMongoError = (err) => {
  const text = getErrorText(err);

  if (isAuthError(err, text)) {
    return {
      title: 'MongoDB authentication failed (the username or password was rejected).',
      steps: [
        'Open MongoDB Atlas → Database Access and confirm the database user exists.',
        "Reset that user's password and paste the NEW password into server/.env.",
        'Use the Database Access user password — NOT your Atlas account login password.',
        'The username in MONGODB_URI is case-sensitive and must match the Atlas user exactly.',
        'If the password contains @ : / ? # [ ] %, URL-encode those characters in the URI.',
      ],
    };
  }

  if (/whitelist|not allowed to access|IP address is not|network access/i.test(text)) {
    return {
      title: 'MongoDB Atlas rejected this machine\'s IP address.',
      steps: [
        'Open MongoDB Atlas → Network Access.',
        'Add your current public IP, or use 0.0.0.0/0 for local development only.',
        'Wait for the status to change from Pending to Active, then restart the server.',
      ],
    };
  }

  if (/ENOTFOUND|querySrv|EAI_AGAIN|DNS/i.test(text)) {
    return {
      title: 'The MongoDB host name could not be resolved.',
      steps: [
        'Check the cluster host name in MONGODB_URI (it comes after the @ symbol).',
        'Verify your internet connection or DNS/firewall settings.',
        'If the cluster was deleted or paused, copy a fresh connection string from Atlas.',
      ],
    };
  }

  if (/ECONNREFUSED/i.test(text)) {
    return {
      title: 'No MongoDB server is listening at the configured address.',
      steps: [
        'For a local database, start the MongoDB service (mongod) on port 27017.',
        'For Atlas, make sure the URI starts with mongodb+srv:// and the cluster is not paused.',
      ],
    };
  }

  if (/ECONNRESET|socket disconnected|secure TLS|timed out|ETIMEDOUT|server selection/i.test(text)) {
    return {
      title: 'The network connection to MongoDB was interrupted.',
      steps: [
        'This is usually a firewall, antivirus, VPN, or unstable internet connection.',
        'The server now forces IPv4 and retries automatically; try again in a moment.',
        'If it keeps happening, disable any TLS-inspecting antivirus/VPN or switch networks.',
        'Check MongoDB Atlas → Network Access and allow your current public IP.',
        'Increase MONGODB_TIMEOUT_MS in server/.env if your connection is slow.',
      ],
    };
  }

  return {
    title: 'MongoDB connection failed.',
    steps: [
      'Verify MONGODB_URI in server/.env.',
      'Confirm the cluster is running and the database user credentials are correct.',
      'Check MongoDB Atlas → Network Access for this machine\'s public IP.',
    ],
  };
};

const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodlink';
  const uri = withDefaultDatabase(rawUri);

  // Explicit in-memory mode (useful for demos/tests without a real database).
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    try {
      return await startInMemoryDB();
    } catch (err) {
      console.error('\n======================================================');
      console.error('❌ FAILED TO START IN-MEMORY MONGODB');
      console.error(`Reason: ${err.message}`);
      console.error('======================================================\n');
      throw err;
    }
  }

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt += 1) {
    try {
      const conn = await mongoose.connect(uri, buildMongoOptions());
      attachConnectionListeners();
      console.log(`✅ MongoDB Connected successfully: Database [${conn.connection.name}] on host [${conn.connection.host}]`);
      console.log(`🔒 Connected to canonical database: "${conn.connection.name}" (Credentials protected)`);
      return conn;
    } catch (err) {
      lastError = err;
      const text = getErrorText(err);

      if (attempt < MAX_CONNECT_ATTEMPTS && isTransientNetworkError(err, text)) {
        console.warn(
          `⚠️  MongoDB connection attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed (${err.message}). Retrying in ${RETRY_DELAY_MS}ms...`
        );
        suppressConnectionWarnings = true;
        try {
          await mongoose.disconnect();
        } catch {
          // Ignore cleanup errors.
        }
        suppressConnectionWarnings = false;
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      break;
    }
  }

  // Optional development fallback: keep the API usable when the real DB is
  // unreachable. Disabled by default so real data is never silently lost.
  if (process.env.ALLOW_IN_MEMORY_FALLBACK === 'true' && process.env.NODE_ENV !== 'production') {
    console.warn('\n⚠️  Real MongoDB is unavailable. Falling back to an in-memory database.');
    console.warn('   This data is temporary and will be lost when the server stops.\n');
    try {
      return await startInMemoryDB();
    } catch (fallbackErr) {
      console.error(`❌ In-memory fallback also failed: ${fallbackErr.message}`);
    }
  }

  const info = explainMongoError(lastError);

  console.error('\n======================================================');
  console.error('❌ MONGODB CONNECTION ERROR');
  console.error(`URI:    ${maskMongoUri(uri)}`);
  console.error(`Reason: ${lastError.message}`);
  if (lastError.reason && lastError.reason.message && lastError.reason.message !== lastError.message) {
    console.error(`Detail: ${lastError.reason.message}`);
  }
  console.error(`\n👉 ${info.title}`);
  console.error('🛠️  HOW TO RESOLVE:');
  info.steps.forEach((step, index) => console.error(`   ${index + 1}. ${step}`));
  console.error('\n💡 To run without MongoDB for a quick demo, set USE_IN_MEMORY_DB=true in server/.env');
  console.error('======================================================\n');

  throw lastError;
};

const closeDB = async () => {
  isClosing = true;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
  usingInMemoryDb = false;
  isClosing = false;
  suppressConnectionWarnings = false;
};

const isUsingInMemoryDb = () => usingInMemoryDb;

module.exports = { connectDB, closeDB, isUsingInMemoryDb };
