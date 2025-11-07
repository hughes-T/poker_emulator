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
export type RoomStatus = 'waiting' | 'dealing' | 'dealt' | 'playing' | 'comparing' | 'finished';

/**
 * 炸金花牌型（从大到小）
 */
export enum HandRank {
  LEOPARD = 6,      // 豹子（三张相同）
  STRAIGHT_FLUSH = 5, // 同花顺
  FLUSH = 4,         // 金花（同花色）
  STRAIGHT = 3,      // 顺子
  PAIR = 2,          // 对子
  HIGH_CARD = 1      // 散牌
}

/**
 * 牌型分析结果
 */
export interface HandAnalysis {
  rank: HandRank;    // 牌型
  value: number;     // 用于比较的数值（越大越好）
  description: string; // 牌型描述
}

/**
 * 玩家信息
 */
export interface Player {
  id: string;          // Socket ID
  name: string;        // 玩家昵称
  cards: Card[];       // 手牌
  isReady: boolean;    // 是否准备
  chips: number;       // 积分
  isLooking: boolean;  // 是否看牌
  isFolded: boolean;   // 是否淘汰/弃牌
  currentBet: number;  // 当前回合下注额
  totalBet: number;    // 本局总下注额
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
  // 炸金花游戏状态
  round: number;       // 当前轮数
  pot: number;         // 底池（总下注额）
  currentPlayerIndex: number; // 当前行动玩家索引
  maxBet: number;      // 当前回合最高下注额
  anteCollected: boolean; // 是否已收取底注
  lastAction?: {       // 上一个操作
    playerId: string;
    action: 'bet' | 'look' | 'compare' | 'fold';
    amount?: number;
    targetId?: string; // 比牌目标玩家ID
  };
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
  // 炸金花游戏事件
  placeBet: (data: { roomId: string; amount: number }) => void;
  lookAtCards: (data: { roomId: string }) => void;
  compareCards: (data: { roomId: string; targetPlayerId: string }) => void;
  fold: (data: { roomId: string }) => void;
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
  // 炸金花游戏事件
  gameStateUpdate: (data: { room: Room }) => void;
  betPlaced: (data: { room: Room; playerId: string; amount: number }) => void;
  cardsLooked: (data: { room: Room; playerId: string }) => void;
  compareResult: (data: {
    room: Room;
    winnerId: string;
    loserId: string;
    winnerHand: HandAnalysis;
    loserHand: HandAnalysis;
  }) => void;
  playerFolded: (data: { room: Room; playerId: string }) => void;
  roundEnd: (data: { room: Room; winnerId: string; amount: number }) => void;
  gameEnd: (data: { room: Room; winnerId: string; amount: number }) => void;
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
