const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { hashPassword } = require('../utils/auth');
const { authenticate, authorize } = require('../middleware/auth');

// 获取用户列表
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'name', 'email', 'phone', 'status', 'role', 'createdAt', 'updatedAt']
    });
    res.status(200).json({
      message: '获取用户列表成功',
      users
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

// 根据ID获取用户信息
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'name', 'email', 'phone', 'status', 'role', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 非管理员只能查看自己的信息
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: '权限不足' });
    }
    
    res.status(200).json({
      message: '获取用户信息成功',
      user
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

// 添加用户
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { username, password, name, email, phone, role, status } = req.body;
    
    // 验证必填字段
    if (!username || !password || !name || !email || !phone) {
      return res.status(400).json({ message: '用户名、密码、姓名、邮箱和手机号为必填字段' });
    }
    
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
      role: role || 'user',
      status: status || 'active'
    });
    
    res.status(201).json({
      message: '添加用户成功',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('添加用户失败:', error);
    res.status(500).json({ message: '添加用户失败' });
  }
});

// 编辑用户信息
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status, password } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 非管理员只能编辑自己的信息，且不能修改角色和状态
    if (req.user.role !== 'admin') {
      if (req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: '权限不足' });
      }
      // 非管理员不能修改角色和状态
      if (role || status) {
        return res.status(403).json({ message: '权限不足，无法修改角色或状态' });
      }
    }
    
    // 检查邮箱是否已被其他用户使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: '邮箱已被其他用户使用' });
      }
    }
    
    // 准备更新数据
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role && req.user.role === 'admin') updateData.role = role;
    if (status && req.user.role === 'admin') updateData.status = status;
    if (password) updateData.password = await hashPassword(password);
    
    // 更新用户信息
    await user.update(updateData);
    
    res.status(200).json({
      message: '编辑用户信息成功',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('编辑用户信息失败:', error);
    res.status(500).json({ message: '编辑用户信息失败' });
  }
});

// 删除用户
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 不能删除自己
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: '不能删除自己的账户' });
    }
    
    await user.destroy();
    
    res.status(200).json({ message: '删除用户成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ message: '删除用户失败' });
  }
});

// 更新用户状态
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: '状态必须为active或inactive' });
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    await user.update({ status });
    
    res.status(200).json({
      message: '更新用户状态成功',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        status: user.status
      }
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({ message: '更新用户状态失败' });
  }
});

module.exports = router;