import { useState } from 'react';
import { useStore } from './store/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import Auth from './pages/Auth';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Account from './pages/Account';
import BudgetManagement from './pages/BudgetManagement';

import PaymentsPage from './pages/PaymentsPage';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TransactionModal from './components/TransactionModal';
import Toast from './components/Toast';

function App() {
  const user = useStore(state => state.user);
  
  const [activePage, setActivePage] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register'

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage 
              onLogin={() => setView('login')} 
              onRegister={() => setView('register')} 
            />
          </motion.div>
        ) : (
          <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Auth 
              initialIsLogin={view === 'login'} 
              onBack={() => setView('landing')} 
            />
          </motion.div>
        )}
        <Toast />
      </AnimatePresence>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFC] font-sans text-[#11142D] overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex-1 flex flex-col ml-[80px] h-screen overflow-hidden relative">
        <Header setActivePage={setActivePage} setModalOpen={setModalOpen} />
        
        <main className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activePage === 'dashboard' && <Dashboard setModalOpen={setModalOpen} setEditId={setEditId} setActivePage={setActivePage} />}
                {activePage === 'transactions' && <Transactions setModalOpen={setModalOpen} setEditId={setEditId} />}
                {activePage === 'analytics' && <Analytics />}
                {activePage === 'budget' && <BudgetManagement />}

                {activePage === 'payments' && <PaymentsPage />}
                {activePage === 'account' && <Account />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <TransactionModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); }} editId={editId} />
      <Toast />
    </div>
  );
}

export default App;
