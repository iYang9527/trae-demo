import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { getDaifus, updateDaifu, deleteDaifu } from '../store/daifuSlice';
import { Daifu } from '../types';

const DaifuComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: daifus, loading, error } = useAppSelector(state => state.daifu);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDaifu, setEditingDaifu] = useState<Daifu | null>(null);
  const [formData, setFormData] = useState({
    status: 'pending'
  });

  useEffect(() => {
    dispatch(getDaifus());
  }, [dispatch]);

  const handleOpenModal = (daifu: Daifu) => {
    setEditingDaifu(daifu);
    setFormData({ status: daifu.status });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDaifu(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDaifu) {
      dispatch(updateDaifu({ id: editingDaifu.id, daifuData: formData }));
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个代付记录吗？')) {
      dispatch(deleteDaifu(id));
    }
  };

  // 获取代付状态对应的样式和文本
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { className: 'badge-warning', text: '待处理' };
      case 'completed':
        return { className: 'badge-success', text: '已完成' };
      case 'failed':
        return { className: 'badge-danger', text: '失败' };
      default:
        return { className: 'badge-info', text: status };
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">代付管理</h1>
        <p className="text-gray-600">管理系统中的代付记录</p>
      </div>
      
      {error && (
        <div className="bg-danger/10 text-danger p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  银行账号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  银行名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  账户 holder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {daifus.map(daifu => {
                const statusInfo = getStatusInfo(daifu.status);
                return (
                  <tr key={daifu.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {daifu.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {daifu.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ¥{daifu.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {daifu.bankAccount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {daifu.bankName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {daifu.accountHolder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(daifu.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(daifu)}
                        className="text-primary hover:text-primary/80 mr-3"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(daifu.id)}
                        className="text-danger hover:text-danger/80"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 代付编辑模态框 */}
      {isModalOpen && editingDaifu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                编辑代付记录: ID {editingDaifu.id}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="status" className="form-label">代付状态</label>
                <select
                  id="status"
                  name="status"
                  className="form-input"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="pending">待处理</option>
                  <option value="completed">已完成</option>
                  <option value="failed">失败</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '提交中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaifuComponent;
