import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { BalanceCard } from './BalanceCard';
import { ProductList } from './ProductList';
import { ConfirmBox } from './ConfirmBox';

/**
 * MessageRenderer 组件
 * 根据消息类型渲染不同的内容
 * @param {object} message - 消息对象
 * @param {boolean} isStreaming - 是否正在流式传输
 * @param {function} sendMessage - WebSocket 消息发送函数（可选）
 */
export function MessageRenderer({ message, isStreaming = false, sendMessage }) {
  const { type, content, plugin, data } = message;

  // 如果是插件类型，渲染特定 UI 插件
  if (type === 'plugin' && plugin) {
    return renderPlugin(plugin, data, content, sendMessage);
  }

  // 默认渲染 Markdown 文本
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),
        }}
      >
        {content || ''}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
      )}
    </div>
  );
}

/**
 * 渲染插件 UI
 */
function renderPlugin(pluginName, pluginData, fallbackContent) {
  switch (pluginName) {
    case 'account_balance':
      return <AccountBalancePlugin data={pluginData} />;
    case 'transaction_history':
      return <TransactionHistoryPlugin data={pluginData} />;
    case 'transfer':
      return <TransferPlugin data={pluginData} />;
    case 'chart':
      return <ChartPlugin data={pluginData} />;
    default:
      // 未知插件类型，回退到文本渲染
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            未知插件类型: {pluginName}
          </p>
          {fallbackContent && <p className="mt-2">{fallbackContent}</p>}
        </div>
      );
  }
}

/**
 * 账户余额插件
 */
function AccountBalancePlugin({ data }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        账户余额
      </h3>
      <div className="space-y-3">
        {data?.accounts?.map((account, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {account.name || account.accountNumber}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {account.accountNumber}
                </p>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(account.balance, account.currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 交易历史插件
 */
function TransactionHistoryPlugin({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        交易记录
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                日期
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                描述
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                金額
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                狀態
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data?.transactions?.map((transaction, index) => (
              <tr key={index}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {transaction.description}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                    transaction.amount >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 转账插件
 */
function TransferPlugin({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        转账确认
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">从账户:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {data?.fromAccount}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">到账户:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {data?.toAccount}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">金额:</span>
          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
            {formatCurrency(data?.amount, data?.currency)}
          </span>
        </div>
        {data?.fee && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-500">手续费:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(data.fee, data.currency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 图表插件
 */
function ChartPlugin({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {data?.title || '图表'}
      </h3>
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          图表渲染区域（可集成 Chart.js、Recharts 等）
        </p>
      </div>
    </div>
  );
}

/**
 * 格式化货币
 */
function formatCurrency(amount, currency = 'CNY') {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

