import React from 'react';
import { Outlet, useNavigate, NavLink, Link } from 'react-router-dom';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { full_name: 'Kullanıcı' };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="app-layout">
            {/* Sidebar (Sol Menü) */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span style={{ color: 'var(--accent-color)', marginRight: '8px' }}>✦</span> FinansTakip
                </div>

                {/* Arama Çubuğu (PayPal Tarzı) */}
                <div style={{ padding: '0 1.5rem', marginTop: '1rem' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', background: '#F3F4F6',
                        borderRadius: '8px', padding: '0.6rem 1rem', color: '#9CA3AF', fontSize: '0.9rem'
                    }}>
                        🔍 <input type="text" placeholder="Search..." style={{ border: 'none', background: 'transparent', marginLeft: '8px', outline: 'none', width: '100%', fontFamily: 'inherit' }} />
                        <span style={{ fontSize: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '2px 4px' }}>⌘ K</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        🏠 Ana Panel
                    </NavLink>
                    <NavLink to="/dashboard/transactions" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        💸 Gelir / Gider
                    </NavLink>
                    <div className="nav-item">💎 Kategoriler</div>
                    <div className="nav-item">📈 Raporlar</div>
                    <div className="nav-item">⚙️ Ayarlar</div>

                    <div className="nav-item" style={{ marginTop: 'auto', color: 'var(--accent-color)', fontWeight: '700' }}>
                        🤖 AI Asistan (10.H)
                    </div>
                </nav>

                {/* Kullanıcı Profili Göstergesi (Sol alt) */}
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ücretsiz Plan</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Ana İçerik */}
            <main className="main-content">
                {/* Navbar */}
                <header className="navbar">
                    {/* Üst Stat Bar (PayPal Resmindeki gibi) */}
                    <div className="top-stats-bar">
                        <div>Hedef: <span className="stat-highlight">2. Hafta %100</span></div>
                        <div>Test Durumu: <span className="stat-highlight">Başarılı</span> <span className="stat-badge-green">▲ %100</span></div>
                        <div>Versiyon: <span className="stat-highlight">v1.2</span></div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={handleLogout} className="btn-primary" style={{ background: '#F3F4F6', color: '#1F2937' }}>
                            Çıkış Yap
                        </button>
                    </div>
                </header>

                <div style={{ padding: '0 2rem 2rem 2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
