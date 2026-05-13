const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FormSchema = sequelize.define('FormSchema', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fieldName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  fieldType: {
    type: DataTypes.ENUM('text', 'dropdown', 'date', 'file', 'textarea', 'number'),
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = FormSchema;
