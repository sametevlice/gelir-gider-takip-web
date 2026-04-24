import { useStore } from '../store/useStore';

export default function Header({ setActivePage, setModalOpen, darkMode, setDarkMode }) {
  const user = useStore(state => state.user);
  const showToast = useStore(state => state.showToast);
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'long' });
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="header">
      <div className="header-logo" onClick={() => setActivePage('dashboard')}>
        <div className="header-logo-icon">F</div>
        <div className="header-logo-text">Fin<em>Tech</em>.</div>
      </div>
      <div className="header-right">
        <span className="header-date">{dateStr}</span>
        <div className="header-btn" onClick={() => setModalOpen(true)}>
          <span>＋</span>
        </div>
        <div className="header-btn" onClick={() => showToast('3 yeni bildirim var!', 'info')}>
          <span>🔔</span>
          <div className="notif-dot"></div>
        </div>
        <button
          className="header-btn theme-toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Tema değiştir"
          title={darkMode ? 'Açık Mod' : 'Koyu Mod'}
        >
          <span className={`theme-icon ${darkMode ? 'dark' : 'light'}`}>
            {darkMode ? '☀️' : '🌙'}
          </span>
        </button>
        <div className="header-avatar" onClick={() => setActivePage('account')}>
          {initials}
        </div>
      </div>
    </header>
  );
}
