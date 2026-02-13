const { sequelize } = require('./src/config/database');
const { User, Channel, Order, Bonus, Share } = require('./src/models');
const { hashPassword } = require('./src/utils/auth');

// 初始化数据库
const initDatabase = async () => {
  try {
    console.log('正在连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功');

    console.log('正在创建表结构...');
    // 自动创建表结构
    await sequelize.sync({ force: true });
    console.log('表结构创建成功');

    // 插入初始数据
    console.log('正在插入初始数据...');
    
    // 创建默认渠道
    const channel1 = await Channel.create({
      name: '京东商城',
      url: 'https://www.jd.com',
      description: '京东商城官方渠道',
      status: 'active'
    });

    const channel2 = await Channel.create({
      name: '淘宝',
      url: 'https://www.taobao.com',
      description: '淘宝官方渠道',
      status: 'active'
    });

    // 创建默认用户
    const hashedAdminPassword = await hashPassword('admin123');
    const user1 = await User.create({
      username: 'admin',
      password: hashedAdminPassword,
      name: '管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      status: 'active',
      role: 'admin'
    });

    const hashedUserPassword = await hashPassword('user123');
    const user2 = await User.create({
      username: 'user1',
      password: hashedUserPassword,
      name: '用户1',
      email: 'user1@example.com',
      phone: '13800138001',
      status: 'active',
      role: 'user'
    });

    console.log('初始数据插入成功');
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
};

// 执行初始化
initDatabase();