const express = require('express');
const router = express.Router();
const { Bonus, BonusRule, Order, User } = require('../models');
const { generateBonusRecords, getUserBonusStats } = require('../utils/bonus');

// 创建或更新奖金规则
router.post('/rules', async (req, res) => {
  try {
    const { channelId, upstreamRate, downstreamRate, minOrderAmount, status } = req.body;

    // 检查是否已存在规则
    let bonusRule = await BonusRule.findOne({ where: { channelId } });

    if (bonusRule) {
      // 更新现有规则
      bonusRule = await bonusRule.update({
        upstreamRate,
        downstreamRate,
        minOrderAmount,
        status
      });
    } else {
      // 创建新规则
      bonusRule = await BonusRule.create({
        channelId,
        upstreamRate,
        downstreamRate,
        minOrderAmount,
        status
      });
    }

    res.status(200).json({ success: true, data: bonusRule });
  } catch (error) {
    console.error('创建/更新奖金规则失败:', error);
    res.status(500).json({ success: false, message: '创建/更新奖金规则失败' });
  }
});

// 获取奖金规则列表
router.get('/rules', async (req, res) => {
  try {
    const { channelId } = req.query;
    const where = {};

    if (channelId) {
      where.channelId = channelId;
    }

    const bonusRules = await BonusRule.findAll({ where });
    res.status(200).json({ success: true, data: bonusRules });
  } catch (error) {
    console.error('获取奖金规则失败:', error);
    res.status(500).json({ success: false, message: '获取奖金规则失败' });
  }
});

// 为订单生成奖金
router.post('/generate', async (req, res) => {
  try {
    const { orderId, upstreamUserId, downstreamUserId } = req.body;

    const result = await generateBonusRecords(orderId, upstreamUserId, downstreamUserId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('生成奖金记录失败:', error);
    res.status(500).json({ success: false, message: '生成奖金记录失败' });
  }
});

// 获取奖金记录列表
router.get('/', async (req, res) => {
  try {
    const { userId, status, type, orderId } = req.query;
    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    const bonuses = await Bonus.findAll({
      where,
      include: [
        { model: Order },
        { model: User, attributes: ['id', 'username', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: bonuses });
  } catch (error) {
    console.error('获取奖金记录失败:', error);
    res.status(500).json({ success: false, message: '获取奖金记录失败' });
  }
});

// 更新奖金状态
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bonus = await Bonus.findByPk(id);
    if (!bonus) {
      return res.status(404).json({ success: false, message: '奖金记录不存在' });
    }

    await bonus.update({ status });
    res.status(200).json({ success: true, data: bonus });
  } catch (error) {
    console.error('更新奖金状态失败:', error);
    res.status(500).json({ success: false, message: '更新奖金状态失败' });
  }
});

// 获取用户奖金统计
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await getUserBonusStats(userId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('获取用户奖金统计失败:', error);
    res.status(500).json({ success: false, message: '获取用户奖金统计失败' });
  }
});

module.exports = router;