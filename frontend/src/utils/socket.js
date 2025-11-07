import { io } from 'socket.io-client';
import { WS_URL } from './config';

/**
 * Socket.io 客户端实例
 */
let socket = null;

/**
 * 获取或创建 Socket.io 连接
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // 连接事件
    socket.on('connect', () => {
      console.log('✅ Socket.io 已连接:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io 已断开:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Socket.io 连接错误:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.io 已重连 (尝试次数:', attemptNumber, ')');
    });
  }

  return socket;
};

/**
 * 断开连接
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * 创建房间
 */
export const createRoom = (playerName, gameType) => {
  const socket = getSocket();
  return new Promise((resolve, reject) => {
    socket.emit('createRoom', { playerName, gameType });

    const timeout = setTimeout(() => {
      reject(new Error('创建房间超时'));
    }, 5000);

    socket.once('roomCreated', (data) => {
      clearTimeout(timeout);
      resolve(data);
    });

    socket.once('error', (data) => {
      clearTimeout(timeout);
      reject(new Error(data.message));
    });
  });
};

/**
 * 加入房间
 */
export const joinRoom = (roomId, playerName) => {
  const socket = getSocket();
  return new Promise((resolve, reject) => {
    socket.emit('joinRoom', { roomId, playerName });

    const timeout = setTimeout(() => {
      reject(new Error('加入房间超时'));
    }, 5000);

    socket.once('playerJoined', (data) => {
      clearTimeout(timeout);
      resolve(data);
    });

    socket.once('error', (data) => {
      clearTimeout(timeout);
      reject(new Error(data.message));
    });
  });
};

/**
 * 离开房间
 */
export const leaveRoom = (roomId) => {
  const socket = getSocket();
  socket.emit('leaveRoom', { roomId });
};

/**
 * 发牌
 */
export const dealCards = (roomId) => {
  const socket = getSocket();
  socket.emit('dealCards', { roomId });
};

/**
 * 更新准备状态
 */
export const updatePlayerReady = (roomId, isReady) => {
  const socket = getSocket();
  socket.emit('playerReady', { roomId, isReady });
};
