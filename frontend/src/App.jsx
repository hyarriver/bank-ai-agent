import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { MessageRenderer } from './components/MessageRenderer';
import { Send, Wifi, WifiOff } from 'lucide-react';

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
      return envUrl;
    }
    // 如果环境变量只是路径，需要根据当前协议构建完整 URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}${envUrl.startsWith('/') ? envUrl : '/' + envUrl}`;
  }
  
  // 默认情况下，根据当前页面协议和开发/生产环境自动选择
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // 开发环境：使用 localhost:8000（后端默认端口）
  if (import.meta.env.DEV) {
    return `${protocol}//localhost:8000/ws/chat`;
  }
  
  // 生产环境：使用当前域名
  const host = window.location.host;
  return `${protocol}//${host}/ws/chat`;
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部状态栏 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">銀</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                银行智能助手
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                专业金融服务咨询
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">已连接</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">未连接</span>
              </>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </header>

      {/* 消息列表区域 */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {displayMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                开始对话
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
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

      {/* 输入框区域 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题... (按 Enter 发送，Shift+Enter 换行)"
                rows={1}
                disabled={!isConnected}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-sm"
            >
              <Send className="w-5 h-5" />
              <span>发送</span>
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
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
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div
        className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
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
