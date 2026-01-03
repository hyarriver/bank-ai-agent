/**
 * ProductList 组件
 * 以列表或网格形式展示贷款产品
 */
export function ProductList({ data }) {
  const { products = [], layout = 'grid' } = data || {};

  const handleApply = (product) => {
    // 触发申请操作，可以通过回调函数实现
    if (data?.onApply) {
      data.onApply(product);
    } else {
      console.log('申请产品:', product);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-gray-500 text-center">
          暂无可用产品
        </p>
      </div>
    );
  }

  if (layout === 'list') {
    // 列表布局
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-bank-blue">
            贷款产品
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {products.map((product, index) => (
            <div
              key={index}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-1">
                    {product.name || '未命名产品'}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {product.description || ''}
                  </p>
                  <div className="flex items-center space-x-4">
                    {product.rate !== undefined && (
                      <span className="text-2xl font-medium text-bank-blue">
                        {product.rate}%
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          年化利率
                        </span>
                      </span>
                    )}
                    {product.amount && (
                      <span className="text-sm text-gray-600">
                        最高额度: {formatCurrency(product.amount)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleApply(product)}
                  className="ml-6 px-6 py-2 bg-bank-blue hover:bg-bank-blue/90 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  立即申请
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 网格布局（默认）
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-bank-blue mb-4">
        贷款产品
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white shadow-sm"
          >
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {product.name || '未命名产品'}
            </h4>
            {product.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>
            )}
            <div className="mb-4">
              {product.rate !== undefined && (
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-medium text-bank-blue">
                    {product.rate}
                  </span>
                  <span className="text-gray-600">%</span>
                  <span className="text-sm text-gray-500">
                    年化利率
                  </span>
                </div>
              )}
              {product.amount && (
                <p className="text-sm text-gray-600 mt-2">
                  最高额度: {formatCurrency(product.amount)}
                </p>
              )}
            </div>
            <button
              onClick={() => handleApply(product)}
              className="w-full px-4 py-2 bg-bank-blue hover:bg-bank-blue/90 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              立即申请
            </button>
          </div>
        ))}
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
    maximumFractionDigits: 0,
  }).format(amount);
}

