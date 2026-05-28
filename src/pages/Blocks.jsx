import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, Edit, Trash2, X, ChevronDown } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

export const Blocks = () => {
  const { blocks, floors, rooms, beds, hostels, users, addRecord, updateRecord, softDeleteRecord, addToast } = useAppContext();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ block_name: '', hostel_id: '', manager_id: '', block_incharge_id: '', photo_url: '' });

  const hostelId = searchParams.get('hostel');
  const activeBlocks = (blocks || []).filter(b => !b.isDeleted);
  
  const filteredBlocks = activeBlocks.filter(b => {
    if (searchTerm && !b.block_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (hostelId && b.hostel_id !== Number(hostelId)) return false;
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
      updateRecord('blocks', { ...formData, id: editingId });
    } else {
      addRecord('blocks', formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ block_name: '', hostel_id: '', manager_id: '', block_incharge_id: '', photo_url: '' });
  };

  const handleEdit = (block) => {
    setFormData({
      block_name: block.block_name || '',
      hostel_id: block.hostel_id || '',
      manager_id: block.manager_id || '',
      block_incharge_id: block.block_incharge_id || '',
      photo_url: block.photo_url || ''
    });
    setEditingId(block.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this block?")) {
      softDeleteRecord('blocks', id);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ block_name: '', hostel_id: '', manager_id: '', block_incharge_id: '', photo_url: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="page-content" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Blocks</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Dashboard &gt; Hostels &gt; <span style={{ color: 'var(--primary-color)' }}>Blocks</span></div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ padding: '10px 20px', borderRadius: '8px' }}>
          <Plus size={18} /> Add Block
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Hierarchy Sidebar Flow */}
        <div className="card" style={{ width: '250px', padding: '16px', flexShrink: 0, position: 'sticky', top: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Hostels</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/blocks" style={{ fontSize: '13px', color: !hostelId ? 'var(--primary-color)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: !hostelId ? 600 : 500, paddingLeft: '22px' }}>
              All Hostels
            </Link>
            {(hostels || []).filter(h => !h.isDeleted).map(h => (
              <div key={h.id}>
                <Link to={`/blocks?hostel=${h.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: Number(hostelId) === h.id ? 'var(--primary-color)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: Number(hostelId) === h.id ? 600 : 500 }}>
                  <ChevronDown size={14} style={{ transform: Number(hostelId) === h.id ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                  {h.hostel_name}
                </Link>
                {Number(hostelId) === h.id && (
                  <div style={{ marginLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #94A3B8', paddingLeft: '12px' }}>
                    {(blocks || []).filter(b => b.hostel_id === h.id && !b.isDeleted).map(b => (
                      <Link key={b.id} to={`/floors?block_id=${b.id}`} style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        - {b.block_name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Toolbar */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-border)' }}>
            <div style={{ position: 'relative', width: '350px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search block..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 16px 10px 48px', borderRadius: '8px', border: '1px solid var(--surface-border)', outline: 'none', fontSize: '14px', background: '#F8FAFC' }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ background: '#F8FAFC', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px', borderBottom: '1px solid var(--surface-border)' }}>Block Name</th>
                  <th style={{ background: '#F8FAFC', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px', borderBottom: '1px solid var(--surface-border)', textAlign: 'center' }}>Total Floors</th>
                  <th style={{ background: '#F8FAFC', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px', borderBottom: '1px solid var(--surface-border)', textAlign: 'center' }}>Total Rooms</th>
                  <th style={{ background: '#F8FAFC', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px', borderBottom: '1px solid var(--surface-border)' }}>Occupancy</th>
                  <th style={{ background: '#F8FAFC', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px', borderBottom: '1px solid var(--surface-border)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">No blocks found</td>
                  </tr>
                ) : (
                  filteredBlocks.map(block => {
                    const blockFloors = (floors || []).filter(f => f.block_id === block.id && !f.isDeleted);
                    const blockRooms = (rooms || []).filter(r => blockFloors.some(f => f.id === r.floor_id) && !r.isDeleted);
                    const blockBeds = (beds || []).filter(b => blockRooms.some(r => r.id === b.room_id) && !b.isDeleted);
                    
                    const totalBeds = blockBeds.length;
                    const occupiedBeds = blockBeds.filter(b => b.status === 'Occupied').length;
                    const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
                    const pbColor = occupancyPercentage >= 80 ? '#10B981' : occupancyPercentage >= 50 ? '#F59E0B' : '#3B82F6';

                    return (
                      <tr key={block.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          <Link to={`/floors?block_id=${block.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={block.photo_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80'} alt="Block" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                            {block.block_name}
                          </Link>
                        </td>
                        <td style={{ textAlign: 'center' }}>{blockFloors.length}</td>
                        <td style={{ textAlign: 'center' }}>{blockRooms.length}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${occupancyPercentage}%`, background: pbColor, borderRadius: '4px' }}></div>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, width: '40px' }}>{occupancyPercentage}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="btn-icon" onClick={() => handleEdit(block)} style={{ padding: '6px', border: '1px solid var(--surface-border)' }}>
                              <Edit size={16} />
                            </button>
                            <button className="btn-icon" onClick={() => handleDelete(block.id)} style={{ padding: '6px', border: '1px solid var(--surface-border)', color: 'var(--danger-color)' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">{editingId ? 'Edit Block' : 'Add Block'}</h3>
                <button type="button" className="btn-icon" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body form-grid">
                <div className="form-group">
                  <label className="form-label">Block Name</label>
                  <input type="text" className="form-control" required value={formData.block_name} onChange={(e) => setFormData({...formData, block_name: e.target.value})} placeholder="Enter block name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Hostel</label>
                  <select className="form-control" required value={formData.hostel_id} onChange={(e) => setFormData({...formData, hostel_id: e.target.value})}>
                    <option value="">Select Hostel</option>
                    {(hostels || []).map(h => <option key={h.id} value={h.id}>{h.hostel_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Manager</label>
                  <select className="form-control" required value={formData.manager_id} onChange={(e) => setFormData({...formData, manager_id: e.target.value})}>
                    <option value="">Select Manager</option>
                    {(users || []).filter(u => u.role_name === 'manager').map(u => <option key={u.user_id} value={u.user_id}>{u.user_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Block Incharge</label>
                  <select className="form-control" required value={formData.block_incharge_id} onChange={(e) => setFormData({...formData, block_incharge_id: e.target.value})}>
                    <option value="">Select Incharge</option>
                    {(users || []).filter(u => u.role_name === 'blockIncharge').map(u => <option key={u.user_id} value={u.user_id}>{u.user_name}</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Block Photo</label>
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
