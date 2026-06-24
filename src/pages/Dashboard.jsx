import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Home, DoorOpen, BedDouble, UserCheck, LayoutDashboard, CreditCard, ChevronRight } from 'lucide-react';

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
    { label: 'Total Hostels', value: getActiveCount(hostels), icon: <Home size={24} />, color: '#4361EE', bg: '#EFF4FF' },
    { label: 'Total Blocks', value: getActiveCount(blocks), icon: <LayoutDashboard size={24} />, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Total Rooms', value: getActiveCount(rooms), icon: <DoorOpen size={24} />, color: '#4361EE', bg: '#EFF4FF' },
    { label: 'Total Beds', value: totalBedsCount, icon: <BedDouble size={24} />, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Occupied Beds', value: occupiedBedsCount, icon: <Users size={24} />, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Vacant Beds', value: vacantBedsCount, icon: <BedDouble size={24} />, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Active Tenants', value: getActiveCount(tenants), icon: <UserCheck size={24} />, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Pending Payments', value: '₹0', icon: <CreditCard size={24} />, color: '#EF4444', bg: '#FEF2F2' },
  ];

  return (
    <div className="page-content" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* Welcome Banner */}
      <div className="card" style={{ 
        padding: '32px 40px', 
        marginBottom: '32px', 
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #1E3A8A 100%)', 
        color: 'white', 
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: 'white' }}>Welcome back, {sessionStorage.getItem('userName') || 'Admin'}! 👋</h1>
          <p style={{ fontSize: '15px', opacity: 0.9, margin: 0, fontWeight: 500 }}>Here's an overview of your hostel operations today.</p>
        </div>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.15)', 
          padding: '12px 24px', 
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Date</div>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="card stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '12px', 
                backgroundColor: stat.bg, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</p>
                <h3 style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '6px' }}>{stat.label}</h3>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#CBD5E1', position: 'absolute', top: '16px', right: '16px' }} />
          </div>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Occupancy Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '32px', fontSize: '16px', fontWeight: 600 }}>Occupancy Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flex: 1 }}>
            <div style={{
              width: '160px', height: '160px', borderRadius: '50%',
              background: `conic-gradient(var(--primary-color) 0% ${occupiedPercentage}%, #E2E8F0 ${occupiedPercentage}% 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{ width: '120px', height: '120px', background: 'var(--surface-color)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 700 }}>{Math.round(occupiedPercentage)}%</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Occupied</span>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-color)' }}></span> Occupied ({occupiedBedsCount})
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E2E8F0' }}></span> Vacant ({vacantBedsCount})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Occupancy Trend */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: 600 }}>Occupancy Trend (This Month)</h3>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', paddingLeft: '40px', paddingBottom: '24px' }}>
            {/* Y-axis labels */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'var(--text-sidebar)', fontSize: '12px' }}>
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            
            {/* Horizontal lines */}
            <div style={{ position: 'absolute', left: '40px', right: 0, top: '6px', bottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ borderBottom: '1px dashed var(--surface-border)', width: '100%' }}></div>
              <div style={{ borderBottom: '1px dashed var(--surface-border)', width: '100%' }}></div>
              <div style={{ borderBottom: '1px dashed var(--surface-border)', width: '100%' }}></div>
              <div style={{ borderBottom: '1px dashed var(--surface-border)', width: '100%' }}></div>
              <div style={{ borderBottom: '1px solid var(--surface-border)', width: '100%' }}></div>
            </div>

            {/* Mock Line Chart SVG */}
            <svg width="100%" height="100%" style={{ position: 'absolute', left: '40px', right: 0, top: '6px', bottom: '24px', zIndex: 1 }} preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 0 50 Q 10 40 20 50 T 40 40 T 60 60 T 80 40 T 100 50" fill="none" stroke="var(--primary-color)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              <path d="M 0 50 Q 10 40 20 50 T 40 40 T 60 60 T 80 40 T 100 50 L 100 100 L 0 100 Z" fill="rgba(67, 97, 238, 0.1)" stroke="none" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* X-axis labels */}
            <div style={{ position: 'absolute', left: '40px', right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', color: 'var(--text-sidebar)', fontSize: '12px' }}>
              <span>1 May</span>
              <span>8 May</span>
              <span>15 May</span>
              <span>22 May</span>
              <span>29 May</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
