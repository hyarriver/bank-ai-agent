# 快速开始 - Git 部署

## ⚠️ 当前状态
Git 未安装，需要先安装 Git 才能部署到 GitHub。

## 🚀 最快的方法

### 步骤 1：安装 Git（5 分钟）

1. 访问：https://git-scm.com/download/win
2. 下载并运行安装程序
3. **重要**：安装时勾选 "Add Git to PATH"
4. 完成安装

### 步骤 2：重启终端

- 完全关闭当前的 PowerShell/命令提示符
- 重新打开并导航到项目目录：`cd d:\bank-agent`

### 步骤 3：执行部署命令

```powershell
# 初始化
git init

# 添加文件
git add .

# 提交
git commit -m "Initial commit: Bank AI Agent project"

# 设置主分支
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/hyarriver/bank-ai-agent.git

# 推送
git push -u origin main
```

## 📝 或者使用我创建的脚本

安装 Git 后，执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-to-github.ps1
```

## 🔧 如果 Git 安装有问题

查看详细指南：`GIT_SETUP.md`

## ✅ 验证

部署成功后，访问：
https://github.com/hyarriver/bank-ai-agent

