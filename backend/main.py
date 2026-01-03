import os
import json
import asyncio
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI
from pydantic import BaseModel

app = FastAPI(title="Bank AI Agent API")

# 配置 CORS - 允许所有来源
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 OpenAI 客户端（兼容 Qwen）
QWEN_API_KEY = os.getenv("QWEN_API_KEY", "")
QWEN_BASE_URL = os.getenv("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")

client = None
if QWEN_API_KEY:
    try:
        client = OpenAI(
            api_key=QWEN_API_KEY,
            base_url=QWEN_BASE_URL,
            timeout=60.0
        )
    except Exception as e:
        print(f"初始化 OpenAI 客户端失败: {e}")
        client = None

# 系统提示词
SYSTEM_PROMPT = """你是一个银行 AI 助手。请以 JSON 格式回复用户的问题。

回复格式必须严格遵循以下结构：
{
  "thought": "你的思考过程",
  "content": "给用户的文字回复内容",
  "action": {
    "component": "组件名称（如果需要渲染组件，否则为 null）",
    "props": {
      // 组件的属性对象
    }
  }
}

规则：
1. 当用户询问"余额"相关问题时，action.component 应为 "BalanceCard"
2. 当用户询问"贷款"相关问题时，action.component 应为 "ProductList"
3. 如果不需要渲染组件，action.component 应为 null
4. 始终以有效的 JSON 格式回复，不要包含任何其他文字"""


class ChatMessage(BaseModel):
    message: str


async def send_event(websocket: WebSocket, event: str, data: dict):
    """发送事件到前端"""
    await websocket.send_json({
        "event": event,
        "data": data
    })


async def process_message_with_qwen(message: str, websocket: WebSocket):
    """使用 Qwen 处理消息并流式返回"""
    if not client:
        await send_event(websocket, "message_chunk", {
            "content": "错误：未配置 QWEN_API_KEY"
        })
        await send_event(websocket, "message_end", {})
        return

    try:
        # 检查是否需要发送组件
        message_lower = message.lower()
        should_send_component = False
        component_name = None
        component_props = None

        if "余额" in message or "balance" in message_lower:
            should_send_component = True
            component_name = "BalanceCard"
            component_props = {
                "balance": 12580.50,
                "currency": "CNY",
                "accountType": "储蓄账户"
            }
        elif "贷款" in message or "loan" in message_lower or "借贷" in message:
            should_send_component = True
            component_name = "ProductList"
            component_props = {
                "products": [
                    {
                        "id": 1,
                        "name": "个人消费贷款",
                        "rate": "4.35%",
                        "amount": "最高 50 万元"
                    },
                    {
                        "id": 2,
                        "name": "房屋抵押贷款",
                        "rate": "3.85%",
                        "amount": "最高 500 万元"
                    }
                ]
            }

        # 调用 Qwen API
        stream = client.chat.completions.create(
            model="qwen-turbo",  # 或根据实际模型名称调整
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ],
            stream=True,
            temperature=0.7
        )

        full_response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_response += content
                # 发送消息片段
                await send_event(websocket, "message_chunk", {
                    "content": content
                })

        # 尝试解析 JSON 响应
        try:
            # 清理响应，提取 JSON 部分
            response_text = full_response.strip()
            # 如果响应被 markdown 代码块包裹，提取 JSON
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                json_lines = []
                in_json = False
                for line in lines:
                    if line.strip().startswith("```"):
                        if in_json:
                            break
                        in_json = True
                        continue
                    if in_json:
                        json_lines.append(line)
                response_text = "\n".join(json_lines)
            
            qwen_response = json.loads(response_text)
            
            # 如果需要发送组件，覆盖 action
            if should_send_component:
                qwen_response["action"] = {
                    "component": component_name,
                    "props": component_props
                }
            
            # 如果 action.component 不为 null，发送组件渲染事件
            if qwen_response.get("action", {}).get("component"):
                await send_event(websocket, "component_render", {
                    "component": qwen_response["action"]["component"],
                    "props": qwen_response["action"].get("props", {})
                })
        except json.JSONDecodeError:
            # 如果无法解析 JSON，使用原始响应
            pass

        # 发送消息结束事件
        await send_event(websocket, "message_end", {})

    except Exception as e:
        await send_event(websocket, "message_chunk", {
            "content": f"错误：{str(e)}"
        })
        await send_event(websocket, "message_end", {})


@app.get("/")
async def health_check():
    """健康检查接口"""
    return JSONResponse(content={"status": "healthy", "message": "Bank AI Agent API is running"})


@app.get("/health")
async def health():
    """健康检查接口（备用）"""
    return JSONResponse(content={"status": "healthy"})


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket 聊天接口"""
    await websocket.accept()
    
    try:
        while True:
            # 接收前端发送的 JSON 消息
            data = await websocket.receive_json()
            
            # 提取消息内容
            message = data.get("message", "")
            
            if not message:
                await send_event(websocket, "message_chunk", {
                    "content": "请输入有效的消息"
                })
                await send_event(websocket, "message_end", {})
                continue
            
            # 处理消息
            await process_message_with_qwen(message, websocket)
            
    except WebSocketDisconnect:
        print("客户端断开连接")
    except Exception as e:
        print(f"WebSocket 错误：{str(e)}")
        try:
            await send_event(websocket, "message_chunk", {
                "content": f"服务器错误：{str(e)}"
            })
            await send_event(websocket, "message_end", {})
        except:
            pass

