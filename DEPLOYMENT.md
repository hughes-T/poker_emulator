# 🚀 部署指南

本文档详细说明如何将扑克发牌模拟器部署到生产环境。

## 📋 部署清单

- [ ] Node.js 18+ 已安装
- [ ] Git 已安装
- [ ] GitHub 账号已创建
- [ ] Railway 账号已注册
- [ ] 代码已推送到 GitHub

---

## 第一部分：准备工作

### 1. 初始化 Git 仓库

```bash
# 在项目根目录
cd d:\my_project\poker_emulator

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 扑克发牌模拟器完整代码"
```

### 2. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`poker_emulator`（或其他名称）
3. 设置为 **Public**（GitHub Pages 免费版需要公开仓库）
4. **不要**勾选 "Add a README file"
5. 点击 **Create repository**

### 3. 推送代码到 GitHub

```bash
# 添加远程仓库（替换 your-username）
git remote add origin https://github.com/your-username/poker_emulator.git

# 推送代码
git branch -M main
git push -u origin main
```

---

## 第二部分：部署后端到 Railway

### 步骤 1：注册 Railway 账号

1. 访问 https://railway.app/
2. 点击 **Login**
3. 选择 **Login with GitHub**
4. 授权 Railway 访问你的 GitHub 账号

### 步骤 2：创建新项目

1. 登录后，点击 **New Project**
2. 选择 **Deploy from GitHub repo**
3. 如果首次使用，点击 **Configure GitHub App** 授权访问仓库
4. 选择 `poker_emulator` 仓库
5. Railway 会自动开始部署

### 步骤 3：配置后端服务

1. 部署完成后，点击项目进入详情页
2. 点击 **Settings** 标签
3. 找到 **Root Directory** 设置
4. 输入：`backend`
5. 点击 **Save**

### 步骤 4：设置环境变量

1. 点击 **Variables** 标签
2. 添加以下变量：

```
FRONTEND_URL=http://localhost:5173
NODE_ENV=production
```

（注意：`FRONTEND_URL` 稍后会更新为 GitHub Pages 的实际地址）

### 步骤 5：生成公开域名

1. 点击 **Settings** 标签
2. 找到 **Networking** 部分
3. 点击 **Generate Domain**
4. Railway 会生成一个域名，例如：
   ```
   poker-backend-production-abcd.up.railway.app
   ```
5. **复制这个域名**，稍后需要用到

### 步骤 6：验证后端部署

1. 访问后端健康检查端点：
   ```
   https://poker-backend-production-abcd.up.railway.app/health
   ```
2. 如果看到 JSON 响应 `{"status":"ok",...}`，说明部署成功

---

## 第三部分：部署前端到 GitHub Pages

### 步骤 1：更新前端配置

修改 `frontend/src/utils/config.js`，将后端 URL 替换为实际的 Railway 地址：

```javascript
export const WS_URL = import.meta.env.PROD
  ? 'https://poker-backend-production-abcd.up.railway.app'  // 替换成你的 Railway 域名
  : 'http://localhost:3000';
```

### 步骤 2：更新 Vite 配置（如果使用自定义域名）

如果你的 GitHub Pages 地址是 `https://your-username.github.io/poker_emulator/`，需要修改 `frontend/vite.config.js`：

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/poker_emulator/',  // 添加仓库名作为 base
  // ...其他配置
})
```

如果使用自定义域名或根域名，保持 `base: '/'` 即可。

### 步骤 3：提交并推送更改

```bash
git add .
git commit -m "Update: 配置生产环境后端 URL"
git push origin main
```

### 步骤 4：启用 GitHub Pages

1. 访问你的 GitHub 仓库
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 下拉菜单中选择 **GitHub Actions**
5. 保存设置

### 步骤 5：等待自动部署

1. 点击仓库顶部的 **Actions** 标签
2. 你会看到一个名为 "Deploy Frontend to GitHub Pages" 的工作流正在运行
3. 等待几分钟直到工作流显示绿色 ✅

### 步骤 6：访问前端应用

1. 回到 **Settings** > **Pages**
2. 你会看到前端地址，例如：
   ```
   https://your-username.github.io/poker_emulator/
   ```
3. 点击链接访问你的应用

---

## 第四部分：连接前后端

### 步骤 1：更新 Railway 环境变量

1. 回到 Railway 项目页面
2. 点击 **Variables** 标签
3. 修改 `FRONTEND_URL` 为实际的 GitHub Pages 地址：
   ```
   FRONTEND_URL=https://your-username.github.io/poker_emulator
   ```
4. 点击 **Save**
5. Railway 会自动重新部署后端

### 步骤 2：测试应用

1. 访问你的前端地址
2. 创建一个房间
3. 在另一个浏览器窗口/标签页中加入房间
4. 测试发牌功能

---

## 🔧 故障排查

### 前端无法连接后端

#### 检查 CORS 配置

确保后端 `backend/src/index.ts` 的 CORS 配置包含你的 GitHub Pages 域名：

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-username.github.io',  // 确保包含这个
    /https:\/\/.*\.github\.io$/
  ]
}));
```

