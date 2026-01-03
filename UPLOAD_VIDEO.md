# 上传视频到 GitHub Releases 指南

## 方法一：使用脚本（推荐）

### 使用 PowerShell 脚本

1. **安装 GitHub CLI（可选但推荐）**
   ```powershell
   winget install --id GitHub.cli
   ```
   或访问：https://cli.github.com/

2. **登录 GitHub CLI**
   ```powershell
   gh auth login
   ```

3. **运行脚本**
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\upload-video-to-release.ps1
   ```

4. **自定义参数（可选）**
   ```powershell
   .\upload-video-to-release.ps1 -Tag "v1.0.0" -ReleaseName "演示视频" -Description "项目演示视频"
   ```

## 方法二：手动上传（最简单）

### 步骤 1：创建 Release

1. 访问：https://github.com/hyarriver/bank-ai-agent/releases
2. 点击 **"Create a new release"** 或 **"Draft a new release"**
3. 填写信息：
   - **Tag version**: `v1.0.0`（或你想要的版本号）
   - **Release title**: `Bank AI Agent Demo Video`
   - **Description**: 项目演示视频
4. 点击 **"Publish release"**

### 步骤 2：上传文件

1. 在 Release 页面，找到 **"Assets"** 部分
2. 点击 **"Attach binaries by dropping them here or selecting them"**
3. 选择 `video/bank-ai-agent.mp4` 文件
4. 等待上传完成

## 方法三：使用 GitHub CLI 命令行

### 安装 GitHub CLI

**Windows:**
```powershell
winget install --id GitHub.cli
```

**Mac:**
```bash
brew install gh
```

**Linux:**
```bash
sudo apt install gh
```

### 登录和上传

```bash
# 登录
gh auth login

# 创建 release 并上传文件
gh release create v1.0.0 \
  --title "Bank AI Agent Demo Video" \
  --notes "项目演示视频" \
  video/bank-ai-agent.mp4

# 或者如果 release 已存在，只上传文件
gh release upload v1.0.0 video/bank-ai-agent.mp4
```

## 方法四：使用 GitHub API

### 获取 Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token (classic)"**
3. 勾选 `repo` 权限
4. 生成并复制 Token

### 使用 curl 上传

```bash
# 1. 创建 release
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/hyarriver/bank-ai-agent/releases \
  -d '{
    "tag_name": "v1.0.0",
    "name": "Bank AI Agent Demo Video",
    "body": "项目演示视频"
  }'

# 2. 上传文件（需要 release ID）
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Content-Type: video/mp4" \
  --data-binary "@video/bank-ai-agent.mp4" \
  "https://uploads.github.com/repos/hyarriver/bank-ai-agent/releases/RELEASE_ID/assets?name=bank-ai-agent.mp4"
```

## 文件大小限制

- **GitHub Releases**: 单个文件最大 2GB
- **GitHub 仓库**: 单个文件最大 100MB（所以需要 Releases）

## 访问上传的文件

上传成功后，可以通过以下方式访问：

1. **Release 页面**：
   ```
   https://github.com/hyarriver/bank-ai-agent/releases/tag/v1.0.0
   ```

2. **直接下载链接**：
   ```
   https://github.com/hyarriver/bank-ai-agent/releases/download/v1.0.0/bank-ai-agent.mp4
   ```

## 常见问题

### Q: 上传失败，提示文件太大？
A: 检查文件大小，GitHub Releases 支持最大 2GB 的文件。

### Q: 没有权限上传？
A: 确保：
- 已登录 GitHub
- 有仓库的写入权限
- Token 有 `repo` 权限

### Q: 如何更新已存在的 Release？
A: 
- 删除旧文件后重新上传
- 或创建新的 Release 版本

## 推荐方法

对于大多数用户，**方法二（手动上传）** 最简单直接：
1. 访问 Releases 页面
2. 创建新 Release
3. 拖拽文件上传

完成！

