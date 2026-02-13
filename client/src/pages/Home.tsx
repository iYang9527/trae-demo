import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { getChannels } from '../store/channelSlice';
import { getUsers } from '../store/userSlice';
import { getOrders } from '../store/orderSlice';
import { getDaifus } from '../store/daifuSlice';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const { items: channels } = useAppSelector(state => state.channels);
  const { items: users } = useAppSelector(state => state.users);
  const { items: orders } = useAppSelector(state => state.orders);
  const { items: daifus } = useAppSelector(state => state.daifu);

  useEffect(() => {
    dispatch(getChannels());
    dispatch(getUsers());
    dispatch(getOrders());
    dispatch(getDaifus());
  }, [dispatch]);

  // 计算关键指标
  const totalOrders = orders.length;
  const pendingDaifus = daifus.filter(d => d.status === 'pending').length;
  const activeChannels = channels.length;
  const totalUsers = users.length;

  // 计算今日订单数量和金额
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(order => 
    order.createdAt.split('T')[0] === today
  );
  const todayOrderCount = todayOrders.length;
  const todayOrderAmount = todayOrders.reduce((sum, order) => sum + order.amount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">系统概览</h1>
        <p className="text-gray-600">欢迎回来，这是您的系统概览</p>
      </div>
      
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总订单数</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalOrders}</h3>
            </div>
            <div className="bg-primary/20 text-primary rounded-full p-3">
              📋
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待处理代付</p>
              <h3 className="text-2xl font-bold text-gray-800">{pendingDaifus}</h3>
            </div>
            <div className="bg-warning/20 text-warning rounded-full p-3">
              💳
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">活跃渠道</p>
              <h3 className="text-2xl font-bold text-gray-800">{activeChannels}</h3>
            </div>
            <div className="bg-success/20 text-success rounded-full p-3">
              🌐
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总用户数</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalUsers}</h3>
            </div>
            <div className="bg-info/20 text-info rounded-full p-3">
              👥
            </div>
          </div>
        </div>
      </div>
      
      {/* 今日数据 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">今日订单</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">订单数量</span>
              <span className="text-lg font-medium">{todayOrderCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">订单金额</span>
              <span className="text-lg font-medium">¥{todayOrderAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">系统状态</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">系统状态</span>
              <span className="badge badge-success">正常运行</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">最后更新</span>
              <span className="text-sm text-gray-500">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
