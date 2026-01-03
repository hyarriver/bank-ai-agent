import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { MessageRenderer } from './components/MessageRenderer';
import { Send, Wifi, WifiOff, Wallet, ArrowRightLeft, MessageCircle } from 'lucide-react';

/**
 * 获取 WebSocket URL，自动处理 ws/wss 协议切换
 * 如果页面是 https，则使用 wss，否则使用 ws
 */
function getWebSocketUrl() {
  const envUrl = import.meta.env.VITE_WS_URL;
  
  // 如果环境变量已设置
  if (envUrl) {
    // 如果环境变量是完整 URL（包含协议），直接返回
    if (envUrl.startsWith('ws://') || envUrl.startsWith('wss://')) {
      console.log('使用环境变量中的完整 WebSocket URL:', envUrl);
      return envUrl;
    }
    // 如果环境变量只是路径，需要根据当前协议构建完整 URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const fullUrl = `${protocol}//${host}${envUrl.startsWith('/') ? envUrl : '/' + envUrl}`;
    console.log('从环境变量路径构建 WebSocket URL:', fullUrl);
    return fullUrl;
  }
  
  // 默认情况下，根据当前页面协议和开发/生产环境自动选择
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // 开发环境：使用 localhost:8000（后端默认端口）
  if (import.meta.env.DEV) {
    const devUrl = `${protocol}//localhost:8000/ws/chat`;
    console.log('开发环境 WebSocket URL:', devUrl);
    return devUrl;
  }
  
  // 生产环境：使用当前域名
  const host = window.location.host;
  const prodUrl = `${protocol}//${host}/ws/chat`;
  console.log('生产环境 WebSocket URL:', prodUrl);
  return prodUrl;
}

function App() {
  const wsUrl = getWebSocketUrl();
  const { sendMessage, messages, isConnected, error } = useWebSocket(wsUrl);
  const [inputValue, setInputValue] = useState('');
  const [streamingMessages, setStreamingMessages] = useState(new Map());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const processedMessagesRef = useRef(new Set());

  // 自动滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessages]);

  // 处理打字机效果的流式消息
  useEffect(() => {
    const timers = [];
    
    messages.forEach((message, index) => {
      if (message.type === 'stream' || message.type === 'assistant') {
        const messageId = message.id || `msg-${index}`;
        const content = message.content || '';
        
        // 检查是否已经处理过这条消息
        if (!processedMessagesRef.current.has(messageId) && content.length > 0) {
          processedMessagesRef.current.add(messageId);
          
          // 启动打字机效果
          let displayedLength = 0;
          const timer = setInterval(() => {
            displayedLength = Math.min(displayedLength + 2, content.length);
            
            setStreamingMessages((prev) => {
              const updated = new Map(prev);
              updated.set(messageId, {
                ...message,
                displayedContent: content.substring(0, displayedLength),
                isStreaming: displayedLength < content.length,
              });
              return updated;
            });
            
            if (displayedLength >= content.length) {
              clearInterval(timer);
            }
          }, 30); // 每30ms显示2个字符
          
          timers.push(timer);
        } else if (processedMessagesRef.current.has(messageId)) {
          // 如果消息已经处理过，检查内容是否有更新（流式传输）
          setStreamingMessages((prev) => {
            const current = prev.get(messageId);
            if (current && content.length > (current.displayedContent?.length || 0)) {
              const updated = new Map(prev);
              updated.set(messageId, {
                ...message,
                displayedContent: content,
                isStreaming: false,
              });
              return updated;
            }
            return prev;
          });
        }
      }
    });
    
    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [messages]);

  // 处理发送消息
  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim() && isConnected) {
      sendMessage({
        type: 'user',
        content: inputValue.trim(),
      });
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  // 处理键盘快捷键
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // 获取要显示的消息列表（合并普通消息和流式消息）
  const displayMessages = messages.map((message, index) => {
    const messageId = message.id || `msg-${index}`;
    const streaming = streamingMessages.get(messageId);
    
    if (streaming) {
      return {
        ...message,
        content: streaming.displayedContent,
        isStreaming: streaming.isStreaming,
      };
    }
    
    return message;
  });

  // 快捷操作按钮处理
  const handleQuickAction = (action) => {
    const actionMessages = {
      balance: '查余额',
      transfer: '转账',
      consult: '咨询',
    };
    if (isConnected) {
      sendMessage({
        type: 'user',
        content: actionMessages[action] || action,
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-app-bg">
      {/* 顶部状态栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-bank-blue rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-bank-blue">
                银行智能助手
              </h1>
              <p className="text-sm text-gray-500">
                专业金融服务咨询
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600">已连接</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600">未连接</span>
              </>
            )}
          </div>
        </div>
        {error && (
          <div className="max-w-4xl mx-auto mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </header>

      {/* 消息列表区域 */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {displayMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-bank-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-bank-blue" />
              </div>
              <h2 className="text-xl font-medium text-bank-blue mb-2">
                开始对话
              </h2>
              <p className="text-gray-500">
                输入您的问题，我们的智能助手将为您提供专业的金融服务
              </p>
            </div>
          ) : (
            displayMessages.map((message, index) => (
              <MessageBubble key={message.id || `msg-${index}`} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 悬浮输入框区域 */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {/* 快捷操作按钮 */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={() => handleQuickAction('balance')}
              disabled={!isConnected}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-bank-blue bg-bank-blue/5 hover:bg-bank-blue/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <Wallet className="w-4 h-4" />
              查余额
            </button>
            <button
              onClick={() => handleQuickAction('transfer')}
              disabled={!isConnected}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-bank-blue bg-bank-blue/5 hover:bg-bank-blue/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <ArrowRightLeft className="w-4 h-4" />
              转账
            </button>
            <button
              onClick={() => handleQuickAction('consult')}
              disabled={!isConnected}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-bank-blue bg-bank-blue/5 hover:bg-bank-blue/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <MessageCircle className="w-4 h-4" />
              咨询
            </button>
          </div>
          
          {/* 输入框 */}
          <form onSubmit={handleSend} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题... (按 Enter 发送，Shift+Enter 换行)"
                rows={1}
                disabled={!isConnected}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bank-blue focus:border-bank-blue resize-none bg-white text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                style={{
                  minHeight: '48px',
                  maxHeight: '200px',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || !isConnected}
              className="px-6 py-3 bg-bank-blue hover:bg-bank-blue/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-sm font-medium"
            >
              <Send className="w-5 h-5" />
              <span>发送</span>
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-500 text-center">
            银行级安全保障 | 您的隐私受到保护
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * 消息气泡组件
 */
function MessageBubble({ message }) {
  const isUser = message.type === 'user';
  const isStreaming = message.isStreaming;

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      {/* 機器人頭像 */}
      {!isUser && (
        <div className="w-8 h-8 bg-bank-blue rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
          <Wallet className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div
        className={`max-w-3xl rounded-lg px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-bank-blue text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <MessageRenderer message={message} isStreaming={isStreaming} />
        )}
      </div>
    </div>
  );
}

export default App;
