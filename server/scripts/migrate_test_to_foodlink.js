require('dotenv').config({ path: './server/.env' });
const { MongoClient, ObjectId } = require('mongodb');

async function migrateData() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to Atlas for migration.');

    const testDb = client.db('test');
    const foodlinkDb = client.db('foodlink');

    // 1. Migrate Users
    console.log('\n--- Migrating Users ---');
    const testUsers = await testDb.collection('users').find({}).toArray();
    for (const u of testUsers) {
      const email = u.email.toLowerCase().trim();
      const existing = await foodlinkDb.collection('users').findOne({ email });
      if (!existing) {
        console.log(`Migrating user: ${u.name} (${email}) with ID: ${u._id}`);
        await foodlinkDb.collection('users').insertOne(u);
      } else {
        console.log(`User already exists in foodlink: ${email}`);
      }
    }

    // 2. Migrate Volunteer Profiles
    console.log('\n--- Migrating Volunteer Profiles ---');
    const testVolunteerProfiles = await testDb.collection('volunteerprofiles').find({}).toArray();
    for (const vp of testVolunteerProfiles) {
      const existing = await foodlinkDb.collection('volunteerprofiles').findOne({ userId: vp.userId });
      if (!existing) {
        console.log(`Migrating volunteer profile for userId: ${vp.userId} with ID: ${vp._id}`);
        await foodlinkDb.collection('volunteerprofiles').insertOne(vp);
      } else {
        console.log(`Volunteer profile already exists in foodlink for userId: ${vp.userId}`);
      }
    }

    // 3. Migrate Contact Messages
    console.log('\n--- Migrating Contact Messages ---');
    const testMessages = await testDb.collection('contactmessages').find({}).toArray();
    for (const msg of testMessages) {
      const existing = await foodlinkDb.collection('contactmessages').findOne({
        email: msg.email,
        message: msg.message,
      });
      if (!existing) {
        console.log(`Migrating contact message from: ${msg.name} (${msg.email})`);
        await foodlinkDb.collection('contactmessages').insertOne(msg);
      } else {
        console.log(`Contact message already exists in foodlink for: ${msg.email}`);
      }
    }

    // 4. Migrate Notifications
    console.log('\n--- Migrating Notifications ---');
    const testNotifs = await testDb.collection('notifications').find({}).toArray();
    for (const n of testNotifs) {
      if (n.recipientId) {
        const userExists = await foodlinkDb.collection('users').findOne({ _id: n.recipientId });
        if (userExists) {
          const existingNotif = await foodlinkDb.collection('notifications').findOne({ _id: n._id });
          if (!existingNotif) {
            console.log(`Migrating notification "${n.title}" for user ${n.recipientId}`);
            await foodlinkDb.collection('notifications').insertOne(n);
          }
        }
      }
    }

    // 5. Verify Akhil in foodlink
    console.log('\n--- Verification in foodlink ---');
    const akhil = await foodlinkDb.collection('users').findOne({ email: 'akhil31102006@gmail.com' });
    console.log('Akhil in foodlink:', akhil ? { id: akhil._id, name: akhil.name, role: akhil.role } : 'NOT FOUND');
    if (akhil) {
      const akhilProfile = await foodlinkDb.collection('volunteerprofiles').findOne({ userId: akhil._id });
      console.log('Akhil profile in foodlink:', akhilProfile ? { id: akhilProfile._id, points: akhilProfile.totalPoints } : 'NOT FOUND');
      const akhilNotifs = await foodlinkDb.collection('notifications').find({ recipientId: akhil._id }).toArray();
      console.log(`Akhil notifications in foodlink: ${akhilNotifs.length}`);
    }

    console.log('\n✅ Data migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.close();
  }
}

migrateData();
