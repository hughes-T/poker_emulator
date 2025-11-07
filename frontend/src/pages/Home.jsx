import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, joinRoom } from '../utils/socket';
import { GAME_CONFIG } from '../utils/config';

function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [playerName, setPlayerName] = useState('');
  const [gameType, setGameType] = useState(5);
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('请输入玩家昵称');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await createRoom(playerName.trim(), gameType);
      navigate(`/room/${data.roomId}`, {
        state: {
          playerName: playerName.trim(),
          isHost: true,
          initialRoom: data.room  // 传递初始房间数据
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('请输入玩家昵称');
      return;
    }
    if (!roomId.trim()) {
      setError('请输入房间 ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinRoom(roomId.trim().toUpperCase(), playerName.trim());
      navigate(`/room/${roomId.trim().toUpperCase()}`, {
        state: { playerName: playerName.trim(), isHost: false }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 标题 */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-5xl font-bold text-white mb-2">
            🃏 扑克发牌模拟器
          </h1>
          <p className="text-white/70">多人实时在线</p>
        </div>

        {/* 主界面 */}
        {!mode ? (
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => setMode('create')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-6 rounded-lg transition-colors"
            >
              创建房间
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-semibold py-6 rounded-lg transition-colors"
            >
              加入房间
            </button>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              {mode === 'create' ? '创建房间' : '加入房间'}
            </h2>

            <form onSubmit={mode === 'create' ? handleCreateRoom : handleJoinRoom}>
              {/* 玩家昵称 */}
              <div className="mb-4">
                <label className="block text-white mb-2">玩家昵称</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="请输入昵称"
                  className="input-field"
                  maxLength={20}
                  autoFocus
                />
              </div>

              {/* 创建房间：选择游戏类型 */}
              {mode === 'create' && (
                <div className="mb-4">
                  <label className="block text-white mb-2">游戏类型</label>
                  <div className="flex gap-4">
                    {GAME_CONFIG.CARD_OPTIONS.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setGameType(type)}
                        className={`
                          flex-1 py-3 rounded-lg font-semibold transition-colors
                          ${gameType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                          }
                        `}
                      >
                        {type} 张
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 加入房间：输入房间 ID */}
              {mode === 'join' && (
                <div className="mb-4">
                  <label className="block text-white mb-2">房间 ID</label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="请输入 6 位房间 ID"
                    className="input-field uppercase"
                    maxLength={6}
                  />
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode(null);
                    setError('');
                    setRoomId('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  返回
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? '加载中...' : mode === 'create' ? '创建' : '加入'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 页脚 */}
        <div className="text-center mt-8 text-white/50 text-sm">
          <p>支持 {GAME_CONFIG.MIN_PLAYERS} - {GAME_CONFIG.MAX_PLAYERS} 人游戏</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
