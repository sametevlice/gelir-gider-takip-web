import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Account from './pages/Account';
import BudgetManagement from './pages/BudgetManagement';
import InvestmentsPage from './pages/InvestmentsPage';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TransactionModal from './components/TransactionModal';
import Toast from './components/Toast';

function App() {
  const user = useStore(state => state.user);
  
  const [activePage, setActivePage] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('fintech_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('fintech_dark_mode', darkMode.toString());
    } catch {
      // ignore
    }
  }, [darkMode]);

  if (!user) {
    return (
      <>
        <Auth />
        <Toast />
      </>
    );
  }

  return (
    <div id="app" style={{ display: 'block' }}>
      <div className="app-grid">
        <Header setActivePage={setActivePage} setModalOpen={setModalOpen} darkMode={darkMode} setDarkMode={setDarkMode} />
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="main">
          {activePage === 'dashboard' && <Dashboard setModalOpen={setModalOpen} setEditId={setEditId} setActivePage={setActivePage} />}
          {activePage === 'transactions' && <Transactions setModalOpen={setModalOpen} setEditId={setEditId} />}
          {activePage === 'analytics' && <Analytics />}
          {activePage === 'budget' && <BudgetManagement />}
          {activePage === 'investments' && <InvestmentsPage />}
          {activePage === 'account' && <Account />}
        </main>
      </div>
      <TransactionModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); }} editId={editId} />
      <Toast />
    </div>
  );
}

export default App;
