'use client';

import React, { useState } from 'react';
import './globals.css';

interface StoreItem {
  id: string;
  name: string;
  ntn: string;
  strn: string;
  phone: string;
  address: string;
  status: 'Active' | 'Expired' | 'Suspended';
  plan: 'Basic' | 'Professional' | 'Enterprise';
  expiryDate: string;
  lastSeen: string;
  dbSize: string;
  version: string;
}

const BACKEND_URL = 'http://localhost:3001/api';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempToken, setTempToken] = useState('');

  // Notification input
  const [notificationType, setNotificationType] = useState('System Update');
  const [notificationMessage, setNotificationMessage] = useState('');

  // New Store Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreNtn, setNewStoreNtn] = useState('');
  const [newStoreStrn, setNewStoreStrn] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');

  // Sample data (mocked but integrates easily with GET /stores)
  const [stores, setStores] = useState<StoreItem[]>([
    {
      id: 'STORE001',
      name: 'Faakhir Pharmacy - Branch Karachi',
      ntn: '1234567-8',
      strn: '9876543-2',
      phone: '03001234567',
      address: 'DHA Phase 6, Karachi',
      status: 'Active',
      plan: 'Enterprise',
      expiryDate: '2026-07-01',
      lastSeen: '1 min ago',
      dbSize: '45 MB',
      version: 'v1.0.2',
    },
    {
      id: 'STORE002',
      name: 'Al-Shifa Medicos - Branch Lahore',
      ntn: '7654321-0',
      strn: '1122334-4',
      phone: '03217654321',
      address: 'Gulberg III, Lahore',
      status: 'Expired',
      plan: 'Basic',
      expiryDate: '2026-05-30',
      lastSeen: '3 days ago',
      dbSize: '12 MB',
      version: 'v1.0.0',
    },
    {
      id: 'STORE003',
      name: 'MediCare - Branch Hyderabad',
      ntn: '5566778-9',
      strn: '9988776-5',
      phone: '03339988776',
      address: 'Saddar, Hyderabad',
      status: 'Suspended',
      plan: 'Professional',
      expiryDate: '2026-12-15',
      lastSeen: '12 hours ago',
      dbSize: '28 MB',
      version: 'v1.0.1',
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { date: '03-Jun-2026 02:15 AM', admin: 'MYMN SAAB', action: 'Created Store', store: 'Faakhir Pharmacy', ip: '192.168.1.15' },
    { date: '03-Jun-2026 01:45 AM', admin: 'MYMN SAAB', action: 'Suspended Store', store: 'MediCare Hyderabad', ip: '192.168.1.15' },
    { date: '02-Jun-2026 11:20 PM', admin: 'MYMN SAAB', action: 'Viewed Revenue Reports', store: 'System-wide', ip: '192.168.1.15' },
  ]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter admin credentials');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed. Check credentials.');
      } else if (data.passwordChangeRequired) {
        setIsPasswordChangeRequired(true);
        setTempToken(data.access_token);
      } else {
        setTempToken(data.access_token);
        setIsAuthenticated(true);
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running on port 3001.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Password change failed.');
      } else {
        setIsPasswordChangeRequired(false);
        setIsAuthenticated(true);
        setError('');
        alert('Password updated successfully! Welcome MYMN SAAB.');
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName || !newStorePhone) {
      alert('Store Name and Phone are required.');
      return;
    }

    const newId = `STORE00${stores.length + 1}`;
    const newStore: StoreItem = {
      id: newId,
      name: newStoreName,
      ntn: newStoreNtn || 'N/A',
      strn: newStoreStrn || 'N/A',
      phone: newStorePhone,
      address: newStoreAddress || 'N/A',
      status: 'Active',
      plan: 'Basic',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastSeen: 'Just now',
      dbSize: '1 MB',
      version: 'v1.0.0',
    };

    setStores([...stores, newStore]);
    
    // Add to audit logs
    const log = {
      date: new Date().toLocaleString(),
      admin: 'MYMN SAAB',
      action: `Created Store ${newStoreName}`,
      store: newStoreName,
      ip: '127.0.0.1'
    };
    setAuditLogs([log, ...auditLogs]);

    setShowCreateModal(false);
    // Reset form
    setNewStoreName('');
    setNewStoreNtn('');
    setNewStoreStrn('');
    setNewStorePhone('');
    setNewStoreAddress('');
  };

  const handleSuspend = (id: string) => {
    setStores(stores.map(s => s.id === id ? { ...s, status: 'Suspended' } : s));
    const targetStore = stores.find(s => s.id === id);
    const log = {
      date: new Date().toLocaleString(),
      admin: 'MYMN SAAB',
      action: `Suspended Store ${targetStore?.name}`,
      store: targetStore?.name || 'N/A',
      ip: '127.0.0.1'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleActivate = (id: string) => {
    setStores(stores.map(s => s.id === id ? { ...s, status: 'Active' } : s));
    const targetStore = stores.find(s => s.id === id);
    const log = {
      date: new Date().toLocaleString(),
      admin: 'MYMN SAAB',
      action: `Activated Store ${targetStore?.name}`,
      store: targetStore?.name || 'N/A',
      ip: '127.0.0.1'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleRenew = (id: string) => {
    setStores(stores.map(s => {
      if (s.id === id) {
        const currentExp = new Date(s.expiryDate);
        const base = currentExp.getTime() < Date.now() ? new Date() : currentExp;
        base.setDate(base.getDate() + 30);
        return {
          ...s,
          status: 'Active',
          expiryDate: base.toISOString().split('T')[0]
        };
      }
      return s;
    }));
    const targetStore = stores.find(s => s.id === id);
    const log = {
      date: new Date().toLocaleString(),
      admin: 'MYMN SAAB',
      action: `Renewed Subscription Store ${targetStore?.name}`,
      store: targetStore?.name || 'N/A',
      ip: '127.0.0.1'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMessage) return;
    alert(`Broadcasted notification [${notificationType}]: "${notificationMessage}" to all stores!`);
    setNotificationMessage('');
  };

  // 1. First login / change password mandatory page
  if (isPasswordChangeRequired) {
    return (
      <div className="setup-container">
        <div className="setup-card">
          <div className="setup-title">
            <h2>MANDATORY PASSWORD CHANGE</h2>
            <p>Security Policy requires you to set a new password on your first login.</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>New Secure Password</label>
              <input 
                type="password" 
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary-glow btn-block">Update Password & Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Login screen
  if (!isAuthenticated) {
    return (
      <div className="setup-container">
        <div className="setup-card">
          <div className="setup-title">
            <h1 className="logo-placeholder">MYMN SAAB</h1>
            <p>SYSTEM ADMINISTRATOR SIGN IN</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Administrator Email</label>
              <input 
                type="email" 
                placeholder="admin@access.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Security Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn-primary-glow btn-block" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Main Dashboard UI
  return (
    <div>
      {/* Premium Dashboard Header */}
      <header className="admin-header">
        <div className="admin-header-box">
          ╔══════════════════════════════════════════════╗<br />
          ║                                              ║<br />
          ║                 MYMN SAAB                    ║<br />
          ║              SYSTEM ADMINISTRATOR            ║<br />
          ║                                              ║<br />
          ╚══════════════════════════════════════════════╝
        </div>
      </header>

      <div className="dashboard-container">
        <div className="admin-meta">
          <div>
            <h2>Operations Control Center</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time cluster and licenses monitor</p>
          </div>
          <div className="system-status">
            <span className="status-dot"></span>
            <span>All systems nominal | Server: Active</span>
            <button className="btn btn-danger btn-sm" style={{ width: 'auto', marginLeft: '1rem' }} onClick={() => setIsAuthenticated(false)}>Sign Out</button>
          </div>
        </div>

        {/* Create Store Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '2rem'
          }}>
            <div className="setup-card" style={{ maxWidth: '500px' }}>
              <div className="setup-title">
                <h2>Create New Client Store</h2>
                <p>Register new establishment license into cluster</p>
              </div>
              <form onSubmit={handleCreateStore}>
                <div className="form-group">
                  <label>Store Name</label>
                  <input type="text" placeholder="Faakhir Pharmacy Lahore" value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} required />
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>NTN Number</label>
                    <input type="text" placeholder="1234567-8" value={newStoreNtn} onChange={(e) => setNewStoreNtn(e.target.value)} />
                  </div>
                  <div>
                    <label>STRN Number</label>
                    <input type="text" placeholder="9876543-2" value={newStoreStrn} onChange={(e) => setNewStoreStrn(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input type="text" placeholder="e.g. 03001234567" value={newStorePhone} onChange={(e) => setNewStorePhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" placeholder="Street Address" value={newStoreAddress} onChange={(e) => setNewStoreAddress(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn-primary-glow btn-block">Generate Store License</button>
                  <button type="button" className="btn btn-block" onClick={() => setShowCreateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modules Grid */}
        <div className="modules-grid">
          
          {/* Module 1: Store Management */}
          <div className="module-card">
            <h3><span className="module-card-icon">🏢</span> Store Management</h3>
            <div className="stats-group">
              <div className="stat-item">
                <span className="stat-label">Total Stores</span>
                <span className="stat-value">{stores.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active</span>
                <span className="stat-value active">{stores.filter(s => s.status === 'Active').length}</span>
              </div>
            </div>
            <div className="stats-group" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-item">
                <span className="stat-label">Expired</span>
                <span className="stat-value danger">{stores.filter(s => s.status === 'Expired').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Suspended</span>
                <span className="stat-value suspended">{stores.filter(s => s.status === 'Suspended').length}</span>
              </div>
            </div>
            <div className="quick-actions">
              <button className="btn-primary-glow btn-block" onClick={() => setShowCreateModal(true)}>+ Register New Store</button>
            </div>
          </div>

          {/* Module 2: Live Monitoring */}
          <div className="module-card" style={{ gridColumn: 'span 2' }}>
            <h3><span className="module-card-icon">⚡</span> Live Client Cluster Monitoring</h3>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Store ID</th>
                  <th>Store Name</th>
                  <th>Plan</th>
                  <th>Last Seen</th>
                  <th>Sync Size</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.id}</strong></td>
                    <td>{s.name}</td>
                    <td><span className="role-tag" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>{s.plan}</span></td>
                    <td>{s.lastSeen}</td>
                    <td>{s.dbSize}</td>
                    <td>
                      <span className={`badge ${s.status === 'Active' ? 'badge-online' : 'badge-offline'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Module 3: Sales Overview */}
          <div className="module-card">
            <h3><span className="module-card-icon">📈</span> Revenue & Sales Overview</h3>
            <div className="stats-group">
              <div className="stat-item">
                <span className="stat-label">Today's Sales</span>
                <span className="stat-value">Rs 45,000</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Weekly Sales</span>
                <span className="stat-value">Rs 385,000</span>
              </div>
            </div>
            <div className="stats-group">
              <div className="stat-item">
                <span className="stat-label">Monthly Sales</span>
                <span className="stat-value">Rs 1,650,000</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Yearly Sales</span>
                <span className="stat-value">Rs 18.2M</span>
              </div>
            </div>
          </div>

          {/* Module 4: Subscription Center */}
          <div className="module-card" style={{ gridColumn: 'span 2' }}>
            <h3><span className="module-card-icon">💳</span> Subscription Center</h3>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Store ID</th>
                  <th>Current Plan</th>
                  <th>Expiry Date</th>
                  <th>Lic. Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.id}</strong></td>
                    <td>{s.plan}</td>
                    <td>{s.expiryDate}</td>
                    <td>
                      <span className={`badge ${s.status === 'Active' ? 'badge-online' : s.status === 'Suspended' ? 'badge-offline' : 'badge-danger'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-xs" onClick={() => handleRenew(s.id)}>Renew 30d</button>
                        {s.status === 'Active' ? (
                          <button className="btn btn-danger btn-xs" onClick={() => handleSuspend(s.id)}>Suspend</button>
                        ) : (
                          <button className="btn btn-xs" style={{ borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => handleActivate(s.id)}>Activate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Module 5: Notifications Panel */}
          <div className="module-card">
            <h3><span className="module-card-icon">📣</span> Broadcast System Alerts</h3>
            <form onSubmit={handleSendNotification}>
              <div className="form-group">
                <label>Alert Type</label>
                <select 
                  value={notificationType} 
                  onChange={(e) => setNotificationType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    backgroundColor: 'var(--bg-surface-light)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option>System Update</option>
                  <option>Subscription Reminder</option>
                  <option>Emergency Notice</option>
                </select>
              </div>
              <div className="form-group">
                <label>Alert Content</label>
                <input 
                  type="text" 
                  placeholder="Type alert broadcast message..." 
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary-glow btn-block">Broadcast Alert</button>
            </form>
          </div>

        </div>

        {/* System Audit Logs */}
        <div className="system-logs">
          <h3>🔐 Security & Administrative Audit Logs</h3>
          <div className="logs-window">
            {auditLogs.map((log, index) => (
              <div className="log-entry" key={index}>
                <span className="log-time">[{log.date}]</span>
                <span style={{ color: 'var(--primary)' }}>{log.admin}</span>
                <span className="log-action"> - {log.action} for </span>
                <strong style={{ color: 'white' }}>{log.store}</strong>
                <span style={{ float: 'right', color: 'var(--text-muted)' }}>IP: {log.ip}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
