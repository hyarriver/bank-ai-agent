#!/bin/bash
# GitHub 部署脚本
# 使用方法：在项目根目录执行此脚本

# 检查 git 是否安装
if ! command -v git &> /dev/null; then
    echo "错误：未检测到 Git，请先安装 Git"
    echo "下载地址：https://git-scm.com/downloads"
    exit 1
fi

# 检查是否已经初始化 git
if [ ! -d ".git" ]; then
    echo "初始化 Git 仓库..."
    git init
fi

# 添加所有文件（.gitignore 会自动排除不需要的文件）
echo "添加文件到 Git..."
git add .

# 提交更改
echo "提交更改..."
git commit -m "Initial commit: Bank AI Agent project with FastAPI backend and React frontend"

# 设置主分支
git branch -M main

# 检查远程仓库是否已添加
if git remote | grep -q "^origin$"; then
    echo "更新远程仓库地址..."
    git remote set-url origin https://github.com/hyarriver/bank-ai-agent.git
else
    echo "添加远程仓库..."
    git remote add origin https://github.com/hyarriver/bank-ai-agent.git
fi

# 推送到 GitHub
echo "推送到 GitHub..."
git push -u origin main

echo "✅ 部署完成！"
echo "仓库地址：https://github.com/hyarriver/bank-ai-agent"

