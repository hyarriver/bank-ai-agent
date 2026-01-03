# Zeabur 部署指南

## 快速部署步骤

### 1. 登录 Zeabur

访问 [Zeabur Dashboard](https://dash.zeabur.com) 并登录你的账户。

### 2. 创建新项目

1. 点击 **"New Project"** 按钮
2. 输入项目名称（例如：`bank-ai-agent`）

### 3. 部署后端服务

1. 在项目中点击 **"Add Service"**
2. 选择 **"Import from GitHub"**
3. 选择你的 GitHub 仓库：`hyarriver/bank-ai-agent`
4. 在服务配置中：
   - **Root Directory**: 设置为 `backend`
   - Zeabur 会自动检测到 `Dockerfile` 并使用它构建

**配置后端环境变量：**

在服务设置页面的 "Environment Variables" 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `QWEN_API_KEY` | `你的 Qwen API Key` | **必填**：从阿里云 DashScope 获取 |
| `QWEN_BASE_URL` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 可选：默认值 |
| `PORT` | `8080` | 可选：服务端口（默认 8080） |

**获取 Qwen API Key：**
1. 访问：https://dashscope.console.aliyun.com/
2. 登录并创建 API Key
3. 复制 Key 并填入环境变量

### 4. 部署前端服务

1. 在同一个项目中，再次点击 **"Add Service"**
2. 选择 **"Import from GitHub"**
3. 再次选择仓库：`hyarriver/bank-ai-agent`
4. 在服务配置中：
   - **Root Directory**: 设置为 `frontend`
   - Zeabur 会自动检测为 Node.js 项目

**配置前端环境变量：**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_WS_URL` | `/ws/chat` | 可选：WebSocket 路径（前端会自动根据协议切换 ws/wss） |

**前端构建配置：**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Start Command**: 使用静态文件服务（Zeabur 会自动处理）

### 5. 配置域名和连接

#### 后端服务
- Zeabur 会自动分配一个域名，例如：`backend-xxx.zeabur.app`
- 记录这个域名，用于前端连接（如果需要跨域）

#### 前端服务
- Zeabur 会自动分配一个域名，例如：`frontend-xxx.zeabur.app`
- 这是用户访问的地址

#### WebSocket 连接配置

**选项 A：前后端在同一域名下（推荐）**

如果前端和后端可以配置在同一域名下：
- 前端代码会自动使用相对路径 `/ws/chat`
- 自动根据页面协议（HTTPS）使用 `wss://`

**选项 B：前后端在不同域名**

如果前后端在不同域名，需要设置 `VITE_WS_URL` 为完整 URL：
```
VITE_WS_URL=wss://backend-xxx.zeabur.app/ws/chat
```

### 6. 验证部署

1. **检查后端健康状态**
   - 访问：`https://backend-xxx.zeabur.app/`
   - 应该返回：`{"status": "healthy", "message": "Bank AI Agent API is running"}`

2. **检查前端应用**
   - 访问：`https://frontend-xxx.zeabur.app`
   - 应该看到银行智能助手界面

3. **测试 WebSocket 连接**
   - 在前端界面发送一条消息
   - 检查是否成功连接并收到回复

## 环境变量详细说明

### 后端环境变量

#### QWEN_API_KEY（必填）
- **说明**：Qwen API 密钥
- **获取方式**：
  1. 访问 https://dashscope.console.aliyun.com/
  2. 登录阿里云账户
  3. 创建 API Key
  4. 复制并填入环境变量

#### QWEN_BASE_URL（可选）
- **默认值**：`https://dashscope.aliyuncs.com/compatible-mode/v1`
- **说明**：Qwen API 的基础 URL，通常不需要修改

#### PORT（可选）
- **默认值**：`8080`
- **说明**：服务监听端口，Zeabur 会自动处理端口映射

### 前端环境变量

#### VITE_WS_URL（可选）
- **说明**：WebSocket 连接路径或完整 URL
- **推荐值**：`/ws/chat`（如果前后端在同一域名）
- **或完整 URL**：`wss://backend-xxx.zeabur.app/ws/chat`（如果跨域）

## WebSocket 协议自动切换

前端代码会自动处理协议切换：
- **HTTP 页面** → 使用 `ws://`
- **HTTPS 页面** → 使用 `wss://`

这确保了在生产环境（HTTPS）中自动使用安全的 WebSocket 连接。

## 常见问题

### 1. 构建失败

**问题**：后端或前端构建失败

**解决方案**：
- 检查 Zeabur 构建日志
- 确保 Root Directory 设置正确
- 检查依赖是否正确安装

### 2. WebSocket 连接失败

**问题**：前端无法连接到后端 WebSocket

**解决方案**：
- 检查后端服务是否正常运行
- 确认 `VITE_WS_URL` 环境变量设置正确
- 确保使用 `wss://` 协议（HTTPS 环境）
- 检查 Zeabur 防火墙设置

### 3. CORS 错误

**问题**：浏览器控制台显示 CORS 错误

**解决方案**：
- 后端已配置允许所有来源的 CORS
- 如果仍有问题，检查后端服务是否正常运行

### 4. 环境变量未生效

**问题**：修改环境变量后未生效

**解决方案**：
- 在 Zeabur 中重新部署服务
- 前端环境变量需要重新构建才能生效

## 更新部署

当代码更新后：

1. 推送到 GitHub：
```bash
git add .
git commit -m "Update code"
git push
```

2. Zeabur 会自动检测更改并重新部署（如果启用了自动部署）

3. 或者手动在 Zeabur Dashboard 中点击 **"Redeploy"**

## 监控和日志

在 Zeabur Dashboard 中：
- **Logs**：查看实时日志
- **Metrics**：查看服务指标（CPU、内存等）
- **Deployments**：查看部署历史

## 成本优化

- Zeabur 提供免费额度
- 可以根据使用情况调整服务规格
- 可以设置自动休眠以节省资源

## 需要帮助？

如果遇到问题：
1. 查看 Zeabur 构建日志
2. 检查服务健康状态
3. 查看浏览器控制台错误信息
4. 参考 Zeabur 官方文档：https://zeabur.com/docs

