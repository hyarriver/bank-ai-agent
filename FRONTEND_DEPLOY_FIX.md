# 前端部署问题修复指南

## 已修复的问题

### 1. ✅ 构建工具配置
- **问题**：`vite.config.js` 使用了 `terser` 压缩，但可能缺少依赖
- **修复**：改为使用 `esbuild`（Vite 内置，更稳定）
- **文件**：`frontend/vite.config.js`

### 2. ✅ 添加 Zeabur 配置文件
- **新增**：`frontend/zeabur.json` 配置文件
- **作用**：明确告诉 Zeabur 如何构建和部署前端

### 3. ✅ 添加启动脚本
- **新增**：`start` 脚本用于生产环境预览
- **文件**：`frontend/package.json`

## 在 Zeabur 中的配置

### 前端服务配置

1. **Root Directory**: `frontend`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Start Command**: `npm run start` 或使用静态文件服务

### 环境变量（可选）

```
VITE_WS_URL=/ws/chat
```

## 常见部署失败原因

### 1. 构建命令错误
- **错误**：找不到构建命令
- **解决**：确保 Build Command 设置为 `npm run build`

### 2. 输出目录错误
- **错误**：找不到构建输出
- **解决**：确保 Output Directory 设置为 `dist`

### 3. 依赖安装失败
- **错误**：npm install 失败
- **解决**：
  - 检查 Node.js 版本（推荐 18+）
  - 清除缓存后重新构建
  - 检查 package.json 中的依赖版本

### 4. TailwindCSS 构建问题
- **错误**：CSS 未正确生成
- **解决**：
  - 确保 `postcss.config.js` 存在
  - 确保 `tailwind.config.js` 配置正确
  - 检查 `src/index.css` 中的 Tailwind 导入

### 5. 环境变量未生效
- **错误**：VITE_WS_URL 未生效
- **解决**：
  - 环境变量必须以 `VITE_` 开头
  - 需要重新构建才能生效
  - 检查变量名是否正确

## 验证构建

本地测试构建（如果 npm 可用）：

```bash
cd frontend
npm install
npm run build
```

构建成功后应该生成 `dist` 目录。

## Zeabur 部署检查清单

- [ ] Root Directory 设置为 `frontend`
- [ ] Build Command 设置为 `npm run build`
- [ ] Output Directory 设置为 `dist`
- [ ] Node.js 版本设置为 18 或更高
- [ ] 环境变量已正确设置（如需要）
- [ ] 查看构建日志确认没有错误

## 如果仍然失败

1. **查看构建日志**：
   - 在 Zeabur Dashboard 中查看服务的构建日志
   - 查找错误信息

2. **检查常见错误**：
   - 依赖版本冲突
   - 内存不足
   - 超时问题

3. **尝试解决方案**：
   - 清除构建缓存
   - 增加构建超时时间
   - 检查 Node.js 版本兼容性

