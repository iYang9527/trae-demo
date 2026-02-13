const { Bonus, BonusRule, Order } = require('../models');

// 计算订单奖金
const calculateOrderBonus = async (orderId) => {
  try {
    // 获取订单信息
    const order = await Order.findByPk(orderId, {
      include: [{ model: BonusRule, where: { status: 'active' } }]
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 检查订单金额是否满足最小要求
    if (order.amount < order.BonusRules[0]?.minOrderAmount) {
      return { upstreamBonus: 0, downstreamBonus: 0 };
    }

    // 获取奖金规则
    const bonusRule = order.BonusRules[0];
    if (!bonusRule) {
      return { upstreamBonus: 0, downstreamBonus: 0 };
    }

    // 计算上游奖金和下游奖金
    const upstreamBonus = order.amount * bonusRule.upstreamRate;
    const downstreamBonus = order.amount * bonusRule.downstreamRate;

    return { upstreamBonus, downstreamBonus };
  } catch (error) {
    console.error('计算订单奖金失败:', error);
    throw error;
  }
};

// 为订单生成奖金记录
const generateBonusRecords = async (orderId, upstreamUserId, downstreamUserId) => {
  try {
    // 计算奖金
    const { upstreamBonus, downstreamBonus } = await calculateOrderBonus(orderId);

    // 获取订单信息
    const order = await Order.findByPk(orderId);

    // 生成上游奖金记录
    if (upstreamBonus > 0 && upstreamUserId) {
      await Bonus.create({
        userId: upstreamUserId,
        channelId: order.channelId,
        orderId: order.id,
        amount: upstreamBonus,
        type: 'direct',
        status: 'pending'
      });
    }

    // 生成下游奖金记录
    if (downstreamBonus > 0 && downstreamUserId) {
      await Bonus.create({
        userId: downstreamUserId,
        channelId: order.channelId,
        orderId: order.id,
        amount: downstreamBonus,
        type: 'referral',
        status: 'pending'
      });
    }

    return { upstreamBonus, downstreamBonus };
  } catch (error) {
    console.error('生成奖金记录失败:', error);
    throw error;
  }
};

// 获取用户的奖金统计
const getUserBonusStats = async (userId) => {
  try {
    const bonuses = await Bonus.findAll({
      where: { userId },
      include: [{ model: Order }]
    });

    const totalPending = bonuses
      .filter(b => b.status === 'pending')
      .reduce((sum, b) => sum + b.amount, 0);

    const totalApproved = bonuses
      .filter(b => b.status === 'approved')
      .reduce((sum, b) => sum + b.amount, 0);

    const totalPaid = bonuses
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);

    return {
      totalPending,
      totalApproved,
      totalPaid,
      total: totalPending + totalApproved + totalPaid
    };
  } catch (error) {
    console.error('获取用户奖金统计失败:', error);
    throw error;
  }
};

module.exports = {
  calculateOrderBonus,
  generateBonusRecords,
  getUserBonusStats
};