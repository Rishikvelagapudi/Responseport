const User = require('./models/User');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');

async function seed() {
  await sequelize.sync();
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Rvs@Admin#2026', salt);
  
  const existing = await User.findOne({ where: { email: 'admin.rvs@system.com' } });
  if (!existing) {
    await User.create({
      name: 'Admin User',
      email: 'admin.rvs@system.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Admin user seeded');
  } else {
    console.log('Admin user already exists');
  }
  
  // Seed a station user too
  const stationSalt = await bcrypt.genSalt(10);
  const stationHashed = await bcrypt.hash('Stn01@Rvs#A1', stationSalt);
  const existingStation = await User.findOne({ where: { email: 'station01@rvs.com' } });
  if (!existingStation) {
    await User.create({
      name: 'Station 01',
      email: 'station01@rvs.com',
      password: stationHashed,
      role: 'station'
    });
    console.log('Station 01 seeded');
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
