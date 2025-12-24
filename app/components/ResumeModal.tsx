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

        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white'
          }}>
            👨‍💻
          </div>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#0f172a' }}>
            Creator Name
          </h2>
          <span style={{ 
            display: 'inline-block',
            background: '#dcfce7', 
            color: '#166534', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '1.5rem'
          }}>
            OPEN TO WORK
          </span>

          <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Full Stack Developer specializing in React, Node.js, and Cloud Architecture. Building modern web experiences.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {['React', 'Next.js', 'AWS Amplify', 'TypeScript', 'Node.js'].map(skill => (
              <span key={skill} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#475569'
              }}>
                {skill}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
             <a href="#" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>GitHub</a>
             <a href="#" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>LinkedIn</a>
             <a href="#" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>Portfolio</a>
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
