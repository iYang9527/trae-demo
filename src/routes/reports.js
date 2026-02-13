const express = require('express');
const router = express.Router();
const { Bonus, Channel, Order, User } = require('../models');
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');

// 奖金统计报表
router.get('/bonuses', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, status, channelId } = req.query;
    const where = {};

    if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }

    if (status) {
      where.status = status;
    }

    if (channelId) {
      where.channelId = channelId;
    }

    // 奖金统计
    const bonusStats = await Bonus.findAll({
      where,
      include: [
        { model: Channel },
        { model: User, attributes: ['id', 'username', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // 计算总金额
    const totalAmount = bonusStats.reduce((sum, bonus) => {
      return sum + parseFloat(bonus.amount);
    }, 0);

    // 按状态分组统计
    const statusStats = bonusStats.reduce((acc, bonus) => {
      if (!acc[bonus.status]) {
        acc[bonus.status] = {
          count: 0,
          amount: 0
        };
      }
      acc[bonus.status].count++;
      acc[bonus.status].amount += parseFloat(bonus.amount);
      return acc;
    }, {});

    // 按渠道分组统计
    const channelStats = bonusStats.reduce((acc, bonus) => {
      if (!bonus.Channel) return acc;
      const channelName = bonus.Channel.name;
      if (!acc[channelName]) {
        acc[channelName] = {
          count: 0,
          amount: 0
        };
      }
      acc[channelName].count++;
      acc[channelName].amount += parseFloat(bonus.amount);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalAmount,
        statusStats,
        channelStats,
        bonusList: bonusStats
      }
    });
  } catch (error) {
    console.error('获取奖金统计失败:', error);
    res.status(500).json({ success: false, message: '获取奖金统计失败' });
  }
});

// 渠道业绩统计报表
router.get('/channels/performance', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }

    // 获取所有渠道
    const channels = await Channel.findAll();
    const channelPerformance = [];

    for (const channel of channels) {
      // 获取渠道的订单统计
      const channelOrders = await Order.findAll({
        where: {
          channelId: channel.id,
          ...where
        }
      });

      // 计算订单总金额和数量
      const totalOrderAmount = channelOrders.reduce((sum, order) => {
        return sum + parseFloat(order.amount);
      }, 0);

      const totalOrderCount = channelOrders.length;

      // 计算完成代付的订单金额
      const completedOrderAmount = channelOrders
        .filter(order => order.daifuStatus === 'completed')
        .reduce((sum, order) => {
          return sum + parseFloat(order.amount);
        }, 0);

      // 获取渠道的奖金统计
      const channelBonuses = await Bonus.findAll({
        where: {
          channelId: channel.id,
          ...where
        }
      });

      const totalBonusAmount = channelBonuses.reduce((sum, bonus) => {
        return sum + parseFloat(bonus.amount);
      }, 0);

      channelPerformance.push({
        channelId: channel.id,
        channelName: channel.name,
        totalOrderCount,
        totalOrderAmount,
        completedOrderAmount,
        totalBonusAmount,
        performanceRate: totalOrderAmount > 0 ? (completedOrderAmount / totalOrderAmount) * 100 : 0
      });
    }

    // 按业绩排序
    channelPerformance.sort((a, b) => b.totalOrderAmount - a.totalOrderAmount);

    res.status(200).json({
      success: true,
      data: channelPerformance
    });
  } catch (error) {
    console.error('获取渠道业绩统计失败:', error);
    res.status(500).json({ success: false, message: '获取渠道业绩统计失败' });
  }
});

// 代付统计报表
router.get('/daifu', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, daifuStatus } = req.query;
    const where = {};

    if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }

    if (daifuStatus) {
      where.daifuStatus = daifuStatus;
    }

    // 获取代付相关订单
    const orders = await Order.findAll({
      where,
      include: [
        { model: Channel },
        { model: User, attributes: ['id', 'username', 'name'] },
        {
          model: Bonus,
          attributes: ['id', 'amount', 'status', 'type']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // 计算统计数据
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => {
      return sum + parseFloat(order.amount);
    }, 0);

    // 按代付状态分组统计
    const statusStats = orders.reduce((acc, order) => {
      if (!acc[order.daifuStatus]) {
        acc[order.daifuStatus] = {
          count: 0,
          amount: 0
        };
      }
      acc[order.daifuStatus].count++;
      acc[order.daifuStatus].amount += parseFloat(order.amount);
      return acc;
    }, {});

    // 按渠道分组统计
    const channelStats = orders.reduce((acc, order) => {
      if (!order.Channel) return acc;
      const channelName = order.Channel.name;
      if (!acc[channelName]) {
        acc[channelName] = {
          count: 0,
          amount: 0
        };
      }
      acc[channelName].count++;
      acc[channelName].amount += parseFloat(order.amount);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalAmount,
        statusStats,
        channelStats,
        orderList: orders
      }
    });
  } catch (error) {
    console.error('获取代付统计失败:', error);
    res.status(500).json({ success: false, message: '获取代付统计失败' });
  }
});

