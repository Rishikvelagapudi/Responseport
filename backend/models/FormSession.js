const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const FormSession = sequelize.define('FormSession', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  fields: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  description: {
    type: DataTypes.TEXT,
  },
  targetStations: {
    type: DataTypes.JSONB,
    defaultValue: [], // Array of station user IDs
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium',
  },
  deadline: {
    type: DataTypes.DATE,
  }
}, {
  timestamps: true,
});

FormSession.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(FormSession, { foreignKey: 'createdBy' });

module.exports = FormSession;
