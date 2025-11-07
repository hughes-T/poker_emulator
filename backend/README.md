# Poker Emulator Backend

扑克发牌模拟器后端服务，基于 Node.js + TypeScript + Socket.io 构建。

## 技术栈

- Node.js 18+
- TypeScript
- Express
- Socket.io
- CORS

## 安装

```bash
npm install
```

## 开发

```bash
# 启动开发服务器（自动重启）
npm run dev

# 类型检查
npm run type-check
```

## 构建

```bash
npm run build
```

## 生产运行

```bash
npm start
```

## 环境变量

复制 `.env.example` 到 `.env` 并配置：

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## API 端点

- `GET /` - 服务器信息
- `GET /health` - 健康检查

## Socket.io 事件

### 客户端 -> 服务器

- `createRoom` - 创建房间
- `joinRoom` - 加入房间
- `leaveRoom` - 离开房间
- `dealCards` - 发牌
- `playerReady` - 更新准备状态

### 服务器 -> 客户端

- `roomCreated` - 房间已创建
- `playerJoined` - 玩家加入
- `playerLeft` - 玩家离开
- `cardsDealt` - 发牌完成
- `playerReadyUpdate` - 准备状态更新
- `error` - 错误信息

## 部署

### Railway.app

1. 连接 GitHub 仓库
2. 选择 backend 目录
3. 自动检测并部署

Railway 会自动识别 `package.json` 中的 `start` 脚本。

### 其他平台

确保设置环境变量：
- `PORT` - 端口号
- `FRONTEND_URL` - 前端地址
- `NODE_ENV=production`

## 项目结构

```
backend/
├── src/
│   ├── game/
│   │   ├── Deck.ts        # 扑克牌堆逻辑
│   │   └── Room.ts        # 房间管理
│   ├── socket/
│   │   └── handlers.ts    # Socket.io 事件处理
│   ├── types/
│   │   └── index.ts       # TypeScript 类型定义
│   └── index.ts           # 主入口
├── package.json
├── tsconfig.json
└── nodemon.json
```

## License

MIT
