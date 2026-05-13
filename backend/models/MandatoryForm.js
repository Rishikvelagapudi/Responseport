const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const MandatoryForm = sequelize.define('MandatoryForm', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  chargeSheet: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  missingCases: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  roadAccident: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  reportingSession: {
    type: DataTypes.ENUM('Morning', 'Afternoon', 'Evening'),
    allowNull: false,
    defaultValue: 'Morning',
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'date', 'reportingSession']
    }
  ]
});

MandatoryForm.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(MandatoryForm, { foreignKey: 'userId' });

module.exports = MandatoryForm;
