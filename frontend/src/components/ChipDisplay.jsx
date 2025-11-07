/**
 * 积分和底池显示组件
 */
function ChipDisplay({ pot, myChips }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        {/* 底池 */}
        <div className="flex items-center gap-2">
          <div className="text-3xl">💰</div>
          <div>
            <div className="text-white/70 text-sm">底池</div>
            <div className="text-yellow-400 text-2xl font-bold">{pot}</div>
          </div>
        </div>

        {/* 我的积分 */}
        <div className="flex items-center gap-2">
          <div>
            <div className="text-white/70 text-sm text-right">我的积分</div>
            <div className="text-green-400 text-2xl font-bold">{myChips}</div>
          </div>
          <div className="text-3xl">🪙</div>
        </div>
      </div>
    </div>
  );
}

export default ChipDisplay;
