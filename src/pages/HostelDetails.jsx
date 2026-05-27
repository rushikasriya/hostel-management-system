import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, MapPin, Layers, DoorOpen, BedDouble, Phone, User, ArrowLeft, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const HostelDetails = () => {
  const { id } = useParams();
  const hostelId = parseInt(id, 10);
  const { hostels, blocks, floors, rooms, beds, tenants, users } = useAppContext();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserName = (userId) => {
    if (!userId) return '-';
    const user = users?.find(u => u.id === userId || u.user_id === userId);
    return user ? user.user_name : `ID: ${userId}`;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const hostelId = parseInt(id, 10);
        const response = await fetch(`/getFullHostelDetails_1_0/${hostelId}`);
        
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch hostel details. Status: ${response.status} ${response.statusText}. Response: ${text}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [hostelId]);

  if (loading) {
    return <div className="page-content"><div className="empty-state">Loading hostel details...</div></div>;
  }

  if (error) {
    return <div className="page-content"><div className="empty-state" style={{color: 'var(--danger-color)'}}>Error: {error}</div></div>;
  }

  if (!data) return null;

  const hostelBlocks = blocks.filter(b => b.hostel_id === hostelId);

  return (
    <div className="page-content">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/hostels" className="btn-icon">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Building size={28} className="text-primary" />
              {data.hostelName}
            </h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <MapPin size={16} /> Location Code: {data.hostelLocation}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card glass stat-card">
          <div className="stat-icon"><Layers size={28} /></div>
          <div className="stat-content">
            <h3>Total Blocks</h3>
            <p>{data.blockDetails?.length || 0}</p>
          </div>
        </div>
        <div className="card glass stat-card">
          <div className="stat-icon"><Layers size={28} /></div>
          <div className="stat-content">
            <h3>Total Floors</h3>
            <p>{data.floorDetails?.length || 0}</p>
          </div>
        </div>
        <div className="card glass stat-card">
          <div className="stat-icon"><DoorOpen size={28} /></div>
          <div className="stat-content">
            <h3>Total Rooms</h3>
            <p>{data.roomDetails?.length || 0}</p>
          </div>
        </div>
        <div className="card glass stat-card">
          <div className="stat-icon"><BedDouble size={28} /></div>
          <div className="stat-content">
            <h3>Total Beds</h3>
            <p>{data.bedDetails?.length || 0}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
        {hostelBlocks.length === 0 ? (
          <div className="card glass"><div className="empty-state">No blocks found for this hostel.</div></div>
        ) : (
          hostelBlocks.map(block => {
            const blockFloors = floors.filter(f => f.block_id === block.id);
            return (
              <div key={block.id} className="card glass" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={24} className="text-primary" /> {block.block_name}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                    Manager: {getUserName(block.manager_id)} | Incharge: {getUserName(block.block_incharge_id)}
                  </p>
                </div>
                
                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                  {blockFloors.length === 0 ? (
                    <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>No floors configured for this block.</div>
                  ) : (
                    blockFloors.map(floor => {
                      const floorRooms = rooms.filter(r => r.floor_id === floor.id);
                      return (
                        <div key={floor.id} className="nested-card" style={{ 
                          background: 'var(--surface-color)', 
                          padding: '20px', 
                          borderRadius: '16px',
                          border: '1px solid var(--surface-border)',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '18px', margin: 0 }}>
                                <Layers size={20} className="text-primary" style={{ color: 'var(--primary-color)' }} /> {floor.floor_name}
                              </h4>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={14} /> Incharge: {getUserName(floor.incharge_id)}
                              </p>
                            </div>
                            <div style={{ 
                              background: 'rgba(59, 130, 246, 0.1)', 
                              color: 'var(--primary-color)',
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              {floorRooms.length} Rooms
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', flex: 1 }}>
                            <h5 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <DoorOpen size={14} /> Room Directory
                            </h5>
                            {floorRooms.length === 0 ? (
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No rooms found.</p>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {floorRooms.map(room => {
                                  const roomBedsCount = beds.filter(b => b.room_id === room.id).length;
                                  return (
                                    <div key={room.id} style={{ 
                                      background: '#ffffff', 
                                      border: '1px solid #e2e8f0',
                                      padding: '6px 12px', 
                                      borderRadius: '8px', 
                                      fontSize: '14px',
                                      color: 'var(--text-primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      cursor: 'default',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                    }}>
                                      <span style={{ fontWeight: 600 }}>{room.room_no}</span>
                                      {roomBedsCount > 0 && (
                                        <span style={{ 
                                          fontSize: '11px', 
                                          background: 'rgba(59, 130, 246, 0.1)', 
                                          padding: '2px 6px', 
                                          borderRadius: '4px',
                                          color: 'var(--primary-color)',
                                          fontWeight: 600
                                        }}>
                                          {roomBedsCount} <BedDouble size={10} style={{ display: 'inline', verticalAlign: 'middle', marginTop: '-2px' }}/>
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="dashboard-grid" style={{ marginTop: '24px' }}>
                  {/* BEDS & TENANTS */}
                  <div className="nested-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', gridColumn: '1 / -1' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                      <Users size={18} /> Beds & Tenants
                    </h4>
                    <div className="table-container">
                      <table style={{ background: 'transparent' }}>
                        <thead>
                          <tr>
                            <th>Room</th>
                            <th>Bed No</th>
                            <th>Status</th>
                            <th>Tenant Name</th>
                            <th>Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blockFloors.flatMap(floor => 
                            rooms.filter(r => r.floor_id === floor.id).flatMap(room => 
                              beds.filter(b => b.room_id === room.id).map(bed => {
                                const tenant = tenants.find(t => t.bed_id === bed.id);
                                return (
                                  <tr key={bed.id} style={{ background: 'rgba(0,0,0,0.1)' }}>
                                    <td>{room.room_no}</td>
                                    <td style={{ fontWeight: 600 }}>{bed.bed_no}</td>
                                    <td>
                                      <span className={`badge ${bed.status === 'Occupied' ? 'badge-active' : 'badge-inactive'}`}>
                                        {bed.status}
                                      </span>
                                    </td>
                                    <td>{tenant ? tenant.tenant_name : '-'}</td>
                                    <td>{tenant ? tenant.phone : '-'}</td>
                                  </tr>
                                );
                              })
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
