# 上传 video 目录下的 MP4 文件到 GitHub Releases
# 使用方法：powershell -ExecutionPolicy Bypass -File .\upload-video-to-release.ps1

param(
    [string]$Tag = "v1.0.0",
    [string]$ReleaseName = "Bank AI Agent Demo Video",
    [string]$Description = "项目演示视频"
)

$RepoOwner = "hyarriver"
$RepoName = "bank-ai-agent"
$VideoDir = "video"

# 检查 GitHub CLI 是否安装
try {
    $ghVersion = gh --version 2>&1
    Write-Host "检测到 GitHub CLI" -ForegroundColor Green
    $useCLI = $true
} catch {
    Write-Host "未检测到 GitHub CLI，将使用 GitHub API" -ForegroundColor Yellow
    $useCLI = $false
}

# 检查 video 目录
if (-not (Test-Path $VideoDir)) {
    Write-Host "错误：找不到 $VideoDir 目录" -ForegroundColor Red
    exit 1
}

# 获取所有 MP4 文件
$mp4Files = Get-ChildItem -Path $VideoDir -Filter "*.mp4" -File

if ($mp4Files.Count -eq 0) {
    Write-Host "错误：在 $VideoDir 目录中未找到 MP4 文件" -ForegroundColor Red
    exit 1
}

Write-Host "找到 $($mp4Files.Count) 个 MP4 文件：" -ForegroundColor Cyan
foreach ($file in $mp4Files) {
    $sizeMB = [math]::Round($file.Length / 1MB, 2)
    Write-Host "  - $($file.Name) ($sizeMB MB)" -ForegroundColor Gray
}

# 方法 1：使用 GitHub CLI
if ($useCLI) {
    Write-Host "`n使用 GitHub CLI 创建 Release..." -ForegroundColor Cyan
    
    # 检查 release 是否已存在
    $existingRelease = gh release view $Tag --repo "$RepoOwner/$RepoName" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Release $Tag 已存在，将添加文件..." -ForegroundColor Yellow
    } else {
        # 创建新的 release
        Write-Host "创建新的 Release: $Tag" -ForegroundColor Cyan
        gh release create $Tag `
            --title $ReleaseName `
            --notes $Description `
            --repo "$RepoOwner/$RepoName"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "错误：创建 Release 失败" -ForegroundColor Red
            exit 1
        }
    }
    
    # 上传文件
    foreach ($file in $mp4Files) {
        Write-Host "上传文件: $($file.Name)..." -ForegroundColor Cyan
        gh release upload $Tag "$($file.FullName)" --repo "$RepoOwner/$RepoName"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $($file.Name) 上传成功" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $($file.Name) 上传失败" -ForegroundColor Red
        }
    }
    
    Write-Host "`n✅ 完成！" -ForegroundColor Green
    Write-Host "Release 地址：https://github.com/$RepoOwner/$RepoName/releases/tag/$Tag" -ForegroundColor Cyan
}

# 方法 2：使用 GitHub API
else {
    Write-Host "`n使用 GitHub API 创建 Release..." -ForegroundColor Cyan
    Write-Host "需要 GitHub Personal Access Token (PAT)" -ForegroundColor Yellow
    Write-Host ""
    
    $token = Read-Host "请输入 GitHub Personal Access Token (需要 repo 权限)"
    
    if ([string]::IsNullOrEmpty($token)) {
        Write-Host "错误：需要提供 GitHub Token" -ForegroundColor Red
        exit 1
    }
    
    $headers = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    # 检查 release 是否已存在
    $checkUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/releases/tags/$Tag"
    $existingRelease = Invoke-RestMethod -Uri $checkUrl -Headers $headers -ErrorAction SilentlyContinue
    
    $releaseId = $null
    if ($existingRelease) {
        Write-Host "Release $Tag 已存在，将添加文件..." -ForegroundColor Yellow
        $releaseId = $existingRelease.id
    } else {
        # 创建新的 release
        Write-Host "创建新的 Release: $Tag" -ForegroundColor Cyan
        $createUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/releases"
        $body = @{
            tag_name = $Tag
            name = $ReleaseName
            body = $Description
        } | ConvertTo-Json
        
        $release = Invoke-RestMethod -Uri $createUrl -Method Post -Headers $headers -Body $body
        $releaseId = $release.id
        Write-Host "  ✓ Release 创建成功 (ID: $releaseId)" -ForegroundColor Green
    }
    
    # 上传文件
    foreach ($file in $mp4Files) {
        Write-Host "上传文件: $($file.Name)..." -ForegroundColor Cyan
        
        $uploadUrl = "https://uploads.github.com/repos/$RepoOwner/$RepoName/releases/$releaseId/assets?name=$($file.Name)"
        
        try {
            $fileBytes = [System.IO.File]::ReadAllBytes($file.FullName)
            $fileContent = [System.Convert]::ToBase64String($fileBytes)
            
            $uploadHeaders = @{
                "Authorization" = "token $token"
                "Accept" = "application/vnd.github.v3+json"
                "Content-Type" = "video/mp4"
            }
            
            Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -Body $fileBytes -ContentType "video/mp4"
            Write-Host "  ✓ $($file.Name) 上传成功" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ $($file.Name) 上传失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n✅ 完成！" -ForegroundColor Green
    Write-Host "Release 地址：https://github.com/$RepoOwner/$RepoName/releases/tag/$Tag" -ForegroundColor Cyan
}

