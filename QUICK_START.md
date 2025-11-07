# ⚡ 快速启动指南

立即开始使用扑克发牌模拟器！

## 🚀 5 分钟快速启动

### 第 1 步：检查环境

确保你已安装：
- Node.js 18 或更高版本

检查版本：
```bash
node --version
# 应该显示 v18.x.x 或更高
```

如果未安装，访问 https://nodejs.org/ 下载安装。

### 第 2 步：安装依赖

打开两个终端窗口。

**终端 1 - 后端：**
```bash
cd backend
npm install
```

**终端 2 - 前端：**
```bash
cd frontend
npm install
```

等待依赖安装完成（首次安装需要几分钟）。

### 第 3 步：启动服务

**终端 1 - 后端：**
```bash
npm run dev
```

你会看到：
```
╔════════════════════════════════════════╗
║  Poker Emulator Backend Server         ║
╚════════════════════════════════════════╝

🚀 Server is running on port 3000
...
```

**终端 2 - 前端：**
```bash
npm run dev
```

你会看到：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### 第 4 步：开始玩！

1. 打开浏览器访问 http://localhost:5173/
2. 点击"创建房间"
3. 输入昵称，选择 3 张或 5 张
4. 点击创建
5. 复制房间号分享给朋友，或在另一个浏览器窗口加入

---

## 🎮 测试多人游戏

### 方法 1：使用多个浏览器窗口

1. 打开两个浏览器窗口都访问 http://localhost:5173/
2. 在第一个窗口创建房间，记下房间号
3. 在第二个窗口加入房间
4. 点击发牌测试

### 方法 2：使用手机测试

1. 确保手机和电脑在同一个 WiFi 网络
2. 查看前端终端输出的 Network 地址（如 `http://192.168.1.100:5173/`）
3. 在手机浏览器中访问这个地址
4. 加入电脑上创建的房间

---

## 🛑 停止服务

在两个终端中按 `Ctrl + C`

---

## 📝 常用命令

### 后端

```bash
cd backend

# 开发模式（自动重启）
npm run dev

# 类型检查
npm run type-check

# 构建
npm run build

# 生产运行
npm start
```

### 前端

```bash
cd frontend

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

---

## 🔧 故障排查

### 端口被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方法：**

**Windows:**
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换 PID）
taskkill /PID <进程ID> /F
```

**Mac/Linux:**
```bash
# 查找占用端口的进程
lsof -i :3000

# 结束进程（替换 PID）
kill -9 <进程ID>
```

### 依赖安装失败

**解决方法：**
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 前端无法连接后端

1. 确保后端正在运行（检查终端 1）
2. 检查后端端口是否为 3000
3. 打开浏览器控制台（F12）查看错误信息

---

## 📚 下一步

- 阅读 [README.md](README.md) 了解完整功能
- 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 学习如何部署
- 开始添加新功能！

---

**享受游戏！ 🎉**
