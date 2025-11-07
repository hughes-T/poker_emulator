import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getSocket, leaveRoom, dealCards } from '../utils/socket';
import PlayerCard from '../components/PlayerCard';

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { playerName, isHost, initialRoom } = location.state || {};

  const [room, setRoom] = useState(initialRoom || null);
  const [myId, setMyId] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
      // 更新房间状态，显示所有玩家的牌
      setRoom(prevRoom => ({
        ...prevRoom,
        players: data.players,
        status: 'dealt'
      }));
    });

    socket.on('playerReadyUpdate', (data) => {
      setRoom(data.room);
    });

    socket.on('error', (data) => {
      setError(data.message);
    });

    // 清理函数
    return () => {
      socket.off('roomCreated');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('cardsDealt');
      socket.off('playerReadyUpdate');
      socket.off('error');
    };
  }, [playerName, navigate]);

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
                {room.gameType} 张模式 · {room.players.length} 人在线
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
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* 游戏控制 */}
        {isRoomHost && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="font-semibold mb-1">房主控制</h3>
                <p className="text-sm text-white/70">
                  {canDeal ? '点击发牌开始游戏' : `需要至少 2 名玩家才能开始游戏`}
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
                showCards={player.id === myId} // 只显示自己的牌
              />
            ))}
          </div>
        </div>

        {/* 提示信息 */}
        {room.players.length < 2 && (
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-200 text-center">
            等待更多玩家加入... 分享房间号给朋友吧！
          </div>
        )}

        {room.status === 'dealt' && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-center">
            发牌完成！查看你的手牌
          </div>
        )}
      </div>
    </div>
  );
}

export default Room;
