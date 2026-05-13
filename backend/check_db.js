const FormSession = require('./models/FormSession');
const sequelize = require('./config/database');

async function check() {
  try {
    const sessions = await FormSession.findAll({ order: [['createdAt', 'DESC']], limit: 10 });
    sessions.forEach(s => {
      console.log('Title:', s.title);
      console.log('Fields:', s.fields);
      console.log('Fields Type:', typeof s.fields);
      console.log('Is Array:', Array.isArray(s.fields));
      console.log('------------------');
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
