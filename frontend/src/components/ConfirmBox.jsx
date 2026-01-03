/**
 * ConfirmBox 组件
 * 确认对话框，包含取消和确认按钮
 */
export function ConfirmBox({ data, onConfirm, onCancel }) {
  const {
    title = '确认操作',
    message = '您确定要执行此操作吗？',
    confirmText = '确认',
    cancelText = '取消',
    confirmData,
  } = data || {};

  const handleConfirm = () => {
    // 如果提供了 onConfirm 回调，使用它
    if (onConfirm) {
      onConfirm(confirmData || { action: 'confirm' });
    } else if (data?.onConfirm) {
      data.onConfirm(confirmData || { action: 'confirm' });
    }
  };

  const handleCancel = () => {
    // 如果提供了 onCancel 回调，使用它
    if (onCancel) {
      onCancel({ action: 'cancel' });
    } else if (data?.onCancel) {
      data.onCancel({ action: 'cancel' });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-wrap">
        {message}
      </p>
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

