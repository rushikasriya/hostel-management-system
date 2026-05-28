import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, ChevronDown, CheckCircle2, XCircle, AlertTriangle, X, Edit, Trash2 } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

export const Rooms = () => {
  const { rooms, beds, floors, blocks, hostels, tenants, addRecord, updateRecord, softDeleteRecord, addToast } = useAppContext();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeTab, setActiveTab] = useState('Beds');
  const [roomHistory, setRoomHistory] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ room_no: '', floor_id: '', photo_url: '' });
  
  // Example query param handling for hierarchical filtering
  const floorId = searchParams.get('floor_id');

  const activeRooms = (rooms || []).filter(r => !r.isDeleted);
  
  const filteredRooms = activeRooms.filter(r => {
    // Basic text search
    if (searchTerm && !r.room_no.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    // Floor filter
    if (floorId && r.floor_id !== Number(floorId)) return false;
    return true;
  });

  // Calculate status per room based on beds
  const roomsWithStatus = filteredRooms.map(room => {
    const roomBeds = (beds || []).filter(b => b.room_id === room.id && !b.isDeleted);
    const totalBeds = roomBeds.length;
    const occupied = roomBeds.filter(b => b.status === 'Occupied').length;
    
    let status = 'Available';
    let color = '#10B981'; // Green
    let bg = '#ECFDF5';
    let border = '#A7F3D0';
    let icon = <CheckCircle2 size={14} color="#10B981" />;
    
    if (totalBeds > 0 && occupied === totalBeds) {
      status = 'Full';
      color = '#EF4444'; // Red
      bg = '#FEF2F2';
      border = '#FECACA';
      icon = <XCircle size={14} color="#EF4444" />;
    } else if (totalBeds === 0) {
      // Just for UI variety, let's pretend some are maintenance if they have no beds
      status = 'Maintenance';
      color = '#F59E0B'; // Orange
      bg = '#FFFBEB';
      border = '#FDE68A';
      icon = <AlertTriangle size={14} color="#F59E0B" />;
    }

    return { ...room, status, color, bg, border, icon, occupied, totalBeds };
  });

  // Apply Status Filter
  const finalRooms = roomsWithStatus.filter(r => statusFilter === 'All' || r.status === statusFilter);

  useEffect(() => {
    if (activeRoomId && activeTab === 'History') {
      const fetchHistory = async () => {
        try {
          const roomBeds = (beds || []).filter(b => b.room_id === activeRoomId && !b.isDeleted);
          const promises = roomBeds.map(b => fetch(`/getBedHistory/${b.id}`).then(res => res.json()));
          const results = await Promise.all(promises);
          
          const merged = results.flatMap((arr, i) => 
            (arr || []).map(h => ({ ...h, bed_no: roomBeds[i].bed_no }))
          ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          setRoomHistory(merged);
        } catch (err) {
          console.error('Failed to fetch history', err);
        }
      };
      fetchHistory();
    }
  }, [activeRoomId, activeTab, beds]);

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
      updateRecord('rooms', { ...formData, id: editingId });
    } else {
      addRecord('rooms', formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ room_no: '', floor_id: '', photo_url: '' });
  };

  const handleEdit = () => {
    const room = (rooms || []).find(r => r.id === activeRoomId);
    if (!room) return;
    setFormData({
      room_no: room.room_no || '',
      floor_id: room.floor_id || '',
      photo_url: room.photo_url || ''
    });
    setEditingId(room.id);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      softDeleteRecord('rooms', activeRoomId);
      setActiveRoomId(null);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ room_no: '', floor_id: '', photo_url: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="page-content" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Rooms</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Dashboard &gt; <span style={{ color: 'var(--primary-color)' }}>Rooms</span></div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ padding: '10px 20px', borderRadius: '8px' }}>
          <Plus size={18} /> Add Room
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '200px' }}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--surface-border)', outline: 'none', fontSize: '14px', appearance: 'none', background: 'white' }}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
        </div>

        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search room..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid var(--surface-border)', outline: 'none', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Main Container */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></span> Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></span> Full
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></span> Maintenance
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {finalRooms.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No rooms found</div>
            ) : (
              finalRooms.map(room => (
                <div 
                  key={room.id} 
                  style={{ 
                    background: room.bg, 
                    border: `1px solid ${room.border}`, 
                    borderRadius: '12px', 
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    position: 'relative'
                  }}
                  onClick={() => setActiveRoomId(room.id)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img src={room.photo_url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&q=80'} alt="Room" style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {room.room_no}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: room.color, fontSize: '13px', fontWeight: 600 }}>
                    {room.icon} {room.status}
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Beds: {room.occupied}/{room.totalBeds} Occupied
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Side Panel for Room Details */}
        {activeRoomId && (
          <div className="card" style={{ width: '400px', flexShrink: 0, padding: '24px', position: 'sticky', top: '24px', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Room {(rooms || []).find(r => r.id === activeRoomId)?.room_no || ''} Details
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={handleEdit} style={{ padding: '4px' }}>
                  <Edit size={16} />
                </button>
                <button className="btn-icon" onClick={handleDelete} style={{ padding: '4px', color: 'var(--danger-color)' }}>
                  <Trash2 size={16} />
                </button>
                <button className="btn-icon" onClick={() => setActiveRoomId(null)} style={{ padding: '4px' }}>
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)', marginBottom: '24px' }}>
              <div onClick={() => setActiveTab('Beds')} style={{ padding: '8px 16px', borderBottom: activeTab === 'Beds' ? '2px solid var(--primary-color)' : 'none', color: activeTab === 'Beds' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: activeTab === 'Beds' ? 600 : 500, fontSize: '13px', cursor: 'pointer' }}>Beds</div>
              <div onClick={() => setActiveTab('Tenants')} style={{ padding: '8px 16px', borderBottom: activeTab === 'Tenants' ? '2px solid var(--primary-color)' : 'none', color: activeTab === 'Tenants' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: activeTab === 'Tenants' ? 600 : 500, fontSize: '13px', cursor: 'pointer' }}>Tenants</div>
              <div onClick={() => setActiveTab('History')} style={{ padding: '8px 16px', borderBottom: activeTab === 'History' ? '2px solid var(--primary-color)' : 'none', color: activeTab === 'History' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: activeTab === 'History' ? 600 : 500, fontSize: '13px', cursor: 'pointer' }}>History</div>
            </div>

            {activeTab === 'Beds' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Beds in Room {(rooms || []).find(r => r.id === activeRoomId)?.room_no || ''}
                  </div>
                  <Link to={`/beds?room_id=${activeRoomId}`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', textDecoration: 'none' }}>
                    <Plus size={14} /> Add Bed
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(beds || []).filter(b => b.room_id === activeRoomId && !b.isDeleted).map(bed => {
                    const tenant = (tenants || []).find(t => t.bed_id === bed.id && !t.isDeleted);
                    return (
                      <div key={bed.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--surface-border)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', width: '60px' }}>{bed.bed_no}</div>
                          <div className={`badge ${bed.status === 'Occupied' ? 'badge-inactive' : 'badge-active'}`} style={{ background: bed.status === 'Occupied' ? '#FEF2F2' : '#ECFDF5', color: bed.status === 'Occupied' ? '#EF4444' : '#10B981' }}>
                            {bed.status}
                          </div>
                        </div>
                        {tenant ? (
                          <div style={{ textAlign: 'right', fontSize: '12px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tenant.tenant_name}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>{tenant.phone || '--'}</div>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)' }}>--</div>
                        )}
                      </div>
                    );
                  })}
                  {(beds || []).filter(b => b.room_id === activeRoomId && !b.isDeleted).length === 0 && (
                    <div className="empty-state" style={{ padding: '24px' }}>No beds in this room</div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'Tenants' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(tenants || []).filter(t => !t.isDeleted && (beds || []).find(b => b.id === t.bed_id && b.room_id === activeRoomId)).length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px' }}>No tenants in this room</div>
                ) : (
                  (tenants || []).filter(t => !t.isDeleted && (beds || []).find(b => b.id === t.bed_id && b.room_id === activeRoomId)).map(tenant => {
                    const bed = (beds || []).find(b => b.id === tenant.bed_id);
                    return (
                      <div key={tenant.id} style={{ padding: '12px', border: '1px solid var(--surface-border)', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img 
                          src={tenant.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tenant.tenant_name || 'Tenant')}&background=random`} 
                          alt="Profile" 
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--surface-border)' }} 
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{tenant.tenant_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tenant.phone || tenant.emergency_phone}</div>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary-color)' }}>
                          {bed ? bed.bed_no : '--'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'History' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {roomHistory.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px' }}>No history available</div>
                ) : (
                  roomHistory.map(item => (
                    <div key={item.id} style={{ padding: '12px', border: '1px solid var(--surface-border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{item.action}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(item.created_at).toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 600 }}>{item.bed_no}</span>
                        {item.tenant_name && <span> • {item.tenant_name}</span>}
                      </div>
                      {item.notes && <div style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{item.notes}"</div>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">{editingId ? 'Edit Room' : 'Add Room'}</h3>
                <button type="button" className="btn-icon" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body form-grid">
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input type="text" className="form-control" required value={formData.room_no} onChange={(e) => setFormData({...formData, room_no: e.target.value})} placeholder="Enter room number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Floor</label>
                  <select className="form-control" required value={formData.floor_id} onChange={(e) => setFormData({...formData, floor_id: e.target.value})}>
                    <option value="">Select Floor</option>
                    {(floors || []).map(f => <option key={f.id} value={f.id}>{f.floor_name}</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Room Photo</label>
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
