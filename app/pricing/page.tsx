"use client";

import Link from "next/link";
import GuestNavbar from "../components/GuestNavbar";

export default function Pricing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'system-ui, sans-serif' }}>
      <GuestNavbar />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-teal-900)', marginBottom: '1rem' }}>
          Simple Pricing
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-slate-600)', marginBottom: '4rem' }}>
          Start building your business presence today.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
                background: 'white', 
                borderRadius: '24px', 
                boxShadow: 'var(--shadow-layered)', 
                padding: '3rem', 
                width: '100%', 
                maxWidth: '400px',
                border: '1px solid var(--color-slate-100)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'linear-gradient(90deg, #0f766e, #06b6d4)' }}></div>
                
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-teal-900)', marginBottom: '1rem' }}>Starter Plan</h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-teal-800)' }}>$0</span>
                    <span style={{ fontSize: '1.25rem', color: 'var(--color-slate-400)', fontWeight: 500 }}>/ month</span>
                </div>
                
                <div style={{ background: '#f0fdfa', color: '#115e59', padding: '0.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
                    No credit card needed
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        "Unlimited Short Links",
                        "Custom QR Codes", 
                        "Basic Analytics",
                        "AI Poster Generator (Coming Soon)",
                        "Email Manager (Coming Soon)"
                    ].map((feature, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-slate-600)' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="10" fill="#ccfbf1"/>
                                <path d="M6 10L9 13L14 7" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {feature}
                        </li>
                    ))}
                </ul>

                <Link href="/login" style={{ textDecoration: 'none' }}>
                <button style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    background: 'var(--color-teal-700)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontWeight: 700, 
                    fontSize: '1.1rem', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(15, 118, 110, 0.2)'
                }}>
                    Get Started
                </button>
                </Link>
                
                <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-slate-400)' }}>
                    New plans and usage limits detailed soon.
                </p>
            </div>
        </div>

      </main>
    </div>
  );
}
