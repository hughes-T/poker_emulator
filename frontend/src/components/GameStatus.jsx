/**
 * 游戏状态显示组件
 */
function GameStatus({ round, currentPlayer, maxRounds, lastAction }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* 当前轮数 */}
        <div className="flex items-center gap-2">
          <div className="text-2xl">🎯</div>
          <div>
            <div className="text-white/70 text-sm">回合</div>
            <div className="text-white text-lg font-semibold">
              {round} / {maxRounds}
            </div>
          </div>
        </div>

        {/* 当前玩家 */}
        <div className="flex items-center gap-2">
          <div className="text-2xl">👤</div>
          <div>
            <div className="text-white/70 text-sm">当前玩家</div>
            <div className="text-white text-lg font-semibold">
              {currentPlayer?.name || '等待中...'}
            </div>
          </div>
        </div>

        {/* 上一个操作 */}
        {lastAction && (
          <div className="flex items-center gap-2">
            <div className="text-2xl">📋</div>
            <div>
              <div className="text-white/70 text-sm">上一个操作</div>
              <div className="text-white text-lg font-semibold">
                {getActionText(lastAction)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 获取操作文本
function getActionText(action) {
  const actionMap = {
    bet: `下注 ${action.amount}`,
    look: '看牌',
    compare: '比牌',
    fold: '弃牌'
  };
  return actionMap[action.action] || '';
}

export default GameStatus;
