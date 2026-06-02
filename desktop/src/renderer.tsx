import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Client-side simulated license grace check
// In a full implementation, this calls window.electron.checkLicense()
interface LicenseState {
  isValid: boolean;
  daysRemaining: number;
  gracePeriodActive: boolean;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'Owner' | 'Manager' | 'Cashier' | 'Accountant'>('Cashier');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Licensing mock state for offline 7 days grace validation
  const [license, setLicense] = useState<LicenseState>({
    isValid: true,
    daysRemaining: 7,
    gracePeriodActive: true
  });

  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'batches' | 'license'>('pos');

  // Handle local state or simulate grace period countdown
  useEffect(() => {
    // Check if grace period is expiring
    const timer = setTimeout(() => {
      // Simulate real-time license updates
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    // Perform authentication
    if (username === 'cashier' && password === 'password') {
      setIsAuthenticated(true);
      setRole('Cashier');
      setError('');
    } else if (username === 'owner' && password === 'owner123') {
      setIsAuthenticated(true);
      setRole('Owner');
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  if (!license.isValid && license.daysRemaining <= 0) {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <div className="lock-icon">🔒</div>
          <h2>SOFTWARE LOCKED</h2>
          <p>Your subscription has expired, and the grace period has ended.</p>
          <div className="store-id-badge">Store ID: STORE001</div>
          <button className="btn-primary" onClick={() => alert('Please connect to the internet to activate.')}>
            Retry Activation
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-placeholder">MediCore ERP</div>
          <h2>Sign In to Store App</h2>
          <p className="subtitle">Enter your username and password below</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                placeholder="e.g. owner or cashier" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary btn-block">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Store Header */}
      <header className="app-header">
        <div className="store-info">
          <div className="store-logo">M</div>
          <div>
            <h1>FAAKHIR PHARMACY</h1>
            <p className="store-meta">NTN: 1234567-8 | STRN: 9876543-2 | Branch: Karachi</p>
          </div>
        </div>
        <div className="user-profile">
          <span className="role-tag">{role}</span>
          <span className="username">Welcome, {username}</span>
          <button className="btn-secondary btn-sm" onClick={() => setIsAuthenticated(false)}>Logout</button>
        </div>
      </header>

      {/* Main Container */}
      <div className="main-content">
        <aside className="sidebar">
          <nav>
            <button 
              className={`nav-item ${activeTab === 'pos' ? 'active' : ''}`}
              onClick={() => setActiveTab('pos')}
            >
              🛒 Sales POS
            </button>
            <button 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Products
            </button>
            <button 
              className={`nav-item ${activeTab === 'batches' ? 'active' : ''}`}
              onClick={() => setActiveTab('batches')}
            >
              ⏳ Batches & Expiry
            </button>
            <button 
              className={`nav-item ${activeTab === 'license' ? 'active' : ''}`}
              onClick={() => setActiveTab('license')}
            >
              🔑 License Details
            </button>
          </nav>
          {license.gracePeriodActive && (
            <div className="offline-warning">
              ⚠️ Offline Mode. License validity expires in {license.daysRemaining} days.
            </div>
          )}
        </aside>

        <main className="view-panel">
          {activeTab === 'pos' && (
            <div className="pos-screen">
              <h2>Point of Sale</h2>
              <div className="pos-grid">
                <div className="pos-billing">
                  <div className="search-bar">
                    <input type="text" placeholder="Scan Barcode or Search Product..." />
                  </div>
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Batch</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Panadol Extra</td>
                        <td>PAN001 (Expiry: 2027)</td>
                        <td>2</td>
                        <td>Rs 15</td>
                        <td>Rs 30</td>
                        <td><button className="btn-danger btn-xs">Remove</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="pos-summary">
                  <h3>Checkout Summary</h3>
                  <div className="summary-row"><span>Subtotal:</span><span>Rs 30</span></div>
                  <div className="summary-row"><span>Tax (15%):</span><span>Rs 4.5</span></div>
                  <div className="summary-row"><span>Discount:</span><span>Rs 0</span></div>
                  <hr />
                  <div className="summary-row total"><span>Total:</span><span>Rs 34.5</span></div>
                  <button className="btn-primary btn-block btn-lg" onClick={() => alert('Receipt Printed!')}>
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-screen">
              <div className="screen-header">
                <h2>Product Directory</h2>
                <button className="btn-primary">+ Add Product</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Barcode</th>
                    <th>Category</th>
                    <th>Price (Purchase/Sale)</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Panadol Extra</td>
                    <td>PAN001</td>
                    <td>123456</td>
                    <td>Analgesics</td>
                    <td>Rs 10 / Rs 15</td>
                    <td>150 Units</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="batches-screen">
              <h2>Medicine Batch System (FIFO)</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Batch ID</th>
                    <th>Expiry Date</th>
                    <th>Quantity Available</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="danger">
                    <td>Panadol Extra</td>
                    <td>Batch A</td>
                    <td>30-Jun-2026</td>
                    <td>50 Units</td>
                    <td><span className="badge badge-danger">Expiring (27 days left)</span></td>
                  </tr>
                  <tr>
                    <td>Panadol Extra</td>
                    <td>Batch B</td>
                    <td>31-Dec-2028</td>
                    <td>100 Units</td>
                    <td><span className="badge badge-success">Good</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'license' && (
            <div className="license-screen">
              <h2>Subscription & License Status</h2>
              <div className="license-card">
                <div className="license-row"><span>Store ID:</span><strong>STORE001</strong></div>
                <div className="license-row"><span>License Status:</span><span className="badge badge-success">ACTIVE</span></div>
                <div className="license-row"><span>Plan:</span><strong>Professional</strong></div>
                <div className="license-row"><span>Expires On:</span><strong>01-Jul-2026</strong></div>
                <div className="license-row"><span>Offline Grace Remaining:</span><strong>{license.daysRemaining} Days</strong></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
