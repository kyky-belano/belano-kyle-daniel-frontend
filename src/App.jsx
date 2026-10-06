import React, { useState, useEffect, useMemo } from 'react';
import api from './api';
import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  X, 
  LayoutGrid, 
  List, 
  SlidersHorizontal, 
  Sparkles, 
  PackageCheck, 
  AlertTriangle, 
  PackageX, 
  User, 
  Users, 
  ExternalLink, 
  RefreshCw, 
  Database, 
  TrendingUp, 
  Box, 
  Key, 
  Check,
  Zap,
  ArrowRight,
  HardDrive
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleAuthLogout = () => {
      setToken(null);
      setCurrentUser(null);
    };
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, []);

  const handleLoginSuccess = (accessToken, refreshToken, user) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    setToken(accessToken);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/api/auth/logout', { refresh_token: refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setToken(null);
      setCurrentUser(null);
    }
  };

  if (!token) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <MainCockpit 
      user={currentUser} 
      onLogout={handleLogout} 
    />
  );
}

// -------------------------------------------------------------
// 1. LOGIN SCREEN: Futuristic Cyber-Chassis (Centered Matrix Box)
// -------------------------------------------------------------
function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide your credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { username: username.trim(), password });
      if (res.data.status === 'success' || res.data.access_token) {
        onLoginSuccess(
          res.data.access_token, 
          res.data.refresh_token, 
          res.data.user || { username }
        );
      } else {
        setError('Authorization rejected. Verify credentials.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-login-wrapper">
      <div className="login-ambient-glow" />
      <div className="login-matrix-chassis">
        {/* Header / Brand Badge */}
        <div className="login-brand-header">
          <div className="login-chip-icon">
            <Cpu size={32} strokeWidth={2.2} />
          </div>
          <h1 className="login-brand-title">KDB NEXUS</h1>
          <p className="login-brand-sub">Hardware Matrix & API Console</p>
          <div className="login-student-tag">Kyle Daniel Belano • BSIT 3-F2</div>
        </div>

        {error && (
          <div className="cyber-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="cyber-form">
          <div className="cyber-input-group">
            <label>OPERATOR IDENTIFIER</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input 
                type="text" 
                placeholder="Enter username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="cyber-input-group">
            <label>ACCESS SECURITY KEY</label>
            <div className="input-with-icon">
              <Key size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-cyber-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin-icon" />
                <span>Verifying Signature...</span>
              </>
            ) : (
              <>
                <span>Initialize Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="login-security-footer">
          <div className="security-pill">
            <ShieldCheck size={13} />
            <span>AES-256 JWT</span>
          </div>
          <div className="security-pill">
            <Zap size={13} />
            <span>LavaLust v4</span>
          </div>
          <div className="security-pill">
            <Terminal size={13} />
            <span>REST API</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. MAIN COCKPIT DASHBOARD (Top Nav Workspace Architecture)
// -------------------------------------------------------------
function MainCockpit({ user, onLogout }) {
  // Navigation active tab: 'products' | 'users' | 'profile'
  const [activeTab, setActiveTab] = useState('products');

  // Product state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('id-asc');

  // Modals state
  const [productModalMode, setProductModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userModalMode, setUserModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // Student Profile state
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/products');
      const list = res.data?.data || res.data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      showToast('Failed to load products from API', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get('/api/users');
      const list = res.data?.data || res.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      showToast('Failed to load user accounts', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Student Profile
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get('/api/student/profile');
      setProfile(res.data?.data || res.data);
    } catch (err) {
      try {
        const fallback = await api.get('/student/profile');
        setProfile(fallback.data?.data || fallback.data);
      } catch (e2) {
        console.error('Failed to fetch profile:', e2);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchProfile();
  }, []);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    
    let result = products.filter(p => {
      const matchSearch = p.product_name?.toLowerCase().includes(q) || 
                          p.description?.toLowerCase().includes(q);
      if (!matchSearch) return false;

      const qty = parseInt(p.quantity, 10) || 0;
      if (activeFilter === 'in_stock') return qty > 10;
      if (activeFilter === 'low_stock') return qty > 0 && qty <= 10;
      if (activeFilter === 'out_of_stock') return qty === 0;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'id-asc') return (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0);
      if (sortBy === 'id-desc') return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0);
      if (sortBy === 'price-asc') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      if (sortBy === 'price-desc') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      if (sortBy === 'name-asc') return (a.product_name || '').localeCompare(b.product_name || '');
      if (sortBy === 'stock-desc') return (parseInt(b.quantity, 10) || 0) - (parseInt(a.quantity, 10) || 0);
      return 0;
    });

    return result;
  }, [products, search, activeFilter, sortBy]);

  // Metric counts
  const metrics = useMemo(() => {
    const totalQty = products.reduce((acc, p) => acc + (parseInt(p.quantity, 10) || 0), 0);
    const totalVal = products.reduce((acc, p) => acc + ((parseFloat(p.price) || 0) * (parseInt(p.quantity, 10) || 0)), 0);
    const inStock = products.filter(p => (parseInt(p.quantity, 10) || 0) > 10).length;
    const lowStock = products.filter(p => {
      const q = parseInt(p.quantity, 10) || 0;
      return q > 0 && q <= 10;
    }).length;
    const depleted = products.filter(p => (parseInt(p.quantity, 10) || 0) === 0).length;

    return {
      totalItems: products.length,
      totalUnits: totalQty,
      valuation: totalVal,
      inStock,
      lowStock,
      depleted
    };
  }, [products]);

  // Product CRUD Handlers
  const handleSaveProduct = async (formData) => {
    try {
      if (productModalMode === 'create') {
        const res = await api.post('/api/products', formData);
        showToast(res.data?.message || 'Hardware deployed to inventory!');
      } else if (productModalMode === 'edit' && selectedProduct) {
        const res = await api.put(`/api/products/${selectedProduct.id}`, formData);
        showToast(res.data?.message || 'Hardware specifications updated!');
      }
      setProductModalMode(null);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to save product';
      showToast(msg, 'error');
    }
  };

  const handleDeleteProductConfirm = async () => {
    if (!deleteProduct) return;
    try {
      await api.delete(`/api/products/${deleteProduct.id}`);
      showToast('Hardware record decommissioned');
      setDeleteProduct(null);
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  // User CRUD Handlers
  const handleSaveUser = async (formData) => {
    try {
      if (userModalMode === 'create') {
        const res = await api.post('/api/users', formData);
        showToast(res.data?.message || 'Operator account created!');
      } else if (userModalMode === 'edit' && selectedUser) {
        const res = await api.put(`/api/users/${selectedUser.id}`, formData);
        showToast(res.data?.message || 'Operator account updated!');
      }
      setUserModalMode(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to save user';
      showToast(msg, 'error');
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!deleteUser) return;
    try {
      await api.delete(`/api/users/${deleteUser.id}`);
      showToast('Operator account revoked');
      setDeleteUser(null);
      fetchUsers();
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  return (
    <div className="cockpit-root">
      {/* Toast popup */}
      {toast && (
        <div className={`cyber-toast ${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="cockpit-nav-header">
        <div className="nav-container">
          {/* Brand identifier */}
          <div className="nav-brand">
            <div className="brand-hexagon">
              <Cpu size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-title">KDB NEXUS</span>
              <span className="brand-meta">Hardware Architecture Core</span>
            </div>
          </div>

          {/* Centered Segmented Navigation */}
          <nav className="nav-tab-strip">
            <button 
              className={`nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <HardDrive size={16} />
              <span>Hardware Matrix</span>
              <span className="tab-badge">{products.length}</span>
            </button>

            <button 
              className={`nav-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('users');
                fetchUsers();
              }}
            >
              <Users size={16} />
              <span>Access Directory</span>
              <span className="tab-badge">{users.length}</span>
            </button>

            <button 
              className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profile');
                fetchProfile();
              }}
            >
              <Terminal size={16} />
              <span>Student Dossier</span>
            </button>
          </nav>

          {/* Right Status & Controls */}
          <div className="nav-status-cluster">
            <div className="api-live-pill" title="LavaLust REST Engine">
              <span className="pulse-dot" />
              <span>PORT 3000 ACTIVE</span>
            </div>

            <div className="operator-chip">
              <div className="operator-avatar">
                {(user?.username?.[0] || 'K').toUpperCase()}
              </div>
              <div className="operator-info">
                <span className="op-name">{user?.username || 'admin'}</span>
                <span className="op-role">ROOT SYS</span>
              </div>
            </div>

            <button onClick={onLogout} className="btn-cockpit-logout" title="Terminate Session">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="cockpit-content-wrap">
        {/* TAB 1: PRODUCTS / HARDWARE MATRIX */}
        {activeTab === 'products' && (
          <div className="tab-view-content">
            {/* System Metrics Strip */}
            <section className="metrics-grid">
              <div className="metric-cell">
                <div className="metric-header">
                  <span className="metric-label">TOTAL REPOSITORY UNITS</span>
                  <Box size={16} className="metric-icon cyan" />
                </div>
                <div className="metric-value-row">
                  <span className="metric-number">{metrics.totalItems}</span>
                  <span className="metric-sub">({metrics.totalUnits} Units in stock)</span>
                </div>
                <div className="metric-footer-bar cyan" style={{ width: '100%' }} />
              </div>

              <div className="metric-cell">
                <div className="metric-header">
                  <span className="metric-label">INVENTORY VALUATION</span>
                  <TrendingUp size={16} className="metric-icon emerald" />
                </div>
                <div className="metric-value-row">
                  <span className="metric-number emerald">₱{metrics.valuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="metric-footer-bar emerald" style={{ width: '85%' }} />
              </div>

              <div className="metric-cell">
                <div className="metric-header">
                  <span className="metric-label">OPERATIONAL READINESS</span>
                  <PackageCheck size={16} className="metric-icon blue" />
                </div>
                <div className="metric-value-row">
                  <span className="metric-number">{metrics.inStock}</span>
                  <span className="metric-sub">Ready to deploy</span>
                </div>
                <div className="metric-footer-bar blue" style={{ width: `${Math.min(100, Math.round((metrics.inStock / (metrics.totalItems || 1)) * 100))}%` }} />
              </div>

              <div className="metric-cell">
                <div className="metric-header">
                  <span className="metric-label">CRITICAL ATTENTION</span>
                  <AlertTriangle size={16} className="metric-icon amber" />
                </div>
                <div className="metric-value-row">
                  <span className="metric-number amber">{metrics.lowStock + metrics.depleted}</span>
                  <span className="metric-sub">{metrics.lowStock} low · {metrics.depleted} zero</span>
                </div>
                <div className="metric-footer-bar amber" style={{ width: '40%' }} />
              </div>
            </section>

            {/* Command Dock Toolbar */}
            <section className="command-dock">
              {/* Left: Filter Pills */}
              <div className="filter-pills-row">
                <button 
                  className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  <span>All Hardware</span>
                  <span className="pill-count">{metrics.totalItems}</span>
                </button>
                <button 
                  className={`filter-pill-btn ${activeFilter === 'in_stock' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('in_stock')}
                >
                  <span>In Stock</span>
                  <span className="pill-count">{metrics.inStock}</span>
                </button>
                <button 
                  className={`filter-pill-btn ${activeFilter === 'low_stock' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('low_stock')}
                >
                  <span>Low Reserve</span>
                  <span className="pill-count warning">{metrics.lowStock}</span>
                </button>
                <button 
                  className={`filter-pill-btn ${activeFilter === 'out_of_stock' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('out_of_stock')}
                >
                  <span>Depleted</span>
                  <span className="pill-count danger">{metrics.depleted}</span>
                </button>
              </div>

              {/* Right: Search, Sort, View, Action */}
              <div className="command-actions-cluster">
                <div className="cyber-search-box">
                  <Search size={15} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search hardware by specs or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="search-clear">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="cyber-sort-wrapper">
                  <SlidersHorizontal size={14} className="sort-icon" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="id-asc">SKU Order (Asc)</option>
                    <option value="id-desc">SKU Order (Desc)</option>
                    <option value="price-asc">Price (Low → High)</option>
                    <option value="price-desc">Price (High → Low)</option>
                    <option value="name-asc">Title (A → Z)</option>
                    <option value="stock-desc">Stock (Highest)</option>
                  </select>
                </div>

                <div className="view-mode-toggle">
                  <button 
                    className={`btn-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid Tiles"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Data Table"
                  >
                    <List size={16} />
                  </button>
                </div>

                <button 
                  className="btn-cyber-primary"
                  onClick={() => {
                    setSelectedProduct(null);
                    setProductModalMode('create');
                  }}
                >
                  <Plus size={16} />
                  <span>Deploy Hardware</span>
                </button>
              </div>
            </section>

            {/* Product Rendering */}
            {loading ? (
              <div className="matrix-empty-state">
                <RefreshCw size={28} className="spin-icon cyan" />
                <p>Synchronizing Hardware Matrix...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="matrix-empty-state">
                <Box size={36} />
                <p>No hardware records match the specified query.</p>
                <button onClick={() => { setSearch(''); setActiveFilter('all'); }} className="btn-cyber-secondary">
                  Reset Parameters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID TILES VIEW */
              <div className="hardware-grid">
                {filteredProducts.map((p) => {
                  const qty = parseInt(p.quantity, 10) || 0;
                  const price = parseFloat(p.price) || 0;
                  const stockStatus = qty === 0 ? 'out' : qty <= 10 ? 'low' : 'ok';

                  return (
                    <article key={p.id} className="hardware-card">
                      <div className="card-top-header">
                        <span className="sku-tag">#HW-{String(p.id).padStart(4, '0')}</span>
                        <span className={`status-pill ${stockStatus}`}>
                          {stockStatus === 'ok' && 'In Stock'}
                          {stockStatus === 'low' && 'Low Stock'}
                          {stockStatus === 'out' && 'Out of Stock'}
                        </span>
                      </div>

                      <div className="card-body">
                        <h3 className="card-title">{p.product_name}</h3>
                        <p className="card-desc">{p.description || 'Enterprise hardware unit verified for deployment.'}</p>
                      </div>

                      <div className="card-specs-strip">
                        <div className="spec-item">
                          <span className="spec-label">VALUATION</span>
                          <span className="spec-val price">₱{price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">INVENTORY LEVEL</span>
                          <span className="spec-val qty">{qty} units</span>
                        </div>
                      </div>

                      {/* Stock Level Progress Visual */}
                      <div className="stock-visual-bar">
                        <div 
                          className={`stock-visual-fill ${stockStatus}`} 
                          style={{ width: `${Math.min(100, Math.max(5, (qty / 30) * 100))}%` }} 
                        />
                      </div>

                      <div className="card-actions-dock">
                        <button 
                          className="btn-card-action edit"
                          onClick={() => {
                            setSelectedProduct(p);
                            setProductModalMode('edit');
                          }}
                        >
                          <Edit3 size={14} />
                          <span>Edit Specs</span>
                        </button>
                        <button 
                          className="btn-card-action delete"
                          onClick={() => setDeleteProduct(p)}
                          title="Decommission item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* DATA TABLE VIEW */
              <div className="matrix-table-card">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '90px' }}>SKU</th>
                      <th>HARDWARE SPECIFICATION</th>
                      <th style={{ width: '160px' }}>VALUATION</th>
                      <th style={{ width: '180px' }}>STOCK RESERVE</th>
                      <th style={{ width: '120px' }}>STATUS</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>OPERATIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const qty = parseInt(p.quantity, 10) || 0;
                      const price = parseFloat(p.price) || 0;
                      const stockStatus = qty === 0 ? 'out' : qty <= 10 ? 'low' : 'ok';

                      return (
                        <tr key={p.id}>
                          <td>
                            <span className="sku-tag">#HW-{String(p.id).padStart(4, '0')}</span>
                          </td>
                          <td>
                            <div className="table-product-cell">
                              <span className="table-prod-name">{p.product_name}</span>
                              <span className="table-prod-desc">{p.description}</span>
                            </div>
                          </td>
                          <td>
                            <span className="table-price">₱{price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </td>
                          <td>
                            <div className="table-stock-cell">
                              <span>{qty} units</span>
                              <div className="table-stock-bar">
                                <div className={`stock-visual-fill ${stockStatus}`} style={{ width: `${Math.min(100, (qty / 30) * 100)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${stockStatus}`}>
                              {stockStatus === 'ok' && 'Operational'}
                              {stockStatus === 'low' && 'Low Reserve'}
                              {stockStatus === 'out' && 'Depleted'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-cluster">
                              <button 
                                className="table-btn-icon edit" 
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setProductModalMode('edit');
                                }}
                                title="Edit specs"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button 
                                className="table-btn-icon delete" 
                                onClick={() => setDeleteProduct(p)}
                                title="Decommission"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACCESS DIRECTORY (USERS MANAGEMENT) */}
        {activeTab === 'users' && (
          <div className="tab-view-content">
            <div className="tab-header-banner">
              <div>
                <h2 className="banner-title">Security Access Directory</h2>
                <p className="banner-sub">Database Operators & System User Accounts (`/api/users`)</p>
              </div>
              <button 
                className="btn-cyber-primary"
                onClick={() => {
                  setSelectedUser(null);
                  setUserModalMode('create');
                }}
              >
                <Plus size={16} />
                <span>Register Operator</span>
              </button>
            </div>

            {loadingUsers ? (
              <div className="matrix-empty-state">
                <RefreshCw size={28} className="spin-icon cyan" />
                <p>Loading operator credentials...</p>
              </div>
            ) : (
              <div className="matrix-table-card">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>UID</th>
                      <th>USERNAME</th>
                      <th>ROLE AUTHORIZATION</th>
                      <th>CREATED TIMESTAMP</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <span className="sku-tag">#{String(u.id).padStart(3, '0')}</span>
                        </td>
                        <td>
                          <div className="user-table-cell">
                            <div className="user-circle">
                              {(u.username?.[0] || 'U').toUpperCase()}
                            </div>
                            <span className="user-name-text">{u.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'operator'}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td>
                          <span className="timestamp-text">{u.created_at || 'Database Record'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions-cluster">
                            <button 
                              className="table-btn-icon edit" 
                              onClick={() => {
                                setSelectedUser(u);
                                setUserModalMode('edit');
                              }}
                              title="Edit user"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button 
                              className="table-btn-icon delete" 
                              onClick={() => setDeleteUser(u)}
                              title="Revoke user"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STUDENT DOSSIER (KYLE DANIEL BELANO) */}
        {activeTab === 'profile' && (
          <div className="tab-view-content">
            <div className="dossier-grid">
              {/* Profile Card */}
              <div className="dossier-card primary">
                <div className="dossier-header">
                  <div className="dossier-avatar">
                    <span className="avatar-letters">KD</span>
                  </div>
                  <div className="dossier-title-block">
                    <div className="status-indicator">
                      <span className="pulse-dot green" />
                      <span>AUTHENTICATED STUDENT DOSSIER</span>
                    </div>
                    <h2 className="dossier-name">{profile?.name || 'Kyle Daniel Belano'}</h2>
                    <span className="dossier-id">{profile?.student_id || 'MCC2024-00068'}</span>
                  </div>
                </div>

                <div className="dossier-data-grid">
                  <div className="data-box">
                    <span className="data-label">DEGREE & SECTION</span>
                    <span className="data-val">{profile?.section || 'BSIT-3-F2'}</span>
                  </div>
                  <div className="data-box">
                    <span className="data-label">ACADEMIC INSTITUTION</span>
                    <span className="data-val">{profile?.institution || 'Mindoro State University (MinSU)'}</span>
                  </div>
                  <div className="data-box">
                    <span className="data-label">CAMPUS</span>
                    <span className="data-val">{profile?.campus || 'Calapan City Campus'}</span>
                  </div>
                  <div className="data-box">
                    <span className="data-label">COURSE CODE</span>
                    <span className="data-val">IT321 - Web Systems & Tech 2</span>
                  </div>
                </div>

                <div className="dossier-footer">
                  <button onClick={fetchProfile} className="btn-cyber-secondary" disabled={loadingProfile}>
                    <RefreshCw size={14} className={loadingProfile ? 'spin-icon' : ''} />
                    <span>Ping Endpoint `/student/profile`</span>
                  </button>
                  <span className="endpoint-tag">LavaLust AuthApiController</span>
                </div>
              </div>

              {/* API Diagnostics Console */}
              <div className="dossier-card secondary">
                <div className="console-header">
                  <Terminal size={16} />
                  <span>LIVE API RESPONSE INSPECTOR</span>
                </div>
                <div className="console-body">
                  <pre className="code-block">
                    {JSON.stringify(profile || { status: 'loading' }, null, 2)}
                  </pre>
                </div>
                <div className="console-footer">
                  <span>JWT Token Verification:</span>
                  <span className="token-ok">VALID & ENCRYPTED</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------
          MODALS
      ------------------------------------------------------------- */}

      {/* PRODUCT CREATE / EDIT MODAL */}
      {productModalMode && (
        <ProductModal 
          mode={productModalMode} 
          product={selectedProduct} 
          onSave={handleSaveProduct} 
          onClose={() => setProductModalMode(null)} 
        />
      )}

      {/* PRODUCT DELETE CONFIRMATION MODAL */}
      {deleteProduct && (
        <ConfirmModal 
          title="Decommission Hardware"
          message={`Are you sure you want to permanently remove "${deleteProduct.product_name}" from the repository?`}
          onConfirm={handleDeleteProductConfirm}
          onCancel={() => setDeleteProduct(null)}
          confirmText="Confirm Deletion"
        />
      )}

      {/* USER CREATE / EDIT MODAL */}
      {userModalMode && (
        <UserModal 
          mode={userModalMode} 
          user={selectedUser} 
          onSave={handleSaveUser} 
          onClose={() => setUserModalMode(null)} 
        />
      )}

      {/* USER DELETE CONFIRMATION MODAL */}
      {deleteUser && (
        <ConfirmModal 
          title="Revoke Operator Access"
          message={`Are you sure you want to revoke database account for operator "${deleteUser.username}"?`}
          onConfirm={handleDeleteUserConfirm}
          onCancel={() => setDeleteUser(null)}
          confirmText="Revoke Access"
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// PRODUCT MODAL
// -------------------------------------------------------------
function ProductModal({ mode, product, onSave, onClose }) {
  const [name, setName] = useState(product?.product_name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || '');
  const [quantity, setQuantity] = useState(product?.quantity || '');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr('Hardware name is required.');
      return;
    }
    setSubmitting(true);
    await onSave({
      product_name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity, 10) || 0
    });
    setSubmitting(false);
  };

  return (
    <div className="cyber-modal-overlay">
      <div className="cyber-modal-dialog">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Cpu size={20} className="modal-icon cyan" />
            <h3>{mode === 'create' ? 'Deploy New Hardware' : 'Update Specifications'}</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn"><X size={18} /></button>
        </div>

        {err && <div className="cyber-alert error">{err}</div>}

        <form onSubmit={handleSubmit} className="cyber-form modal-body">
          <div className="cyber-input-group">
            <label>HARDWARE NAME</label>
            <input 
              type="text" 
              placeholder="e.g., ASUS ROG Matrix Platinum RTX 4090"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              autoFocus
            />
          </div>

          <div className="cyber-input-group">
            <label>TECHNICAL SPECIFICATIONS / DESCRIPTION</label>
            <textarea 
              rows={3} 
              placeholder="Enter technical details, performance specs, chipset, etc."
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <div className="form-row-two">
            <div className="cyber-input-group">
              <label>VALUATION (PHP ₱)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0.00"
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
              />
            </div>

            <div className="cyber-input-group">
              <label>INVENTORY QUANTITY</label>
              <input 
                type="number" 
                min="0"
                placeholder="0"
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn-cyber-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-cyber-primary" disabled={submitting}>
              {submitting ? 'Writing to DB...' : mode === 'create' ? 'Deploy to Catalog' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// USER MODAL
// -------------------------------------------------------------
function UserModal({ mode, user, onSave, onClose }) {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'user');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErr('Username is required.');
      return;
    }
    setSubmitting(true);
    const payload = {
      username: username.trim(),
      email: email.trim() || `${username.trim()}@minsu.edu.ph`,
      role: role
    };
    if (password) {
      payload.password = password;
    }
    await onSave(payload);
    setSubmitting(false);
  };

  return (
    <div className="cyber-modal-overlay">
      <div className="cyber-modal-dialog">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <User size={20} className="modal-icon cyan" />
            <h3>{mode === 'create' ? 'Register New Operator' : 'Modify Operator Profile'}</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn"><X size={18} /></button>
        </div>

        {err && <div className="cyber-alert error">{err}</div>}

        <form onSubmit={handleSubmit} className="cyber-form modal-body">
          <div className="cyber-input-group">
            <label>OPERATOR USERNAME</label>
            <input 
              type="text" 
              placeholder="Username identifier"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              autoFocus
            />
          </div>

          <div className="cyber-input-group">
            <label>SECURITY ROLE</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Standard Operator (user)</option>
              <option value="admin">System Administrator (admin)</option>
            </select>
          </div>

          <div className="cyber-input-group">
            <label>{mode === 'create' ? 'AUTHENTICATION PASSWORD' : 'NEW PASSWORD (OPTIONAL)'}</label>
            <input 
              type="password" 
              placeholder={mode === 'create' ? 'Set security password' : 'Leave empty to retain existing'}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required={mode === 'create'}
            />
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn-cyber-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-cyber-primary" disabled={submitting}>
              {submitting ? 'Writing to DB...' : mode === 'create' ? 'Register Account' : 'Commit Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CONFIRM DIALOG
// -------------------------------------------------------------
function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Confirm' }) {
  return (
    <div className="cyber-modal-overlay">
      <div className="cyber-modal-dialog alert">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <AlertTriangle size={20} className="modal-icon danger" />
            <h3>{title}</h3>
          </div>
          <button onClick={onCancel} className="modal-close-btn"><X size={18} /></button>
        </div>

        <div className="modal-body">
          <p className="confirm-message">{message}</p>
        </div>

        <div className="modal-actions-footer">
          <button type="button" onClick={onCancel} className="btn-cyber-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-cyber-danger">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
