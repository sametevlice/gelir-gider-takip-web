import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';

const DashboardLayout = () => {
    const navigate = useNavigate();

    // Kullanıcı bilgisini local storage'dan alıyoruz
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { full_name: 'Kullanıcı' };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="app-layout">
            {/* Sol Menü - Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span style={{ color: 'var(--accent-color)', marginRight: '8px' }}>✦</span> FinansTakip
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item active">
                        📊 Ana Panel
                    </Link>
                    <div className="nav-item">💰 Gelir / Gider (2. Hafta)</div>
                    <div className="nav-item">📁 Kategoriler (3. Hafta)</div>
                    <div className="nav-item">📈 Raporlar (7. Hafta)</div>
                    <div className="nav-item" style={{ marginTop: 'auto', color: 'var(--accent-color)' }}>
                        🤖 AI Asistan (10. Hafta)
                    </div>
                </nav>
            </aside>

            {/* Ana İçerik Alanı */}
            <main className="main-content">
                {/* Üst Menü - Navbar */}
                <header className="navbar">
                    <div>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Görünüm Modu / Arama (İleride)</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.full_name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ücretsiz Plan</div>
                        </div>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                color: 'white'
                            }}
                        >
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 1rem', width: 'auto', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
                        >
                            Çıkış
                        </button>
                    </div>
                </header>

                {/* Dinamik Sayfa İçeriği - (Dashboard vs.) */}
                <div style={{ padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
