"use client";

import Link from "next/link";
import { useState } from "react";

export default function GuestNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: 'white',
      borderBottom: '1px solid var(--color-slate-100)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      marginBottom: '2rem',
      width: '100%'
    }}>
      {/* LEFT: Branding & Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>

        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/about" style={{ textDecoration: 'none', color: 'var(--color-slate-600)', fontWeight: 500, fontSize: '0.95rem' }}>
                About
            </Link>

            {/* Products Dropdown */}
            <div 
                style={{ position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-slate-600)', fontWeight: 500, fontSize: '0.95rem' }}>
                    Products
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                {isDropdownOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: -10,
                        background: 'white',
                        border: '1px solid var(--color-slate-100)',
                        boxShadow: 'var(--shadow-layered)',
                        borderRadius: '12px',
                        padding: '0.5rem',
                        minWidth: '220px',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 100
                    }}>
                        <Link href="/" className="dropdown-item active">
                            <div style={{ fontWeight: 600 }}>URL Shortener</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Shorten & Track Links</div>
                        </Link>
                        <div className="dropdown-item disabled">
                            <div style={{ fontWeight: 600 }}>Poster Generator</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Coming Soon</div>
                        </div>
                        <div className="dropdown-item disabled">
                            <div style={{ fontWeight: 600 }}>Bill & Mail Manager</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Coming Soon</div>
                        </div>
                         <div className="dropdown-item disabled">
                            <div style={{ fontWeight: 600 }}>Web Pages</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Coming Soon</div>
                        </div>
                    </div>
                )}
            </div>

            <Link href="/pricing" style={{ textDecoration: 'none', color: 'var(--color-slate-600)', fontWeight: 500, fontSize: '0.95rem' }}>
                Pricing
            </Link>
        </div>
      </div>

      {/* RIGHT: Login */}
      <div>
        <Link href="/login" style={{ 
            textDecoration: 'none', 
            color: 'white', 
            background: 'var(--color-teal-700)', 
            padding: '0.6rem 1.25rem', 
            borderRadius: '8px', 
            fontWeight: 600, 
            fontSize: '0.9rem',
            transition: 'background 0.2s' 
        }}>
            Login
        </Link>
      </div>

      <style jsx>{`
        .dropdown-item {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            text-decoration: none;
            color: var(--color-slate-600);
            transition: background 0.2s;
            cursor: pointer;
        }
        .dropdown-item:hover {
            background: var(--color-slate-100);
            color: var(--color-teal-900);
        }
        .dropdown-item.active {
            color: var(--color-teal-700);
            background: var(--color-cyan-100);
        }
        .dropdown-item.disabled {
            cursor: default;
            opacity: 0.6;
        }
        .dropdown-item.disabled:hover {
            background: none;
            color: var(--color-slate-600);
        }
      `}</style>
    </nav>
  );
}
