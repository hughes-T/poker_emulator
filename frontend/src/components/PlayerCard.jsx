import Card, { CardBack } from './Card';

/**
 * 玩家卡片组件
 * 显示玩家信息和手牌
 */
function PlayerCard({ player, isCurrentPlayer, showCards }) {
  return (
    <div className={`
      bg-white/10 backdrop-blur-sm rounded-lg p-4
      border-2 ${isCurrentPlayer ? 'border-yellow-400' : 'border-white/20'}
      transition-all duration-300
      ${isCurrentPlayer ? 'shadow-lg shadow-yellow-400/50' : ''}
    `}>
      {/* 玩家信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`
            w-3 h-3 rounded-full
            ${player.isReady ? 'bg-green-400' : 'bg-gray-400'}
          `} />
          <h3 className="text-white font-semibold">
            {player.name}
            {isCurrentPlayer && <span className="text-yellow-400 ml-1">(你)</span>}
          </h3>
        </div>
        {player.isReady && (
          <span className="text-xs text-green-400 font-semibold">已准备</span>
        )}
      </div>

      {/* 手牌 */}
      <div className="flex gap-2 justify-center">
        {player.cards && player.cards.length > 0 ? (
          showCards ? (
            // 显示具体的牌
            player.cards.map((card, index) => (
              <Card
                key={index}
                suit={card.suit}
                rank={card.rank}
                className="animate-card-deal"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))
          ) : (
            // 显示牌背面
            [...Array(player.cards.length)].map((_, index) => (
              <CardBack
                key={index}
                className="animate-card-deal"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))
          )
        ) : (
          <p className="text-white/50 text-sm">暂无手牌</p>
        )}
      </div>
    </div>
  );
}

export default PlayerCard;
