import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, UserCircle, LogOut } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    const path = location.pathname.substring(1);
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="header">
      <div className="header-title">{getPageTitle()}</div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button className="btn-icon">
          <Bell size={20} />
        </button>
        <button className="btn-icon" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <UserCircle size={24} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Admin</span>
        </button>
        <button 
          className="btn-icon" 
          title="Logout" 
          onClick={() => { localStorage.removeItem('auth'); window.location.reload(); }}
          style={{ color: 'var(--danger-color)' }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
