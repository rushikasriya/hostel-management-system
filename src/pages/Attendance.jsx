import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, X, Clock, Save, Calendar, Download, Eye, Minus } from 'lucide-react';

export const Attendance = () => {
  const { tenants, beds, rooms, floors, blocks, addToast, globalSearch } = useAppContext();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeline, setTimeline] = useState('Morning');
  const [localState, setLocalState] = useState({}); // { tenant_id: { status, notes } }
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewPhotoUrl, setViewPhotoUrl] = useState(null);

  const activeTenants = (tenants || []).filter(t => !t.isDeleted);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/getAttendance?target_date=${date}&timeline=${timeline}`)
      .then(res => res.json())
      .then(data => {
        const newState = {};
        data.forEach(item => {
          newState[item.tenant_id] = { status: item.status, notes: item.notes };
        });
        setLocalState(newState);
      })
      .catch(err => {
        console.error(err);
        addToast('Failed to load attendance data', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [date, timeline, addToast]);

  const handleStatusChange = (tenantId, status) => {
    setLocalState(prev => ({
      ...prev,
      [tenantId]: { ...prev[tenantId], status }
    }));
  };

  const handleMarkAll = (status) => {
    const newState = { ...localState };
    activeTenants.forEach(t => {
      newState[t.id] = { ...newState[t.id], status };
    });
    setLocalState(newState);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const recordsToSave = activeTenants
        .filter(t => localState[t.id]?.status)
        .map(t => ({
          tenant_id: t.id,
          attendance_date: date,
          status: localState[t.id].status,
          timeline: timeline,
          notes: localState[t.id].notes || ''
        }));

      if (recordsToSave.length === 0) {
        addToast('No attendance records to save.', 'info');
        setIsSaving(false);
        return;
      }

      // Save one by one (or could batch if backend supported it)
      await Promise.all(recordsToSave.map(record => 
        fetch('/addAttendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        }).then(res => {
          if (!res.ok) throw new Error('Failed');
        })
      ));
      
      addToast('Attendance saved successfully!', 'success');
    } catch(err) {
      addToast('Failed to save some attendance records', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getBedInfo = (bedId) => {
    if (!bedId) return 'Not assigned';
    const bed = beds?.find(b => b.id === bedId);
    if (!bed) return 'Unknown Bed';
    const room = rooms?.find(r => r.id === bed.room_id);
    return room ? `Room ${room.room_no} - Bed ${bed.bed_no}` : `Bed ${bed.bed_no}`;
  };

  const filteredTenants = activeTenants.filter(t => {
    // Check status filter
    const currentStatus = localState[t.id]?.status;
    let statusMatch = true;
    if (filterStatus === 'Unmarked') statusMatch = !currentStatus;
    else if (filterStatus !== 'All') statusMatch = currentStatus === filterStatus;
    
    if (!statusMatch) return false;

    // Check global search filter
    if (!globalSearch) return true;
    
    const searchLower = globalSearch.toLowerCase();
    const searchString = `${t.tenant_name} ${t.phone || ''} ${getBedInfo(t.bed_id)}`.toLowerCase();
    return searchString.includes(searchLower);
  });

  const handleDownloadCSV = () => {
    const headers = ['Tenant Name', 'Phone', 'Location', 'Status', 'Date', 'Timeline'];
    
    const csvData = filteredTenants.map(t => {
      const status = localState[t.id]?.status || 'Not Marked';
      const location = getBedInfo(t.bed_id);
      return `"${t.tenant_name}","${t.phone || '-'}","${location}","${status}","${date}","${timeline}"`;
    });
    
    const csvString = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Attendance_${date}_${timeline}_${filterStatus}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Daily Attendance</h2>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
            <Calendar size={18} style={{ marginRight: '8px', color: 'var(--text-secondary)' }} />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '15px', color: 'var(--text-primary)', background: 'transparent' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
            <span style={{ fontSize: '15px', color: 'var(--text-secondary)', marginRight: '8px', fontWeight: 500 }}>Timeline:</span>
            <select 
              value={timeline} 
              onChange={(e) => setTimeline(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '15px', color: 'var(--text-primary)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>

          <button 
            className="btn btn-outline" 
            onClick={handleDownloadCSV} 
            disabled={isLoading || filteredTenants.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', height: '40px' }}
          >
            <Download size={18} />
            Download Report
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={isSaving || isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', height: '40px' }}
          >
            {isSaving ? <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      <div className="card glass" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--surface-border)', paddingRight: '16px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Filter:</span>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--surface-border)', outline: 'none' }}
          >
            <option value="All">All Tenants</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
            <option value="Late">Late Only</option>
            <option value="Half Day">Half Day Only</option>
            <option value="Unmarked">Not Marked</option>
          </select>
        </div>
        
        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Quick Actions:</span>
        <button className="btn btn-outline" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => handleMarkAll('Present')}>Mark All Present</button>
        <button className="btn btn-outline" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => handleMarkAll('Half Day')}>Mark All Half Day</button>
        <button className="btn btn-outline" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => handleMarkAll('Absent')}>Mark All Absent</button>
      </div>

      <div className="card glass">
        <div className="table-container">
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading attendance data...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="empty-state">
              <p>No tenants match the current filter.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Photo</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th style={{ width: '380px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map(tenant => {
                  const currentStatus = localState[tenant.id]?.status;
                  return (
                    <tr key={tenant.id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{tenant.tenant_name}</span>
                      </td>
                      <td>
                        <button 
                          className="btn-icon"
                          onClick={() => setViewPhotoUrl(tenant.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tenant.tenant_name)}&background=random`)}
                          title="View Photo"
                          style={{ color: 'var(--primary-color)' }}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {getBedInfo(tenant.bed_id)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {tenant.phone || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            type="button"
                            onClick={() => handleStatusChange(tenant.id, 'Present')}
                            style={{
                              flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                              border: currentStatus === 'Present' ? '1px solid #10b981' : '1px solid var(--surface-border)',
                              background: currentStatus === 'Present' ? '#ecfdf5' : '#fff',
                              color: currentStatus === 'Present' ? '#10b981' : 'var(--text-secondary)'
                            }}
                          >
                            <Check size={14} /> Present
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleStatusChange(tenant.id, 'Half Day')}
                            style={{
                              flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                              border: currentStatus === 'Half Day' ? '1px solid #3b82f6' : '1px solid var(--surface-border)',
                              background: currentStatus === 'Half Day' ? '#eff6ff' : '#fff',
                              color: currentStatus === 'Half Day' ? '#3b82f6' : 'var(--text-secondary)'
                            }}
                          >
                            <Minus size={14} /> Half Day
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleStatusChange(tenant.id, 'Late')}
                            style={{
                              flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                              border: currentStatus === 'Late' ? '1px solid #f59e0b' : '1px solid var(--surface-border)',
                              background: currentStatus === 'Late' ? '#fffbeb' : '#fff',
                              color: currentStatus === 'Late' ? '#f59e0b' : 'var(--text-secondary)'
                            }}
                          >
                            <Clock size={14} /> Late
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleStatusChange(tenant.id, 'Absent')}
                            style={{
                              flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                              border: currentStatus === 'Absent' ? '1px solid #ef4444' : '1px solid var(--surface-border)',
                              background: currentStatus === 'Absent' ? '#fef2f2' : '#fff',
                              color: currentStatus === 'Absent' ? '#ef4444' : 'var(--text-secondary)'
                            }}
                          >
                            <X size={14} /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {viewPhotoUrl && (
        <div className="modal-overlay" onClick={() => setViewPhotoUrl(null)}>
          <div className="modal-content glass" style={{ width: 'auto', padding: '8px' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
              <img src={viewPhotoUrl} alt="Tenant" style={{ maxWidth: '400px', maxHeight: '80vh', borderRadius: '8px', display: 'block' }} />
              <button 
                onClick={() => setViewPhotoUrl(null)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
