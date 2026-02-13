import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { logout } from '../store/authSlice';

// 导航菜单配置
const navItems = [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '渠道管理', path: '/channels', icon: '🌐' },
  { name: '用户管理', path: '/users', icon: '👥' },
  { name: '订单管理', path: '/orders', icon: '📋' },
  { name: '代付管理', path: '/daifu', icon: '💳' },
  { name: '财务报表', path: '/reports', icon: '📊' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 侧边栏 */}
      <div 
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-primary">后台管理</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="mr-3">{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="bg-primary/20 text-primary rounded-full p-2">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-700">{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.name || '首页'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              退出登录
            </button>
          </div>
        </header>
        
        {/* 内容区域 */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
