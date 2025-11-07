/**
 * 应用配置
 */

// 后端 WebSocket URL
export const WS_URL = import.meta.env.PROD
  ? 'https://your-backend.railway.app'  // 生产环境（需要替换成实际的 Railway URL）
  : 'http://localhost:3000';

// 开发模式
export const isDevelopment = import.meta.env.DEV;

// 生产模式
export const isProduction = import.meta.env.PROD;

// 扑克牌花色符号
export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

// 扑克牌花色颜色
export const SUIT_COLORS = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900'
};

// 游戏配置
export const GAME_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  CARD_OPTIONS: [3, 5]
};
