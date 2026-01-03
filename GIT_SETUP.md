# Git 安装和配置指南

## 当前状态
❌ **Git 未安装或未添加到 PATH**

## 解决方案

### 方法 1：安装 Git for Windows（推荐）

1. **下载 Git**
   - 访问：https://git-scm.com/download/win
   - 或直接下载：https://github.com/git-for-windows/git/releases/latest
   - 下载 `Git-2.x.x-64-bit.exe`（最新版本）

2. **安装 Git**
   - 运行下载的安装程序
   - **重要**：在安装过程中，选择 "Add Git to PATH" 选项
   - 其他选项保持默认即可
   - 点击 "Install" 完成安装

3. **验证安装**
   - 关闭并重新打开 PowerShell 或命令提示符
   - 执行：`git --version`
   - 应该显示类似：`git version 2.x.x`

4. **配置 Git**（首次使用）
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 方法 2：使用 Chocolatey 安装（如果已安装 Chocolatey）

```powershell
choco install git -y
```

### 方法 3：使用 Winget 安装（Windows 10/11）

```powershell
winget install --id Git.Git -e --source winget
```

## 安装后操作

安装完成后，在项目目录执行：

```powershell
# 1. 初始化仓库
git init

# 2. 添加文件
git add .

# 3. 提交
git commit -m "Initial commit: Bank AI Agent project"

# 4. 设置主分支
git branch -M main

# 5. 添加远程仓库
git remote add origin https://github.com/hyarriver/bank-ai-agent.git

# 6. 推送到 GitHub
git push -u origin main
```

## 替代方案：使用 GitHub Desktop

如果命令行 Git 安装有问题，可以使用 GitHub Desktop：

1. **下载 GitHub Desktop**
   - 访问：https://desktop.github.com/
   - 下载并安装

2. **使用 GitHub Desktop 部署**
   - 打开 GitHub Desktop
   - 点击 "File" → "Add Local Repository"
   - 选择项目目录：`d:\bank-agent`
   - 点击 "Publish repository"
   - 输入仓库名：`bank-ai-agent`
   - 选择账户并发布

## 常见问题

### Q: 安装后仍然显示 "git 不是内部或外部命令"
**A:** 
1. 确保在安装时选择了 "Add Git to PATH"
2. 完全关闭并重新打开终端
3. 如果还是不行，手动添加到 PATH：
   - 找到 Git 安装路径（通常在 `C:\Program Files\Git\bin`）
   - 添加到系统环境变量 PATH 中

### Q: 如何手动添加到 PATH？
**A:**
1. 右键 "此电脑" → "属性"
2. 点击 "高级系统设置"
3. 点击 "环境变量"
4. 在 "系统变量" 中找到 "Path"，点击 "编辑"
5. 点击 "新建"，添加 Git 的 bin 目录路径
6. 确定并重启终端

### Q: 推送时要求输入用户名和密码
**A:**
- 使用 GitHub Personal Access Token 作为密码
- 生成 Token：GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- 或者配置 SSH 密钥

## 快速检查清单

- [ ] Git 已下载
- [ ] Git 已安装（选择了 "Add Git to PATH"）
- [ ] 终端已重启
- [ ] `git --version` 命令可以执行
- [ ] Git 用户信息已配置
- [ ] GitHub 仓库已创建
- [ ] 准备推送代码

## 需要帮助？

如果遇到问题，请提供：
1. 错误信息截图
2. 执行的命令
3. Git 版本（如果已安装）

