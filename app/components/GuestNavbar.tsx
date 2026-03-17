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

        
        {/* Removed About, Products, and Pricing links per user request */}
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
