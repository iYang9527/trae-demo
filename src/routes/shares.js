const express = require('express');
const { Share, User, Channel } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateShareCode, generateShareUrl, validateShareCode } = require('../utils/share');

const router = express.Router();

// 验证分享请求的中间件
const validateShareRequest = (req, res, next) => {
  const { channelId, originalUrl } = req.body;
  
  if (!channelId || !originalUrl) {
    return res.status(400).json({ error: '渠道ID和原始URL是必填项' });
  }
  
  try {
    new URL(originalUrl);
  } catch (error) {
    return res.status(400).json({ error: '无效的URL格式' });
  }
  
  next();
};

// 生成分享链接
router.post('/generate', authenticate, validateShareRequest, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { channelId, originalUrl } = req.body;
    
    // 验证渠道是否存在
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({ error: '渠道不存在' });
    }
    
    // 生成唯一分享码
    let shareCode;
    let isUnique = false;
    
    while (!isUnique) {
      shareCode = generateShareCode();
      const existingShare = await Share.findOne({ where: { shareCode } });
      if (!existingShare) {
        isUnique = true;
      }
    }
    
    // 生成分享链接
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const shareUrl = generateShareUrl(baseUrl, shareCode);
    
    // 创建分享记录
    const share = await Share.create({
      shareCode,
      userId,
      channelId,
      originalUrl,
      shareUrl
    });
    
    res.status(201).json({
      shareCode,
      shareUrl,
      originalUrl,
      channelId,
      userId,
      clickCount: 0,
      status: 'active',
      createdAt: share.createdAt
    });
  } catch (error) {
    console.error('生成分享链接失败:', error);
    res.status(500).json({ error: '生成分享链接失败' });
  }
});

// 获取用户的分享记录
router.get('/user', authenticate, async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const shares = await Share.findAll({
      where: { userId },
      include: [
        {
          model: Channel,
          attributes: ['id', 'name', 'url']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(shares);
  } catch (error) {
    console.error('获取分享记录失败:', error);
    res.status(500).json({ error: '获取分享记录失败' });
  }
});

// 处理分享链接点击
router.get('/:shareCode', async (req, res) => {
  try {
    const { shareCode } = req.params;
    
    // 验证分享码格式
    if (!validateShareCode(shareCode)) {
      return res.status(400).json({ error: '无效的分享码格式' });
    }
    
    // 查找分享记录
    const share = await Share.findOne({ where: { shareCode } });
    if (!share) {
      return res.status(404).json({ error: '分享记录不存在' });
    }
    
    // 检查分享状态
    if (share.status !== 'active') {
      return res.status(400).json({ error: '分享链接已失效' });
    }
    
    // 增加点击次数
    await share.increment('clickCount');
    
    // 重定向到原始URL
    res.redirect(share.originalUrl);
  } catch (error) {
    console.error('处理分享链接点击失败:', error);
    res.status(500).json({ error: '处理分享链接点击失败' });
  }
});

// 获取单个分享记录
router.get('/detail/:id', authenticate, async (req, res) => {
  try {
    const share = await Share.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name']
        },
        {
          model: Channel,
          attributes: ['id', 'name', 'url']
        }
      ]
    });
    
    if (!share) {
      return res.status(404).json({ error: '分享记录不存在' });
    }
    
    res.json(share);
  } catch (error) {
    console.error('获取分享记录失败:', error);
    res.status(500).json({ error: '获取分享记录失败' });
  }
});

// 更新分享状态
router.patch('/detail/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值，必须是 active 或 inactive' });
    }
    
    const share = await Share.findByPk(id);
    if (!share) {
      return res.status(404).json({ error: '分享记录不存在' });
    }
    
    // 验证用户权限
    if (share.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限操作此分享记录' });
    }
    
    await share.update({ status });
    res.json(share);
  } catch (error) {
    console.error('更新分享状态失败:', error);
    res.status(500).json({ error: '更新分享状态失败' });
  }
});

// 删除分享记录
router.delete('/detail/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const share = await Share.findByPk(id);
    
    if (!share) {
      return res.status(404).json({ error: '分享记录不存在' });
    }
    
    // 验证用户权限
    if (share.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限操作此分享记录' });
    }
    
    await share.destroy();
    res.json({ message: '分享记录删除成功' });
  } catch (error) {
    console.error('删除分享记录失败:', error);
    res.status(500).json({ error: '删除分享记录失败' });
  }
});

// 获取分享统计数据
router.get('/stats/:id', authenticate, async (req, res) => {
  try {
    const share = await Share.findByPk(req.params.id);
    
    if (!share) {
      return res.status(404).json({ error: '分享记录不存在' });
    }
    
    // 验证用户权限
    if (share.userId !== req.user.id) {
      return res.status(403).json({ error: '无权限查看此分享记录' });
    }
    
    res.json({
      shareCode: share.shareCode,
      shareUrl: share.shareUrl,
      clickCount: share.clickCount,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt,
      status: share.status
    });
  } catch (error) {
    console.error('获取分享统计数据失败:', error);
    res.status(500).json({ error: '获取分享统计数据失败' });
  }
});

module.exports = router;