"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useAuthenticator } from "@aws-amplify/ui-react";
import Link from 'next/link';

import "./../app/app.css";
import { generateShortCode } from "./utils";
import Toast, { ToastType } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import { validateUrl } from "./actions";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [urls, setUrls] = useState<Array<Schema["Url"]["type"]>>([]);
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expirationMonths, setExpirationMonths] = useState(3);
  
  const [shortenedUrl, setShortenedUrl] = useState<Schema["Url"]["type"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  
  // Sidebar state (open by default for auth users)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const domain = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (user) {
      const sub = client.models.Url.observeQuery().subscribe({
        next: (data) => setUrls([...data.items]),
      });
      return () => sub.unsubscribe();
    } else {
      setUrls([]);
    }
  }, [user]);

  function showToast(message: string, type: ToastType) {
    setToast({ message, type });
  }

  async function createUrl() {
    if (!originalUrl) {
      showToast("Please enter a URL", "error");
      return;
    }

    if (customAlias && !/^[a-zA-Z0-9-]{4,15}$/.test(customAlias)) {
      showToast("Alias must be 4-15 alphanumeric chars", "error");
      return;
    }

    // Normalization & Validation
    let urlToShorten = originalUrl.trim();
    if (!/^https?:\/\//i.test(urlToShorten)) {
      urlToShorten = 'https://' + urlToShorten;
    }

    if (/^http:\/\//i.test(urlToShorten)) {
      showToast("Insecure HTTP URLs not allowed. Use HTTPS.", "error");
      return;
    }

    try {
      setIsLoading(true);
      // Valid reachability
      const { isValid, error } = await validateUrl(urlToShorten);
      if (!isValid) {
        showToast(error || "URL unreachable.", "error");
        setIsLoading(false);
        return;
      }

      let finalShortCode = "";
      if (user && customAlias) {
        const { data: existing } = await client.models.Url.list({
          filter: { shortCode: { eq: customAlias } }
        });
        if (existing.length > 0) {
          showToast("Alias taken", "error");
          setIsLoading(false);
          return;
        }
        finalShortCode = customAlias;
      } else {
        finalShortCode = generateShortCode();
      }

      const monthsToAdd = user ? expirationMonths : 3;
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + monthsToAdd);
      const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000);
      const authMode = user ? 'userPool' : 'apiKey';

      const { data: newUrl } = await client.models.Url.create({
        originalUrl: urlToShorten,
        shortCode: finalShortCode,
        clicks: 0,
        expiration: expirationTimestamp
      }, { authMode });

      setOriginalUrl("");
      setCustomAlias("");
      setShortenedUrl(newUrl);
      showToast("Link Generated!", "success");
    } catch (e: any) {
      console.error(e);
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }

  const downloadQr = async () => {
    if (!shortenedUrl) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${domain}/${shortenedUrl.shortCode}`;
    try {
      const resp = await fetch(qrUrl);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${shortenedUrl.shortCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(qrUrl, '_blank');
    }
  };

  return (
    <div className={`app-shell ${!user ? 'guest-mode' : ''} ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="content-area">

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Guest Header */}
        {!user && (
          <header style={{ width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'flex-end', padding: '1rem 0' }}>
            <Link href="/login" style={{ color: 'var(--color-teal-700)', fontWeight: 600, textDecoration: 'none' }}>
              Admin Login &rarr;
            </Link>
          </header>
        )}

        <main className="main-card">
          {/* LEFT: Inputs */}
          <div className="card-section card-left">
            <h1 className="heading-lg">Shrink your link</h1>
            <p style={{ color: 'var(--color-slate-600)', marginBottom: '2rem' }}>
              Create secure, trackable short links in seconds.
            </p>

            {/* Destination URL */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="label-text">Destination URL</label>
              <input 
                className="input-base" 
                placeholder="https://super-long-url.com/..." 
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                autoFocus
              />
            </div>

            {/* Row: Alias & Expiration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label className="label-text">
                  Custom Alias {!user && "(Login to unlock)"}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1rem', pointerEvents: 'none' }}>/</span>
                  <input 
                    className="input-base"
                    style={{ paddingLeft: '1.75rem', height: '3.5rem' }}
                    placeholder={user ? "my-link" : "Random"} 
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    disabled={!user}
                  />
                </div>
              </div>
              <div>
                <label className="label-text">
                  Expiration {!user && "(Default)"}
                </label>
                <select 
                  className="input-base"
                  style={{ height: '3.5rem' }}
                  value={expirationMonths}
                  onChange={(e) => setExpirationMonths(Number(e.target.value))}
                  disabled={!user}
                >
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>1 Year</option>
                </select>
              </div>
            </div>


            <button 
              className="btn-primary" 
              onClick={createUrl} 
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Short Link & QR'}
            </button>
          </div>

          {/* RIGHT: Results */}
          <div className="card-section card-right" style={{ padding: '2rem', justifyContent: 'flex-start', textAlign: 'left', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s' }}>
                <h3 style={{ color: shortenedUrl ? 'var(--color-teal-900)' : 'var(--color-slate-400)', marginBottom: '1.5rem', fontSize: '1.5rem', alignSelf: 'flex-start', width: '100%', maxWidth: '400px' }}>
                    {shortenedUrl ? 'Ready to share!' : 'Your link will appear here...'}
                </h3>
                
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: shortenedUrl ? 1 : 0.6, filter: shortenedUrl ? 'none' : 'grayscale(100%)', pointerEvents: shortenedUrl ? 'all' : 'none', transition: 'all 0.3s' }}>
                    {/* Short Link Section */}
                    <div style={{ width: '100%' }}>
                    <label className="label-text" style={{ display: 'block' }}>Short Link</label>
                    <div style={{ marginTop: '0.25rem' }}>
                        <input 
                        readOnly 
                        value={shortenedUrl ? `${domain.replace('http://', 'https://')}/${shortenedUrl.shortCode}` : `${domain.replace('http://', 'https://')}/example`} 
                        className="input-base"
                        style={{ background: 'white', color: shortenedUrl ? 'var(--color-teal-700)' : 'var(--color-slate-400)', fontWeight: 700, width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                        <button 
                        onClick={() => {
                            if (!shortenedUrl) return;
                            navigator.clipboard.writeText(`${domain.replace('http://', 'https://')}/${shortenedUrl.shortCode}`);
                            showToast("Copied!", "success");
                        }}
                        disabled={!shortenedUrl}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: shortenedUrl ? 'var(--color-teal-600)' : 'transparent', 
                            fontWeight: 600, 
                            cursor: shortenedUrl ? 'pointer' : 'default',
                            fontSize: '0.9rem',
                            textDecoration: 'underline'
                        }}
                        >
                        Copy
                        </button>
                    </div>
                    </div>

                    {/* QR Section */}
                    <div style={{ width: '100%' }}>
                        <div className="qr-frame" style={{ 
                            background: 'white', 
                            width: '100%', 
                            aspectRatio: '1/1',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            padding: '1rem',
                            border: '2px solid var(--color-slate-200)',
                            borderRadius: 'var(--radius-lg)'
                        }}>
                            {/* Placeholder / Actual QR */}
                            {shortenedUrl ? (
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${domain.replace('http://', 'https://')}/${shortenedUrl.shortCode}`} 
                                    alt="QR Code" 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 600 }}>QR Preview</span>
                                </div>
                            )}
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <button 
                            onClick={downloadQr}
                            disabled={!shortenedUrl}
                            style={{ 
                                background: 'none',
                                border: 'none',
                                color: shortenedUrl ? 'var(--color-teal-600)' : 'transparent', 
                                fontWeight: 600, 
                                cursor: shortenedUrl ? 'pointer' : 'default',
                                fontSize: '0.9rem',
                                textDecoration: 'underline'
                            }}
                            >
                            Download PNG
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </main>
        
        {/* Simple Dashboard List for Auth Users */}
        {user && urls.length > 0 && (
          <section id="dashboard" style={{ marginTop: '4rem', width: '100%', maxWidth: '1100px', paddingBottom: '4rem' }}>
            <h2 className="heading-lg" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Active Links</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {urls.map(url => (
                <div key={url.id} style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-lg)', 
                  boxShadow: 'var(--shadow-layered)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <a href={`${domain}/${url.shortCode}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-teal-700)', fontWeight: 800, fontSize: '1.25rem', textDecoration: 'none' }}>
                            /{url.shortCode}
                          </a>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                            {url.expiration && (
                                <>
                                    <span style={{ color: '#cbd5e1' }}>|</span>
                                    <span style={{ color: (url.expiration * 1000 < Date.now()) ? '#ef4444' : '#64748b' }}>
                                        Expires: {new Date(url.expiration * 1000).toLocaleDateString()}
                                    </span>
                                </>
                            )}
                          </span>
                      </div>
                      
                      {/* Editable Original URL */}
                      <DashboardUrlItem url={url} client={client} showToast={showToast} />

                    </div>
                    
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                       <div style={{ textAlign: 'center' }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Clicks</div>
                         <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-teal-900)' }}>{url.clicks}</div>
                       </div>
                       <span style={{ 
                         padding: '0.25rem 0.75rem', 
                         borderRadius: '99px', 
                         background: (url.expiration && url.expiration * 1000 < Date.now()) ? '#fee2e2' : '#dcfce7',
                         color: (url.expiration && url.expiration * 1000 < Date.now()) ? '#ef4444' : '#166534',
                         fontWeight: 700,
                         fontSize: '0.75rem'
                       }}>
                         {(url.expiration && url.expiration * 1000 < Date.now()) ? 'EXPIRED' : 'ACTIVE'}
                       </span>
                       
                       <button 
                          onClick={async () => {
                              if (window.confirm("Delete this link?")) {
                                  try {
                                      await client.models.Url.delete({ id: url.id }, { authMode: 'userPool' });
                                      showToast("Link deleted", "success");
                                  } catch(e) {
                                      console.error("Delete error", e);
                                      showToast("Delete failed", "error");
                                  }
                              }
                          }}
                          style={{
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fee2e2',
                              borderRadius: '6px',
                              padding: '0 0.75rem',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              transition: 'all 0.2s'
                          }}
                          title="Delete Link"
                       >
                           Delete
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Sub-component for editable URL item
function DashboardUrlItem({ url, client, showToast }: { url: any, client: any, showToast: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(url.originalUrl);
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        if (!editValue.trim()) return;
        setSaving(true);
        try {
            await client.models.Url.update({
                id: url.id,
                originalUrl: editValue.trim()
            }, { authMode: 'userPool' });
            showToast("URL updated", "success");
            setIsEditing(false);
        } catch(e) {
            console.error("Update error", e);
            showToast("Update failed", "error");
        } finally {
            setSaving(false);
        }
    }

    if (isEditing) {
        return (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                    className="input-base"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{ padding: '0.5rem', fontSize: '0.9rem', flex: 1, maxWidth: '400px' }}
                    autoFocus
                />
                <button onClick={handleSave} disabled={saving} style={{ background: '#0f766e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {saving ? '...' : 'Save'}
                </button>
                <button onClick={() => setIsEditing(false)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Cancel
                </button>
            </div>
        )
    }

    return (
        <div style={{ color: 'var(--color-slate-400)', fontSize: '0.9rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {url.originalUrl}
            </span>
            <button 
                onClick={() => setIsEditing(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-teal-600)', fontWeight: 600, textDecoration: 'underline' }}
                title="Edit Destination"
            >
                Edit
            </button>
        </div>
    );
}

