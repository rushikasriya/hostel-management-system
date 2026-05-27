import React, { useState } from 'react';
import { Building, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        onLogin();
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
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1e2d 0%, #151521 100%)',
      padding: '24px'
    }}>
      <div className="card glass" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2)'
        }}>
          <Building size={32} className="text-primary" />
        </div>
        
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center' }}>
          Sign in to manage your hostels
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger-color)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '48px', height: '48px' }}
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Password
              <a href="#" style={{ color: 'var(--primary-color)', fontSize: '12px', textDecoration: 'none' }}>Forgot?</a>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '48px', height: '48px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '48px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
