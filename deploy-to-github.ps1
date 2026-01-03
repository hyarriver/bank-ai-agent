# GitHub 部署脚本 (PowerShell)
# 使用方法：在项目根目录执行此脚本
# 执行命令：powershell -ExecutionPolicy Bypass -File .\deploy-to-github.ps1

# 检查 git 是否安装
try {
    $gitVersion = git --version 2>&1
    Write-Host "检测到 Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "错误：未检测到 Git，请先安装 Git" -ForegroundColor Red
    Write-Host "下载地址：https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# 检查是否已经初始化 git
if (-not (Test-Path ".git")) {
    Write-Host "初始化 Git 仓库..." -ForegroundColor Cyan
    git init
}

# 添加所有文件（.gitignore 会自动排除不需要的文件）
Write-Host "添加文件到 Git..." -ForegroundColor Cyan
git add .

# 提交更改
Write-Host "提交更改..." -ForegroundColor Cyan
git commit -m "Initial commit: Bank AI Agent project with FastAPI backend and React frontend"

# 设置主分支
Write-Host "设置主分支..." -ForegroundColor Cyan
git branch -M main

# 检查远程仓库是否已添加
$remoteExists = git remote | Select-String -Pattern "^origin$"
if ($remoteExists) {
    Write-Host "更新远程仓库地址..." -ForegroundColor Cyan
    git remote set-url origin https://github.com/hyarriver/bank-ai-agent.git
} else {
    Write-Host "添加远程仓库..." -ForegroundColor Cyan
    git remote add origin https://github.com/hyarriver/bank-ai-agent.git
}

# 推送到 GitHub
Write-Host "推送到 GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`n✅ 部署完成！" -ForegroundColor Green
Write-Host "仓库地址：https://github.com/hyarriver/bank-ai-agent" -ForegroundColor Cyan

