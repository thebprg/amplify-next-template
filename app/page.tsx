"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

import { useAuthenticator } from "@aws-amplify/ui-react";
import Link from 'next/link';
import QRCode from 'qrcode';

import "./../app/app.css";
import { generateShortCode } from "./utils";
import Toast, { ToastType } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import GuestNavbar from "./components/GuestNavbar";
import ResumeModal from "./components/ResumeModal";
import { validateUrl } from "./actions";

Amplify.configure(outputs);

const client = generateClient<Schema>();
// Removed dedicated authClient to prevent premature auth checks
// We will use client.models.Group.observeQuery({ authMode: 'userPool' }) inline instead.

const ITEMS_PER_PAGE = 10;

export default function App() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [urls, setUrls] = useState<Array<Schema["Url"]["type"]>>([]);
  const [groups, setGroups] = useState<Array<Schema["Group"]["type"]>>([]);
  
  // Link Form State
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [expirationMonths, setExpirationMonths] = useState(3);
  
  const [shortenedUrl, setShortenedUrl] = useState<Schema["Url"]["type"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Auto-close on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'links' | 'groups'>('links');
  const [viewingGroup, setViewingGroup] = useState<Schema["Group"]["type"] | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Pagination State
  const [linksPage, setLinksPage] = useState(1);
  const [groupsPage, setGroupsPage] = useState(1);

  const domain = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (user) {
      // Observer Links
      const subLinks = client.models.Url.observeQuery({ authMode: 'userPool' }).subscribe({
        next: (data) => {
            // Sort by createdAt desc
            const sorted = [...data.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setUrls(sorted);
        },
      });
      
      // Observer Groups
      const subGroups = client.models.Group.observeQuery({ authMode: 'userPool' }).subscribe({
        next: (data) => {
            const sorted = [...data.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setGroups(sorted);
        },
        error: (err) => console.error("Error fetching groups:", err)
      });
      return () => {
        subLinks.unsubscribe();
        subGroups.unsubscribe();
      };
    } else {
      setUrls([]);
      setGroups([]);
      setShortenedUrl(null);
      setOriginalUrl("");
      setCustomAlias("");
      setDescription("");
      setSelectedGroupId("");
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
        expiration: expirationTimestamp,
        description: description.trim() || undefined,
        groupId: selectedGroupId || undefined
      }, { authMode });

      setOriginalUrl("");
      setCustomAlias("");
      setDescription("");
      setSelectedGroupId("");
      setShortenedUrl(newUrl);
      showToast("Link Generated!", "success");
    } catch (e: any) {
      console.error(e);
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function createGroup() {
    if (!newGroupName.trim()) {
        showToast("Group Name required", "error");
        return;
    }
    setCreatingGroup(true);
    try {
        await client.models.Group.create({
            name: newGroupName.trim(),
            description: newGroupDesc.trim() || undefined
        }, { authMode: 'userPool' });
        showToast("Group Created", "success");
        setNewGroupName("");
        setNewGroupDesc("");
    } catch(e) {
        console.error("Create Group Error:", e);
        showToast("Failed to create group", "error");
    } finally {
        setCreatingGroup(false);
    }
  }

  async function deleteGroup(group: Schema["Group"]["type"]) {
    if (!confirm(`Delete group "${group.name}" and ALL its links? This cannot be undone.`)) return;
    
    try {
        const { data: groupLinks } = await client.models.Url.list({
            filter: { groupId: { eq: group.id } },
            authMode: 'userPool'
        });
        await Promise.all(groupLinks.map((link: any) => client.models.Url.delete({ id: link.id }, { authMode: 'userPool' })));
        await client.models.Group.delete({ id: group.id }, { authMode: 'userPool' });
        
        showToast("Group and contents deleted", "success");
        if (viewingGroup?.id === group.id) setViewingGroup(null);
    } catch(e) {
        console.error(e);
        showToast("Error deleting group", "error");
    }
  }

  const downloadQr = async () => {
    if (!shortenedUrl) return;
    const fullShortLink = `${domain}/${shortenedUrl.shortCode}`;
    try {
      const dataUrl = await QRCode.toDataURL(fullShortLink, { width: 300, margin: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `qrcode-${shortenedUrl.shortCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      showToast("Error generating QR", "error");
    }
  };

  // Filter & Pagination Logic
  const visibleUrls = viewingGroup 
    ? urls.filter(u => u.groupId === viewingGroup.id) 
    : urls.filter(u => activeTab === 'links'); 

  // Reset page when tab changes
  useEffect(() => { setLinksPage(1); }, [activeTab, viewingGroup]);

  const totalLinkPages = Math.ceil(visibleUrls.length / ITEMS_PER_PAGE);
  const currentLinks = visibleUrls.slice((linksPage - 1) * ITEMS_PER_PAGE, linksPage * ITEMS_PER_PAGE);

  const totalGroupPages = Math.ceil(groups.length / ITEMS_PER_PAGE);
  const currentGroups = groups.slice((groupsPage - 1) * ITEMS_PER_PAGE, groupsPage * ITEMS_PER_PAGE);

  return (
    <div className={`app-shell ${!user ? 'guest-mode' : ''} ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <ResumeModal />
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="content-area">

        {/* Guest Header */}
        {!user && <GuestNavbar />}
        <div style={{ width: '100%', padding: user ? 0 : '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <main className="main-card">
          {/* LEFT: Inputs */}
          <div className="card-section card-left">
            <h1 className="heading-lg">Shrink your link</h1>
            <p style={{ color: 'var(--color-slate-600)', marginBottom: '2rem' }}>
              Create secure, trackable short links in seconds.
            </p>

            {/* Destination URL */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label-text">Destination URL</label>
              <input 
                className="input-base" 
                placeholder="https://super-long-url.com/..." 
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                autoFocus
                style={{ position: 'relative', zIndex: 1 }}
              />
            </div>

            {/* Description & Group (New) */}
            {user && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                     <div>
                        <label className="label-text">Description <span style={{fontWeight: 400, opacity: 0.7}}>(Optional)</span></label>
                        <input 
                            className="input-base"
                            placeholder="e.g. Marketing Campaign"
                            maxLength={75}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ height: '3.5rem' }}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                            {description.length}/75
                        </div>
                     </div>
                     <div>
                        <label className="label-text">Group</label>
                         {groups.length > 0 ? (
                             <select
                                className="input-base"
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                style={{ height: '3.5rem' }}
                             >
                                <option value="">None</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                             </select>
                         ) : (
                             <div style={{ padding: '0.875rem', fontSize: '0.9rem', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                 <button onClick={() => { setActiveTab('groups'); document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: 'var(--color-teal-600)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                                    Create a group first
                                 </button>
                             </div>
                         )}
                     </div>
                </div>
            )}

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
                  {!user && (
                    <div 
                        onClick={() => showToast("Login to get full access", "info")}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  )}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
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
                 {!user && (
                    <div 
                        onClick={() => showToast("Login to get full access", "info")}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                )}
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
                                <QrDisplay url={`${domain.replace('http://', 'https://')}/${shortenedUrl.shortCode}`} />
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
        
        {/* Dashboard Area */}
        {user && (
          <section id="dashboard" style={{ marginTop: '4rem', width: '100%', maxWidth: '1100px', paddingBottom: '4rem' }}>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
               <button 
                  onClick={() => { setActiveTab('links'); setViewingGroup(null); }}
                  style={{
                      padding: '1rem 0',
                      background: 'none',
                      border: 'none',
                      borderBottom: (activeTab === 'links' && !viewingGroup) ? '3px solid var(--color-teal-700)' : '3px solid transparent',
                      color: (activeTab === 'links' && !viewingGroup) ? 'var(--color-teal-900)' : 'var(--color-slate-600)',
                      fontWeight: (activeTab === 'links' && !viewingGroup) ? 800 : 500,
                      fontSize: '1.25rem',
                      cursor: 'pointer'
                  }}
               >
                   All Links
               </button>
               <button 
                  onClick={() => setActiveTab('groups')}
                  style={{
                      padding: '1rem 0',
                      background: 'none',
                      border: 'none',
                      borderBottom: (activeTab === 'groups' || viewingGroup) ? '3px solid var(--color-teal-700)' : '3px solid transparent',
                      color: (activeTab === 'groups' || viewingGroup) ? 'var(--color-teal-900)' : 'var(--color-slate-600)',
                      fontWeight: (activeTab === 'groups' || viewingGroup) ? 800 : 500,
                      fontSize: '1.25rem',
                      cursor: 'pointer'
                  }}
               >
                   Groups
               </button>
            </div>

            {/* Viewing Group Header */}
            {viewingGroup && (
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setViewingGroup(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        &larr;
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-teal-900)' }}>{viewingGroup.name}</h2>
                        {viewingGroup.description && <p style={{ color: 'var(--color-slate-600)' }}>{viewingGroup.description}</p>}
                    </div>
                </div>
            )}

            {/* GROUPS TAB CONTENT */}
            {activeTab === 'groups' && !viewingGroup && (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {/* Create Group Form */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <input 
                                className="input-base" 
                                placeholder="New Group Name"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 2, minWidth: '300px' }}>
                             <input 
                                className="input-base" 
                                placeholder="Description (Optional, max 150 chars)"
                                maxLength={150}
                                value={newGroupDesc}
                                onChange={(e) => setNewGroupDesc(e.target.value)}
                            />
                        </div>
                        <button 
                            className="btn-primary" 
                            style={{ width: 'auto', padding: '0.875rem 1.5rem' }}
                            onClick={createGroup}
                            disabled={creatingGroup}
                        >
                            {creatingGroup ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>

                    {/* Group List */}
                    {groups.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate-400)' }}>No groups yet. Create one to organize your links!</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {currentGroups.map(group => (
                                <div key={group.id} 
                                    onClick={() => setViewingGroup(group)}
                                    style={{ 
                                        background: 'white', 
                                        padding: '1.5rem', 
                                        borderRadius: '16px', 
                                        boxShadow: 'var(--shadow-layered)', 
                                        cursor: 'pointer', 
                                        transition: 'transform 0.2s',
                                        border: '1px solid transparent'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-teal-500)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{group.name}</h3>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteGroup(group); }}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                                            title="Delete Group"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    {group.description && <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', marginBottom: '1rem', minHeight: '1.5em' }}>{group.description}</p>}
                                    <div style={{ color: 'var(--color-teal-700)', fontWeight: 600, fontSize: '0.875rem' }}>
                                        View Links &rarr;
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Groups Pagination */}
                    {totalGroupPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                            <button 
                                disabled={groupsPage === 1}
                                onClick={() => setGroupsPage(p => p - 1)}
                                style={{ padding: '0.5rem 1rem', cursor: groupsPage === 1 ? 'default' : 'pointer', opacity: groupsPage === 1 ? 0.5 : 1 }}
                            >
                                Previous
                            </button>
                            <span>Page {groupsPage} of {totalGroupPages}</span>
                            <button 
                                disabled={groupsPage === totalGroupPages}
                                onClick={() => setGroupsPage(p => p + 1)}
                                style={{ padding: '0.5rem 1rem', cursor: groupsPage === totalGroupPages ? 'default' : 'pointer', opacity: groupsPage === totalGroupPages ? 0.5 : 1 }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}


            {/* LINKS LIST (Used by both All Links and Viewing Group) */}
            {(activeTab === 'links' || viewingGroup) && (
              <>
                <div style={{ display: 'grid', gap: '1rem' }}>
                {visibleUrls.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate-400)' }}>No links found.</div>
                ) : currentLinks.map(url => (
                    <LinkCard 
                        key={url.id} 
                        url={url} 
                        group={groups.find(g => g.id === url.groupId)}
                        domain={domain}
                        client={client}
                        showToast={showToast}
                        onDelete={async (id) => {
                             // Optimistic update
                             const previousUrls = [...urls];
                             setUrls(prev => prev.filter(u => u.id !== id));

                             try {
                                await client.models.Url.delete({ id }, { authMode: 'userPool' });
                                showToast("Link deleted", "success");
                            } catch(e) {
                                console.error("Delete error", e);
                                showToast("Delete failed", "error");
                                // Revert on failure
                                setUrls(previousUrls);
                            }
                        }}
                    />
                ))}
                </div>
                {/* Links Pagination */}
                {totalLinkPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
                        <button 
                            disabled={linksPage === 1}
                            onClick={() => setLinksPage(p => p - 1)}
                            style={{ padding: '0.5rem 1rem', cursor: linksPage === 1 ? 'default' : 'pointer', opacity: linksPage === 1 ? 0.5 : 1 }}
                        >
                            Previous
                        </button>
                        <span>Page {linksPage} of {totalLinkPages}</span>
                        <button 
                            disabled={linksPage === totalLinkPages}
                            onClick={() => setLinksPage(p => p + 1)}
                            style={{ padding: '0.5rem 1rem', cursor: linksPage === totalLinkPages ? 'default' : 'pointer', opacity: linksPage === totalLinkPages ? 0.5 : 1 }}
                        >
                            Next
                        </button>
                    </div>
                )}
              </>
            )}
          </section>
        )}
        </div>
      </div>
    </div>
  );
}



function LinkCard({ url, group, domain, client, showToast, onDelete }: { 
    url: any, 
    group?: any, 
    domain: string, 
    client: any, 
    showToast: (m: string, t: ToastType) => void,
    onDelete: (id: string) => void
}) {
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(url.originalUrl);

    // Helpers
    const isExpired = url.expiration && url.expiration * 1000 < Date.now();
    const fullShortLink = `${domain}/${url.shortCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullShortLink);
        showToast("Copied!", "success");
    };

    const handleSaveOriginal = async () => {
        if(!editValue.trim()) return;
        try {
            await client.models.Url.update({ id: url.id, originalUrl: editValue.trim() }, { authMode: 'userPool' });
            showToast("Updated Destination", "success");
            setIsEditing(false);
        } catch(e) {
            showToast("Update failed", "error");
        }
    };

    return (
        <div className="link-card">
            
            <div className="link-card-inner">
                
                {/* --- LEFT SECTION: Links --- */}
                <div className="lc-section-left">
                    
                    {/* Short Link */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                         <a href={fullShortLink} target="_blank" rel="noopener noreferrer" className="lc-short-link">
                            {fullShortLink.replace(/^https?:\/\//, '')}
                        </a>
                        <button 
                            onClick={handleCopy}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600, color: '#475569', height: 'fit-content' }}
                        >
                            Copy
                        </button>
                    </div>

                    {/* Original URL */}
                    <div className="lc-original-url">
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <input value={editValue} onChange={e => setEditValue(e.target.value)} className="input-base" style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%' }} />
                                <button onClick={handleSaveOriginal} style={{ color: 'white', background: '#0f766e', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>Save</button>
                                <button onClick={() => setIsEditing(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>X</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                 <span style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }} title={url.originalUrl}>
                                    {url.originalUrl}
                                 </span>
                                 <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--color-teal-600)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}>Edit</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MIDDLE SECTION: Meta (Group, Desc, Dates) --- */}
                <div className="lc-section-middle">
                    
                    {/* Top: Dates */}
                    <div className="lc-meta-date">
                        <span title={new Date(url.createdAt).toLocaleString()}>
                            Created: {new Date(url.createdAt).toLocaleDateString()}
                        </span>
                        {url.expiration && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isExpired ? '#ef4444' : '#94a3b8' }}>
                                {isExpired && <span>⚠️</span>}
                                Expires: {new Date(url.expiration * 1000).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    {/* Bottom: Group & Description */}
                    <div className="lc-meta-group">
                        {group && (
                            <span className="lc-group-tag">
                                {group.name}
                            </span>
                        )}
                        {url.description && (
                            <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>
                                {url.description}
                            </span>
                        )}
                    </div>

                </div>

                {/* --- RIGHT SECTION: Actions --- */}
                <div className="lc-section-right">
                    
                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                         <span className="lc-clicks-label">Clicks</span>
                         <div className="lc-clicks-value">{url.clicks}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button 
                            onClick={() => setIsQrOpen(!isQrOpen)}
                            style={{ background: isQrOpen ? '#f0fdfa' : 'white', border: '1px solid #ccfbf1', color: '#0f766e', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                             {isQrOpen ? 'Hide QR' : 'Show QR'}
                        </button>
                        
                        <button 
                            onClick={() => onDelete(url.id)}
                            style={{ background: '#fff1f2', border: '1px solid #ffe4e6', color: '#e11d48', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Delete
                        </button>
                    </div>

                </div>

            </div>
            
            {/* Expanded QR */}
            {isQrOpen && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '150px', height: '150px', background: 'white', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <QrDisplay url={fullShortLink} />
                    </div>
                    <div>
                         <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', margin: '0 0 0.5rem 0' }}>QR Code</h4>
                         <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            Scan to visit <br/> <strong>{fullShortLink.replace(/^https?:\/\//, '')}</strong>
                         </div>
                         <DownloadQrBtn url={fullShortLink} filename={`qr-${url.shortCode}.png`} />
                    </div>
                </div>
            )}
        </div>
    );
}

function QrDisplay({ url }: { url: string }) {
    const [src, setSrc] = useState<string>('');
    
    useEffect(() => {
        QRCode.toDataURL(url, { width: 400, margin: 2 })
            .then(setSrc)
            .catch(err => console.error("QR Gen Error", err));
    }, [url]);

    if (!src) return <div style={{ color: '#94a3b8' }}>Generating...</div>;

    return <img src={src} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
}

function DownloadQrBtn({ url, filename }: { url: string, filename: string }) {
    const download = async () => {
        try {
            const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch(e) { console.error(e); }
    };
    return (
        <button onClick={download} style={{ display: 'inline-block', background: '#0f766e', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
             Download PNG
        </button>
    );
}
