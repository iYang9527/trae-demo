const express = require('express');
const router = express.Router();
const { Order, Bonus } = require('../models');
const { authenticate } = require('../middleware/auth');

// 获取代付状态列表
router.get('/status', authenticate, async (req, res) => {
  try {
    const statusList = [
      { value: 'pending', label: '待代付' },
      { value: 'completed', label: '代付完成' },
      { value: 'failed', label: '代付失败' }
    ];
    res.json(statusList);
  } catch (error) {
    console.error('获取代付状态列表失败:', error);
    res.status(500).json({ error: '获取代付状态列表失败' });
  }
});

// 更新订单代付状态
router.put('/:orderId/status', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { daifuStatus } = req.body;
    
    // 验证订单是否存在
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    // 验证代付状态是否合法
    const validDaifuStatuses = ['pending', 'completed', 'failed'];
    if (!validDaifuStatuses.includes(daifuStatus)) {
      return res.status(400).json({ error: '无效的代付状态' });
    }
    
    // 代付状态流转规则
    if (order.daifuStatus === 'completed' && daifuStatus !== 'completed') {
      return res.status(400).json({ error: '已完成代付的订单不能改为其他状态' });
    }
    
    if (order.daifuStatus === 'failed' && daifuStatus !== 'failed') {
      return res.status(400).json({ error: '代付失败的订单不能改为其他状态' });
    }
    
    // 保存旧状态
    const oldDaifuStatus = order.daifuStatus;
    
    // 更新代付状态
    order.daifuStatus = daifuStatus;
    await order.save();
    
    // 代付状态与奖金分配的关联逻辑
    if (daifuStatus === 'completed' && oldDaifuStatus !== 'completed') {
      // 代付完成时，更新相关奖金状态为approved
      await Bonus.update(
        { status: 'approved' },
        { where: { orderId, status: 'pending' } }
      );
    } else if (daifuStatus === 'failed' && oldDaifuStatus !== 'failed') {
      // 代付失败时，更新相关奖金状态为pending
      await Bonus.update(
        { status: 'pending' },
        { where: { orderId, status: 'approved' } }
      );
    }
    
    // 返回更新后的订单信息
    const updatedOrder = await Order.findByPk(orderId, {
      include: [
        {
          model: Bonus,
          attributes: ['id', 'userId', 'amount', 'type', 'status']
        }
      ]
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('更新代付状态失败:', error);
    res.status(500).json({ error: '更新代付状态失败' });
  }
});

// 获取订单的代付状态历史
router.get('/:orderId/history', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 验证订单是否存在
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    // 这里可以扩展为从数据库中获取历史记录
    // 目前返回订单的当前状态和创建时间
    const history = [
      {
        status: 'pending',
        changedAt: order.createdAt,
        changedBy: 'system'
      },
      {
        status: order.daifuStatus,
        changedAt: order.updatedAt,
        changedBy: 'system'
      }
    ];
    
    res.json(history);
  } catch (error) {
    console.error('获取代付状态历史失败:', error);
    res.status(500).json({ error: '获取代付状态历史失败' });
  }
});

// 获取待代付订单列表
router.get('/pending', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const orders = await Order.findAndCountAll({
      where: { daifuStatus: 'pending' },
      include: [
        {
          model: Bonus,
          attributes: ['id', 'userId', 'amount', 'type', 'status']
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      total: orders.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: orders.rows
    });
  } catch (error) {
    console.error('获取待代付订单列表失败:', error);
    res.status(500).json({ error: '获取待代付订单列表失败' });
  }
});

module.exports = router;