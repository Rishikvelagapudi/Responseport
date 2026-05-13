const FormSession = require('./models/FormSession');
const sequelize = require('./config/database');

async function testInsert() {
  try {
    const fields = [
      { label: 'Field 1', fieldType: 'text', fieldName: 'f1', isRequired: false, options: [] },
      { label: 'Field 2', fieldType: 'text', fieldName: 'f2', isRequired: false, options: [] }
    ];
    const s = await FormSession.create({ 
      sessionNo: 'TEST-' + Date.now(), 
      title: 'Manual Test', 
      fields: fields 
    });
    console.log('Created:', s.title, 'Fields Count:', s.fields.length);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testInsert();
