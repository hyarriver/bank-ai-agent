# GitHub 部署指南

## 前置要求

1. **安装 Git**
   - Windows: 下载并安装 [Git for Windows](https://git-scm.com/downloads)
   - Mac: `brew install git` 或从官网下载
   - Linux: `sudo apt-get install git` (Ubuntu/Debian)

2. **配置 Git**（首次使用）
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

3. **GitHub 账户**
   - 确保已创建仓库：https://github.com/hyarriver/bank-ai-agent
   - 如果仓库不存在，请在 GitHub 上创建它

## 部署方法

### 方法 1：使用 PowerShell 脚本（Windows 推荐）

1. 在项目根目录打开 PowerShell
2. 执行以下命令：
```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-to-github.ps1
```

### 方法 2：使用 Bash 脚本（Mac/Linux）

1. 在项目根目录打开终端
2. 执行以下命令：
```bash
chmod +x deploy-to-github.sh
./deploy-to-github.sh
```

### 方法 3：手动执行命令

如果脚本无法运行，可以手动执行以下命令：

```bash
# 1. 初始化 Git 仓库（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交更改
git commit -m "Initial commit: Bank AI Agent project with FastAPI backend and React frontend"

# 4. 设置主分支
git branch -M main

# 5. 添加远程仓库
git remote add origin https://github.com/hyarriver/bank-ai-agent.git

# 6. 推送到 GitHub
git push -u origin main
```

**注意**：如果远程仓库已存在，第 5 步可能会失败。如果遇到错误，可以：
- 删除现有远程：`git remote remove origin`
- 然后重新添加：`git remote add origin https://github.com/hyarriver/bank-ai-agent.git`
- 或者更新远程地址：`git remote set-url origin https://github.com/hyarriver/bank-ai-agent.git`

## 验证部署

部署成功后，访问以下地址查看仓库：
https://github.com/hyarriver/bank-ai-agent

## 后续更新

当代码有更新时，使用以下命令推送：

```bash
git add .
git commit -m "描述你的更改"
git push
```

## 常见问题

### 1. 认证失败

如果推送时要求输入用户名和密码：
- **推荐**：使用 Personal Access Token (PAT)
  - 生成 Token：GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
  - 使用 Token 作为密码
- **或者**：配置 SSH 密钥

### 2. 仓库已存在内容

如果远程仓库已有内容（如 README），需要先拉取：
```bash
git pull origin main --allow-unrelated-histories
# 解决可能的冲突后
git push -u origin main
```

### 3. 大文件问题

如果遇到大文件问题，检查 `.gitignore` 是否正确配置，确保 `node_modules` 等大文件夹被忽略。

