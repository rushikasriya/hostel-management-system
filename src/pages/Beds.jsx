import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, BedDouble, CheckCircle2, XCircle, X, Edit, Trash2, UserPlus } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

export const Beds = () => {
  const { beds, rooms, floors, blocks, hostels, tenants, addRecord, updateRecord, softDeleteRecord, addToast } = useAppContext();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ bed_no: '', room_id: '', photo_url: '' });

  const roomId = searchParams.get('room_id');
  const activeBeds = (beds || []).filter(b => !b.isDeleted);
  
  const filteredBeds = activeBeds.filter(b => {
    if (searchTerm && !b.bed_no.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (roomId && b.room_id !== Number(roomId)) return false;
    return true;
  });

  const getRoomName = (id) => rooms?.find(r => r.id === id)?.room_no || 'Unknown Room';

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
    if (editingId) {
      updateRecord('beds', { ...formData, id: editingId });
    } else {
      addRecord('beds', formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ bed_no: '', room_id: '', photo_url: '' });
  };

  const handleEdit = (bed) => {
    setFormData({
      bed_no: bed.bed_no || '',
      room_id: bed.room_id || '',
      photo_url: bed.photo_url || ''
    });
    setEditingId(bed.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this bed?")) {
      softDeleteRecord('beds', id);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ bed_no: '', room_id: '', photo_url: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="page-content" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {roomId ? `Room ${getRoomName(Number(roomId))} - Beds` : 'Beds'}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Dashboard &gt; Rooms &gt; <span style={{ color: 'var(--primary-color)' }}>Beds</span></div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ padding: '10px 20px', borderRadius: '8px' }}>
          <Plus size={18} /> Add Bed
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search bed..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid var(--surface-border)', outline: 'none', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filteredBeds.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No beds found</div>
        ) : (
          filteredBeds.map(bed => {
            const isOccupied = bed.status === 'Occupied';
            const occupant = isOccupied ? tenants?.find(t => t.bed_id === bed.id && !t.isDeleted) : null;
            
            return (
              <div 
                key={bed.id} 
                className="card" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '24px',
                  border: isOccupied ? '1px solid #E2E8F0' : '1px dashed #CBD5E1',
                  background: isOccupied ? 'white' : '#F8FAFC'
                }}
              >
                <img 
                  src={bed.photo_url || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&q=80'} 
                  alt="Bed" 
                  style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} 
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Bed {bed.bed_no}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isOccupied ? (
                        <span className="badge badge-inactive" style={{ color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px' }}>
                          Occupied
                        </span>
                      ) : (
                        <span className="badge badge-active" style={{ color: '#10B981', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px' }}>
                          Vacant
                        </span>
                      )}
                      <button className="btn-icon" onClick={() => handleEdit(bed)} style={{ padding: '4px' }}><Edit size={14} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(bed.id)} style={{ padding: '4px', color: 'var(--danger-color)' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  
                  <div style={{ minHeight: '40px' }}>
                    {isOccupied && occupant ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={occupant.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(occupant.tenant_name || 'Tenant')}&background=random`} 
                          alt="Tenant" 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--surface-border)' }} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{occupant.tenant_name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{occupant.phone || occupant.emergency_phone || 'No phone'}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>Available for booking</span>
                        <Link 
                          to={`/tenants?action=add&bed_id=${bed.id}`}
                          className="btn btn-primary" 
                          style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '4px', height: 'auto', display: 'inline-flex' }}
                        >
                          <UserPlus size={14} style={{ marginRight: '6px' }} /> Add Tenant
                        </Link>
                      </div>
                    )}
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
                <h3 className="modal-title">{editingId ? 'Edit Bed' : 'Add Bed'}</h3>
                <button type="button" className="btn-icon" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body form-grid">
                <div className="form-group">
                  <label className="form-label">Bed Number</label>
                  <input type="text" className="form-control" required value={formData.bed_no} onChange={(e) => setFormData({...formData, bed_no: e.target.value})} placeholder="Enter bed number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Room</label>
                  <select className="form-control" required value={formData.room_id} onChange={(e) => setFormData({...formData, room_id: e.target.value})}>
                    <option value="">Select Room</option>
                    {(rooms || []).map(r => <option key={r.id} value={r.id}>{r.room_no}</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Bed Photo</label>
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
