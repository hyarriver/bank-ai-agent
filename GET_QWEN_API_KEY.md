# 获取 Qwen API Key 详细步骤

## 方法一：通过阿里云 DashScope 控制台（推荐）

### 步骤 1：访问 DashScope 控制台

访问：https://dashscope.console.aliyun.com/

### 步骤 2：登录/注册阿里云账户

1. 如果没有阿里云账户，点击"注册"创建新账户
2. 如果已有账户，直接登录

### 步骤 3：开通 DashScope 服务

1. 登录后，如果是首次使用，需要开通 DashScope 服务
2. 按照提示完成服务开通（通常免费）

### 步骤 4：创建 API Key

1. 在控制台左侧菜单找到 **"API-KEY 管理"** 或 **"密钥管理"**
2. 点击 **"创建新的 API Key"** 或 **"新建密钥"**
3. 输入密钥名称（例如：`bank-ai-agent`）
4. 点击 **"确定"** 或 **"创建"**

### 步骤 5：复制 API Key

1. 创建成功后，会显示 API Key
2. **重要**：立即复制并保存 API Key（只显示一次）
3. 格式类似：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 方法二：通过阿里云官网

1. 访问：https://www.aliyun.com/
2. 登录后搜索 "DashScope" 或 "通义千问"
3. 进入服务控制台
4. 按照上述步骤 4-5 创建 API Key

## 注意事项

### 安全提示
- ⚠️ API Key 具有账户权限，请妥善保管
- ⚠️ 不要将 API Key 提交到代码仓库
- ⚠️ 如果泄露，立即删除并重新创建

### 使用限制
- 新用户通常有免费额度
- 查看使用量和余额：控制台 → 费用中心
- 超出免费额度后按量计费

### API Key 格式
- 通常以 `sk-` 开头
- 长度约 40-50 个字符
- 示例：`sk-1234567890abcdefghijklmnopqrstuvwxyz`

## 验证 API Key

创建后，可以在项目中测试：

```bash
# 测试 API Key 是否有效
curl https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-turbo",
    "input": {
      "messages": [
        {
          "role": "user",
          "content": "你好"
        }
      ]
    }
  }'
```

## 在 Zeabur 中使用

获取 API Key 后，在 Zeabur 后端服务中添加环境变量：

| 变量名 | 值 |
|--------|-----|
| `QWEN_API_KEY` | `sk-你的API Key` |

## 常见问题

### Q: 找不到 API Key 管理页面？
A: 确保已开通 DashScope 服务，可能需要先完成实名认证。

### Q: API Key 创建失败？
A: 检查账户状态，确保账户正常且已实名认证。

### Q: 如何查看 API Key 使用情况？
A: 在控制台的"用量统计"或"费用中心"查看。

### Q: API Key 可以创建多个吗？
A: 可以，建议为不同项目创建不同的 API Key，便于管理。

## 相关链接

- DashScope 控制台：https://dashscope.console.aliyun.com/
- 官方文档：https://help.aliyun.com/zh/dashscope/
- 定价说明：https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-obtain-an-api-key

