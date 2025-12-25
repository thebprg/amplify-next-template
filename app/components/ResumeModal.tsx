'use client';

import React, { useState, useEffect } from 'react';

export default function ResumeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        animation: 'scaleUp 0.3s ease-out'
      }}>
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#64748b'
          }}
          aria-label="Close"
        >
          &times;
        </button>

        <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
        }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>By</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <img 
              src="/my_image.JPG" 
              alt="Profile"
              style={{ 
                width: '160px', 
                height: '160px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                objectPosition: 'top',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />

            <span style={{ 
              display: 'inline-block',
              background: '#dcfce7', 
              color: '#166534', 
              padding: '0.5rem 1rem', 
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              OPEN TO WORK
            </span>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: '#0f172a' }}>
            Bhanu Prakash Reddy Gundam
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexDirection: 'column', width: '100%', maxWidth: '300px' }}>
             <a href="https://linkedin.com/in/bprg" target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <span>In</span> LinkedIn
             </a>
             <a href="https://github.com/thebprg" target="_blank" rel="noopener noreferrer" style={{ color: '#333', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
             </a>
             <a href="https://gundams.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <span>🌐</span> Portfolio
             </a>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleUp {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
