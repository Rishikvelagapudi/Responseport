/**
 * seedStations.js
 * Creates the station user accounts in the PostgreSQL database.
 * Run once: node seedStations.js
 */
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const User = require('./models/User');

const STATIONS = [
  { name: 'Station 01', email: 'station01@rvs.com', password: 'Stn01@Rvs#A1' },
  { name: 'Station 02', email: 'station02@rvs.com', password: 'Stn02@Rvs#B2' },
  { name: 'Station 03', email: 'station03@rvs.com', password: 'Stn03@Rvs#C3' },
  { name: 'Station 04', email: 'station04@rvs.com', password: 'Stn04@Rvs#D4' },
  { name: 'Station 05', email: 'station05@rvs.com', password: 'Stn05@Rvs#E5' },
  { name: 'Station 06', email: 'station06@rvs.com', password: 'Stn06@Rvs#F6' },
  { name: 'Station 07', email: 'station07@rvs.com', password: 'Stn07@Rvs#G7' },
  { name: 'Station 08', email: 'station08@rvs.com', password: 'Stn08@Rvs#H8' },
];

async function seedStations() {
  try {
    await sequelize.sync();
    console.log('Database synced.');

    for (const station of STATIONS) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(station.password, salt);

      const [user, created] = await User.findOrCreate({
        where: { email: station.email },
        defaults: {
          name: station.name,
          password: hashedPassword,
          role: 'station'
        }
      });

      if (created) {
        console.log(`✅ Created user: ${station.email}`);
      } else {
        // Update password if user already exists to ensure it matches the request
        user.password = hashedPassword;
        user.name = station.name;
        user.role = 'station';
        await user.save();
        console.log(`🔄 Updated user: ${station.email}`);
      }
    }

    console.log('All station accounts have been seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding stations:', error);
    process.exit(1);
  }
}

seedStations();