#### 检查浏览器控制台

1. 按 F12 打开浏览器开发者工具
2. 查看 **Console** 标签的错误信息
3. 查看 **Network** 标签，检查 WebSocket 连接状态

### Railway 部署失败

#### 检查构建日志

1. 在 Railway 项目页面，点击 **Deployments** 标签
2. 点击失败的部署
3. 查看 **Build Logs** 和 **Deploy Logs**

#### 常见错误

**错误：找不到 `package.json`**
- 解决：确保 **Root Directory** 设置为 `backend`

**错误：Node 版本不匹配**
- 解决：在 `backend/package.json` 中添加：
  ```json
  "engines": {
    "node": ">=18.0.0"
  }
  ```

**错误：启动失败**
- 解决：确保 `package.json` 中有 `start` 脚本

### GitHub Actions 部署失败

#### 检查工作流日志

1. 访问仓库的 **Actions** 标签
2. 点击失败的工作流运行
3. 查看详细日志

#### 常见错误

**错误：Pages 权限不足**
- 解决：在仓库 **Settings** > **Actions** > **General** 中，找到 "Workflow permissions"，选择 "Read and write permissions"

**错误：构建失败**
- 解决：本地运行 `cd frontend && npm run build` 测试构建

---

## 📊 成本估算

| 服务 | 方案 | 成本 |
|------|------|------|
| 前端托管 | GitHub Pages | **免费** |
| 后端托管 | Railway.app | **免费**（500小时/月） |
| 域名 | GitHub.io 子域名 | **免费** |
| **总计** | | **0 元/月** |

### Railway 免费额度说明

- 每月 500 小时（约 20.8 天）
- 如果 24/7 运行，大约 21 天后会用完免费额度
- 建议：配置自动休眠（无活动 15 分钟后）

### 配置 Railway 自动休眠（可选）

Railway 会自动在无活动时休眠服务，首次请求时会有 10-30 秒的冷启动时间。

---

## 🔄 后续更新流程

### 更新代码

```bash
# 修改代码后
git add .
git commit -m "描述你的修改"
git push origin main
```

### 自动部署

- **前端**：推送后自动触发 GitHub Actions，3-5 分钟后生效
- **后端**：推送后 Railway 自动检测并重新部署，2-3 分钟后生效

---

## 🎉 部署完成

恭喜！你的扑克发牌模拟器已成功部署到生产环境。

现在你可以：
1. 分享前端 URL 给朋友一起玩
2. 在 README 中添加在线 Demo 链接
3. 继续开发新功能

---

## 📱 可选：自定义域名

### 前端自定义域名（GitHub Pages）

1. 购买域名（如 `poker.example.com`）
2. 在 DNS 设置中添加 CNAME 记录指向 `your-username.github.io`
3. 在仓库根目录创建 `frontend/public/CNAME` 文件，内容为你的域名
4. 在 GitHub 仓库 **Settings** > **Pages** 中设置自定义域名

### 后端自定义域名（Railway）

1. 在 Railway 项目 **Settings** > **Networking** 中添加自定义域名
2. 按照提示配置 DNS 记录
3. Railway 会自动配置 HTTPS 证书

---

## 📚 相关链接

- [Railway 文档](https://docs.railway.app/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Socket.io 文档](https://socket.io/docs/v4/)

---

**祝部署顺利！ 🚀**
