const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bonus = sequelize.define('Bonus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  channelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'channels',
      key: 'id'
    }
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('direct', 'referral'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'paid'),
    defaultValue: 'pending'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'bonuses',
  timestamps: true
});

module.exports = Bonus;