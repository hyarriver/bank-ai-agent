# WebSocket 连接错误修复指南

## 问题分析

**错误信息**：`WebSocket 连接错误: wss://hy-bank-ai-agent.zeabur.app/ws/chat`

**可能原因**：
1. 前端和后端不在同一个域名
2. 后端服务未正常运行
3. WebSocket 路径配置错误
4. Zeabur 路由配置问题

## 解决方案

### 方案 1：配置环境变量指向后端（推荐）

在 Zeabur 前端服务的环境变量中设置：

1. **获取后端域名**
   - 在 Zeabur Dashboard 中找到后端服务
   - 复制后端服务的域名（例如：`backend-xxx.zeabur.app`）

2. **设置前端环境变量**
   - 进入前端服务设置
   - 添加环境变量：
   ```
   VITE_WS_URL=wss://backend-xxx.zeabur.app/ws/chat
   ```
   - 将 `backend-xxx.zeabur.app` 替换为你的实际后端域名

3. **重新部署前端**
   - 环境变量更改后需要重新构建
   - 点击 "Redeploy" 重新部署

### 方案 2：使用 Zeabur 路由（如果支持）

如果 Zeabur 支持在同一域名下路由多个服务：

1. 配置前端和后端使用同一域名
2. 设置路由规则：
   - `/` → 前端服务
   - `/ws/*` → 后端服务（WebSocket）
   - `/api/*` → 后端服务（HTTP）

3. 前端环境变量设置为：
   ```
   VITE_WS_URL=/ws/chat
   ```

### 方案 3：检查后端服务状态

1. **验证后端是否运行**
   - 访问：`https://backend-xxx.zeabur.app/`
   - 应该返回：`{"status": "healthy", ...}`

2. **测试 WebSocket 连接**
   - 使用在线工具：https://www.websocket.org/echo.html
   - 输入：`wss://backend-xxx.zeabur.app/ws/chat`
   - 测试连接

## 快速修复步骤

### 步骤 1：获取后端域名

在 Zeabur Dashboard：
1. 进入后端服务
2. 找到服务域名（通常在服务概览页面）
3. 复制完整域名

### 步骤 2：配置前端环境变量

1. 进入前端服务设置
2. 找到 "Environment Variables"
3. 添加或修改：
   ```
   VITE_WS_URL=wss://你的后端域名/ws/chat
   ```
4. 保存

### 步骤 3：重新部署

1. 点击 "Redeploy" 重新部署前端
2. 等待部署完成

### 步骤 4：验证

1. 打开前端应用
2. 打开浏览器开发者工具（F12）
3. 查看 Console，应该看到：
   - `使用环境变量中的完整 WebSocket URL: wss://...`
   - `WebSocket 连接成功`

## 常见错误码

- **1006**: 连接异常关闭（可能是后端未运行或路径错误）
- **1002**: 协议错误（可能是 ws/wss 协议不匹配）
- **1000**: 正常关闭（可能是后端主动断开）

## 调试技巧

1. **查看浏览器控制台**
   - 打开 F12 → Console
   - 查看 WebSocket 相关日志

2. **查看 Network 标签**
   - F12 → Network → WS（WebSocket）
   - 查看连接状态和错误信息

3. **检查后端日志**
   - 在 Zeabur Dashboard 查看后端服务日志
   - 确认 WebSocket 请求是否到达后端

## 如果仍然失败

请提供以下信息：
1. 前端域名：`hy-bank-ai-agent.zeabur.app`
2. 后端域名：`backend-xxx.zeabur.app`（请提供实际域名）
3. 浏览器控制台的完整错误信息
4. 后端服务是否正常运行

