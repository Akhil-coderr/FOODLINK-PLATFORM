require('dotenv').config({ path: './server/.env' });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function backupDatabases() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  try {
    await client.connect();
    console.log('Connected to Atlas for backup.');

    for (const dbName of ['foodlink', 'test']) {
      const db = client.db(dbName);
      const cols = await db.listCollections().toArray();
      const dbBackup = {};

      console.log(`\nBacking up database: ${dbName}...`);
      for (const col of cols) {
        const docs = await db.collection(col.name).find({}).toArray();
        dbBackup[col.name] = docs;
        console.log(` - Backed up ${docs.length} docs from ${col.name}`);
      }

      const filePath = path.join(backupDir, `${dbName}_backup_${timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(dbBackup, null, 2));
      console.log(`Saved backup to ${filePath}`);
    }

    console.log('\n✅ All database backups completed successfully.');
  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

backupDatabases();
