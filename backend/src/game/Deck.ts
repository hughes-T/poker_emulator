import { Card, Suit, Rank } from '../types';

/**
 * 扑克牌堆类
 * 负责生成、洗牌、发牌
 */
export class Deck {
  private cards: Card[];

  constructor() {
    this.cards = this.generateDeck();
    this.shuffle();
  }

  /**
   * 生成完整的 52 张扑克牌
   */
  private generateDeck(): Card[] {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const deck: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }

    return deck;
  }

  /**
   * 洗牌（Fisher-Yates 算法）
   */
  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * 发牌
   * @param count 发牌数量
   * @returns 发出的牌
   */
  deal(count: number): Card[] {
    if (count > this.cards.length) {
      throw new Error(`牌堆中只剩 ${this.cards.length} 张牌，无法发出 ${count} 张`);
    }
    return this.cards.splice(0, count);
  }

  /**
   * 获取剩余牌数
   */
  get remainingCards(): number {
    return this.cards.length;
  }

  /**
   * 重置牌堆（重新生成并洗牌）
   */
  reset(): void {
    this.cards = this.generateDeck();
    this.shuffle();
  }
}
