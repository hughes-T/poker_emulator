import { Room, Player, GameType, Card } from '../types';
import { Deck } from './Deck';

/**
 * 房间管理类
 */
export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private readonly MAX_PLAYERS = 6; // 每个房间最多 6 人

  /**
   * 生成随机房间 ID（6 位大写字母和数字）
   */
  private generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    for (let i = 0; i < 6; i++) {
      roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 确保 ID 唯一
    if (this.rooms.has(roomId)) {
      return this.generateRoomId();
    }

    return roomId;
  }

  /**
   * 创建房间
   */
  createRoom(hostId: string, hostName: string, gameType: GameType): Room {
    const roomId = this.generateRoomId();

    const room: Room = {
      id: roomId,
      gameType,
      players: [{
        id: hostId,
        name: hostName,
        cards: [],
        isReady: false
      }],
      hostId,
      status: 'waiting',
      createdAt: new Date()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * 加入房间
   */
  joinRoom(roomId: string, playerId: string, playerName: string): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('房间不存在');
    }

    if (room.status !== 'waiting') {
      throw new Error('游戏已开始，无法加入');
    }

    if (room.players.length >= this.MAX_PLAYERS) {
      throw new Error('房间已满');
    }

    // 检查是否已经在房间中
    if (room.players.some(p => p.id === playerId)) {
      throw new Error('您已在房间中');
    }

    room.players.push({
      id: playerId,
      name: playerName,
      cards: [],
      isReady: false
    });

    return room;
  }

  /**
   * 离开房间
   */
  leaveRoom(roomId: string, playerId: string): { room: Room | null; isEmpty: boolean } {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('房间不存在');
    }

    // 移除玩家
    room.players = room.players.filter(p => p.id !== playerId);

    // 如果房间为空，删除房间
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return { room: null, isEmpty: true };
    }

    // 如果离开的是房主，转让房主给第一个玩家
    if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
    }

    // 重置房间状态
    room.status = 'waiting';
    room.players.forEach(p => p.cards = []);

    return { room, isEmpty: false };
  }

  /**
   * 发牌
   */
  dealCards(roomId: string, dealerId: string): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('房间不存在');
    }

    // 只有房主可以发牌
    if (room.hostId !== dealerId) {
      throw new Error('只有房主可以发牌');
    }

    if (room.players.length < 2) {
      throw new Error('至少需要 2 名玩家才能开始游戏');
    }

    // 创建新牌堆并洗牌
    const deck = new Deck();

    // 清空所有玩家的手牌
    room.players.forEach(player => player.cards = []);

    // 给每个玩家发牌
    room.players.forEach(player => {
      player.cards = deck.deal(room.gameType);
    });

    room.status = 'dealt';

    return room;
  }

  /**
   * 更新玩家准备状态
   */
  updatePlayerReady(roomId: string, playerId: string, isReady: boolean): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('房间不存在');
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('玩家不在房间中');
    }

    player.isReady = isReady;

    return room;
  }

  /**
   * 获取房间信息
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * 获取所有房间
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * 清理超过 24 小时的空房间
   */
  cleanupOldRooms(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const [roomId, room] of this.rooms.entries()) {
      if (room.createdAt < oneDayAgo && room.players.length === 0) {
        this.rooms.delete(roomId);
      }
    }
  }
}
