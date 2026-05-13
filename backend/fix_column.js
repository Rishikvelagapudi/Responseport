const sequelize = require('./config/database');

async function fix() {
  try {
    await sequelize.query('ALTER TABLE "FormSessions" ALTER COLUMN "fields" TYPE JSONB USING "fields"::JSONB');
    console.log('✅ Altered column to JSONB');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
