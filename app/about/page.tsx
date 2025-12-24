"use client";

import GuestNavbar from "../components/GuestNavbar";

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'system-ui, sans-serif' }}>
      <GuestNavbar />
      
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-teal-900)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Our Vision
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--color-slate-600)', lineHeight: 1.6, textAlign: 'center', marginBottom: '4rem' }}>
          Empowering small businesses with sleek, powerful, and AI-driven tools to manage their digital presence.
        </p>

        <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-teal-800)', marginBottom: '1rem' }}>
                Where We Are Now
            </h2>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-layered)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Link Management Suite</h3>
                <p style={{ color: 'var(--color-slate-600)' }}>
                    We started with a robust <strong>URL Shortener</strong> and <strong>QR Code Generator</strong>. 
                    Our platform allows you to create trackable, custom links instantly, providing the first step in managing your digital footprint.
                </p>
            </div>
        </section>

        <section>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-teal-800)', marginBottom: '1rem' }}>
                The Future
            </h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--color-cyan-500)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>AI Poster Generator</h3>
                    <p style={{ color: 'var(--color-slate-600)' }}>
                        Creativity on demand. We plan to integrate generative AI to help you create stunning promotional posters for your business events and sales in seconds.
                    </p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--color-teal-500)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>AI Email & Marketing Manager</h3>
                    <p style={{ color: 'var(--color-slate-600)' }}>
                        Connect better. Our future roadmap includes an intelligent email manager that leverages AI to draft, personalize, and send marketing emails and newsletters, specifically tailored for small businesses to maximize reach.
                    </p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--color-amber-500)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Static Pages and more</h3>
                    <p style={{ color: 'var(--color-slate-600)' }}>
                       Simple, fast, and hosted static pages for your campaigns, ensuring you have a landing spot for every idea.
                    </p>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
