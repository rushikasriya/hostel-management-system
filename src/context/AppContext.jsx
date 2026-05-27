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
    fetch('/getBlocks').then(res => res.json()).then(data => { if(Array.isArray(data)) setBlocks(data.map(h => ({ ...h, id: h.id || h.block_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getFloors').then(res => res.json()).then(data => { if(Array.isArray(data)) setFloors(data.map(h => ({ ...h, id: h.id || h.floor_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getRooms').then(res => res.json()).then(data => { if(Array.isArray(data)) setRooms(data.map(h => ({ ...h, id: h.id || h.room_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getBeds').then(res => res.json()).then(data => { if(Array.isArray(data)) setBeds(data.map(h => ({ ...h, id: h.id || h.bed_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getTenants').then(res => res.json()).then(data => { if(Array.isArray(data)) setTenants(data.map(h => ({ ...h, id: h.id || h.tenant_id }))) }).catch(err => console.error("Failed:", err));
  }, []);

  useEffect(() => {
    fetch('/getRoles').then(res => res.json()).then(data => { if(Array.isArray(data)) setRoles(data) }).catch(err => console.error("Failed:", err));
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
        if(record.role_id) record.role_id = parseInt(record.role_id, 10);
        await handleApiAction('/usersList', 'POST', record);
        await reloadData('/getUsers', setUsers, 'user_id');
      } else if (entityType === 'hostels') {
        if(record.location_id) record.location_id = parseInt(record.location_id, 10);
        await handleApiAction('/addHostel', 'POST', record);
        await reloadData('/getHostels', setHostels, 'hostel_id');
      } else if (entityType === 'blocks') {
        if(record.hostel_id) record.hostel_id = parseInt(record.hostel_id, 10);
        if(record.manager_id) record.manager_id = parseInt(record.manager_id, 10);
        if(record.block_incharge_id) record.block_incharge_id = parseInt(record.block_incharge_id, 10);
        await handleApiAction('/addBlocks', 'POST', record);
        await reloadData('/getBlocks', setBlocks, 'block_id');
      } else if (entityType === 'floors') {
        if(record.block_id) record.block_id = parseInt(record.block_id, 10);
        if(record.incharge_id) record.incharge_id = parseInt(record.incharge_id, 10);
        await handleApiAction('/addFloor', 'POST', record);
        await reloadData('/getFloors', setFloors, 'floor_id');
      } else if (entityType === 'rooms') {
        if(record.floor_id) record.floor_id = parseInt(record.floor_id, 10);
        await handleApiAction('/addRoom', 'POST', record);
        await reloadData('/getRooms', setRooms, 'room_id');
      } else if (entityType === 'beds') {
        if(record.room_id) record.room_id = parseInt(record.room_id, 10);
        await handleApiAction('/addBed', 'POST', record);
        await reloadData('/getBeds', setBeds, 'bed_id');
      } else if (entityType === 'tenants') {
        if(record.bed_id) record.bed_id = parseInt(record.bed_id, 10);
        if(record.fee) record.fee = parseFloat(record.fee);
        await handleApiAction('/addTenant', 'POST', record);
        await reloadData('/getTenants', setTenants, 'tenant_id');
      }
    } catch (err) {
      alert(`Failed to add ${entityType}: ${err.message}`);
    }
  };

  const updateRecord = async (entityType, updatedRecord) => {
    try {
      if (entityType === 'users') {
        if(updatedRecord.role_id) updatedRecord.role_id = parseInt(updatedRecord.role_id, 10);
        await handleApiAction(`/updateUser/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getUsers', setUsers, 'user_id');
      } else if (entityType === 'hostels') {
        if(updatedRecord.location_id) updatedRecord.location_id = parseInt(updatedRecord.location_id, 10);
        await handleApiAction(`/updateHostelDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getHostels', setHostels, 'hostel_id');
      } else if (entityType === 'blocks') {
        if(updatedRecord.hostel_id) updatedRecord.hostel_id = parseInt(updatedRecord.hostel_id, 10);
        if(updatedRecord.manager_id) updatedRecord.manager_id = parseInt(updatedRecord.manager_id, 10);
        if(updatedRecord.block_incharge_id) updatedRecord.block_incharge_id = parseInt(updatedRecord.block_incharge_id, 10);
        await handleApiAction(`/updateBlockDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getBlocks', setBlocks, 'block_id');
      } else if (entityType === 'floors') {
        if(updatedRecord.block_id) updatedRecord.block_id = parseInt(updatedRecord.block_id, 10);
        if(updatedRecord.incharge_id) updatedRecord.incharge_id = parseInt(updatedRecord.incharge_id, 10);
        await handleApiAction(`/updateFloorDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getFloors', setFloors, 'floor_id');
      } else if (entityType === 'rooms') {
        if(updatedRecord.floor_id) updatedRecord.floor_id = parseInt(updatedRecord.floor_id, 10);
        await handleApiAction(`/updateRoomDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getRooms', setRooms, 'room_id');
      } else if (entityType === 'beds') {
        if(updatedRecord.room_id) updatedRecord.room_id = parseInt(updatedRecord.room_id, 10);
        await handleApiAction(`/updateBedDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getBeds', setBeds, 'bed_id');
      } else if (entityType === 'tenants') {
        if(updatedRecord.bed_id) updatedRecord.bed_id = parseInt(updatedRecord.bed_id, 10);
        if(updatedRecord.fee) updatedRecord.fee = parseFloat(updatedRecord.fee);
        await handleApiAction(`/updateTenantDetails/${updatedRecord.id}`, 'PUT', updatedRecord);
        await reloadData('/getTenants', setTenants, 'tenant_id');
      }
    } catch (err) {
      alert(`Failed to update ${entityType}: ${err.message}`);
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
    } catch (err) {
      alert(`Failed to delete ${entityType}: ${err.message}`);
    }
  };

  return (
    <AppContext.Provider value={{
      users, hostels, blocks, floors, rooms, beds, tenants, roles,
      addRecord, updateRecord, softDeleteRecord
    }}>
      {children}
    </AppContext.Provider>
  );
};
