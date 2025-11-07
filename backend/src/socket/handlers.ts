import { Server, Socket } from 'socket.io';
import { RoomManager } from '../game/Room';
import { ClientToServerEvents, ServerToClientEvents } from '../types';

/**
 * Socket.io 事件处理器
 */
export class SocketHandlers {
  private roomManager: RoomManager;

  constructor(private io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.roomManager = new RoomManager();

    // 每小时清理一次旧房间
    setInterval(() => {
      this.roomManager.cleanupOldRooms();
    }, 60 * 60 * 1000);
  }

  /**
   * 注册所有事件处理器
   */
  registerHandlers(socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
    console.log(`客户端连接: ${socket.id}`);

    // 创建房间
    socket.on('createRoom', (data) => {
      try {
        const { playerName, gameType } = data;

        if (!playerName || !playerName.trim()) {
          socket.emit('error', { message: '请输入玩家昵称' });
          return;
        }

        if (gameType !== 3 && gameType !== 5) {
          socket.emit('error', { message: '游戏类型必须是 3 张或 5 张' });
          return;
        }

        const room = this.roomManager.createRoom(socket.id, playerName.trim(), gameType);

        // 加入 Socket.io 房间
        socket.join(room.id);

        // 通知创建者
        socket.emit('roomCreated', { roomId: room.id, room });

        console.log(`房间创建: ${room.id}, 房主: ${playerName}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : '创建房间失败';
        socket.emit('error', { message });
      }
    });

    // 加入房间
    socket.on('joinRoom', (data) => {
      try {
        const { roomId, playerName } = data;

        if (!playerName || !playerName.trim()) {
          socket.emit('error', { message: '请输入玩家昵称' });
          return;
        }

        if (!roomId || !roomId.trim()) {
          socket.emit('error', { message: '请输入房间 ID' });
          return;
        }

        const room = this.roomManager.joinRoom(roomId.trim().toUpperCase(), socket.id, playerName.trim());

        // 加入 Socket.io 房间
        socket.join(room.id);

        // 通知房间内所有人
        this.io.to(room.id).emit('playerJoined', { room });

        console.log(`玩家 ${playerName} 加入房间 ${room.id}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : '加入房间失败';
        socket.emit('error', { message });
      }
    });

    // 离开房间
    socket.on('leaveRoom', (data) => {
      try {
        const { roomId } = data;

        if (!roomId) {
          socket.emit('error', { message: '房间 ID 不能为空' });
          return;
        }

        const result = this.roomManager.leaveRoom(roomId, socket.id);

        // 离开 Socket.io 房间
        socket.leave(roomId);

        if (!result.isEmpty && result.room) {
          // 通知房间内其他人
          this.io.to(roomId).emit('playerLeft', { room: result.room, playerId: socket.id });
        }

        console.log(`玩家 ${socket.id} 离开房间 ${roomId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : '离开房间失败';
        socket.emit('error', { message });
      }
    });

    // 发牌
    socket.on('dealCards', (data) => {
      try {
        const { roomId } = data;

        if (!roomId) {
          socket.emit('error', { message: '房间 ID 不能为空' });
          return;
        }

        const room = this.roomManager.dealCards(roomId, socket.id);

        // 给每个玩家发送他们自己的牌
        room.players.forEach(player => {
          this.io.to(player.id).emit('cardsDealt', {
            players: room.players.map(p => ({
              id: p.id,
              name: p.name,
              cards: p.id === player.id ? p.cards : [] // 只发送自己的牌
            }))
          });
        });

        console.log(`房间 ${roomId} 发牌完成`);
      } catch (error) {
        const message = error instanceof Error ? error.message : '发牌失败';
        socket.emit('error', { message });
      }
    });

    // 玩家准备状态更新
    socket.on('playerReady', (data) => {
      try {
        const { roomId, isReady } = data;

        if (!roomId) {
          socket.emit('error', { message: '房间 ID 不能为空' });
          return;
        }

        const room = this.roomManager.updatePlayerReady(roomId, socket.id, isReady);

        // 通知房间内所有人
        this.io.to(roomId).emit('playerReadyUpdate', { room });

        console.log(`玩家 ${socket.id} 在房间 ${roomId} 准备状态: ${isReady}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : '更新准备状态失败';
        socket.emit('error', { message });
      }
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`客户端断开: ${socket.id}`);

      // 查找玩家所在的房间并自动离开
      const rooms = this.roomManager.getAllRooms();
      for (const room of rooms) {
        if (room.players.some(p => p.id === socket.id)) {
          try {
            const result = this.roomManager.leaveRoom(room.id, socket.id);

            if (!result.isEmpty && result.room) {
              this.io.to(room.id).emit('playerLeft', { room: result.room, playerId: socket.id });
            }
          } catch (error) {
            console.error(`清理断开连接的玩家失败:`, error);
          }
        }
      }
    });
  }
}
