const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config(); // Must be before sequelize so DATABASE_URL is loaded first
const sequelize = require('./config/database');

// Import models to ensure they sync
require('./models/User');
require('./models/Case');
require('./models/FormSession');
require('./models/Schema');
require('./models/AuditLog');
require('./models/MandatoryForm');
require('./models/Notification');



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Sync database
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database Connected and Synced'))
  .catch(err => console.error('❌ Database Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/mandatory', require('./routes/mandatory'));
app.use('/api/upload', require('./routes/upload'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
setInterval(() => console.log('Alive...'), 5000);
