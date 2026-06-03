import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ setActivePage, setModalOpen }) {
  const user = useStore(state => state.user);
  const transactions = useStore(state => state.transactions);
  const payments = useStore(state => state.payments);
  const goals = useStore(state => state.goals);
  const totalBudget = useStore(state => state.totalBudget);
  const markNotifAsRead = useStore(state => state.markNotifAsRead);
  const notifications = useStore(state => state.notifications); // manual ones if any
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Dynamic Notifications Logic
  const dynamicNotifications = useMemo(() => {
    const list = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    // 1. Upcoming Payments (Next 3 days)
    if (payments) {
      payments.forEach(p => {
        if (!p.date) return;
        const pDate = new Date(p.date);
        const diffTime = pDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 3) {
          list.push({
            id: `pay_${p.id}`,
            title: `${p.brand} Ödemesi`,
            desc: diffDays === 0 ? 'Bugün ödenecek!' : `${diffDays} gün içinde ₺${p.amount} çekilecek`,
            type: 'payment',
            icon: '💳'
          });
        }
      });
    }

    // 2. Budget Alerts
    if (transactions && transactions.length > 0) {
      const month = today.getMonth();
      const year = today.getFullYear();
      const thisMonthExpense = transactions
        .filter(t => t && t.type === 'EXPENSE' && t.date && new Date(t.date).getMonth() === month && new Date(t.date).getFullYear() === year)
        .reduce((s, t) => s + (t.amount || 0), 0);

      if (totalBudget > 0) {
        const ratio = thisMonthExpense / totalBudget;
        if (ratio > 0.9) {
          list.push({ id: 'budget_crit', title: 'Bütçe Kritik', desc: 'Aylık bütçenizin %90\'ına ulaştınız!', type: 'alert', icon: '⚠️' });
        } else if (ratio > 0.7) {
          list.push({ id: 'budget_warn', title: 'Bütçe Uyarısı', desc: 'Bütçenizin %70\'ini harcadınız.', type: 'warning', icon: '🔔' });
        }
      }
    }

    // 3. Goal Milestones
    if (goals) {
      goals.forEach(g => {
        if (!g.target || g.target <= 0) return;
        const pct = ((g.saved || 0) / g.target) * 100;
        if (pct >= 100) {
          list.push({ id: `goal_win_${g.id}`, title: 'Hedef Tamamlandı!', desc: `${g.name} hedefine ulaştınız! 🎉`, type: 'goal', icon: '🏆' });
        } else if (pct >= 80) {
          list.push({ id: `goal_near_${g.id}`, title: 'Hedefe Çok Yakınsın', desc: `${g.name} hedefi %${Math.round(pct)} tamamlandı.`, type: 'goal', icon: '🎯' });
        }
      });
    }

    return list;
  }, [payments, transactions, goals, totalBudget]);

  const allNotifs = [...dynamicNotifications, ...(notifications || [])];
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-transparent sticky top-0 z-40 backdrop-blur-md">
      <div>
        <h2 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Finansal Durum</h2>
        <p className="text-sm font-bold text-[#11142D] mt-0.5">{dateStr}</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input 
            type="text" 
            placeholder="Ara..." 
            className="bg-white border border-gray-100 rounded-2xl py-2.5 pl-11 pr-4 text-[13px] font-bold text-[#11142D] focus:ring-4 focus:ring-indigo-50/50 outline-none w-64 shadow-sm placeholder:text-gray-400 transition-all" 
          />
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#11142D] text-white rounded-2xl text-[12px] font-extrabold hover:bg-black transition-all shadow-md active:scale-95"
        >
          <span>+</span>
          <span>Yeni Kayıt</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center relative hover:bg-gray-50 text-gray-400 transition-colors group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            {allNotifs.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 z-50 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[14px] font-extrabold text-[#11142D]">Bildirimler</h3>
                  {allNotifs.length > 0 && (
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {allNotifs.length} Bildirim
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  {allNotifs.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="text-3xl mb-2 opacity-20">🔔</div>
                      <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Yeni bildirim yok</p>
                    </div>
                  ) : (
                    allNotifs.map((n) => (
                      <div key={n.id} className="p-4 bg-[#FAFBFC] rounded-2xl hover:bg-gray-100 transition-all cursor-pointer group border border-transparent hover:border-gray-200">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg border border-gray-50">{n.icon}</div>
                          <div className="flex-1">
                            <p className="text-[12px] font-extrabold text-[#11142D] group-hover:text-indigo-600 transition-colors leading-tight">{n.title}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 leading-relaxed">{n.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button 
                  onClick={() => { setActivePage('budget'); setShowNotifications(false); }}
                  className="w-full py-4 mt-4 text-[11px] font-extrabold text-gray-400 hover:text-[#11142D] transition-colors border-t border-gray-50 uppercase tracking-widest"
                >
                  Bütçe Planını Gör
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Gear */}
        <button 
          onClick={() => setActivePage('account')}
          className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-indigo-500 transition-all active:rotate-45"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>

        <div 
          className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-2xl p-1.5 pr-4 cursor-pointer hover:shadow-md transition-all active:scale-95" 
          onClick={() => setActivePage('account')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white overflow-hidden shadow-inner border border-white/20">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <img src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Kullanıcı'}&background=4318FF&color=fff`} alt="User" />
            )}
          </div>
          <div className="flex flex-col justify-center hidden lg:flex">
            <span className="text-[12px] font-extrabold text-[#11142D] leading-none">{user?.full_name || 'Kullanıcı'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
