import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Home, DoorOpen, BedDouble, UserCheck } from 'lucide-react';

export const Dashboard = () => {
  const { users, hostels, blocks, floors, rooms, beds, tenants } = useAppContext();

  const getActiveCount = (arr) => (arr || []).filter(item => !item.isDeleted).length;

  const totalBedsCount = getActiveCount(beds);
  const occupiedBedsCount = (beds || []).filter(b => b.status === 'Occupied' && !b.isDeleted).length;
  const vacantBedsCount = totalBedsCount - occupiedBedsCount;
  const occupiedPercentage = totalBedsCount > 0 ? ((occupiedBedsCount / totalBedsCount) * 100).toFixed(1) : 0;
  const vacantPercentage = totalBedsCount > 0 ? ((vacantBedsCount / totalBedsCount) * 100).toFixed(1) : 0;

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444'];
  const blockWiseOccupancy = (blocks || []).filter(b => !b.isDeleted).map((block, index) => {
    const blockId = block.id || block.block_id;
    const blockFloors = (floors || []).filter(f => f.block_id === blockId && !f.isDeleted);
    const blockRooms = (rooms || []).filter(r => blockFloors.some(f => (f.id || f.floor_id) === r.floor_id) && !r.isDeleted);
    const blockBeds = (beds || []).filter(b => blockRooms.some(r => (r.id || r.room_id) === b.room_id) && !b.isDeleted);
    
    const tBeds = blockBeds.length;
    const occBeds = blockBeds.filter(b => b.status === 'Occupied').length;
    const val = tBeds > 0 ? Math.round((occBeds / tBeds) * 100) : 0;
    
    // Only show up to 7 characters for label to fit in UI
    let displayLabel = block.block_name || '';
    if (displayLabel.length > 10) displayLabel = displayLabel.substring(0, 10) + '..';

    return {
      label: displayLabel,
      val: val,
      color: colors[index % colors.length],
      tooltip: `${occBeds}/${tBeds} Occupied`
    };
  });

  const stats = [
    { label: 'Total Hostels', value: getActiveCount(hostels), icon: <Home size={28} /> },
    { label: 'Total Rooms', value: getActiveCount(rooms), icon: <DoorOpen size={28} /> },
    { label: 'Total Beds', value: getActiveCount(beds), icon: <BedDouble size={28} /> },
    { label: 'Active Tenants', value: getActiveCount(tenants), icon: <UserCheck size={28} /> },
    { label: 'System Users', value: getActiveCount(users), icon: <Users size={28} /> },
  ];

  return (
    <div className="page-content" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* Welcome Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', 
        borderRadius: '16px', 
        padding: '32px', 
        color: 'white',
        marginBottom: '32px',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-10%', top: '-50%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', position: 'relative' }}>Welcome back, {localStorage.getItem('userName') || 'Admin'}! 👋</h2>
        <p style={{ opacity: 0.9, fontSize: '15px', maxWidth: '600px', position: 'relative' }}>Here is what's happening with your hostels today. You have {occupiedBedsCount} beds currently occupied across {getActiveCount(blocks)} active blocks.</p>
      </div>

      <div className="dashboard-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="card glass stat-card">
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.label}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Occupancy Donut */}
        <div className="card">
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: 600 }}>Occupancy Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: `conic-gradient(#10b981 0% ${occupiedPercentage}%, #ef4444 ${occupiedPercentage}% 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--surface-color)', borderRadius: '50%' }}></div>
            </div>
            <div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Occupied Beds
                </div>
                <div style={{ fontWeight: 600, marginTop: '4px' }}>{occupiedBedsCount} ({occupiedPercentage}%)</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Vacant Beds
                </div>
                <div style={{ fontWeight: 600, marginTop: '4px' }}>{vacantBedsCount} ({vacantPercentage}%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card span-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Block Wise Occupancy</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--surface-border)', overflowX: 'auto' }}>
            {blockWiseOccupancy.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-secondary)' }}>No block data available</div>
            ) : (
              blockWiseOccupancy.map(block => (
                <div key={block.label} title={block.tooltip} style={{ flex: 1, minWidth: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'help' }}>
                  <div className="bar-chart-bar" style={{ width: '32px', height: `${Math.max(block.val, 2)}%`, background: block.color, borderRadius: '6px 6px 0 0' }}></div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', wordBreak: 'break-all', fontWeight: 500 }}>{block.label}<br/>({block.val}%)</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fee Collection */}
        <div className="card">
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: 600 }}>Fee Collection Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'conic-gradient(#10b981 0% 70%, #ef4444 70% 80%, #f59e0b 80% 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '50%' }}></div>
            </div>
            <div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Collected
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>₹ 8,75,000 (70%)</div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span> Pending
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>₹ 1,25,000 (10%)</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Upcoming
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>₹ 2,50,000 (20%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
