const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./src/config/database');
const { User, Channel, Order, Bonus, Share, BonusRule } = require('./src/models');
const authRoutes = require('./src/routes/auth');
const channelRoutes = require('./src/routes/channels');
const userRoutes = require('./src/routes/users');
const shareRoutes = require('./src/routes/shares');
const orderRoutes = require('./src/routes/orders');
const bonusRoutes = require('./src/routes/bonuses');
const daifuRoutes = require('./src/routes/daifu');
const reportRoutes = require('./src/routes/reports');
const { authenticate, authorize } = require('./src/middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 认证路由
app.use('/api/auth', authRoutes);

// 渠道路由
app.use('/api/channels', channelRoutes);

// 用户路由
app.use('/api/users', userRoutes);

// 分享路由
app.use('/api/shares', shareRoutes);

// 订单路由
app.use('/api/orders', orderRoutes);

// 奖金路由
app.use('/api/bonuses', bonusRoutes);

// 代付路由
app.use('/api/daifu', daifuRoutes);

// 报表路由
app.use('/api/reports', reportRoutes);

// 分享链接重定向路由（无需认证）
app.use('/share', shareRoutes);

// 测试认证的受保护路由
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: '受保护的路由', user: req.user });
});

// 测试基于角色的权限控制
app.get('/api/admin-only', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: '仅管理员可访问的路由', user: req.user });
});

// 测试数据库连接
const startServer = async () => {
  try {
    await testConnection();
    console.log('服务器启动中...');
    
    // 同步数据库表结构（不强制删除，不修改现有表）
    await sequelize.sync({ force: false });
    console.log('数据库表结构同步完成');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
  }
};

// 基本路由
app.get('/', (req, res) => {
  res.json({ message: '渠道奖金管理系统 API' });
});

// 启动服务器
startServer();