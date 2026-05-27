import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { CrudPage } from './components/CrudPage';
import { HostelDetails } from './pages/HostelDetails';
import { Login } from './pages/Login';
import { ExternalLink } from 'lucide-react';

import { useAppContext } from './context/AppContext';

function App() {
  const { roles, users, hostels, blocks, floors, rooms, beds, addToast } = useAppContext();
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('auth') === 'true');

  React.useEffect(() => {
    if (isAuthenticated && !localStorage.getItem('userName')) {
      // Force logout for old sessions without a saved userName
      localStorage.removeItem('auth');
      setIsAuthenticated(false);
      if (addToast) addToast('Session updated. Please log in again.', 'success');
    }
  }, [isAuthenticated, addToast]);

  if (!isAuthenticated) {
    return <Login onLogin={(user) => {
      localStorage.setItem('auth', 'true');
      if (user && user.user_name) {
        localStorage.setItem('userName', user.user_name);
      }
      setIsAuthenticated(true);
      if (addToast) addToast(`Successfully logged in${user ? ` as ${user.user_name}` : ''}!`, 'success');
    }} />;
  }

  const getUserName = (id) => {
    if (!id) return '-';
    const user = users?.find(u => u.id === id || u.user_id === id);
    return user ? user.user_name : id;
  };
  const getHostelName = (id) => hostels?.find(h => h.id === id)?.hostel_name || id;
  const getBlockName = (id) => blocks?.find(b => b.id === id)?.block_name || id;
  const getFloorName = (id) => floors?.find(f => f.id === id)?.floor_name || id;
  const getRoomName = (id) => rooms?.find(r => r.id === id)?.room_no || id;
  const getBedName = (id) => beds?.find(b => b.id === id)?.bed_no || id;

  const userColumns = [
    { key: 'user_name', label: 'User Name' },
    { key: 'email_id', label: 'Email', type: 'email' },
    { key: 'contact_no', label: 'Contact No' },
    { key: 'role_name', label: 'Role', hideInForm: true },
    { 
      key: 'role_id', 
      label: 'Role', 
      type: 'select', 
      options: (roles || []).map(r => ({ label: r.role_name, value: r.id })),
      hideInTable: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select', 
      options: [{label: 'Active', value: 'T'}, {label: 'Inactive', value: 'F'}],
      render: (val) => (
        <span className={`badge ${val === 'T' ? 'badge-active' : 'badge-inactive'}`}>
          {val === 'T' ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const hostelColumns = [
    { key: 'hostel_name', label: 'Hostel Name' },
    { key: 'hostel_code', label: 'Hostel Code', hideInForm: true },
    { key: 'location_id', label: 'Location ID', type: 'number' },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select', 
      options: [{label: 'Active', value: 'T'}, {label: 'Inactive', value: 'F'}],
      render: (val) => (
        <span className={`badge ${val === 'T' ? 'badge-active' : 'badge-inactive'}`}>
          {val === 'T' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      key: 'id', 
      label: 'Report', 
      hideInForm: true,
      render: (value, item) => {
        const hId = item.id || item.hostel_id || item.hostelId;
        return (
          <Link to={`/hostel-details/${hId}`} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>
            <ExternalLink size={14} /> View Details
          </Link>
        );
      }
    }
  ];

  const blockColumns = [
    { key: 'block_name', label: 'Block Name' },
    { 
      key: 'hostel_id', 
      label: 'Hostel Name', 
      type: 'select',
      options: (hostels || []).map(h => ({ label: h.hostel_name, value: h.id })),
      render: (val) => getHostelName(val) 
    },
    { 
      key: 'manager_id', 
      label: 'Manager', 
      type: 'select',
      options: (users || []).filter(u => u.role_name === 'manager').map(u => ({ label: u.user_name, value: u.user_id })),
      render: (val) => getUserName(val) 
    },
    { 
      key: 'block_incharge_id', 
      label: 'Incharge', 
      type: 'select',
      options: (users || []).filter(u => u.role_name === 'blockIncharge').map(u => ({ label: u.user_name, value: u.user_id })),
      render: (val) => getUserName(val) 
    }
  ];

  const floorColumns = [
    { key: 'floor_name', label: 'Floor Name' },
    { 
      key: 'block_id', 
      label: 'Block Name', 
      type: 'select',
      options: (blocks || []).map(b => ({ label: b.block_name, value: b.id })),
      render: (val) => getBlockName(val) 
    },
    { 
      key: 'incharge_id', 
      label: 'Incharge', 
      type: 'select',
      options: (users || []).filter(u => u.role_name === 'floorIncharge').map(u => ({ label: u.user_name, value: u.user_id })),
      render: (val) => getUserName(val) 
    }
  ];

  const roomColumns = [
    { key: 'room_no', label: 'Room Number' },
    { 
      key: 'floor_id', 
      label: 'Floor', 
      type: 'select',
      options: (floors || []).map(f => ({ label: f.floor_name, value: f.id })),
      render: (val) => getFloorName(val) 
    }
  ];

  const bedColumns = [
    { key: 'bed_no', label: 'Bed Number' },
    { 
      key: 'room_id', 
      label: 'Room', 
      type: 'select',
      options: (rooms || []).map(r => ({ label: r.room_no, value: r.id })),
      render: (val) => getRoomName(val) 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select', 
      options: [{label: 'Vacant', value: 'Vacant'}, {label: 'Occupied', value: 'Occupied'}],
      render: (val) => (
        <span className={`badge ${val === 'Occupied' ? 'badge-active' : 'badge-inactive'}`}>
          {val}
        </span>
      )
    }
  ];

  const tenantColumns = [
    { key: 'tenant_name', label: 'Tenant Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'emergency_phone', label: 'Emergency Phone' },
    { key: 'designation', label: 'Designation' },
    { key: 'address', label: 'Address' },
    { 
      key: 'bed_id', 
      label: 'Bed', 
      type: 'select',
      options: (formData) => (beds || []).filter(b => b.status === 'Vacant' || (formData && b.id === formData.bed_id)).map(b => ({ label: `${getRoomName(b.room_id)} - ${b.bed_no}${b.status !== 'Vacant' ? ' (Current)' : ''}`, value: b.id })),
      render: (val) => getBedName(val) 
    },
    { key: 'fee', label: 'Fee', type: 'number' },
    { key: 'joining_date', label: 'Joining Date', type: 'date' }
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hostel-details/:id" element={<HostelDetails />} />
          <Route path="/users" element={<CrudPage entityType="users" title="Users" columns={userColumns} />} />
          <Route path="/hostels" element={<CrudPage entityType="hostels" title="Hostels" columns={hostelColumns} />} />
          <Route path="/blocks" element={<CrudPage entityType="blocks" title="Blocks" columns={blockColumns} />} />
          <Route path="/floors" element={<CrudPage entityType="floors" title="Floors" columns={floorColumns} />} />
          <Route path="/rooms" element={<CrudPage entityType="rooms" title="Rooms" columns={roomColumns} />} />
          <Route path="/beds" element={<CrudPage entityType="beds" title="Beds" columns={bedColumns} />} />
          <Route path="/tenants" element={<CrudPage entityType="tenants" title="Tenants" columns={tenantColumns} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
