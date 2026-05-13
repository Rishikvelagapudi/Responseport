/**
 * seedAdmin.js
 * Creates or updates the admin user in the PostgreSQL database.
 * Run once: node seedAdmin.js
 */
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const User = require('./models/User');

// ── Seed configuration ─────────────────────────────────────────────
const ADMIN_EMAIL = 'admin13@gmail.com';
const ADMIN_PASSWORD = 'rishiktrue13';
const ADMIN_NAME = 'System Admin';
// ──────────────────────────────────────────────────────────────────

async function seedAdmin() {
  await sequelize.sync();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  let adminUser = await User.findOne({ where: { email: ADMIN_EMAIL } });

  if (adminUser) {
    adminUser.password = hashedPassword;
    adminUser.role = 'admin';
    await adminUser.save();
    console.log('✅ Admin user updated successfully.');
    console.log(`   Email: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });
    console.log('✅ Admin user created successfully.');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  }

  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
