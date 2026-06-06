import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import Auth from './pages/Auth';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
  const subscribeToChanges = useStore(state => state.subscribeToChanges);
  
  useEffect(() => {
    if (user) {
      subscribeToChanges();
    }
  }, [user, subscribeToChanges]);

  const [activePage, setActivePage] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register', 'verify-email', 'forgot-password', 'reset-password'
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verificationContext, setVerificationContext] = useState('register'); // 'register' or 'reset'

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
        ) : view === 'forgot-password' ? (
          <motion.div key="forgot-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ForgotPassword 
              onBack={() => setView('login')}
              onSuccess={(email) => {
                setRegisteredEmail(email);
                setVerificationContext('reset');
                setView('verify-email');
              }}
            />
          </motion.div>
        ) : view === 'reset-password' ? (
          <motion.div key="reset-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ResetPassword 
              onBack={() => setView('login')}
              onSuccess={() => {
                // Şifre yenilendi
                setView('login');
              }}
            />
          </motion.div>
        ) : view === 'verify-email' ? (
          <motion.div key="verify-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <EmailVerification 
              email={registeredEmail}
              type={verificationContext === 'reset' ? 'recovery' : 'signup'}
              onBack={() => setView('login')}
              onVerify={(code) => {
                // Şimdilik simüle ediyoruz, 3. adımda AWS API buraya gelecek
                console.log('Doğrulanan kod:', code);
                // Eğer şifre sıfırlama için doğrulanıyorsa yeni şifre ekranına geç
                if (verificationContext === 'reset') {
                  setView('reset-password');
                } else {
                  // Değilse normal login
                  setView('login');
                }
              }}
            />
          </motion.div>
        ) : (
          <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Auth 
              initialIsLogin={view === 'login'} 
              onBack={() => setView('landing')} 
              onRegisterSuccess={(email) => {
                setRegisteredEmail(email);
                setVerificationContext('register');
                setView('verify-email');
              }}
              onForgotPassword={() => setView('forgot-password')}
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
