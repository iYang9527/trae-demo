import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { getFinancialReport } from '../store/reportSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports: React.FC = () => {
  const dispatch = useAppDispatch();
  const { financialData, loading, error } = useAppSelector(state => state.reports);

  useEffect(() => {
    dispatch(getFinancialReport());
  }, [dispatch]);

  // 模拟财务数据，实际项目中会从API获取
  const mockFinancialData = [
    { date: '2026-01-01', amount: 1000, type: 'income' },
    { date: '2026-01-02', amount: 1500, type: 'income' },
    { date: '2026-01-03', amount: 800, type: 'expense' },
    { date: '2026-01-04', amount: 2000, type: 'income' },
    { date: '2026-01-05', amount: 1200, type: 'expense' },
    { date: '2026-01-06', amount: 1800, type: 'income' },
    { date: '2026-01-07', amount: 900, type: 'expense' },
  ];

  // 准备图表数据
  const lineChartData = {
    labels: mockFinancialData.map(item => item.date),
    datasets: [
      {
        label: '收入',
        data: mockFinancialData.map(item => item.type === 'income' ? item.amount : 0),
        borderColor: '#165DFF',
        backgroundColor: 'rgba(22, 93, 255, 0.1)',
        tension: 0.1,
      },
      {
        label: '支出',
        data: mockFinancialData.map(item => item.type === 'expense' ? item.amount : 0),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      },
    ],
  };

  // 饼图数据
  const pieChartData = {
    labels: ['收入', '支出'],
    datasets: [
      {
        data: [
          mockFinancialData.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
          mockFinancialData.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
        ],
        backgroundColor: ['#165DFF', '#EF4444'],
      },
    ],
  };

  // 柱状图数据
  const barChartData = {
    labels: mockFinancialData.map(item => item.date),
    datasets: [
      {
        label: '净收入',
        data: mockFinancialData.map(item => item.type === 'income' ? item.amount : -item.amount),
        backgroundColor: mockFinancialData.map(item => item.type === 'income' ? '#165DFF' : '#EF4444'),
      },
    ],
  };

  // 计算财务汇总数据
  const totalIncome = mockFinancialData.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = mockFinancialData.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalIncome - totalExpense;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">财务报表</h1>
        <p className="text-gray-600">查看系统的财务数据和统计信息</p>
      </div>
      
      {error && (
        <div className="bg-danger/10 text-danger p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* 财务汇总卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总收入</p>
              <h3 className="text-2xl font-bold text-success">¥{totalIncome.toFixed(2)}</h3>
            </div>
            <div className="bg-success/20 text-success rounded-full p-3">
              ⬆️
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总支出</p>
              <h3 className="text-2xl font-bold text-danger">¥{totalExpense.toFixed(2)}</h3>
            </div>
            <div className="bg-danger/20 text-danger rounded-full p-3">
              ⬇️
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">净收入</p>
              <h3 className="text-2xl font-bold text-primary">¥{netIncome.toFixed(2)}</h3>
            </div>
            <div className="bg-primary/20 text-primary rounded-full p-3">
              📊
            </div>
          </div>
        </div>
      </div>
      
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">收支趋势</h3>
          <Line data={lineChartData} />
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">收支占比</h3>
          <Pie data={pieChartData} />
        </div>
      </div>
      
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">每日净收入</h3>
        <Bar data={barChartData} />
      </div>
      
      {/* 财务数据表格 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">财务明细</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockFinancialData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${item.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                      {item.type === 'income' ? '收入' : '支出'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={item.type === 'income' ? 'text-success' : 'text-danger'}>
                      {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
