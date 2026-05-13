const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Case = require('./Case');

const AuditLog = sequelize.define('AuditLog', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.JSON,
  },
}, {
  timestamps: true,
});

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'userId' });

AuditLog.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });
Case.hasMany(AuditLog, { foreignKey: 'caseId' });

module.exports = AuditLog;