// 导出奖金统计为CSV
router.get('/bonuses/export', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, status, channelId } = req.query;
    const where = {};

    if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }

    if (status) {
      where.status = status;
    }

    if (channelId) {
      where.channelId = channelId;
    }

    // 获取奖金数据
    const bonuses = await Bonus.findAll({
      where,
      include: [
        { model: Channel },
        { model: User, attributes: ['id', 'username', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // 生成CSV头部
    let csvContent = 'ID,用户ID,用户名,渠道ID,渠道名称,奖金金额,奖金类型,状态,创建时间\n';

    // 生成CSV内容
    bonuses.forEach(bonus => {
      const row = [
        bonus.id,
        bonus.userId,
        bonus.User ? bonus.User.username : '',
        bonus.channelId,
        bonus.Channel ? bonus.Channel.name : '',
        bonus.amount,
        bonus.type === 'direct' ? '直接奖金' : '推荐奖金',
        bonus.status === 'pending' ? '待处理' : bonus.status === 'approved' ? '已批准' : '已支付',
        bonus.createdAt
      ];
      csvContent += row.map(item => `"${item}"`).join(',') + '\n';
    });

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=bonus-report-${new Date().toISOString().slice(0, 10)}.csv`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('导出奖金统计失败:', error);
    res.status(500).json({ success: false, message: '导出奖金统计失败' });
  }
});

// 导出渠道业绩统计为CSV
router.get('/channels/performance/export', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }

    // 获取所有渠道
    const channels = await Channel.findAll();
    const channelPerformance = [];

    for (const channel of channels) {
      // 获取渠道的订单统计
      const channelOrders = await Order.findAll({
        where: {
          channelId: channel.id,
          ...where
        }
      });

      // 计算订单总金额和数量
      const totalOrderAmount = channelOrders.reduce((sum, order) => {
        return sum + parseFloat(order.amount);
      }, 0);

      const totalOrderCount = channelOrders.length;

      // 计算完成代付的订单金额
      const completedOrderAmount = channelOrders
        .filter(order => order.daifuStatus === 'completed')
        .reduce((sum, order) => {
          return sum + parseFloat(order.amount);
        }, 0);

      // 获取渠道的奖金统计
      const channelBonuses = await Bonus.findAll({
        where: {
          channelId: channel.id,
          ...where
        }
      });

      const totalBonusAmount = channelBonuses.reduce((sum, bonus) => {
        return sum + parseFloat(bonus.amount);
      }, 0);

      channelPerformance.push({
        channelId: channel.id,
        channelName: channel.name,
        totalOrderCount,
        totalOrderAmount,
        completedOrderAmount,
        totalBonusAmount,
        performanceRate: totalOrderAmount > 0 ? (completedOrderAmount / totalOrderAmount) * 100 : 0
      });
    }

    // 生成CSV头部
    let csvContent = '渠道ID,渠道名称,订单总数,订单总金额,已完成代付金额,奖金总金额,业绩完成率(%)\n';

    // 生成CSV内容
    channelPerformance.forEach(item => {
      const row = [
        item.channelId,
        item.channelName,
        item.totalOrderCount,
        item.totalOrderAmount,
        item.completedOrderAmount,
        item.totalBonusAmount,
        item.performanceRate.toFixed(2)
      ];
      csvContent += row.map(item => `"${item}"`).join(',') + '\n';
    });

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=channel-performance-report-${new Date().toISOString().slice(0, 10)}.csv`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('导出渠道业绩统计失败:', error);
    res.status(500).json({ success: false, message: '导出渠道业绩统计失败' });
  }
});

// 导出代付统计为CSV
router.get('/daifu/export', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, daifuStatus } = req.query;
    const where = {};

    if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate)
      };
    }

    if (daifuStatus) {
      where.daifuStatus = daifuStatus;
    }

    // 获取代付相关订单
    const orders = await Order.findAll({
      where,
      include: [
        { model: Channel },
        { model: User, attributes: ['id', 'username', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // 生成CSV头部
    let csvContent = '订单ID,订单号,用户ID,用户名,渠道ID,渠道名称,订单金额,代付状态,创建时间\n';

    // 生成CSV内容
    orders.forEach(order => {
      const daifuStatusText = order.daifuStatus === 'pending' ? '待代付' : order.daifuStatus === 'completed' ? '代付完成' : '代付失败';
      const row = [
        order.id,
        order.orderNo,
        order.userId,
        order.User ? order.User.username : '',
        order.channelId,
        order.Channel ? order.Channel.name : '',
        order.amount,
        daifuStatusText,
        order.createdAt
      ];
      csvContent += row.map(item => `"${item}"`).join(',') + '\n';
    });

    // 设置响应头
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=daifu-report-${new Date().toISOString().slice(0, 10)}.csv`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('导出代付统计失败:', error);
    res.status(500).json({ success: false, message: '导出代付统计失败' });
  }
});

module.exports = router;