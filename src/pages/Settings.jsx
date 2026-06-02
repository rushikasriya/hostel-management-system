import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Mail, Phone, MapPin, Camera, Save, Shield, Clock } from 'lucide-react';

export const Settings = () => {
  const { users, updateRecord, addToast } = useAppContext();
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    user_name: '',
    email_id: '',
    contact_no: '',
    address: '',
    photo_url: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedId = sessionStorage.getItem('userId');
    if (storedId) {
      setUserId(Number(storedId));
      const user = users?.find(u => u.user_id === Number(storedId) || u.id === Number(storedId));
      if (user) {
        const initial = {
          user_name: user.user_name || '',
          email_id: user.email_id || '',
          contact_no: user.contact_no || '',
          address: user.address || '',
          photo_url: user.photo_url || ''
        };
        setFormData(initial);
        setOriginalData(initial);
      }
    }
    setIsLoading(false);
  }, [users]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
      addToast('Profile picture uploaded successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId) {
      addToast('User ID not found. Please log out and log in again.', 'error');
      return;
    }
    
    const originalUser = users?.find(u => u.user_id === userId || u.id === userId) || {};
    const updateData = { ...originalUser, ...formData, id: userId };
    
    updateRecord('users', updateData);
    sessionStorage.setItem('userName', formData.user_name);
    addToast('Profile updated successfully!', 'success');
  };

  if (isLoading) {
    return <div className="page-content" style={{ padding: '32px' }}>Loading...</div>;
  }

  const roleName = users?.find(u => u.user_id === userId || u.id === userId)?.role_name || 'Admin';

  return (
    <div className="page-content" style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Account Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Manage your profile information and system preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Profile Card */}
        <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}>
            {/* Banner */}
            <div style={{ 
              height: '120px', 
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #818CF8 100%)',
              position: 'relative'
            }}></div>
            
            <div style={{ padding: '0 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-60px' }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <img 
                  src={formData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.user_name || 'Admin')}&background=random&size=200`} 
                  alt="Profile" 
                  style={{ 
                    width: '120px', height: '120px', 
                    borderRadius: '50%', objectFit: 'cover', 
                    border: '4px solid var(--surface-color)', 
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                    background: 'white'
                  }} 
                />
                <label style={{
                  position: 'absolute', bottom: '0', right: '0',
                  background: 'var(--surface-color)', color: 'var(--text-primary)',
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '1px solid var(--surface-border)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, background 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--surface-color)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                >
                  <Camera size={16} />
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{formData.user_name || 'Your Name'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                <Shield size={14} /> {roleName}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-active" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}>Active Account</span>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px', borderRadius: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--primary-color)' }} /> Activity
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Last login</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Just now</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Account created</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>-</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px' }}>Personal Details</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 600 }}>
                    <User size={14} style={{ color: 'var(--primary-color)' }} /> Full Name
                  </label>
                  <input 
                    type="text" name="user_name" className="form-control" 
                    value={formData.user_name} onChange={handleChange} 
                    placeholder="Enter your full name" required 
                    style={{ background: 'var(--background-color)', padding: '14px 16px', fontSize: '15px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 600 }}>
                    <Mail size={14} style={{ color: 'var(--primary-color)' }} /> Email Address
                  </label>
                  <input 
                    type="email" name="email_id" className="form-control" 
                    value={formData.email_id} onChange={handleChange} 
                    placeholder="Enter your email" required 
                    style={{ background: 'var(--background-color)', padding: '14px 16px', fontSize: '15px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 600 }}>
                    <Phone size={14} style={{ color: 'var(--primary-color)' }} /> Contact Number
                  </label>
                  <input 
                    type="tel" name="contact_no" className="form-control" 
                    value={formData.contact_no} onChange={handleChange} 
                    placeholder="Enter your contact number" 
                    style={{ background: 'var(--background-color)', padding: '14px 16px', fontSize: '15px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 600 }}>
                    <MapPin size={14} style={{ color: 'var(--primary-color)' }} /> Address
                  </label>
                  <textarea 
                    name="address" className="form-control" 
                    value={formData.address} onChange={handleChange} 
                    placeholder="Enter your full address" 
                    style={{ background: 'var(--background-color)', padding: '14px 16px', fontSize: '15px', minHeight: '120px', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid var(--surface-border)' }}>
                <button type="button" className="btn btn-outline" style={{ padding: '12px 24px', fontSize: '15px', marginRight: '16px' }} onClick={() => setFormData(originalData)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
