import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const AppProvider = ({ children }) => {
  // Initial state logic from local storage or default empty array
  const loadInitialData = (key) => {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return [];
  };

  const [users, setUsers] = useState(() => loadInitialData('users'));
  const [hostels, setHostels] = useState(() => loadInitialData('hostels'));
  const [blocks, setBlocks] = useState(() => loadInitialData('blocks'));
  const [floors, setFloors] = useState(() => loadInitialData('floors'));
  const [rooms, setRooms] = useState(() => loadInitialData('rooms'));
  const [beds, setBeds] = useState(() => loadInitialData('beds'));
  const [tenants, setTenants] = useState(() => loadInitialData('tenants'));
  const [roles, setRoles] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');

  const addToast = (message, type = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Fetch users from API
  useEffect(() => {
    fetch('/getUsers')
      .then(res => res.json())
      .then(data => {
        const mappedUsers = data.map(u => ({ ...u, id: u.user_id || u.id }));
        setUsers(mappedUsers);
      })
      .catch(err => console.error("Failed to load users:", err));
  }, []);

  // Fetch hostels from API
  useEffect(() => {
    fetch('/getHostels')
      .then(res => res.json())
      .then(data => {
        const mappedHostels = data.map(h => ({ ...h, id: h.id || h.hostel_id }));
        setHostels(mappedHostels);
      })
      .catch(err => console.error("Failed to load hostels:", err));
  }, []);

  useEffect(() => {
    fetch('/getBlocks').then(res => res.json()).then(data => { if (Array.isArray(data)) setBlocks(data.map(h => ({ ...h, id: h.id || h.block_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getFloors').then(res => res.json()).then(data => { if (Array.isArray(data)) setFloors(data.map(h => ({ ...h, id: h.id || h.floor_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getRooms').then(res => res.json()).then(data => { if (Array.isArray(data)) setRooms(data.map(h => ({ ...h, id: h.id || h.room_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getBeds').then(res => res.json()).then(data => { if (Array.isArray(data)) setBeds(data.map(h => ({ ...h, id: h.id || h.bed_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getTenants').then(res => res.json()).then(data => { if (Array.isArray(data)) setTenants(data.map(h => ({ ...h, id: h.id || h.tenant_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getRoles').then(res => res.json()).then(data => { if (Array.isArray(data)) setRoles(data) }).catch(err => console.error("Failed:", err));
  }, []);

  const handleApiAction = async (url, method, body = null) => {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return res;
  };

  const reloadData = async (url, setter, idKey) => {
    const res = await fetch(url);
    const data = await res.json();
    if (Array.isArray(data)) {
      setter(data.map(item => ({ ...item, id: item.id || item[idKey] })));
    } else {
      console.error(`Expected array from ${url} but got:`, data);
    }
  };

  const addRecord = async (entityType, record) => {
    try {
      if (entityType === 'users') {
        if (record.role_id) record.role_id = parseInt(record.role_id, 10);
        else record.role_id = null;
        await handleApiAction('/addUser', 'POST', record);
        await reloadData('/getUsers', setUsers, 'user_id');
      } else if (entityType === 'hostels') {
        record.location_id = record.location_id ? parseInt(record.location_id, 10) : null;
        await handleApiAction('/addHostel', 'POST', record);
        await reloadData('/getHostels', setHostels, 'hostel_id');
      } else if (entityType === 'blocks') {
        record.hostel_id = record.hostel_id ? parseInt(record.hostel_id, 10) : null;
        record.manager_id = record.manager_id ? parseInt(record.manager_id, 10) : null;
        record.block_incharge_id = record.block_incharge_id ? parseInt(record.block_incharge_id, 10) : null;
        await handleApiAction('/addBlocks', 'POST', record);
        await reloadData('/getBlocks', setBlocks, 'block_id');
      } else if (entityType === 'floors') {
        record.block_id = record.block_id ? parseInt(record.block_id, 10) : null;
        record.incharge_id = record.incharge_id ? parseInt(record.incharge_id, 10) : null;
        await handleApiAction('/addFloor', 'POST', record);
        await reloadData('/getFloors', setFloors, 'floor_id');
      } else if (entityType === 'rooms') {
        record.floor_id = record.floor_id ? parseInt(record.floor_id, 10) : null;
        await handleApiAction('/addRoom', 'POST', record);
        await reloadData('/getRooms', setRooms, 'room_id');
      } else if (entityType === 'beds') {
        record.room_id = record.room_id ? parseInt(record.room_id, 10) : null;
        await handleApiAction('/addBed', 'POST', record);
        await reloadData('/getBeds', setBeds, 'bed_id');
      } else if (entityType === 'tenants') {
        record.bed_id = record.bed_id ? parseInt(record.bed_id, 10) : null;
        record.fee = record.fee ? parseFloat(record.fee) : null;
        await handleApiAction('/addTenant', 'POST', record);
        await reloadData('/getTenants', setTenants, 'tenant_id');
      }
      addToast(`Item added successfully!`);
    } catch (err) {
      addToast(`Failed to add: ${err.message}`, 'error');
    }
  };

  const updateRecord = async (entityType, updatedRecord) => {
    try {
      if (entityType === 'users') {
        if (updatedRecord.role_id) updatedRecord.role_id = parseInt(updatedRecord.role_id, 10);
        else updatedRecord.role_id = null;
        await handleApiAction(`/updateUser/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getUsers', setUsers, 'user_id');
      } else if (entityType === 'hostels') {
        updatedRecord.location_id = updatedRecord.location_id ? parseInt(updatedRecord.location_id, 10) : null;
        await handleApiAction(`/updateHostelDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getHostels', setHostels, 'hostel_id');
      } else if (entityType === 'blocks') {
        updatedRecord.hostel_id = updatedRecord.hostel_id ? parseInt(updatedRecord.hostel_id, 10) : null;
        updatedRecord.manager_id = updatedRecord.manager_id ? parseInt(updatedRecord.manager_id, 10) : null;
        updatedRecord.block_incharge_id = updatedRecord.block_incharge_id ? parseInt(updatedRecord.block_incharge_id, 10) : null;
        await handleApiAction(`/updateBlockDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getBlocks', setBlocks, 'block_id');
      } else if (entityType === 'floors') {
        updatedRecord.block_id = updatedRecord.block_id ? parseInt(updatedRecord.block_id, 10) : null;
        updatedRecord.incharge_id = updatedRecord.incharge_id ? parseInt(updatedRecord.incharge_id, 10) : null;
        await handleApiAction(`/updateFloorDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getFloors', setFloors, 'floor_id');
      } else if (entityType === 'rooms') {
        updatedRecord.floor_id = updatedRecord.floor_id ? parseInt(updatedRecord.floor_id, 10) : null;
        await handleApiAction(`/updateRoomDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getRooms', setRooms, 'room_id');
      } else if (entityType === 'beds') {
        updatedRecord.room_id = updatedRecord.room_id ? parseInt(updatedRecord.room_id, 10) : null;
        await handleApiAction(`/updateBedDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getBeds', setBeds, 'bed_id');
      } else if (entityType === 'tenants') {
        updatedRecord.bed_id = updatedRecord.bed_id ? parseInt(updatedRecord.bed_id, 10) : null;
        updatedRecord.fee = updatedRecord.fee ? parseFloat(updatedRecord.fee) : null;
        await handleApiAction(`/updateTenantDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getTenants', setTenants, 'tenant_id');
      }
      addToast(`Item updated successfully!`);
    } catch (err) {
      addToast(`Failed to update: ${err.message}`, 'error');
    }
  };

  const softDeleteRecord = async (entityType, id) => {
    try {
      if (entityType === 'users') {
        await handleApiAction(`/deactivateUser/${id}`, 'DELETE');
        await reloadData('/getUsers', setUsers, 'user_id');
      } else if (entityType === 'hostels') {
        await handleApiAction(`/updateHostelStatus/${id}`, 'DELETE');
        await reloadData('/getHostels', setHostels, 'hostel_id');
      } else if (entityType === 'blocks') {
        await handleApiAction(`/deleteBlock/${id}`, 'DELETE');
        await reloadData('/getBlocks', setBlocks, 'block_id');
      } else if (entityType === 'floors') {
        await handleApiAction(`/deleteFloor/${id}`, 'DELETE');
        await reloadData('/getFloors', setFloors, 'floor_id');
      } else if (entityType === 'rooms') {
        await handleApiAction(`/deleteRoom/${id}`, 'DELETE');
        await reloadData('/getRooms', setRooms, 'room_id');
      } else if (entityType === 'beds') {
        await handleApiAction(`/deleteBed/${id}`, 'DELETE');
        await reloadData('/getBeds', setBeds, 'bed_id');
      } else if (entityType === 'tenants') {
        await handleApiAction(`/deleteTenant/${id}`, 'DELETE');
        await reloadData('/getTenants', setTenants, 'tenant_id');
      }
      addToast(`Item deleted successfully!`);
    } catch (err) {
      addToast(`Failed to delete: ${err.message}`, 'error');
    }
  };

  const userId = parseInt(localStorage.getItem('userId'), 10);
  const userRoleId = parseInt(localStorage.getItem('roleId'), 10);
  const userRole = roles.find(r => r.id === userRoleId)?.role_name || '';

  // Apply Role-Based Data Restrictions
  let filteredBlocks = blocks;
  let filteredFloors = floors;
  let filteredRooms = rooms;
  let filteredBeds = beds;
  let filteredTenants = tenants;

  if (userRole === 'manager') {
    filteredBlocks = blocks.filter(b => b.manager_id === userId);
    const validBlockIds = new Set(filteredBlocks.map(b => b.id));
    filteredFloors = floors.filter(f => validBlockIds.has(f.block_id));
    const validFloorIds = new Set(filteredFloors.map(f => f.id));
    filteredRooms = rooms.filter(r => validFloorIds.has(r.floor_id));
    const validRoomIds = new Set(filteredRooms.map(r => r.id));
    filteredBeds = beds.filter(b => validRoomIds.has(b.room_id));
    const validBedIds = new Set(filteredBeds.map(b => b.id));
    filteredTenants = tenants.filter(t => validBedIds.has(t.bed_id));
  } else if (userRole === 'blockIncharge') {
    filteredBlocks = blocks.filter(b => b.block_incharge_id === userId);
    const validBlockIds = new Set(filteredBlocks.map(b => b.id));
    filteredFloors = floors.filter(f => validBlockIds.has(f.block_id));
    const validFloorIds = new Set(filteredFloors.map(f => f.id));
    filteredRooms = rooms.filter(r => validFloorIds.has(r.floor_id));
    const validRoomIds = new Set(filteredRooms.map(r => r.id));
    filteredBeds = beds.filter(b => validRoomIds.has(b.room_id));
    const validBedIds = new Set(filteredBeds.map(b => b.id));
    filteredTenants = tenants.filter(t => validBedIds.has(t.bed_id));
  } else if (userRole === 'floorIncharge') {
    filteredBlocks = []; // Can't see blocks
    filteredFloors = floors.filter(f => f.incharge_id === userId);
    const validFloorIds = new Set(filteredFloors.map(f => f.id));
    filteredRooms = rooms.filter(r => validFloorIds.has(r.floor_id));
    const validRoomIds = new Set(filteredRooms.map(r => r.id));
    filteredBeds = beds.filter(b => validRoomIds.has(b.room_id));
    const validBedIds = new Set(filteredBeds.map(b => b.id));
    filteredTenants = tenants.filter(t => validBedIds.has(t.bed_id));
  }

  return (
    <AppContext.Provider value={{
      users, hostels, blocks: filteredBlocks, floors: filteredFloors, rooms: filteredRooms, beds: filteredBeds, tenants: filteredTenants, roles,
      globalSearch, setGlobalSearch,
      addRecord, updateRecord, softDeleteRecord, addToast, userRole
    }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};
