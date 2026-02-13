const { verifyToken } = require('../utils/auth');

// 验证 JWT token 中间件
exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '未提供认证 token' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: '无效的认证 token' });
  }
  req.user = decoded;
  next();
};

// 基于角色的权限控制中间件
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足' });
    }
    next();
  };
};