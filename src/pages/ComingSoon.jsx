import React from 'react';
import { Clock } from 'lucide-react';

export const ComingSoon = ({ title }) => {
  return (
    <div className="page-content" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="card" style={{ 
        padding: '64px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        color: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Clock size={40} color="#38BDF8" />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', background: 'linear-gradient(to right, #38BDF8, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Coming Soon
        </h1>
        <p style={{ fontSize: '18px', lineHeight: 1.6, opacity: 0.9, marginBottom: '0' }}>
          The <strong style={{ color: '#38BDF8' }}>{title}</strong> module is currently under development and will arrive soon!
        </p>
      </div>
    </div>
  );
};
