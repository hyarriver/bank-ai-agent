import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * WebSocket 自定义 Hook
 * @param {string} url - WebSocket 连接地址
 * @param {object} options - 配置选项
 * @returns {object} - { sendMessage, messages, isConnected, error }
 */
export function useWebSocket(url, options = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectDelay = options.reconnectDelay || 3000;
  const urlRef = useRef(url);

  // 更新 urlRef
  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  // 连接 WebSocket（内部函数，用于重连）
  const connectInternal = useCallback(() => {
    const currentUrl = urlRef.current;
    if (!currentUrl) {
      setError('WebSocket URL 未设置');
      return;
    }

    try {
      const ws = new WebSocket(currentUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket 连接成功');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        } catch {
          // 如果不是 JSON，当作纯文本处理
          setMessages((prev) => [
            ...prev,
            {
              type: 'text',
              content: event.data,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        console.error('WebSocket URL:', currentUrl);
        console.error('WebSocket readyState:', ws.readyState);
        setError(`WebSocket 连接错误: ${currentUrl}`);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;
        
        console.log('WebSocket 连接关闭:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url: currentUrl
        });

        // 自动重连逻辑
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`尝试重连 (${reconnectAttemptsRef.current}/${maxReconnectAttempts}): ${currentUrl}`);
            connectInternal();
          }, reconnectDelay);
        } else {
          const errorMsg = `WebSocket 连接失败，已达到最大重连次数。URL: ${currentUrl}`;
          console.error(errorMsg);
          setError(errorMsg);
        }
      };
    } catch (err) {
      setError(`WebSocket 连接失败: ${err.message}`);
      setIsConnected(false);
    }
  }, [maxReconnectAttempts, reconnectDelay]);

  // 公开的 connect 函数
  const connect = useCallback(() => {
    connectInternal();
  }, [connectInternal]);

  // 发送消息
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      // 将用户消息添加到消息列表
      setMessages((prev) => [
        ...prev,
        {
          type: 'user',
          content: typeof message === 'string' ? message : message.content,
          timestamp: new Date().toISOString(),
        },
      ]);
    } else {
      setError('WebSocket 未连接，无法发送消息');
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // 初始化连接
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage,
    messages,
    isConnected,
    error,
    disconnect,
    connect,
  };
}

