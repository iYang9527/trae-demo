# 渠道奖金管理系统

## 系统概述

渠道奖金管理系统是一个用于管理上游渠道、分享渠道给下游用户、追踪订单和奖金分配的完整系统。该系统帮助渠道管理者高效管理渠道网络和奖金核算，解决渠道管理混乱、奖金核算复杂、订单统计困难的问题。

## 核心功能

- **上游渠道管理**：支持添加、编辑、删除上游渠道信息
- **下游用户管理**：支持添加、编辑、删除下游用户信息
- **渠道分享机制**：生成唯一的分享链接或代码给下游用户
- **订单追踪**：记录通过渠道产生的订单信息
- **奖金核算**：根据订单自动计算上游奖金和下游分配
- **代付状态管理**：记录下游用户的代付状态，支持对账查看
- **财务报表**：生成详细的奖金收支报表
- **数据统计**：提供渠道性能和用户活跃度的统计分析

## 技术栈

### 后端
- Node.js + Express
- SQLite 数据库
- Sequelize ORM
- JWT 认证

### 前端
- React + TypeScript
- Redux Toolkit (状态管理)
- React Router (路由)
- Tailwind CSS (样式)
- Chart.js (数据可视化)

## 系统要求

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/iYang9527/trae-demo.git
cd trae-demo
```

### 2. 安装后端依赖

```bash
npm install
```

### 3. 安装前端依赖

```bash
cd client
npm install
cd ..
```

### 4. 初始化数据库

```bash
node init-db.js
```

### 5. 启动后端服务器

```bash
npm start
```

后端服务器将运行在 http://localhost:3000

### 6. 启动前端开发服务器

```bash
cd client
npm run dev
```

前端服务器将运行在 http://localhost:5173

## 使用说明

### 1. 系统登录

- 打开 http://localhost:5173
- 使用默认管理员账号登录：
  - 用户名：admin
  - 密码：admin123

### 2. 管理上游渠道

- 点击左侧菜单的 "渠道管理"
- 点击 "添加渠道" 按钮创建新渠道
- 填写渠道信息并保存

### 3. 管理下游用户

- 点击左侧菜单的 "用户管理"
- 点击 "添加用户" 按钮创建新用户
- 填写用户信息并保存

### 4. 生成分享链接

- 点击左侧菜单的 "分享管理"
- 选择渠道和用户，点击 "生成分享链接"
- 复制生成的分享链接并分享给下游用户

### 5. 管理订单

- 点击左侧菜单的 "订单管理"
- 查看订单列表和详情
- 更新订单状态

### 6. 管理代付状态

- 点击左侧菜单的 "代付管理"
- 查看代付列表和详情
- 更新代付状态

### 7. 查看财务报表

- 点击左侧菜单的 "报表统计"
- 查看奖金统计、渠道业绩统计和代付统计报表
- 导出报表数据

## API 文档

系统提供以下主要 API 端点：

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 渠道管理
- `GET /api/channels` - 获取渠道列表
- `POST /api/channels` - 创建渠道
- `PUT /api/channels/:id` - 更新渠道
- `DELETE /api/channels/:id` - 删除渠道

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 订单管理
- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id` - 更新订单
- `DELETE /api/orders/:id` - 删除订单

### 奖金管理
- `POST /api/bonuses/rules` - 创建或更新奖金规则
- `POST /api/bonuses/generate` - 为订单生成奖金
- `GET /api/bonuses` - 获取奖金记录列表
- `PUT /api/bonuses/:id/status` - 更新奖金状态

### 代付管理
- `GET /api/daifu/status` - 获取代付状态列表
- `PUT /api/daifu/:orderId/status` - 更新订单代付状态
- `GET /api/daifu/pending` - 获取待代付订单列表

### 报表统计
- `GET /api/reports/bonuses` - 奖金统计报表
- `GET /api/reports/channels/performance` - 渠道业绩统计报表
- `GET /api/reports/daifu` - 代付统计报表

## 系统维护

### 数据库备份

定期备份 `database.sqlite` 文件以防止数据丢失。

### 日志管理

系统日志将输出到控制台，可根据需要配置日志文件。

### 安全注意事项

- 定期更新系统密码
- 确保 JWT 密钥的安全性
- 限制系统访问权限
- 定期检查系统安全漏洞

## 常见问题

### 1. 无法登录系统

- 检查用户名和密码是否正确
- 检查后端服务器是否正常运行

### 2. 无法创建渠道

- 检查必填字段是否填写完整
- 检查后端服务器是否正常运行

### 3. 奖金计算错误

- 检查奖金规则配置是否正确
- 检查订单金额是否正确

### 4. 报表数据不准确

- 检查数据源是否完整
- 检查计算逻辑是否正确

## 联系我们

如果您在使用过程中遇到任何问题，请联系系统管理员。

---

© 2026 渠道奖金管理系统