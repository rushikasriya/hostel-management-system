import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Home, Layers, Box, DoorOpen, BedDouble, UserCheck, Settings, CreditCard, FileText, AlertCircle, CalendarCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Sidebar = () => {
  const { userRole } = useAppContext();
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/users', name: 'Users', icon: <Users size={20} /> },
    { path: '/hostels', name: 'Hostels', icon: <Home size={20} /> },
    { path: '/blocks', name: 'Blocks', icon: <Layers size={20} /> },
    { path: '/floors', name: 'Floors', icon: <Box size={20} /> },
    { path: '/rooms', name: 'Rooms', icon: <DoorOpen size={20} /> },
    { path: '/beds', name: 'Beds', icon: <BedDouble size={20} /> },
    { path: '/tenants', name: 'Tenants', icon: <UserCheck size={20} /> },
    { path: '/attendance', name: 'Attendance', icon: <CalendarCheck size={20} /> },
    { path: '/tickets', name: 'Tickets', icon: <AlertCircle size={20} /> },
    { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
  ].filter(item => {
    if (userRole === 'manager') {
      return item.name !== 'Users';
    } else if (userRole === 'blockIncharge') {
      return !['Users', 'Hostels'].includes(item.name);
    } else if (userRole === 'floorIncharge') {
      return !['Users', 'Hostels', 'Blocks'].includes(item.name);
    }
    return true; // admin, superAdmin, or unknown
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 12px' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--sidebar-active)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Home size={24} color="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'white', letterSpacing: '1px', lineHeight: 1 }}>HOSTEL</span>
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-sidebar)', letterSpacing: '1.5px', marginTop: '2px' }}>MANAGEMENT</span>
        </div>
      </div>
      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
