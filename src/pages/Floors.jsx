import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, X, ChevronDown, LayoutGrid, BedDouble, Users, Edit, Trash2 } from 'lucide-react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

export const Floors = () => {
  const { floors, rooms, beds, blocks, hostels, users, addRecord, updateRecord, softDeleteRecord, addToast } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ floor_name: '', block_id: '', incharge_id: '', photo_url: '' });
  
  const blockId = searchParams.get('block_id');
  const activeFloors = (floors || []).filter(f => !f.isDeleted);
  
  const filteredFloors = activeFloors.filter(f => {
    if (searchTerm && !f.floor_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (blockId && f.block_id !== Number(blockId)) return false;
    return true;
  });

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
      updateRecord('floors', { ...formData, id: editingId });
    } else {
      addRecord('floors', formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ floor_name: '', block_id: '', incharge_id: '', photo_url: '' });
  };

  const handleEdit = (e, floor) => {
    e.stopPropagation();
    setFormData({
      floor_name: floor.floor_name || '',
      block_id: floor.block_id || '',
      incharge_id: floor.incharge_id || '',
      photo_url: floor.photo_url || ''
    });
    setEditingId(floor.id);
    setIsModalOpen(true);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this floor?")) {
      softDeleteRecord('floors', id);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ floor_name: '', block_id: '', incharge_id: '', photo_url: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="page-content" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Floors</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Dashboard &gt; <span style={{ color: 'var(--primary-color)' }}>Floors</span></div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ padding: '10px 20px', borderRadius: '8px' }}>
          <Plus size={18} /> Add Floor
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Hierarchy Sidebar Flow */}
        <div className="card" style={{ width: '250px', padding: '16px', flexShrink: 0, position: 'sticky', top: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Hostels &amp; Blocks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/floors" style={{ fontSize: '13px', color: !blockId ? 'var(--primary-color)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: !blockId ? 600 : 500, paddingLeft: '22px' }}>
              All Floors
            </Link>
            {(hostels || []).filter(h => !h.isDeleted).map(h => {
              const hostelBlocks = (blocks || []).filter(b => b.hostel_id === h.id && !b.isDeleted);
              const isHostelExpanded = hostelBlocks.some(b => b.id === Number(blockId)) || !blockId;
              
              return (
                <div key={h.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <ChevronDown size={14} style={{ transform: isHostelExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                    {h.hostel_name}
                  </div>
                  {isHostelExpanded && (
                    <div style={{ marginLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #94A3B8', paddingLeft: '12px' }}>
                      {hostelBlocks.map(b => {
                        const isBlockExpanded = Number(blockId) === b.id;
                        const blockFloors = (floors || []).filter(f => f.block_id === b.id && !f.isDeleted);
                        return (
                          <div key={b.id}>
                            <Link to={`/floors?block_id=${b.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: isBlockExpanded ? 'var(--primary-color)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: isBlockExpanded ? 600 : 500 }}>
                              <ChevronDown size={14} style={{ transform: isBlockExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', opacity: blockFloors.length ? 1 : 0 }} />
                              {b.block_name}
                            </Link>
                            {isBlockExpanded && blockFloors.length > 0 && (
                              <div style={{ marginLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #94A3B8', paddingLeft: '12px' }}>
                                {blockFloors.map(f => (
                                  <Link key={f.id} to={`/rooms?floor_id=${f.id}`} style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                    {f.floor_name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', marginBottom: '32px' }}>
            <div style={{ position: 'relative', width: '350px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search floor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid var(--surface-border)', outline: 'none', fontSize: '14px', background: 'var(--surface-color)' }}
              />
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredFloors.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No floors found</div>
            ) : (
              filteredFloors.map(floor => {
                const floorRooms = (rooms || []).filter(r => r.floor_id === floor.id && !r.isDeleted);
                const floorBeds = (beds || []).filter(b => floorRooms.some(r => r.id === b.room_id) && !b.isDeleted);
                
                const totalRooms = floorRooms.length;
                const totalBeds = floorBeds.length;
                const occupiedBeds = floorBeds.filter(b => b.status === 'Occupied').length;
                
                const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
                const circleColor = occupancyPercentage >= 80 ? '#10B981' : occupancyPercentage >= 50 ? '#F59E0B' : '#EF4444';

                return (
                  <div 
                    key={floor.id} 
                    onClick={() => navigate(`/rooms?floor_id=${floor.id}`)}
                    className="card" 
                    style={{ 
                      padding: '24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                  >
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <img src={floor.photo_url || 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=200&q=80'} alt="Floor" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '12px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{floor.floor_name}</h3>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-icon" onClick={(e) => handleEdit(e, floor)} style={{ padding: '4px' }}><Edit size={14} /></button>
                            <button className="btn-icon" onClick={(e) => handleDelete(e, floor.id)} style={{ padding: '4px', color: 'var(--danger-color)' }}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', width: '130px', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutGrid size={14} /> Rooms</span> 
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalRooms}</span>
                        </div>
                        <div style={{ display: 'flex', width: '130px', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BedDouble size={14} /> Beds</span> 
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalBeds}</span>
                        </div>
                        <div style={{ display: 'flex', width: '130px', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> Occupied</span> 
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{occupiedBeds}</span>
                        </div>
                      </div>
                    </div>
                    </div>

                    <div style={{ 
                      width: '90px', 
                      height: '90px', 
                      borderRadius: '50%', 
                      background: `conic-gradient(${circleColor} 0% ${occupancyPercentage}%, #E2E8F0 ${occupancyPercentage}% 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{ 
                        width: '74px', 
                        height: '74px', 
                        background: 'var(--surface-color)', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: circleColor
                      }}>
                        {occupancyPercentage}%
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">{editingId ? 'Edit Floor' : 'Add Floor'}</h3>
                <button type="button" className="btn-icon" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body form-grid">
                <div className="form-group">
                  <label className="form-label">Floor Name</label>
                  <input type="text" className="form-control" required value={formData.floor_name} onChange={(e) => setFormData({...formData, floor_name: e.target.value})} placeholder="Enter floor name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Block</label>
                  <select className="form-control" required value={formData.block_id} onChange={(e) => setFormData({...formData, block_id: e.target.value})}>
                    <option value="">Select Block</option>
                    {(blocks || []).map(b => <option key={b.id} value={b.id}>{b.block_name}</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Floor Incharge</label>
                  <select className="form-control" required value={formData.incharge_id} onChange={(e) => setFormData({...formData, incharge_id: e.target.value})}>
                    <option value="">Select Incharge</option>
                    {(users || [])
                      .filter(u => u.role_name === 'floorIncharge')
                      .filter(u => {
                        if (!formData.block_id) return true;
                        const block = blocks?.find(b => b.id === Number(formData.block_id));
                        if (!block || !block.block_incharge_id) return true;
                        return u.manager_id === block.block_incharge_id;
                      })
                      .map(u => <option key={u.user_id || u.id} value={u.user_id || u.id}>{u.user_name}</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Floor Photo</label>
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
