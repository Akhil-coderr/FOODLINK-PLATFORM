const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config(); // Fallback to root .env if present
const http = require('http');
const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const { initSocket } = require('./sockets/socketHandler');
const { startExpiryMonitor } = require('./jobs/expiryMonitor');
const { ensureInitialDonations } = require('./seeds/seedAvailableFood');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Connect to Database (with embedded fallback if local MongoDB service is inactive)
    await connectDB();

    // 1b. Ensure initial available food records are populated idempotently
    try {
      await ensureInitialDonations();
    } catch (seedErr) {
      console.warn('⚠️ Non-blocking warning: Failed to ensure initial donations:', seedErr.message);
    }

    // 2. Create HTTP server
    const server = http.createServer(app);

    // 3. Initialize Socket.IO
    initSocket(server, process.env.CLIENT_URL);

    // 4. Start background food expiry monitor
    startExpiryMonitor();

    // 5. Start listening
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error('   Another FoodLink server (or another app) is still running.');
        console.error('   Stop that process, or run: npm run free-ports\n');
      } else {
        console.error(`\n❌ Server error: ${err.message}\n`);
      }
      process.exit(1);
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FoodLink Server active and listening on port ${PORT}`);
      console.log(`🌐 Web App: http://localhost:${PORT}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
      console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await closeDB();
        console.log('MongoDB connection closed. Server terminated safely.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (err) {
    console.error('Fatal Server Startup Error:', err.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
