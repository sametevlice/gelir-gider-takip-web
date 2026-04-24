import { useStore } from '../store/useStore';

export default function Sidebar({ activePage, setActivePage }) {
  const logout = useStore(state => state.logout);

  return (
    <nav className="sidebar" style={{ gridColumn: 1, gridRow: 2 }}>
      <div className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
        <span className="nav-icon">🏠</span> Dashboard
      </div>
      <div className={`nav-item ${activePage === 'transactions' ? 'active' : ''}`} onClick={() => setActivePage('transactions')}>
        <span className="nav-icon">📋</span> İşlemler
      </div>
      <div className={`nav-item ${activePage === 'analytics' ? 'active' : ''}`} onClick={() => setActivePage('analytics')}>
        <span className="nav-icon">📊</span> Analitik
      </div>
      <div className={`nav-item ${activePage === 'budget' ? 'active' : ''}`} onClick={() => setActivePage('budget')}>
        <span className="nav-icon">💰</span> Bütçe Yönetimi
      </div>
      <div className={`nav-item ${activePage === 'investments' ? 'active' : ''}`} onClick={() => setActivePage('investments')}>
        <span className="nav-icon">📈</span> Yatırımlarım
      </div>
      <div className="nav-divider"></div>
      <div className={`nav-item ${activePage === 'account' ? 'active' : ''}`} onClick={() => setActivePage('account')}>
        <span className="nav-icon">👤</span> Hesabım
      </div>
      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={logout}>
          <span className="nav-icon">🚪</span> Çıkış Yap
        </button>
      </div>
    </nav>
  );
}
