# Poker Emulator Frontend

扑克发牌模拟器前端应用，基于 React + Vite 构建。

## 技术栈

- React 18
- Vite
- Tailwind CSS
- React Router
- Socket.io-client

## 安装

```bash
npm install
```

## 开发

```bash
npm run dev
```

访问 http://localhost:5173

## 构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 预览构建

```bash
npm run preview
```

## 配置后端地址

修改 [src/utils/config.js](src/utils/config.js#L6):

```javascript
export const WS_URL = import.meta.env.PROD
  ? 'https://your-backend.railway.app'  // 替换成实际的后端地址
  : 'http://localhost:3000';
```

## 部署到 GitHub Pages

### 方法 1：使用 GitHub Actions（推荐）

已配置自动部署，推送到 main 分支即可自动部署。

### 方法 2：手动部署

```bash
npm run build
# 将 dist 目录内容推送到 gh-pages 分支
```

## 项目结构

```
frontend/
├── src/
│   ├── components/      # React 组件
│   │   ├── Card.jsx     # 扑克牌组件
│   │   └── PlayerCard.jsx  # 玩家卡片组件
│   ├── pages/           # 页面组件
│   │   ├── Home.jsx     # 首页
│   │   └── Room.jsx     # 房间页面
│   ├── utils/           # 工具函数
│   │   ├── config.js    # 配置
│   │   └── socket.js    # Socket.io 客户端
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # 入口文件
│   └── index.css        # 全局样式
├── public/              # 静态资源
├── index.html           # HTML 模板
└── package.json
```

## 功能特性

- ✅ 创建/加入房间
- ✅ 实时多人在线
- ✅ 扑克牌动画效果
- ✅ 响应式设计
- ✅ 房间号分享
- ✅ 自动重连

## License

MIT
