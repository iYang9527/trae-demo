const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone, role } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }
    
    // 密码加密
    const hashedPassword = await hashPassword(password);
    
    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      role: role || 'user'
    });
    
    // 生成 JWT token
    const token = generateToken(user);
    
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      },
      token
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 检查用户状态
    if (user.status === 'inactive') {
      return res.status(401).json({ message: '账户已被禁用' });
    }
    
    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 生成 JWT token
    const token = generateToken(user);
    
    res.status(200).json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      },
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '登录失败' });
  }
});

module.exports = router;