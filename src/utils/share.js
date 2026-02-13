const crypto = require('crypto');

// 生成唯一分享码
const generateShareCode = () => {
  const randomString = crypto.randomBytes(4).toString('hex');
  const timestamp = Date.now().toString(36);
  return `${timestamp}_${randomString}`.toUpperCase();
};

// 生成分享链接
const generateShareUrl = (baseUrl, shareCode) => {
  return `${baseUrl}/share/${shareCode}`;
};

// 验证分享码格式
const validateShareCode = (shareCode) => {
  const regex = /^[A-Z0-9_]+$/;
  return regex.test(shareCode);
};

module.exports = {
  generateShareCode,
  generateShareUrl,
  validateShareCode
};