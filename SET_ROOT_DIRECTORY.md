# 在 Zeabur 中设置 Root Directory 详细步骤

## 设置 Root Directory：backend

### 步骤 1：进入服务配置页面

1. 登录 Zeabur Dashboard：https://dash.zeabur.com
2. 选择你的项目（或创建新项目）
3. 点击 **"Add Service"** 或选择已添加的服务
4. 选择 **"Import from GitHub"**
5. 选择仓库：`hyarriver/bank-ai-agent`

### 步骤 2：找到 Root Directory 设置

在服务配置页面中，你会看到以下选项：

#### 方式 A：在服务设置页面
1. 服务添加后，点击服务名称进入详情页
2. 点击 **"Settings"** 或 **"设置"** 标签
3. 找到 **"Root Directory"** 或 **"根目录"** 选项
4. 输入：`backend`
5. 点击 **"Save"** 或 **"保存"**

#### 方式 B：在添加服务时设置
1. 选择 GitHub 仓库后
2. 在配置表单中找到 **"Root Directory"** 字段
3. 输入：`backend`
4. 点击 **"Deploy"** 或 **"部署"**

### 步骤 3：验证设置

设置完成后，Zeabur 会：
- 自动检测 `backend` 目录下的 `Dockerfile`
- 使用 Dockerfile 构建 Docker 镜像
- 启动服务

## 设置 Root Directory：frontend

部署前端时，同样设置：

1. 再次点击 **"Add Service"**
2. 选择同一个仓库：`hyarriver/bank-ai-agent`
3. 设置 **Root Directory**：`frontend`
4. Zeabur 会自动检测为 Node.js 项目

## 常见问题

### Q: 找不到 Root Directory 选项？
A: 
- 确保服务已添加
- 进入服务的 Settings/设置页面
- 如果还是没有，可能是 Zeabur 界面更新，查找类似的选项如 "Working Directory" 或 "Build Context"

### Q: Root Directory 设置后没有生效？
A:
- 检查输入是否正确（注意大小写：`backend` 不是 `Backend`）
- 重新部署服务
- 查看构建日志确认路径

### Q: 如何确认 Root Directory 设置成功？
A:
- 查看构建日志，应该显示从 `backend` 目录开始构建
- 如果看到 Dockerfile 被找到，说明设置成功

## 图示说明

```
项目结构：
bank-ai-agent/
├── backend/          ← Root Directory 设置为 "backend"
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/         ← Root Directory 设置为 "frontend"
│   ├── package.json
│   └── src/
└── README.md
```

## 快速参考

| 服务 | Root Directory | 说明 |
|------|----------------|------|
| 后端 | `backend` | 包含 Dockerfile |
| 前端 | `frontend` | Node.js 项目 |

