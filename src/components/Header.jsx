import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Header = () => {
  const location = useLocation();
  const { globalSearch, setGlobalSearch } = useAppContext();
  
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    const path = location.pathname.substring(1);
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div className="header-title">{getPageTitle()}</div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '24px', border: '1px solid var(--surface-border)', background: '#F8FAFC', outline: 'none', color: 'var(--text-primary)', fontSize: '14px' }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <button className="btn-icon" style={{ position: 'relative', background: '#F8FAFC', borderRadius: '50%', padding: '10px' }}>
          <Bell size={20} color="var(--primary-color)" />
          <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', background: 'var(--danger-color)', borderRadius: '50%', border: '2px solid white' }}></span>
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--surface-border)', paddingLeft: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
            {(localStorage.getItem('userName') || 'A')[0].toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{localStorage.getItem('userName') || 'Admin'}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Super Admin</span>
          </div>
        </div>

        <button 
          className="btn-icon" 
          title="Logout" 
          onClick={() => { localStorage.removeItem('auth'); window.location.reload(); }}
          style={{ color: 'var(--danger-color)', marginLeft: '12px' }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
