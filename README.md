# 🃏 扑克发牌模拟器

一个支持多人实时在线的扑克发牌模拟应用，支持 3 张或 5 张发牌模式。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)

## ✨ 功能特性

- ✅ **实时多人在线** - 基于 WebSocket 的实时通信
- ✅ **房间系统** - 创建/加入房间，支持 2-6 人
- ✅ **灵活发牌** - 支持 3 张或 5 张模式
- ✅ **实时发牌** - 流畅的发牌动画效果
- ✅ **响应式设计** - 完美适配手机和电脑
- ✅ **房间分享** - 一键复制房间号或链接
- 🚧 **判断输赢** - 规划中
- 🚧 **筹码系统** - 规划中

## 🛠️ 技术栈

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Socket.io-client** - WebSocket 客户端
- **React Router** - 路由管理

### 后端
- **Node.js 18+** - 运行时
- **TypeScript** - 类型安全
- **Express** - Web 框架
- **Socket.io** - WebSocket 服务器

## 📦 快速开始

### 前置要求

- Node.js 18 或更高版本
- npm 或 yarn

### 本地开发

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/poker_emulator.git
cd poker_emulator
```

#### 2. 启动后端

```bash
cd backend
npm install
npm run dev
```

后端将在 http://localhost:3000 启动

#### 3. 启动前端（新终端）

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:5173 启动

#### 4. 访问应用

打开浏览器访问 http://localhost:5173

## 🚀 部署指南

### 前端部署到 GitHub Pages

#### 步骤 1：创建 GitHub 仓库

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/poker_emulator.git
git push -u origin main
```

#### 步骤 2：启用 GitHub Pages

1. 进入 GitHub 仓库的 **Settings** > **Pages**
2. 在 **Source** 下选择 **GitHub Actions**
3. 推送代码后会自动部署

#### 步骤 3：获取前端 URL

部署成功后，前端地址为：`https://your-username.github.io/poker_emulator/`

### 后端部署到 Railway

#### 步骤 1：注册 Railway

访问 [Railway.app](https://railway.app/) 并使用 GitHub 账号登录

#### 步骤 2：创建新项目

1. 点击 **New Project**
2. 选择 **Deploy from GitHub repo**
3. 选择 `poker_emulator` 仓库
4. Railway 会自动检测 Node.js 项目

#### 步骤 3：配置根目录

1. 在项目设置中，将 **Root Directory** 设置为 `backend`
2. 或者在 `backend/package.json` 中确保有 `start` 脚本

#### 步骤 4：设置环境变量

在 Railway 项目的 **Variables** 中添加：

```
FRONTEND_URL=https://your-username.github.io/poker_emulator
NODE_ENV=production
```

#### 步骤 5：获取后端 URL

部署成功后，Railway 会提供一个 URL，例如：
```
https://poker-backend-production-xxxx.up.railway.app
```

#### 步骤 6：更新前端配置

修改 `frontend/src/utils/config.js`：

```javascript
export const WS_URL = import.meta.env.PROD
  ? 'https://poker-backend-production-xxxx.up.railway.app'  // 替换成实际的 Railway URL
  : 'http://localhost:3000';
```

然后重新推送代码以触发前端重新部署。

### 其他部署平台

#### 后端替代方案
- **Render.com** - 免费但冷启动慢
- **Fly.io** - 免费额度充足
- **Vercel** - WebSocket 支持有限

#### 前端替代方案
- **Vercel** - 自动部署，速度快
- **Netlify** - 功能丰富
- **Cloudflare Pages** - 全球 CDN

## 📁 项目结构

```
poker_emulator/
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml  # GitHub Actions 部署配置
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── components/          # React 组件
│   │   │   ├── Card.jsx         # 扑克牌组件
│   │   │   └── PlayerCard.jsx   # 玩家卡片组件
│   │   ├── pages/               # 页面组件
│   │   │   ├── Home.jsx         # 首页
│   │   │   └── Room.jsx         # 房间页面
│   │   ├── utils/               # 工具函数
│   │   │   ├── config.js        # 配置
│   │   │   └── socket.js        # Socket.io 客户端
│   │   ├── App.jsx              # 主应用
│   │   ├── main.jsx             # 入口
│   │   └── index.css            # 全局样式
│   ├── package.json
│   └── vite.config.js
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── game/                # 游戏逻辑
│   │   │   ├── Deck.ts          # 扑克牌堆
│   │   │   └── Room.ts          # 房间管理
│   │   ├── socket/              # Socket.io
│   │   │   └── handlers.ts      # 事件处理
│   │   ├── types/               # TypeScript 类型
│   │   │   └── index.ts
│   │   └── index.ts             # 入口
│   ├── package.json
│   ├── tsconfig.json
│   └── railway.json
├── .gitignore
└── README.md
```

## 🎮 使用说明

### 创建房间

1. 打开应用首页
2. 点击"创建房间"
3. 输入昵称
4. 选择游戏类型（3 张或 5 张）
5. 点击创建

### 加入房间

1. 打开应用首页
2. 点击"加入房间"
3. 输入昵称和房间 ID
4. 点击加入

### 开始游戏

1. 房主等待玩家加入（至少 2 人）
2. 点击"发牌"按钮
3. 每个玩家可以看到自己的手牌

### 分享房间

- 点击"复制房间号"分享 6 位房间号
- 点击"分享链接"分享完整 URL

## 🔧 开发指南

### 后端 API

#### Socket.io 事件

**客户端 → 服务器**
- `createRoom` - 创建房间
- `joinRoom` - 加入房间
- `leaveRoom` - 离开房间
- `dealCards` - 发牌
- `playerReady` - 更新准备状态

**服务器 → 客户端**
- `roomCreated` - 房间已创建
- `playerJoined` - 玩家加入
- `playerLeft` - 玩家离开
- `cardsDealt` - 发牌完成
- `playerReadyUpdate` - 准备状态更新
- `error` - 错误信息

### 前端组件

- **Card** - 扑克牌显示组件
- **CardBack** - 扑克牌背面组件
- **PlayerCard** - 玩家信息卡片
- **Home** - 首页（创建/加入房间）
- **Room** - 房间页面（游戏主界面）

## 📝 待办事项

- [x] 项目初始化
- [x] 后端核心功能（房间管理、发牌逻辑）
- [x] 前端核心功能（UI 组件、Socket.io 集成）
- [x] 部署配置
- [ ] 添加牌型判断算法
- [ ] 实现筹码系统
- [ ] 添加聊天功能
- [ ] 优化动画效果
- [ ] 添加音效

## 🐛 常见问题

### 前端无法连接后端

- 检查 `frontend/src/utils/config.js` 中的 `WS_URL` 是否正确
- 确保后端已启动且可访问
- 检查浏览器控制台的错误信息

### Railway 部署失败

- 确保 `backend/package.json` 中有 `start` 脚本
- 检查 Node.js 版本是否为 18+
- 查看 Railway 的部署日志

### GitHub Pages 404 错误

- 确保仓库设置中启用了 GitHub Pages
- 检查 GitHub Actions 是否成功运行
- 等待几分钟让 DNS 生效

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题，请在 GitHub 上提交 Issue。

---

**Made with ❤️ using React + Node.js + Socket.io**
