import { create } from 'zustand';

const STORAGE_KEY = 'cashio_data';

export const CATEGORIES = [
  { id: 'cat1',  name: 'Yemek & Kafe',     icon: '☕', color: '#FF6B6B' },
  { id: 'cat2',  name: 'Market',            icon: '🛒', color: '#4ECDC4' },
  { id: 'cat3',  name: 'Eğlence',           icon: '🎬', color: '#FFE66D' },
  { id: 'cat4',  name: 'Ulaşım',            icon: '🚗', color: '#1A535C' },
  { id: 'cat5',  name: 'Sağlık',            icon: '💊', color: '#FF9F1C' },
  { id: 'cat6',  name: 'Giyim',             icon: '👕', color: '#845EC2' },
  { id: 'cat7',  name: 'Kişisel Bakım',     icon: '🧴', color: '#D65DB1' },
  { id: 'cat8',  name: 'Ev & Yaşam',        icon: '🏠', color: '#FFC75F' },
  { id: 'cat9',  name: 'Eğitim',            icon: '📚', color: '#F9F871' },
  { id: 'cat10', name: 'Abonelikler',       icon: '📺', color: '#2C3E50' },
  { id: 'cat11', name: 'Faturalar',         icon: '🧾', color: '#95A5A6' },
  { id: 'cat12', name: 'Maaş',               icon: '💰', color: '#27AE60' },
  { id: 'cat13', name: 'Borçlar',           icon: '💳', color: '#E74C3C' },
  { id: 'cat14', name: 'Ek Gelir',          icon: '📈', color: '#F39C12' },
  { id: 'cat15', name: 'Diğer',             icon: '✨', color: '#BDC3C7' },
];

export const BRAND_LOGOS = [
  { keywords: ['netflix'], brand: 'Netflix', domain: 'netflix.com', color: 'bg-zinc-900 border-zinc-800 text-white', categoryId: 'cat10' },
  { keywords: ['spotify'], brand: 'Spotify', domain: 'spotify.com', color: 'bg-emerald-50 border-emerald-100', categoryId: 'cat10' },
  { keywords: ['adobe', 'photoshop', 'illustrator'], brand: 'Adobe', domain: 'adobe.com', color: 'bg-red-50 border-red-100', categoryId: 'cat5' },
  { keywords: ['figma'], brand: 'Figma', domain: 'figma.com', color: 'bg-purple-50 border-purple-100', categoryId: 'cat15' },
  { keywords: ['linkedin'], brand: 'LinkedIn', domain: 'linkedin.com', color: 'bg-blue-50 border-blue-100', categoryId: 'cat14' },
  { keywords: ['canva'], brand: 'Canva', domain: 'canva.com', color: 'bg-blue-50 border-blue-100', categoryId: 'cat15' },
  { keywords: ['google', 'drive', 'cloud'], brand: 'Google', domain: 'google.com', color: 'bg-gray-50 border-gray-100', categoryId: 'cat11' },
  { keywords: ['apple', 'icloud', 'music'], brand: 'Apple', domain: 'apple.com', color: 'bg-zinc-50 border-zinc-100', categoryId: 'cat10' },
  { keywords: ['amazon', 'prime', 'aws'], brand: 'Amazon', domain: 'amazon.com', color: 'bg-orange-50 border-orange-100', categoryId: 'cat2' },
  { keywords: ['microsoft', 'office', '365', 'azure'], brand: 'Microsoft', domain: 'microsoft.com', color: 'bg-blue-50 border-blue-100', categoryId: 'cat11' },
  { keywords: ['disney'], brand: 'Disney+', domain: 'disneyplus.com', color: 'bg-blue-900 border-blue-800 text-white', categoryId: 'cat10' },
  { keywords: ['youtube', 'premium'], brand: 'YouTube', domain: 'youtube.com', color: 'bg-red-50 border-red-100', categoryId: 'cat10' },
  { keywords: ['dropbox'], brand: 'Dropbox', domain: 'dropbox.com', color: 'bg-blue-50 border-blue-100', categoryId: 'cat11' },
  { keywords: ['slack'], brand: 'Slack', domain: 'slack.com', color: 'bg-purple-50 border-purple-100', categoryId: 'cat14' },
  { keywords: ['zoom', 'meeting'], brand: 'Zoom', domain: 'zoom.us', color: 'bg-blue-50 border-blue-100', categoryId: 'cat14' },
];

export const detectBrand = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  return BRAND_LOGOS.find(b => b.keywords.some(k => lower.includes(k))) || null;
};

const mapTransaction = (t) => ({
  ...t,
  categoryId: t.categoryId || t.category || 'cat15',
  date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0],
});

