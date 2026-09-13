const mongoose = require('mongoose');
const User = require('../src/models/User');
const { connectDatabase } = require('../src/config/db');
const { mongoUri, validateEnv } = require('../src/config/env');
const { ROLES } = require('../src/constants/roles');

async function seed() {
  try {
    validateEnv();
    await connectDatabase(mongoUri);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@kycplatform.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    const verifierEmail = process.env.VERIFIER_EMAIL || 'verifier@kycplatform.com';
    const verifierPassword = process.env.VERIFIER_PASSWORD || 'Verifier@123456';
    const verifierName = process.env.VERIFIER_NAME || 'KYC Verifier';

    // Seed Admin User
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: ROLES.ADMIN,
      });
      console.log(`[SEED] Created Admin User: ${admin.email} (Password: ${adminPassword})`);
    } else {
      admin.role = ROLES.ADMIN;
      await admin.save();
      console.log(`[SEED] Updated existing user to Admin: ${admin.email}`);
    }

    // Seed Verifier User
    let verifier = await User.findOne({ email: verifierEmail });
    if (!verifier) {
      verifier = await User.create({
        name: verifierName,
        email: verifierEmail,
        password: verifierPassword,
        role: ROLES.VERIFIER,
      });
      console.log(`[SEED] Created Verifier User: ${verifier.email} (Password: ${verifierPassword})`);
    } else {
      verifier.role = ROLES.VERIFIER;
      await verifier.save();
      console.log(`[SEED] Updated existing user to Verifier: ${verifier.email}`);
    }

    console.log('[SEED] Seeding completed successfully!');
  } catch (error) {
    console.error('[SEED] Error seeding users:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
