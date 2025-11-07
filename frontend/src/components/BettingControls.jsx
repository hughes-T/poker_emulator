import { useState } from 'react';
import { ZHAJINHUA_CONFIG } from '../utils/config';

/**
 * 下注控制组件
 */
function BettingControls({
  isMyTurn,
  myPlayer,
  onBet,
  onLook,
  onCompare,
  onFold,
  disabled
}) {
  const [betAmount, setBetAmount] = useState(ZHAJINHUA_CONFIG.MIN_BET);

  if (!isMyTurn) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
        <div className="text-center text-white/70">
          请等待轮到你...
        </div>
      </div>
    );
  }

  const multiplier = myPlayer?.isLooking ? 2 : 1;
  const actualBet = betAmount * multiplier;
  const maxBet = myPlayer?.isLooking ? ZHAJINHUA_CONFIG.LOOK_BET_MAX : ZHAJINHUA_CONFIG.BLIND_BET_MAX;

  const canAfford = myPlayer && myPlayer.chips >= actualBet;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold">
            {myPlayer?.isLooking ? '看牌下注' : '闷牌下注'}
          </span>
          <span className="text-white/70 text-sm">
            实际消耗: <span className="text-yellow-400 font-bold">{actualBet}</span> 积分
          </span>
        </div>

        {/* 下注金额滑块 */}
        <div className="mb-4">
          <input
            type="range"
            min={ZHAJINHUA_CONFIG.MIN_BET}
            max={maxBet}
            step={1}
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full"
            disabled={disabled}
          />
          <div className="flex justify-between text-white/70 text-sm mt-1">
            <span>{ZHAJINHUA_CONFIG.MIN_BET}</span>
            <span className="text-white font-bold">{betAmount}</span>
            <span>{maxBet}</span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-2 gap-2">
        {/* 下注 */}
        <button
          onClick={() => onBet(betAmount)}
          disabled={disabled || !canAfford}
          className={`py-3 rounded-lg font-semibold transition-colors ${
            canAfford
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-500 text-white/50 cursor-not-allowed'
          }`}
        >
          下注 {betAmount}
        </button>

        {/* 看牌 */}
        <button
          onClick={onLook}
          disabled={disabled || myPlayer?.isLooking}
          className={`py-3 rounded-lg font-semibold transition-colors ${
            !myPlayer?.isLooking
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-500 text-white/50 cursor-not-allowed'
          }`}
        >
          {myPlayer?.isLooking ? '已看牌' : '看牌'}
        </button>

        {/* 比牌 */}
        <button
          onClick={onCompare}
          disabled={disabled || !canAfford}
          className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:text-white/50 disabled:cursor-not-allowed"
        >
          比牌
        </button>

        {/* 弃牌 */}
        <button
          onClick={onFold}
          disabled={disabled}
          className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:text-white/50 disabled:cursor-not-allowed"
        >
          弃牌
        </button>
      </div>

      {!canAfford && (
        <div className="mt-3 text-red-400 text-sm text-center">
          积分不足，请调整下注金额或弃牌
        </div>
      )}
    </div>
  );
}

export default BettingControls;
