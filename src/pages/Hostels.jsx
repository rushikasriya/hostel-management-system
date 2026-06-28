import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, Building, MapPin, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hostels = () => {
  const { hostels, blocks, floors, rooms, beds, users, addToast, addRecord, updateRecord, softDeleteRecord, organizations, userRole } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ hostel_name: '', hostel_code: '', location_id: '', manager_id: '', status: 'T', photo_url: '', organization_id: '' });

  const activeHostels = (hostels || []).filter(h => !h.isDeleted);
  const filteredHostels = activeHostels.filter(h => 
    (h.hostel_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const res = await fetch('/upload', { method: 'POST', body: uploadData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, photo_url: data.photo_url }));
      addToast('Photo uploaded successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (dataToSubmit.organization_id) {
      dataToSubmit.organization_id = parseInt(dataToSubmit.organization_id, 10);
    } else {
      delete dataToSubmit.organization_id;
    }
    if (editingId) {
      updateRecord('hostels', { ...dataToSubmit, id: editingId });
    } else {
      addRecord('hostels', dataToSubmit);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ hostel_name: '', hostel_code: '', location_id: '', manager_id: '', status: 'T', photo_url: '', organization_id: '' });
  };

  const handleEdit = (hostel) => {
    setFormData({ 
      hostel_name: hostel.hostel_name || '', 
      hostel_code: hostel.hostel_code || '', 
      location_id: hostel.location_id || '', 
      manager_id: hostel.manager_id || '',
      status: hostel.status || 'T', 
      photo_url: hostel.photo_url || '',
      organization_id: hostel.organization_id || ''
    });
    setEditingId(hostel.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this hostel?")) {
      softDeleteRecord('hostels', id);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ hostel_name: '', hostel_code: '', location_id: '', manager_id: '', status: 'T', photo_url: '', organization_id: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="page-content" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Hostels</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Dashboard &gt; <span style={{ color: 'var(--primary-color)' }}>Hostels</span></div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ padding: '10px 20px', borderRadius: '8px' }}>
          <Plus size={18} /> Add Hostel
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search hostel..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid var(--surface-border)', outline: 'none', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {filteredHostels.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No hostels found</div>
        ) : (
          filteredHostels.map((hostel, index) => {
            const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];
            const hostelBlocks = (blocks || []).filter(b => b.hostel_id === hostel.id && !b.isDeleted);
            const hostelFloors = (floors || []).filter(f => hostelBlocks.some(b => b.id === f.block_id) && !f.isDeleted);
            const hostelRooms = (rooms || []).filter(r => hostelFloors.some(f => f.id === r.floor_id) && !r.isDeleted);
            const hostelBeds = (beds || []).filter(b => hostelRooms.some(r => r.id === b.room_id) && !b.isDeleted);
            
            const totalBeds = hostelBeds.length;
            const occupiedBeds = hostelBeds.filter(b => b.status === 'Occupied').length;
            const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
            const org = organizations.find(o => o.id === hostel.organization_id);

            return (
              <div key={hostel.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ 
                   height: '140px', 
                   background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${hostel.photo_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'}) center/cover`, 
                   position: 'relative' 
                }}>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--primary-color)' }}>
                    Active
                  </div>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{hostel.hostel_name}</h3>
                    {userRole === 'superAdmin' && (
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '8px' }}>
                        {org ? org.name : 'Unassigned'}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <MapPin size={14} /> Location ID: {hostel.location_id || 'N/A'}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Blocks</div>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{hostelBlocks.length}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Rooms</div>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{hostelRooms.length}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Occupancy</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: occupancyPercentage >= 80 ? 'var(--success-color)' : occupancyPercentage >= 50 ? 'var(--warning-color)' : 'var(--primary-color)' }}>
                        {occupancyPercentage}%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <Link to={`/blocks?hostel=${hostel.id}`} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
                      View
                    </Link>
                    <button className="btn btn-primary" onClick={() => handleEdit(hostel)} style={{ flex: 1, justifyContent: 'center' }}>
                      Edit
                    </button>
                    <button className="btn btn-outline" onClick={() => handleDelete(hostel.id)} style={{ padding: '8px 12px', borderColor: '#FECACA', color: '#EF4444' }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">{editingId ? 'Edit Hostel' : 'Add Hostel'}</h3>
                <button type="button" className="btn-icon" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body form-grid">
                <div className="form-group">
                  <label className="form-label">Hostel Name</label>
                  <input type="text" className="form-control" required value={formData.hostel_name} onChange={(e) => setFormData({...formData, hostel_name: e.target.value})} placeholder="Enter hostel name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Hostel Code</label>
                  <input type="text" className="form-control" required value={formData.hostel_code} onChange={(e) => setFormData({...formData, hostel_code: e.target.value})} placeholder="Enter hostel code" />
                </div>
                {userRole === 'superAdmin' && (
                  <div className="form-group">
                    <label className="form-label">Organization</label>
                    <select className="form-control" required value={formData.organization_id} onChange={(e) => setFormData({...formData, organization_id: e.target.value})}>
                      <option value="">Select Organization</option>
                      {(organizations || []).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Location ID</label>
                  <input type="number" className="form-control" required value={formData.location_id} onChange={(e) => setFormData({...formData, location_id: e.target.value})} placeholder="Enter location ID" />
                </div>
                <div className="form-group">
                  <label className="form-label">Manager</label>
                  <select className="form-control" value={formData.manager_id} onChange={(e) => setFormData({...formData, manager_id: e.target.value})}>
                    <option value="">Select Manager</option>
                    {(users || []).filter(u => u.role_name === 'manager').map(u => <option key={u.user_id || u.id} value={u.user_id || u.id}>{u.user_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="T">Active</option>
                    <option value="F">Inactive</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Hostel Photo</label>
                  {formData.photo_url && (
                    <img src={formData.photo_url} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                  )}
                  <input type="file" className="form-control" accept="image/*" onChange={handleFileUpload} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
