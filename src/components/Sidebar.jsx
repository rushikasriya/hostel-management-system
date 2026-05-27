import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Home, Layers, Box, DoorOpen, BedDouble, UserCheck } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/users', name: 'Users', icon: <Users size={20} /> },
    { path: '/hostels', name: 'Hostels', icon: <Home size={20} /> },
    { path: '/blocks', name: 'Blocks', icon: <Layers size={20} /> },
    { path: '/floors', name: 'Floors', icon: <Box size={20} /> },
    { path: '/rooms', name: 'Rooms', icon: <DoorOpen size={20} /> },
    { path: '/beds', name: 'Beds', icon: <BedDouble size={20} /> },
    { path: '/tenants', name: 'Tenants', icon: <UserCheck size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Home size={28} />
        HostelApp
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
