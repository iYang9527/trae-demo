const express = require('express');
const router = express.Router();
const { Order, User, Channel } = require('../models');
const { authenticate } = require('../middleware/auth');

// 创建订单
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, channelId, orderNo, amount, description } = req.body;
    
    // 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 验证渠道是否存在
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({ error: '渠道不存在' });
    }
    
    // 验证订单号是否已存在
    const existingOrder = await Order.findOne({ where: { orderNo } });
    if (existingOrder) {
      return res.status(400).json({ error: '订单号已存在' });
    }
    
    // 创建订单
    const order = await Order.create({
      userId,
      channelId,
      orderNo,
      amount,
      description,
      paymentStatus: 'unpaid',
      daifuStatus: 'pending'
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ error: '创建订单失败' });
  }
});

// 获取订单列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, channelId, paymentStatus, daifuStatus } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (channelId) where.channelId = channelId;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (daifuStatus) where.daifuStatus = daifuStatus;
    
    const offset = (page - 1) * limit;
    
    const orders = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name', 'email', 'phone']
        },
        {
          model: Channel,
          attributes: ['id', 'name', 'url']
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
    console.error('获取订单列表失败:', error);
    res.status(500).json({ error: '获取订单列表失败' });
  }
});

// 获取单个订单详情
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name', 'email', 'phone']
        },
        {
          model: Channel,
          attributes: ['id', 'name', 'url']
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ error: '获取订单详情失败' });
  }
});

// 更新订单
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, daifuStatus, description } = req.body;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    // 状态流转逻辑
    if (paymentStatus) {
      // 验证支付状态是否合法
      const validPaymentStatuses = ['unpaid', 'paid', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ error: '无效的支付状态' });
      }
      
      // 支付状态流转规则
      if (order.paymentStatus === 'paid' && paymentStatus === 'unpaid') {
        return res.status(400).json({ error: '已支付的订单不能改为未支付' });
      }
      
      if (order.paymentStatus === 'refunded' && paymentStatus !== 'refunded') {
        return res.status(400).json({ error: '已退款的订单不能改为其他状态' });
      }
      
      order.paymentStatus = paymentStatus;
    }
    
    if (daifuStatus) {
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
      
      order.daifuStatus = daifuStatus;
    }
    
    if (description) {
      order.description = description;
    }
    
    await order.save();
    
    // 返回更新后的订单信息
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name', 'email', 'phone']
        },
        {
          model: Channel,
          attributes: ['id', 'name', 'url']
        }
      ]
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('更新订单失败:', error);
    res.status(500).json({ error: '更新订单失败' });
  }
});

// 删除订单
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    // 验证订单状态，只有未支付和代付未完成的订单可以删除
    if (order.paymentStatus === 'paid' || order.daifuStatus === 'completed') {
      return res.status(400).json({ error: '已支付或代付完成的订单不能删除' });
    }
    
    await order.destroy();
    
    res.json({ message: '订单删除成功' });
  } catch (error) {
    console.error('删除订单失败:', error);
    res.status(500).json({ error: '删除订单失败' });
  }
});

module.exports = router;