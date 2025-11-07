import { SUIT_SYMBOLS, SUIT_COLORS } from '../utils/config';

/**
 * 扑克牌组件
 */
function Card({ suit, rank, className = '' }) {
  const suitSymbol = SUIT_SYMBOLS[suit];
  const colorClass = SUIT_COLORS[suit];

  return (
    <div className={`
      w-20 h-28 bg-white rounded-lg border-2 border-gray-800
      flex flex-col items-center justify-center
      card-shadow card-hover
      ${className}
    `}>
      <span className={`text-4xl ${colorClass}`}>
        {suitSymbol}
      </span>
      <span className={`text-2xl font-bold ${colorClass} mt-1`}>
        {rank}
      </span>
    </div>
  );
}

/**
 * 卡牌背面组件
 */
export function CardBack({ className = '' }) {
  return (
    <div className={`
      w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-gray-800
      flex items-center justify-center
      card-shadow
      ${className}
    `}>
      <div className="w-14 h-20 border-4 border-white/30 rounded-md">
        <div className="w-full h-full grid grid-cols-3 grid-rows-4 gap-0.5 p-1">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white/20 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Card;
