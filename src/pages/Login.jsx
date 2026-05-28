import React, { useState } from 'react';
import { Building, Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: email, password: password })
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Left Panel - Image Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95)), url(/login-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '60px',
        color: 'white',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }} className="login-image-panel">
        <div style={{ zIndex: 2, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '120px' }}>
             <Building size={32} color="#60a5fa" />
             <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>NexusHostel</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.1, marginBottom: '24px', maxWidth: '500px' }}>
            Elevate your property management.
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '400px', lineHeight: 1.6 }}>
            The all-in-one platform to seamlessly manage your blocks, tenants, and operations with real-time insights.
          </p>
        </div>
        
        {/* Floating Decorative Elements */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          filter: 'blur(100px)',
          opacity: 0.5,
          borderRadius: '50%',
          zIndex: 1
        }}></div>
      </div>

      {/* Right Panel - Login Form Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Background decorative blob for mobile/form area */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 0
        }}></div>

        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)',
          position: 'relative',
          zIndex: 10,
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          
          {/* Mobile Logo Logo (visible only on small screens) */}
          <div className="mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', justifyContent: 'center' }}>
             <Building size={28} color="#3b82f6" />
             <span style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>NexusHostel</span>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Welcome back
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px' }}>
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#fef2f2',
                color: '#ef4444',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #fee2e2',
                animation: 'shake 0.4s ease-in-out'
              }}>
                <ShieldCheck size={18} /> {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                Email Address
              </label>
              <div style={{
                position: 'relative',
                transition: 'all 0.3s ease',
                borderRadius: '12px',
                boxShadow: focusedInput === 'email' ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none'
              }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'email' ? '#3b82f6' : '#94a3b8', transition: 'color 0.3s ease' }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '12px',
                    border: `1px solid ${focusedInput === 'email' ? '#3b82f6' : '#e2e8f0'}`,
                    background: focusedInput === 'email' ? '#ffffff' : '#f8fafc',
                    fontSize: '15px',
                    color: '#1e293b',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                <span>Password</span>
                <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>Forgot?</a>
              </label>
              <div style={{
                position: 'relative',
                transition: 'all 0.3s ease',
                borderRadius: '12px',
                boxShadow: focusedInput === 'password' ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none'
              }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedInput === 'password' ? '#3b82f6' : '#94a3b8', transition: 'color 0.3s ease' }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '12px',
                    border: `1px solid ${focusedInput === 'password' ? '#3b82f6' : '#e2e8f0'}`,
                    background: focusedInput === 'password' ? '#ffffff' : '#f8fafc',
                    fontSize: '15px',
                    color: '#1e293b',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)',
              }}
              disabled={isLoading}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(37, 99, 235, 0.5)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(37, 99, 235, 0.4)'; }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="spinner"></div> Signing In...
                </div>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
            
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Zap size={14} color="#f59e0b" /> Fast, secure & reliable
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .login-image-panel {
          display: none !important;
        }
        @media (min-width: 900px) {
          .login-image-panel {
            display: flex !important;
          }
          .mobile-logo {
            display: none !important;
          }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

