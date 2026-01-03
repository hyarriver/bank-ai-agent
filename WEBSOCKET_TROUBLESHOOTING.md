# WebSocket 连接问题排查指南

## 常见问题及解决方案

### 1. 前后端不在同一域名

**问题**：前端和后端部署在不同的 Zeabur 域名下

**解决方案**：

#### 选项 A：使用完整 WebSocket URL（推荐）

在 Zeabur 前端服务的环境变量中设置：

```
VITE_WS_URL=wss://backend-xxx.zeabur.app/ws/chat
```

将 `backend-xxx.zeabur.app` 替换为你的实际后端域名。

#### 选项 B：配置同一域名

在 Zeabur 中将前端和后端配置在同一域名下，然后使用相对路径：

```
VITE_WS_URL=/ws/chat
```

### 2. 协议不匹配

**问题**：HTTPS 页面尝试连接 ws://（不安全）

**解决方案**：
- 前端代码已自动处理协议切换
- 确保使用 `wss://` 协议（HTTPS 环境）
- 检查浏览器控制台的 WebSocket URL 日志

### 3. 后端服务未运行

**问题**：后端服务未启动或已停止

**检查方法**：
1. 访问后端健康检查接口：`https://backend-xxx.zeabur.app/`
2. 应该返回：`{"status": "healthy", ...}`
3. 如果无法访问，检查后端服务状态

### 4. CORS 或防火墙问题

**问题**：WebSocket 连接被阻止

**解决方案**：
- 后端已配置允许所有来源的 CORS
- 检查 Zeabur 防火墙设置
- 确保 WebSocket 端口未被阻止

### 5. 路径错误

**问题**：WebSocket 路径不正确

**检查**：
- 后端路径：`/ws/chat`
- 前端应连接：`wss://域名/ws/chat`
- 检查浏览器控制台的 WebSocket URL

## 调试步骤

### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看：
- Console 标签：查看 WebSocket 连接日志
- Network 标签：查看 WebSocket 连接状态

### 2. 验证 WebSocket URL

在浏览器控制台执行：
```javascript
console.log('WebSocket URL:', import.meta.env.VITE_WS_URL);
```

### 3. 测试后端 WebSocket

使用在线工具测试后端 WebSocket：
- 访问：https://www.websocket.org/echo.html
- 输入：`wss://backend-xxx.zeabur.app/ws/chat`
- 测试连接

### 4. 检查环境变量

在 Zeabur Dashboard 中：
1. 进入前端服务设置
2. 查看 Environment Variables
3. 确认 `VITE_WS_URL` 已正确设置
4. 重新部署服务（环境变量更改需要重新构建）

## 快速修复

### 如果前后端在不同域名：

1. 获取后端域名（例如：`backend-abc123.zeabur.app`）
2. 在前端环境变量中设置：
   ```
   VITE_WS_URL=wss://backend-abc123.zeabur.app/ws/chat
   ```
3. 重新部署前端服务

### 如果前后端在同一域名：

1. 在前端环境变量中设置：
   ```
   VITE_WS_URL=/ws/chat
   ```
2. 重新部署前端服务

## 验证连接

部署后，检查：
1. 浏览器控制台应该显示：`WebSocket 连接成功`
2. 前端界面应该显示：`已连接`（绿色状态）
3. 发送测试消息，应该能收到回复

## 需要帮助？

如果问题仍然存在，请提供：
1. 浏览器控制台的错误信息
2. 前端和后端的 Zeabur 域名
3. 环境变量配置截图

