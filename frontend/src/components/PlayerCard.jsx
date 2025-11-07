import Card, { CardBack } from './Card';

/**
 * 玩家卡片组件
 * 显示玩家信息和手牌
 */
function PlayerCard({ player, isCurrentPlayer, showCards, isCurrentTurn, gameStatus }) {
  const isPlaying = gameStatus === 'playing';
  const isFolded = player.isFolded;

  return (
    <div className={`
      bg-white/10 backdrop-blur-sm rounded-lg p-4
      border-2 ${
        isFolded
          ? 'border-gray-600 opacity-50'
          : isCurrentTurn
            ? 'border-green-400'
            : isCurrentPlayer
              ? 'border-yellow-400'
              : 'border-white/20'
      }
      transition-all duration-300
      ${isCurrentTurn && !isFolded ? 'shadow-lg shadow-green-400/50 ring-2 ring-green-400' : ''}
      ${isCurrentPlayer && !isCurrentTurn && !isFolded ? 'shadow-lg shadow-yellow-400/50' : ''}
    `}>
      {/* 玩家信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* 状态指示器 */}
          <div className={`
            w-3 h-3 rounded-full
            ${isFolded ? 'bg-gray-600' : player.isReady ? 'bg-green-400' : 'bg-gray-400'}
          `} />
          <h3 className="text-white font-semibold">
            {player.name}
            {isCurrentPlayer && <span className="text-yellow-400 ml-1">(你)</span>}
          </h3>
        </div>

        {/* 状态标签 */}
        <div className="flex gap-1">
          {isFolded && (
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">已淘汰</span>
          )}
          {!isFolded && isPlaying && player.isLooking && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">已看牌</span>
          )}
          {!isFolded && isPlaying && !player.isLooking && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">闷牌</span>
          )}
          {!isPlaying && player.isReady && (
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">已准备</span>
          )}
        </div>
      </div>

      {/* 积分显示（炸金花模式） */}
      {typeof player.chips !== 'undefined' && (
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-white/70">积分:</span>
          <span className={`font-bold ${
            player.chips === 0 ? 'text-red-400' :
            player.chips < 20 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {player.chips}
          </span>
        </div>
      )}

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
