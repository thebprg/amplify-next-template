'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthenticator } from '@aws-amplify/ui-react';

export default function Sidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  if (!user) return null;

  return (

    <>
      {/* Floating Toggle Button - Always visible, Fixed position */}
      <button 
          onClick={onToggle}
          style={{ 
              position: 'fixed',
              top: '1.5rem',
              left: '1.5rem',
              zIndex: 200,
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--color-teal-900)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
          }}
          title={isOpen ? "Collapse" : "Expand"}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
          {isOpen ? '✕' : '☰'}
      </button>

      {/* Sliding Sidebar Panel */}
      <aside className={`sidebar-panel ${isOpen ? 'open' : 'closed'}`}>
        <div style={{ marginTop: '4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'white' }}>Products</span>
        </div>

        <nav style={{ flex: 1 }}>
          <Link href="/" className="nav-item active" title="URL Shortener">
            <span style={{ fontSize: '1.25rem' }}>🔗</span> 
            <span className="nav-text">URL Shortener</span>
          </Link>
        </nav>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="user-info" style={{ fontSize: '0.85rem', marginBottom: '1rem', opacity: 0.8 }}>
            {user.signInDetails?.loginId || 'User'}
          </div>
          <button 
            onClick={signOut}
            className="nav-item"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#fca5a5', 
              cursor: 'pointer', 
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem',
              justifyContent: 'flex-start'
            }}
            title="Sign Out"
          >
            <span className="nav-text" style={{ fontWeight: 600 }}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
