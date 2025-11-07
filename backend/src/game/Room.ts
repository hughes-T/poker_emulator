import { Room, GameType, HandAnalysis } from '../types';
import { Deck } from './Deck';
import { analyzeHand, compareHands } from './HandRanker';

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
        isReady: false,
        chips: 100,        // 初始积分
        isLooking: false,  // 未看牌
        isFolded: false,   // 未淘汰
        currentBet: 0,     // 当前未下注
        totalBet: 0,       // 总下注为0
        isOnline: true,    // 在线
        disconnectedAt: undefined
      }],
      hostId,
      status: 'waiting',
      createdAt: new Date(),
      // 炸金花游戏状态初始化
      round: 0,
      pot: 0,
      currentPlayerIndex: 0,
      maxBet: 0,
      anteCollected: false
    };

    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * 加入房间（支持断线重连）
   */
  joinRoom(roomId: string, playerId: string, playerName: string): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('房间不存在');
    }

    // 检查是否已经在房间中（相同socket ID）
    if (room.players.some(p => p.id === playerId && p.isOnline)) {
      throw new Error('您已在房间中');
    }

    // 查找是否有同名离线玩家（断线重连）
    const offlinePlayer = room.players.find(p => p.name === playerName && !p.isOnline);

    if (offlinePlayer) {
      // 断线重连：更新玩家的 socket ID 并标记为在线
      console.log(`玩家 ${playerName} 重新连接到房间 ${roomId}`);
      offlinePlayer.id = playerId;
      offlinePlayer.isOnline = true;
      offlinePlayer.disconnectedAt = undefined;
      return room;
    }

    // 新玩家加入
    if (room.status !== 'waiting') {
      throw new Error('游戏已开始，无法加入');
    }

    if (room.players.length >= this.MAX_PLAYERS) {
      throw new Error('房间已满');
    }

    room.players.push({
      id: playerId,
      name: playerName,
      cards: [],
      isReady: false,
      chips: 100,        // 初始积分
      isLooking: false,  // 未看牌
      isFolded: false,   // 未淘汰
      currentBet: 0,     // 当前未下注
      totalBet: 0,       // 总下注为0
      isOnline: true,    // 在线
      disconnectedAt: undefined
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
   * 发牌（开始游戏）
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

    // 初始化所有玩家状态
    room.players.forEach(player => {
      player.cards = [];
      player.isLooking = false;
      player.isFolded = false;
      player.currentBet = 0;
      player.totalBet = 0;
    });

    // 给每个玩家发牌（只在3张模式下才是炸金花）
    room.players.forEach(player => {
      player.cards = deck.deal(room.gameType);
    });

    // 如果是3张牌模式，启动炸金花游戏
    if (room.gameType === 3) {
      // 重置游戏状态
      room.round = 1;
      room.pot = 0;
      room.currentPlayerIndex = 0;
      room.maxBet = 0;
      room.anteCollected = false;
      room.status = 'playing';

      // 收取底注
      this.collectAnte(room);
    } else {
      // 5张牌模式保持原有逻辑
      room.status = 'dealt';
    }

    return room;
  }

  /**
   * 收取底注
   */
  private collectAnte(room: Room): void {
    const ANTE = 1; // 底注为1

    room.players.forEach(player => {
      if (!player.isFolded && player.chips >= ANTE) {
        player.chips -= ANTE;
        player.totalBet += ANTE;
        room.pot += ANTE;
      }
    });

    room.anteCollected = true;
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
   * 标记玩家离线
   */
  markPlayerOffline(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isOnline = false;
      player.disconnectedAt = new Date();
    }

    return room;
  }

  /**
   * 玩家重连
   */
  reconnectPlayer(roomId: string, oldPlayerId: string, newPlayerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const player = room.players.find(p => p.id === oldPlayerId);
    if (player) {
      player.id = newPlayerId;
      player.isOnline = true;
      player.disconnectedAt = undefined;

      // 如果是房主，更新房主ID
      if (room.hostId === oldPlayerId) {
        room.hostId = newPlayerId;
      }
    }

    return room;
  }

  /**
   * 清理离线超过2分钟的玩家和空房间
   */
  cleanupOldRooms(): void {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000); // 2分钟
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24小时

    for (const [roomId, room] of this.rooms.entries()) {
      // 清理离线超过2分钟的玩家
      room.players = room.players.filter(player => {
        if (!player.isOnline && player.disconnectedAt && player.disconnectedAt < twoMinutesAgo) {
          return false; // 移除该玩家
        }
        return true; // 保留玩家
      });

      // 如果房间为空，删除房间
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
        continue;
      }

      // 如果房间创建超过24小时且没有在线玩家，删除房间
      const hasOnlinePlayers = room.players.some(p => p.isOnline);
      if (room.createdAt < oneDayAgo && !hasOnlinePlayers) {
        this.rooms.delete(roomId);
      }
    }
  }

  // ==================== 炸金花游戏逻辑 ====================

  /**
   * 下注
   */
  placeBet(roomId: string, playerId: string, amount: number): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('房间不存在');
    }

    if (room.status !== 'playing') {
      throw new Error('游戏未开始');
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('玩家不在房间中');
    }

    // 检查是否轮到该玩家
    const currentPlayer = this.getActivePlayers(room)[room.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error('还未轮到你');
    }

    if (player.isFolded) {
      throw new Error('您已被淘汰');
    }

    // 检查下注是否符合规则：必须 >= 之前的最大下注额
    if (amount < room.maxBet) {
      throw new Error(`下注额不能小于 ${room.maxBet}`);
    }

    const minBet = 1; // 最小下注单位
    if (amount < minBet) {
      throw new Error(`最小下注额为 ${minBet}`);
    }

    // 根据是否看牌计算实际下注额
    const multiplier = player.isLooking ? 2 : 1;
    const actualBet = amount * multiplier;

    // 检查积分是否足够
    if (player.chips < actualBet) {
      throw new Error('积分不足');
    }

    // 扣除积分并更新状态
    player.chips -= actualBet;
    player.currentBet = actualBet;
    player.totalBet += actualBet;
    room.pot += actualBet;

    // 更新最高下注额（记录玩家选择的amount，而非实际消耗）
    if (amount > room.maxBet) {
      room.maxBet = amount;
    }

    // 记录操作
    room.lastAction = {
      playerId,
      action: 'bet',
      amount: actualBet
    };

    // 移动到下一个玩家
    this.moveToNextPlayer(room);

    // 检查是否结束回合/游戏
    this.checkRoundEnd(room);

    return room;
  }

  /**
   * 看牌
   */
  lookAtCards(roomId: string, playerId: string): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('房间不存在');
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('玩家不在房间中');
    }

    if (player.isFolded) {
      throw new Error('您已被淘汰');
    }

    if (player.isLooking) {
      throw new Error('您已经看过牌了');
    }

    // 标记为已看牌
    player.isLooking = true;

    // 记录操作
    room.lastAction = {
      playerId,
      action: 'look'
    };

    return room;
  }

  /**
   * 比牌
   */
  compareCards(
    roomId: string,
    playerId: string,
    targetPlayerId: string
  ): { room: Room; winnerId: string; loserId: string; winnerHand: HandAnalysis; loserHand: HandAnalysis } {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('房间不存在');
    }

    if (room.status !== 'playing') {
      throw new Error('游戏未开始');
    }

    const player = room.players.find(p => p.id === playerId);
    const targetPlayer = room.players.find(p => p.id === targetPlayerId);

    if (!player || !targetPlayer) {
      throw new Error('玩家不存在');
    }

    if (player.isFolded) {
      throw new Error('您已被淘汰');
    }

    if (targetPlayer.isFolded) {
      throw new Error('目标玩家已被淘汰');
    }

    // 检查是否轮到该玩家
    const currentPlayer = this.getActivePlayers(room)[room.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error('还未轮到你');
    }

    // 比牌需要支付当前回合的下注额（与下注相同）
    const multiplier = player.isLooking ? 2 : 1;
    const betAmount = 1 * multiplier; // 最小单位

    if (player.chips < betAmount) {
      throw new Error('积分不足');
    }

    // 扣除比牌费用
    player.chips -= betAmount;
    player.totalBet += betAmount;
    room.pot += betAmount;

    // 比较牌型
    const result = compareHands(player.cards, targetPlayer.cards);

    let winnerId: string;
    let loserId: string;

    if (result > 0) {
      // player 胜出
      winnerId = playerId;
      loserId = targetPlayerId;
      targetPlayer.isFolded = true;
    } else {
      // targetPlayer 胜出（包括平局的情况，发起比牌者输）
      winnerId = targetPlayerId;
      loserId = playerId;
      player.isFolded = true;
    }

    // 分析双方牌型
    const winnerHand = analyzeHand(winnerId === playerId ? player.cards : targetPlayer.cards);
    const loserHand = analyzeHand(loserId === playerId ? player.cards : targetPlayer.cards);

    // 记录操作
    room.lastAction = {
      playerId,
      action: 'compare',
      targetId: targetPlayerId
    };

    // 移动到下一个玩家
    this.moveToNextPlayer(room);

    // 检查是否结束游戏
    this.checkRoundEnd(room);

    return { room, winnerId, loserId, winnerHand, loserHand };
  }

  /**
   * 弃牌
   */
  fold(roomId: string, playerId: string): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('房间不存在');
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('玩家不在房间中');
    }

    if (player.isFolded) {
      throw new Error('您已被淘汰');
    }

    // 检查是否轮到该玩家
    const currentPlayer = this.getActivePlayers(room)[room.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error('还未轮到你');
    }

    // 标记为已淘汰
    player.isFolded = true;

    // 记录操作
    room.lastAction = {
      playerId,
      action: 'fold'
    };

    // 移动到下一个玩家
    this.moveToNextPlayer(room);

    // 检查是否结束游戏
    this.checkRoundEnd(room);

    return room;
  }

  /**
   * 获取仍在游戏中的玩家
   */
  private getActivePlayers(room: Room) {
    return room.players.filter(p => !p.isFolded);
  }

  /**
   * 移动到下一个玩家
   */
  private moveToNextPlayer(room: Room): void {
    const activePlayers = this.getActivePlayers(room);
    if (activePlayers.length <= 1) {
      return; // 游戏结束
    }

    let nextIndex = (room.currentPlayerIndex + 1) % activePlayers.length;
    room.currentPlayerIndex = nextIndex;

    // 重置当前回合的下注
    room.players.forEach(p => p.currentBet = 0);
  }

  /**
   * 检查回合/游戏是否结束
   */
  private checkRoundEnd(room: Room): void {
    const activePlayers = this.getActivePlayers(room);

    // 只剩一名玩家，游戏结束
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      winner.chips += room.pot;
      room.pot = 0;
      room.status = 'finished';
      return;
    }

    // 达到10轮，强制比牌
    if (room.round >= 10) {
      this.forceCompareAll(room);
      return;
    }

    // 检查是否所有玩家都行动过一次（完成一轮）
    // 这里简化处理：每次移动玩家后增加轮数
    if (room.currentPlayerIndex === 0) {
      room.round++;
    }
  }

  /**
   * 强制所有玩家比牌（10轮后）
   */
  private forceCompareAll(room: Room): void {
    const activePlayers = this.getActivePlayers(room);
    if (activePlayers.length === 0) {
      return;
    }

    // 找出牌型最大的玩家
    let winner = activePlayers[0];
    let winnerAnalysis = analyzeHand(winner.cards);

    for (let i = 1; i < activePlayers.length; i++) {
      const player = activePlayers[i];
      const analysis = analyzeHand(player.cards);

      if (analysis.value > winnerAnalysis.value) {
        winner = player;
        winnerAnalysis = analysis;
      }
    }

    // 获胜者获得底池
    winner.chips += room.pot;
    room.pot = 0;
    room.status = 'finished';
  }
}