const mapPlannedPayment = (p) => ({
  ...p,
  brand: p.title || p.brand,
  categoryId: p.category_id || p.categoryId || 'cat15',
  date: p.date ? p.date.split('T')[0] : new Date().toISOString().split('T')[0],
});

function loadData() {
  let data = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) data = JSON.parse(raw);
  } catch {
    // ignore
  }
  
  if (!data) {
    data = {
      user: null,
      transactions: [],
      goals: [],
      payments: [],
      notifications: []
    };
  }
  
  if (!data.goals) data.goals = [];
  if (!data.payments) data.payments = [];
  if (!data.notifications) data.notifications = [];

  return data;
}

function saveData(data) {
  try {
    const toSave = {
      user: data.user,
      transactions: data.transactions || [],
      goals: data.goals || [],
      payments: data.payments || [],
      notifications: data.notifications || [],
      totalBudget: data.totalBudget || 0,
      budgetLimits: data.budgetLimits || {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

const initial = loadData();

// ── Supabase helper: profile sync ──────────────────────
const supabaseProfileSync = async (userId, updates) => {
  if (!userId) return;
  try {
    const { supabase } = await import('../supabaseClient');
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) {
      console.error('[syncProfileData] Supabase error:', error.message);
    } else {
      console.log('[syncProfileData] Synced:', Object.keys(updates).join(', '));
    }
  } catch (err) {
    console.error('[syncProfileData] Exception:', err.message);
  }
};

// ── Store ────────────────────────────────────────────
// ÖNEMLİ: (set, get) olarak iki parametre aldığından emin ol!
export const useStore = create((set, get) => ({
    user: initial.user,
    transactions: [],
    goals: initial.goals || [],
    payments: [],
    notifications: initial.notifications || [],
    toastMsg: null,
    totalBudget: initial.totalBudget || 0,
    budgetLimits: initial.budgetLimits || {},

    showToast: (msg, type = 'success') => {
      set({ toastMsg: { msg, type } });
      setTimeout(() => {
        set({ toastMsg: null });
      }, 3000);
    },

    hideToast: () => {
      set({ toastMsg: null });
    },

    setTransactions: (rawTransactions) => {
      const transactions = (rawTransactions || []).map(mapTransaction);
      set((state) => {
        saveData({ ...state, transactions });
        return { transactions };
      });
    },

    setPayments: (rawPayments) => {
      const payments = (rawPayments || []).map(mapPlannedPayment);
      set((state) => {
        saveData({ ...state, payments });
        return { payments };
      });
    },

    // ── Goals ─────────────────────────────────────────
    setGoals: (goals) => {
      const user = get().user;
      set((state) => {
        saveData({ ...state, goals });
        return { goals };
      });
      if (user) supabaseProfileSync(user.id, { goals });
    },

    addGoal: (g) => {
      const user = get().user;
      const newG = { ...g, id: 'g_' + Date.now() };
      set((state) => {
        const goals = [...state.goals, newG];
        saveData({ ...state, goals });
        return { goals };
      });
      // Sync after set so get().goals has the new value
      setTimeout(() => {
        if (user) supabaseProfileSync(user.id, { goals: get().goals });
      }, 0);
    },

    updateGoal: (id, updates) => {
      const user = get().user;
      set((state) => {
        const goals = state.goals.map(g => g.id === id ? { ...g, ...updates } : g);
        saveData({ ...state, goals });
        return { goals };
      });
      setTimeout(() => {
        if (user) supabaseProfileSync(user.id, { goals: get().goals });
      }, 0);
    },

    deleteGoal: (id) => {
      const user = get().user;
      set((state) => {
        const goals = state.goals.filter(g => g.id !== id);
        saveData({ ...state, goals });
        return { goals };
      });
      setTimeout(() => {
        if (user) supabaseProfileSync(user.id, { goals: get().goals });
      }, 0);
    },

    addToGoal: (id, amount) => {
      const user = get().user;
      set((state) => {
        const goals = state.goals.map(g => g.id === id ? { ...g, saved: g.saved + amount } : g);
        saveData({ ...state, goals });
        return { goals };
      });
      setTimeout(() => {
        if (user) supabaseProfileSync(user.id, { goals: get().goals });
      }, 0);
    },

    transferBetweenGoals: (fromId, toId, amount) => {
      const user = get().user;
      const fromGoal = get().goals.find(g => g.id === fromId);
      if (fromGoal && amount > fromGoal.saved) {
        const showToast = get().showToast;
        if (showToast) showToast(`Yetersiz bakiye! Mevcut: ${fromGoal.saved.toLocaleString('tr-TR')} ₺`, 'error');
        return;
      }
      set((state) => {
        const goals = state.goals.map(g => {
          if (g.id === fromId) return { ...g, saved: Math.max(0, g.saved - amount) };
          if (g.id === toId) return { ...g, saved: g.saved + amount };
          return g;
        });
        saveData({ ...state, goals });
        return { goals };
      });
      setTimeout(() => {
        if (user) supabaseProfileSync(user.id, { goals: get().goals });
      }, 0);
    },


    // ── Budget ────────────────────────────────────────
    setTotalBudget: (amount) => {
      const user = get().user;
      set((state) => {
        saveData({ ...state, totalBudget: amount });
        return { totalBudget: amount };
      });
      if (user) supabaseProfileSync(user.id, { total_budget: amount });
    },

    updateBudgetLimit: (catId, amount) => {
      const user = get().user;
      set((state) => {
        const newLimits = { ...state.budgetLimits, [catId]: amount };
        saveData({ ...state, budgetLimits: newLimits });
        return { budgetLimits: newLimits };
      });
      setTimeout(() => {
        if (user) supabaseProfileSync(user.id, { budget_limits: get().budgetLimits });
      }, 0);
    },

    // ── Transactions ──────────────────────────────────
    addTransaction: (t) => {
      set((state) => {
        const newT = { ...t, id: t.id || 't_' + Date.now(), date: t.date || new Date().toISOString().split('T')[0] };
        const transactions = [newT, ...state.transactions];
        saveData({ ...state, transactions });
        return { transactions };
      });
    },

    deleteTransaction: (id) => {
      set((state) => {
        const transactions = state.transactions.filter(t => t.id !== id);
        saveData({ ...state, transactions });
        return { transactions };
      });
    },

    // ── Payments ──────────────────────────────────────
    addPayment: (p) => {
      set((state) => {
        const newP = { ...p, id: 'p_' + Date.now() };
        const payments = [...state.payments, newP];
        saveData({ ...state, payments });
        return { payments };
      });
    },

    deletePayment: (id) => {
      set((state) => {
        const payments = state.payments.filter(p => p.id !== id);
        saveData({ ...state, payments });
        return { payments };
      });
    },

    markAsPaid: (paymentId, date) => {
      set((state) => {
        const payment = state.payments.find(p => p.id === paymentId);
        if (!payment) return state;
        const newT = {
          id: 't_' + Date.now(),
          type: 'EXPENSE',
          amount: payment.amount,
          description: payment.brand,
          categoryId: payment.categoryId,
          domain: payment.domain,
          date: date || new Date().toISOString().split('T')[0]
        };
        const transactions = [newT, ...state.transactions];
        saveData({ ...state, transactions });
        return { transactions };
      });
    },

    // ── Auth ──────────────────────────────────────────
    login: (userData) => {
      set((state) => {
        const user = { ...userData, currency: 'TRY' };
        saveData({ user, transactions: state.transactions, goals: state.goals, payments: state.payments, totalBudget: state.totalBudget, budgetLimits: state.budgetLimits });
        return { user };
      });
    },

    register: (full_name, email, phone_number) => {
      const user = { id: 'u_' + Date.now(), full_name, email, phone_number, currency:'TRY' };
      set((state) => {
        saveData({ user, transactions: [], goals: [], payments: [], totalBudget: 0, budgetLimits: {} });
        return { user, transactions: [], goals: [], payments: [], totalBudget: 0, budgetLimits: {} };
      });
    },

    logout: async () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('access_token');
      
      const { supabase } = await import('../supabaseClient');
      await supabase.auth.signOut();
      
      get().unsubscribeFromChanges();

      set({
        user: null,
        transactions: [],
        goals: [],
        payments: [],
        notifications: [],
        totalBudget: 0,
        budgetLimits: {},
      });
    },

    updateUser: (updates) => {
      set((state) => {
        const user = { ...state.user, ...updates };
        saveData({ ...state, user });
        return { user };
      });
    },

    // ── Realtime / Supabase Subscription ─────────────
    subscribeToChanges: async () => {
      const user = get().user;
      if (!user) return;

      const { supabase } = await import('../supabaseClient');
      const api = await import('../services/api');

      // Önce mevcut kanalları temizle
      supabase.removeAllChannels();
      // Mevcut polling'i durdur
      const existingInterval = get()._profilePollInterval;
      if (existingInterval) clearInterval(existingInterval);

      // 1. Profile'dan anlık bütçe ve hedef verilerini çek
      const fetchAndApplyProfile = async () => {
        try {
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('total_budget, budget_limits, goals')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profileErr) {
            console.error('[Profile] Fetch error:', profileErr.message);
          } else if (profile) {
            set((state) => ({
              totalBudget: profile.total_budget !== undefined ? profile.total_budget : state.totalBudget,
              budgetLimits: profile.budget_limits || state.budgetLimits,
              goals: profile.goals || state.goals,
            }));
          }
        } catch (err) {
          console.error('[Profile] Exception:', err.message);
        }
      };

      // İlk yükleme
      await fetchAndApplyProfile();

      const pollAllData = async () => {
        await fetchAndApplyProfile();
        try {
          const api = await import('../services/api');
          
          const rawTxs = await api.getTransactions();
          const mappedTxs = rawTxs.map(mapTransaction);
          if (JSON.stringify(get().transactions) !== JSON.stringify(mappedTxs)) {
            get().setTransactions(rawTxs);
          }
          
          const rawPayments = await api.getPlannedPayments();
          const mappedPayments = rawPayments.map(mapPlannedPayment);
          if (JSON.stringify(get().payments) !== JSON.stringify(mappedPayments)) {
            get().setPayments(rawPayments);
          }
        } catch (err) {
          // sessizce geç
        }
      };

      // 2. Her 5 saniyede bir profil, işlem ve ödeme verisini yenile (Realtime fallback)
      const pollInterval = setInterval(pollAllData, 5000);
      set({ _profilePollInterval: pollInterval });

      // 3. Transactions tablosunu anlık dinle
      supabase
        .channel(`web-tx-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
          async (payload) => {
            console.log('[Realtime] TX change:', payload.eventType);
            try {
              const txs = await api.getTransactions();
              get().setTransactions(txs);
            } catch (err) {
              console.error('[Realtime] TX fetch error:', err);
            }
          }
        )
        .subscribe((status) => {
          console.log('[Realtime] TX channel status:', status);
        });

      // 4. Planned Payments tablosunu anlık dinle
      supabase
        .channel(`web-pay-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'planned_payments', filter: `user_id=eq.${user.id}` },
          async (payload) => {
            console.log('[Realtime] Payments change:', payload.eventType);
            try {
              const payments = await api.getPlannedPayments();
              get().setPayments(payments);
            } catch (err) {
              console.error('[Realtime] Payments fetch error:', err);
            }
          }
        )
        .subscribe((status) => {
          console.log('[Realtime] Payments channel status:', status);
        });

      // 5. Profiles tablosunu Realtime ile dinle (Supabase Replication açıksa çalışır)
      supabase
        .channel(`web-profile-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            console.log('[Realtime] Profile change via Realtime:', payload.new);
            if (payload.new) {
              const newData = payload.new;
              set((state) => ({
                totalBudget: newData.total_budget !== undefined ? newData.total_budget : state.totalBudget,
                budgetLimits: newData.budget_limits || state.budgetLimits,
                goals: newData.goals || state.goals,
              }));
              
              // Profiles güncellendiğinde diğer verileri de anında çek (Ping mekanizması)
              (async () => {
                try {
                  const api = await import('../services/api');
                  const rawTxs = await api.getTransactions();
                  const mappedTxs = rawTxs.map(t => ({
                    ...t,
                    categoryId: t.categoryId || t.category || 'cat15',
                    date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0],
                  }));
                  if (JSON.stringify(get().transactions) !== JSON.stringify(mappedTxs)) {
                    get().setTransactions(rawTxs);
                  }
                  
                  const rawPayments = await api.getPlannedPayments();
                  const mappedPayments = rawPayments.map(p => ({
                    ...p,
                    brand: p.title || p.brand,
                    categoryId: p.category_id || p.categoryId || 'cat15',
                    date: p.date ? p.date.split('T')[0] : new Date().toISOString().split('T')[0],
                  }));
                  if (JSON.stringify(get().payments) !== JSON.stringify(mappedPayments)) {
                    get().setPayments(rawPayments);
                  }
                } catch (err) { }
              })();
            }
          }
        )
        .subscribe((status) => {
          console.log('[Realtime] Profile channel status:', status);
        });
    },

    unsubscribeFromChanges: async () => {
      const interval = get()._profilePollInterval;
      if (interval) {
        clearInterval(interval);
        set({ _profilePollInterval: null });
      }
      try {
        const { supabase } = await import('../supabaseClient');
        supabase.removeAllChannels();
        console.log('[Realtime] All channels removed');
      } catch (err) {
        console.error('[unsubscribeFromChanges] Error:', err.message);
      }
    },

    _profilePollInterval: null,
}));

export const fmt = (val) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
};

export const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const getCat = (id) => {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
};
