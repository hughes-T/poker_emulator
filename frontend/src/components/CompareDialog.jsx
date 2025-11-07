/**
 * 比牌对话框组件
 */
function CompareDialog({ players, myId, onSelect, onCancel }) {
  // 筛选出可以比牌的玩家（排除自己和已淘汰的玩家）
  const availablePlayers = players.filter(p => p.id !== myId && !p.isFolded);

  if (availablePlayers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold text-white mb-4">选择比牌对象</h3>
          <p className="text-white/70 mb-4">没有可以比牌的玩家</p>
          <button
            onClick={onCancel}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">选择比牌对象</h3>

        <div className="space-y-2 mb-4">
          {availablePlayers.map(player => (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className="w-full bg-white/10 hover:bg-white/20 text-white p-4 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-white/70">
                    积分: {player.chips} | {player.isLooking ? '已看牌' : '闷牌'}
                  </div>
                </div>
                <div className="text-2xl">👤</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}

export default CompareDialog;
