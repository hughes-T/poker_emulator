import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getSocket,
  leaveRoom,
  dealCards,
  placeBet,
  lookAtCards,
  compareCards,
  fold
} from '../utils/socket';
import PlayerCard from '../components/PlayerCard';
import ChipDisplay from '../components/ChipDisplay';
import GameStatus from '../components/GameStatus';
import BettingControls from '../components/BettingControls';
import CompareDialog from '../components/CompareDialog';
import { ZHAJINHUA_CONFIG } from '../utils/config';

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { playerName, isHost, initialRoom } = location.state || {};

  const [room, setRoom] = useState(initialRoom || null);
  const [myId, setMyId] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [gameMessage, setGameMessage] = useState('');

  useEffect(() => {
    // 如果没有玩家信息，返回首页
    if (!playerName) {
      navigate('/');
      return;
    }

    const socket = getSocket();
    setMyId(socket.id);

    // 监听房间更新
    socket.on('roomCreated', (data) => {
      setRoom(data.room);
    });

    socket.on('playerJoined', (data) => {
      setRoom(data.room);
    });

    socket.on('playerLeft', (data) => {
      setRoom(data.room);
    });

    socket.on('cardsDealt', (data) => {
      // 更新玩家的手牌数据和游戏状态
      setRoom(prevRoom => {
        if (!prevRoom) return null;

        // 合并新的玩家数据（包括cards, isFolded, isLooking等所有状态）
        const updatedPlayers = prevRoom.players.map(p => {
          const playerData = data.players.find(dp => dp.id === p.id);
          return playerData ? { ...p, ...playerData } : p;
        });

        return {
          ...prevRoom,
          players: updatedPlayers,
          status: prevRoom.gameType === 3 ? 'playing' : 'dealt'
        };
      });
    });

    socket.on('playerReadyUpdate', (data) => {
      setRoom(data.room);
    });

    socket.on('error', (data) => {
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    // 炸金花游戏事件
    socket.on('gameStateUpdate', (data) => {
      setRoom(data.room);
    });

    socket.on('betPlaced', (data) => {
      setRoom(data.room);
      const player = data.room.players.find(p => p.id === data.playerId);
      showMessage(`${player?.name} 下注 ${data.amount}`);
    });

    socket.on('cardsLooked', (data) => {
      setRoom(data.room);
      const player = data.room.players.find(p => p.id === data.playerId);
      showMessage(`${player?.name} 看牌了`);
    });

    socket.on('compareResult', (data) => {
      setRoom(data.room);
      const winner = data.room.players.find(p => p.id === data.winnerId);
      const loser = data.room.players.find(p => p.id === data.loserId);
      showMessage(
        `比牌结果: ${winner?.name} (${data.winnerHand.description}) 胜 ` +
        `${loser?.name} (${data.loserHand.description})`
      );
    });

    socket.on('playerFolded', (data) => {
      setRoom(data.room);
      const player = data.room.players.find(p => p.id === data.playerId);
      showMessage(`${player?.name} 弃牌了`);
    });

    socket.on('gameEnd', (data) => {
      setRoom(data.room);
      const winner = data.room.players.find(p => p.id === data.winnerId);
      showMessage(`游戏结束！${winner?.name} 获胜，赢得 ${data.amount} 积分！`, 5000);
    });

    // 清理函数
    return () => {
      socket.off('roomCreated');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('cardsDealt');
      socket.off('playerReadyUpdate');
      socket.off('error');
      socket.off('gameStateUpdate');
      socket.off('betPlaced');
      socket.off('cardsLooked');
      socket.off('compareResult');
      socket.off('playerFolded');
      socket.off('gameEnd');
    };
  }, [playerName, navigate]);

  // 显示游戏消息
  const showMessage = (message, duration = 3000) => {
    setGameMessage(message);
    setTimeout(() => setGameMessage(''), duration);
  };

  const handleLeaveRoom = () => {
    if (window.confirm('确定要离开房间吗？')) {
      leaveRoom(roomId);
      navigate('/');
    }
  };

  const handleDealCards = () => {
    dealCards(roomId);
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 炸金花游戏操作
  const handleBet = (amount) => {
    placeBet(roomId, amount);
  };

  const handleLook = () => {
    lookAtCards(roomId);
  };

  const handleCompare = () => {
    setShowCompareDialog(true);
  };

  const handleCompareSelect = (targetPlayerId) => {
    compareCards(roomId, targetPlayerId);
    setShowCompareDialog(false);
  };

  const handleFold = () => {
    if (window.confirm('确定要弃牌吗？')) {
      fold(roomId);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <div className="text-white text-xl mb-2">正在连接到房间...</div>
          <div className="text-white/70 text-sm">请稍候，正在建立实时连接</div>
        </div>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.id === myId);
  const isRoomHost = room.hostId === myId;
  const canDeal = isRoomHost && room.players.length >= 2;
  const isZhajinhua = room.gameType === 3;
  const isPlaying = room.status === 'playing';

  // 获取当前行动玩家
  const activePlayers = room.players.filter(p => !p.isFolded);
  const currentTurnPlayer = isPlaying && activePlayers.length > 0
    ? activePlayers[room.currentPlayerIndex || 0]
    : null;
  const isMyTurn = currentTurnPlayer?.id === myId;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部信息 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                房间 {roomId}
              </h1>
              <p className="text-white/70">
                {room.gameType} 张模式{isZhajinhua && ' - 炸金花'} · {room.players.length} 人在线
                {isRoomHost && <span className="ml-2 text-yellow-400">(你是房主)</span>}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyRoomId}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {copied ? '✓ 已复制' : '复制房间号'}
              </button>
              <button
                onClick={handleShareLink}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                分享链接
              </button>
              <button
                onClick={handleLeaveRoom}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                离开房间
              </button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 animate-slide-up">
            {error}
          </div>
        )}

        {/* 游戏消息 */}
        {gameMessage && (
          <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-200 animate-slide-up">
            {gameMessage}
          </div>
        )}

        {/* 炸金花游戏界面 */}
        {isZhajinhua && isPlaying ? (
          <>
            {/* 积分和底池 */}
            <ChipDisplay pot={room.pot || 0} myChips={currentPlayer?.chips || 0} />

            {/* 游戏状态 */}
            <GameStatus
              round={room.round || 1}
              currentPlayer={currentTurnPlayer}
              maxRounds={ZHAJINHUA_CONFIG.MAX_ROUNDS}
              lastAction={room.lastAction}
            />

            {/* 下注控制 */}
            {currentPlayer && !currentPlayer.isFolded && (
              <BettingControls
                isMyTurn={isMyTurn}
                myPlayer={currentPlayer}
                onBet={handleBet}
                onLook={handleLook}
                onCompare={handleCompare}
                onFold={handleFold}
              />
            )}

            {/* 比牌对话框 */}
            {showCompareDialog && (
              <CompareDialog
                players={room.players}
                myId={myId}
                onSelect={handleCompareSelect}
                onCancel={() => setShowCompareDialog(false)}
              />
            )}
          </>
        ) : (
          /* 游戏控制（等待/发牌阶段） */
          isRoomHost && room.status !== 'finished' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="font-semibold mb-1">房主控制</h3>
                  <p className="text-sm text-white/70">
                    {canDeal
                      ? isZhajinhua
                        ? '点击发牌开始炸金花游戏'
                        : '点击发牌开始游戏'
                      : `需要至少 2 名玩家才能开始游戏`}
                  </p>
                </div>
                <button
                  onClick={handleDealCards}
                  disabled={!canDeal}
                  className="btn-primary"
                >
                  🎴 发牌
                </button>
              </div>
            </div>
          )
        )}

        {/* 玩家列表 */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            玩家列表 ({room.players.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {room.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isCurrentPlayer={player.id === myId}
                isCurrentTurn={currentTurnPlayer?.id === player.id}
                showCards={player.id === myId && player.isLooking} // 只有自己且已看牌才显示
                gameStatus={room.status}
              />
            ))}
          </div>
        </div>

        {/* 提示信息 */}
        {room.players.length < 2 && room.status === 'waiting' && (
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-200 text-center">
            等待更多玩家加入... 分享房间号给朋友吧！
          </div>
        )}

        {room.status === 'dealt' && !isZhajinhua && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-center">
            发牌完成！查看你的手牌
          </div>
        )}

        {room.status === 'finished' && (
          <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500 rounded-lg text-purple-200 text-center">
            <div className="text-xl font-bold mb-2">游戏结束！</div>
            {isRoomHost && (
              <button
                onClick={handleDealCards}
                disabled={!canDeal}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                开始下一局
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Room;
