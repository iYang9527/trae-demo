const express = require('express');
const { Channel } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// 验证渠道信息的中间件
const validateChannel = (req, res, next) => {
  const { name, url, status } = req.body;
  
  // 验证必填字段
  if (!name || !url) {
    return res.status(400).json({ error: '渠道名称和URL是必填项' });
  }
  
  // 验证状态值
  if (status && !['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: '无效的渠道状态，必须是 active 或 inactive' });
  }
  
  // 验证URL格式
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: '无效的URL格式' });
  }
  
  next();
};

// 获取所有渠道
router.get('/', authenticate, async (req, res) => {
  try {
    const channels = await Channel.findAll();
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: '获取渠道列表失败' });
  }
});

// 根据ID获取单个渠道
router.get('/:id', authenticate, async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: '渠道不存在' });
    }
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: '获取渠道失败' });
  }
});

// 创建新渠道
router.post('/', authenticate, authorize('admin'), validateChannel, async (req, res) => {
  try {
    const { name, url, description, status } = req.body;
    
    const channel = await Channel.create({
      name,
      url,
      description,
      status: status || 'active'
    });
    
    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ error: '创建渠道失败' });
  }
});

// 更新渠道信息
router.put('/:id', authenticate, authorize('admin'), validateChannel, async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: '渠道不存在' });
    }
    
    const { name, url, description, status } = req.body;
    await channel.update({
      name,
      url,
      description,
      status: status || channel.status
    });
    
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: '更新渠道失败' });
  }
});

// 删除渠道
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: '渠道不存在' });
    }
    
    await channel.destroy();
    res.json({ message: '渠道删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除渠道失败' });
  }
});

// 更新渠道状态
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: '渠道不存在' });
    }
    
    const { status } = req.body;
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: '无效的渠道状态，必须是 active 或 inactive' });
    }
    
    await channel.update({ status });
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: '更新渠道状态失败' });
  }
});

module.exports = router;