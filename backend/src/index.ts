import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { SocketHandlers } from './socket/handlers';
import { ClientToServerEvents, ServerToClientEvents } from './types';

// 环境变量
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 创建 Express 应用
const app = express();
const httpServer = createServer(app);

// CORS 配置
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    FRONTEND_URL,
    // 生产环境 GitHub Pages 地址（需要替换成实际的）
    /https:\/\/.*\.github\.io$/
  ],
  credentials: true
}));

app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'Poker Emulator Backend',
    version: '1.0.0',
    status: 'running'
  });
});

// Socket.io 服务器
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      FRONTEND_URL,
      /https:\/\/.*\.github\.io$/
    ],
    credentials: true
  }
});

// 注册 Socket.io 事件处理器
const socketHandlers = new SocketHandlers(io);

io.on('connection', (socket) => {
  socketHandlers.registerHandlers(socket);
});

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Poker Emulator Backend Server         ║
╚════════════════════════════════════════╝

🚀 Server is running on port ${PORT}
🌐 Frontend URL: ${FRONTEND_URL}
🔗 Health check: http://localhost:${PORT}/health
⚡ Socket.io ready for connections

Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n正在关闭服务器...');
  httpServer.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});
