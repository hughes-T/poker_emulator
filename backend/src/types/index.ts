/**
 * 扑克牌花色
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

/**
 * 扑克牌点数
 */
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

/**
 * 扑克牌
 */
export interface Card {
  suit: Suit;
  rank: Rank;
}

/**
 * 游戏类型（3张或5张）
 */
export type GameType = 3 | 5;

/**
 * 房间状态
 */
export type RoomStatus = 'waiting' | 'dealing' | 'dealt';

/**
 * 玩家信息
 */
export interface Player {
  id: string;          // Socket ID
  name: string;        // 玩家昵称
  cards: Card[];       // 手牌
  isReady: boolean;    // 是否准备
}

/**
 * 房间信息
 */
export interface Room {
  id: string;          // 房间 ID
  gameType: GameType;  // 游戏类型
  players: Player[];   // 玩家列表
  hostId: string;      // 房主 Socket ID
  status: RoomStatus;  // 房间状态
  createdAt: Date;     // 创建时间
}

/**
 * Socket 事件 - 客户端发送
 */
export interface ClientToServerEvents {
  createRoom: (data: { playerName: string; gameType: GameType }) => void;
  joinRoom: (data: { roomId: string; playerName: string }) => void;
  leaveRoom: (data: { roomId: string }) => void;
  dealCards: (data: { roomId: string }) => void;
  playerReady: (data: { roomId: string; isReady: boolean }) => void;
}

/**
 * Socket 事件 - 服务器发送
 */
export interface ServerToClientEvents {
  roomCreated: (data: { roomId: string; room: Room }) => void;
  playerJoined: (data: { room: Room }) => void;
  playerLeft: (data: { room: Room; playerId: string }) => void;
  cardsDealt: (data: { players: Array<{ id: string; name: string; cards: Card[] }> }) => void;
  playerReadyUpdate: (data: { room: Room }) => void;
  error: (data: { message: string }) => void;
}

/**
 * 简化的玩家信息（不包含手牌，用于广播给其他玩家）
 */
export interface PublicPlayer {
  id: string;
  name: string;
  cardCount: number;   // 手牌数量
  isReady: boolean;
}
