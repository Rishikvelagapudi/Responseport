const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const FormSession = require('./FormSession');

const Case = sequelize.define('Case', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved',
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  files: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['sessionId'] },
    { fields: ['status'] }
  ]
});

Case.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Case, { foreignKey: 'userId' });

Case.belongsTo(FormSession, { foreignKey: 'sessionId', as: 'session' });
FormSession.hasMany(Case, { foreignKey: 'sessionId' });

module.exports = Case;
