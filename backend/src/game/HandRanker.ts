import { Card, HandRank, HandAnalysis } from '../types';

/**
 * 炸金花牌型识别和比较工具
 */

// 点数到数值的映射
const RANK_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

/**
 * 将牌转换为数值数组并排序（从大到小）
 */
function getCardValues(cards: Card[]): number[] {
  return cards.map(card => RANK_VALUES[card.rank]).sort((a, b) => b - a);
}

/**
 * 检查是否为豹子（三张相同）
 */
function isLeopard(values: number[]): boolean {
  return values[0] === values[1] && values[1] === values[2];
}

/**
 * 检查是否为顺子
 */
function isStraight(values: number[]): boolean {
  const sorted = [...values].sort((a, b) => a - b);

  // 普通顺子：连续三张
  if (sorted[2] - sorted[1] === 1 && sorted[1] - sorted[0] === 1) {
    return true;
  }

  // 特殊顺子：A-2-3（最小的顺子）
  if (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 14) {
    return true;
  }

  return false;
}

/**
 * 检查是否为金花（同花色）
 */
function isFlush(cards: Card[]): boolean {
  return cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
}

/**
 * 检查是否为对子
 */
function hasPair(values: number[]): boolean {
  return values[0] === values[1] || values[1] === values[2] || values[0] === values[2];
}

/**
 * 获取对子的值和单牌值
 */
function getPairValues(values: number[]): { pairValue: number; kicker: number } {
  if (values[0] === values[1]) {
    return { pairValue: values[0], kicker: values[2] };
  } else if (values[1] === values[2]) {
    return { pairValue: values[1], kicker: values[0] };
  } else {
    return { pairValue: values[2], kicker: values[0] };
  }
}

/**
 * 计算顺子的值（用于比较）
 * A-2-3 是最小的顺子，值为 1
 */
function getStraightValue(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);

  // A-2-3 特殊处理
  if (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 14) {
    return 3; // 最大牌是3
  }

  return sorted[2]; // 返回最大牌
}

/**
 * 分析手牌牌型
 */
export function analyzeHand(cards: Card[]): HandAnalysis {
  if (cards.length !== 3) {
    throw new Error('炸金花必须是3张牌');
  }

  const values = getCardValues(cards);
  const flush = isFlush(cards);
  const straight = isStraight(values);

  // 豹子（三张相同）
  if (isLeopard(values)) {
    return {
      rank: HandRank.LEOPARD,
      value: 600000 + values[0], // 豹子基数 + 牌值
      description: `豹子 ${cards[0].rank}`
    };
  }

  // 同花顺
  if (flush && straight) {
    const straightValue = getStraightValue(values);
    return {
      rank: HandRank.STRAIGHT_FLUSH,
      value: 500000 + straightValue,
      description: '同花顺'
    };
  }

  // 金花（同花色）
  if (flush) {
    const value = 400000 + values[0] * 10000 + values[1] * 100 + values[2];
    return {
      rank: HandRank.FLUSH,
      value,
      description: '金花'
    };
  }

  // 顺子
  if (straight) {
    const straightValue = getStraightValue(values);
    return {
      rank: HandRank.STRAIGHT,
      value: 300000 + straightValue,
      description: '顺子'
    };
  }

  // 对子
  if (hasPair(values)) {
    const { pairValue, kicker } = getPairValues(values);
    const value = 200000 + pairValue * 100 + kicker;
    return {
      rank: HandRank.PAIR,
      value,
      description: `对子 ${pairValue}`
    };
  }

  // 散牌（高牌）
  const value = 100000 + values[0] * 10000 + values[1] * 100 + values[2];
  return {
    rank: HandRank.HIGH_CARD,
    value,
    description: '散牌'
  };
}

/**
 * 比较两手牌
 * @returns 1 表示 hand1 胜, -1 表示 hand2 胜, 0 表示平局（理论上不会出现）
 */
export function compareHands(hand1: Card[], hand2: Card[]): number {
  const analysis1 = analyzeHand(hand1);
  const analysis2 = analyzeHand(hand2);

  if (analysis1.value > analysis2.value) {
    return 1;
  } else if (analysis1.value < analysis2.value) {
    return -1;
  } else {
    return 0; // 平局（极少出现）
  }
}
