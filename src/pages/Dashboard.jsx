import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Home, DoorOpen, BedDouble, UserCheck } from 'lucide-react';

export const Dashboard = () => {
  const { users, hostels, rooms, beds, tenants } = useAppContext();

  const getActiveCount = (arr) => arr.filter(item => !item.isDeleted).length;

  const stats = [
    { label: 'Total Hostels', value: getActiveCount(hostels), icon: <Home size={28} /> },
    { label: 'Total Rooms', value: getActiveCount(rooms), icon: <DoorOpen size={28} /> },
    { label: 'Total Beds', value: getActiveCount(beds), icon: <BedDouble size={28} /> },
    { label: 'Active Tenants', value: getActiveCount(tenants), icon: <UserCheck size={28} /> },
    { label: 'System Users', value: getActiveCount(users), icon: <Users size={28} /> },
  ];

  return (
    <div className="page-content">
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'conic-gradient(#10b981 0% 71%, #ef4444 71% 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '50%' }}></div>
            </div>
            <div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Occupied Beds
                </div>
                <div style={{ fontWeight: 600, marginTop: '4px' }}>86 (71.7%)</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Vacant Beds
                </div>
                <div style={{ fontWeight: 600, marginTop: '4px' }}>34 (28.3%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Block Wise Occupancy</h3>
            <select className="form-control" style={{ width: 'auto', padding: '4px 12px' }}>
              <option>All Blocks</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--surface-border)' }}>
            {/* Using colors for each bar as requested */}
            {[
              { label: 'Block A', val: 75, color: '#3b82f6' },
              { label: 'Block B', val: 60, color: '#8b5cf6' },
              { label: 'Block C', val: 90, color: '#10b981' },
              { label: 'Block D', val: 40, color: '#f59e0b' },
              { label: 'Block E', val: 85, color: '#ec4899' },
              { label: 'Block F', val: 55, color: '#06b6d4' },
              { label: 'Block G', val: 70, color: '#3b82f6' }
            ].map(block => (
              <div key={block.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: `${block.val}%`, background: block.color, borderRadius: '4px 4px 0 0', transition: 'all 0.3s' }}></div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{block.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Collection */}
        <div className="card">
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: 600 }}>Fee Collection Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
