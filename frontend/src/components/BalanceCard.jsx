/**
 * BalanceCard 组件
 * 展示银行卡类型、脱敏卡号和实时余额
 */
export function BalanceCard({ data }) {
  const { cardType, cardNumber, balance, currency = 'CNY' } = data || {};

  // 脱敏卡号处理（只显示后4位）
  const maskCardNumber = (number) => {
    if (!number) return '';
    const numStr = String(number);
    if (numStr.length <= 4) return numStr;
    return '**** **** **** ' + numStr.slice(-4);
  };

  // 格式化货币
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-bank-blue to-bank-blue/90 rounded-lg p-6 shadow-sm border border-gray-200 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm mb-1">卡类型</p>
          <p className="text-xl font-medium">{cardType || '标准卡'}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-white/80 text-sm mb-2">卡號</p>
        <p className="text-lg font-mono tracking-wider">
          {maskCardNumber(cardNumber)}
        </p>
      </div>
      
      <div className="border-t border-white/20 pt-4">
        <p className="text-white/80 text-sm mb-2">可用余额</p>
        <p className="text-4xl font-medium">
          {balance !== undefined && balance !== null 
            ? formatCurrency(balance)
            : 'N/A'}
        </p>
      </div>
    </div>
  );
}

