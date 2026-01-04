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
      <div className="mobile-top-banner" />
      <button 
          onClick={onToggle}
          className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
          title={isOpen ? "Collapse" : "Expand"}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
          {isOpen ? '✕' : '☰'}
      </button>

      {/* Sliding Sidebar Panel */}
      <aside className={`sidebar-panel ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
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
