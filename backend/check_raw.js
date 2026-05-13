const sequelize = require('./config/database');

async function check() {
  try {
    const [results] = await sequelize.query('SELECT * FROM "FormSessions" ORDER BY "createdAt" DESC LIMIT 1');
    console.log('Raw Result:', JSON.stringify(results[0], null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
