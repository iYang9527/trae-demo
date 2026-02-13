const User = require('./User');
const Channel = require('./Channel');
const Order = require('./Order');
const Bonus = require('./Bonus');
const Share = require('./Share');
const BonusRule = require('./BonusRule');

// 建立关联关系
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Bonus, { foreignKey: 'userId' });
Bonus.belongsTo(User, { foreignKey: 'userId' });

Channel.hasMany(Order, { foreignKey: 'channelId' });
Order.belongsTo(Channel, { foreignKey: 'channelId' });

Channel.hasMany(Bonus, { foreignKey: 'channelId' });
Bonus.belongsTo(Channel, { foreignKey: 'channelId' });

Order.hasMany(Bonus, { foreignKey: 'orderId' });
Bonus.belongsTo(Order, { foreignKey: 'orderId' });

// 奖金规则关联
Channel.hasMany(BonusRule, { foreignKey: 'channelId' });
BonusRule.belongsTo(Channel, { foreignKey: 'channelId' });

// 分享相关关联
User.hasMany(Share, { foreignKey: 'userId' });
Share.belongsTo(User, { foreignKey: 'userId' });

Channel.hasMany(Share, { foreignKey: 'channelId' });
Share.belongsTo(Channel, { foreignKey: 'channelId' });

module.exports = {
  User,
  Channel,
  Order,
  Bonus,
  Share,
  BonusRule
};