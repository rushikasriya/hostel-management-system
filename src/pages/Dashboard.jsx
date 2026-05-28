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

  const activeTenants = (tenants || []).filter(t => !t.isDeleted);
  const totalRevenue = activeTenants.reduce((sum, t) => sum + (Number(t.fee) || 0), 0);

  const revenueByBlock = {};
  activeTenants.forEach(tenant => {
    const bed = beds?.find(b => b.id === tenant.bed_id || b.bed_id === tenant.bed_id);
    if (!bed) return;
    const room = rooms?.find(r => r.id === bed.room_id || r.room_id === bed.room_id);
    if (!room) return;
    const floor = floors?.find(f => f.id === room.floor_id || f.floor_id === room.floor_id);
    if (!floor) return;
    const block = blocks?.find(b => b.id === floor.block_id || b.block_id === floor.block_id);
    if (!block) return;
    
    const blockName = block.block_name || 'Unknown';
    revenueByBlock[blockName] = (revenueByBlock[blockName] || 0) + (Number(tenant.fee) || 0);
  });

  const revenueData = Object.entries(revenueByBlock)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const revenueColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
  
  let currentPercentage = 0;
  const gradientStops = revenueData.map((item, index) => {
    const percentage = totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0;
    const stop = `${revenueColors[index % revenueColors.length]} ${currentPercentage}% ${currentPercentage + percentage}%`;
    currentPercentage += percentage;
    return stop;
  }).join(', ');

  const donutBackground = revenueData.length > 0 
    ? `conic-gradient(${gradientStops})` 
    : 'var(--surface-border)';


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

        {/* Revenue Overview */}
        <div className="card">
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: 600 }}>Monthly Revenue Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: donutBackground,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--surface-color)', borderRadius: '50%' }}></div>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Expected Revenue</div>
                <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '4px', color: 'var(--primary-color)' }}>
                  ₹ {totalRevenue.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '85px', overflowY: 'auto', paddingRight: '4px' }}>
                {revenueData.length === 0 ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No revenue data</div>
                ) : (
                  revenueData.map((item, index) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: revenueColors[index % revenueColors.length], flexShrink: 0 }}></span> 
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px', paddingLeft: '16px' }}>
                        ₹ {item.value.toLocaleString()} ({((item.value / totalRevenue) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
