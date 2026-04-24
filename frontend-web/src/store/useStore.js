import { create } from 'zustand';

const STORAGE_KEY = 'cashio_data';

export const CATEGORIES = [
  {id:'cat1', name:'Yiyecek',   icon:'🍽️', color:'#FF5722'},
  {id:'cat2', name:'Market',    icon:'🛒', color:'#4CAF50'},
  {id:'cat3', name:'Seyahat',   icon:'✈️', color:'#2196F3'},
  {id:'cat4', name:'Araç',      icon:'🚗', color:'#FF9800'},
  {id:'cat5', name:'Eğitim',    icon:'📚', color:'#9C27B0'},
  {id:'cat6', name:'Sigorta',   icon:'🛡️', color:'#00BCD4'},
  {id:'cat7', name:'Pazarlama', icon:'📢', color:'#E91E63'},
  {id:'cat8', name:'Ev',        icon:'🏠', color:'#795548'},
  {id:'cat9', name:'Sağlık',    icon:'💊', color:'#F44336'},
  {id:'cat10',name:'Eğlence',   icon:'🎮', color:'#673AB7'},
  {id:'cat11',name:'Faturalar', icon:'💡', color:'#FFC107'},
  {id:'cat12',name:'Maaş',      icon:'💼', color:'#ABE39E'},
  {id:'cat13',name:'Yatırım',   icon:'📈', color:'#8552FF'},
  {id:'cat14',name:'Freelance', icon:'💻', color:'#00BCD4'},
  {id:'cat15',name:'Diğer',     icon:'📦', color:'#9E9E9E'},
];

const DEMO_TRANSACTIONS = [
  {id:'t1', type:'INCOME',  amount:15000,  description:'Ocak Maaşı',          categoryId:'cat12', date:'2025-01-01'},
  {id:'t2', type:'EXPENSE', amount:2500,   description:'Kira',                 categoryId:'cat8',  date:'2025-01-03'},
  {id:'t3', type:'EXPENSE', amount:450,    description:'Market Alışverişi',    categoryId:'cat2',  date:'2025-01-05'},
  {id:'t4', type:'EXPENSE', amount:189,    description:'Netflix & Spotify',    categoryId:'cat10', date:'2025-01-08'},
  {id:'t5', type:'EXPENSE', amount:320,    description:'Akaryakıt',            categoryId:'cat4',  date:'2025-01-10'},
  {id:'t6', type:'INCOME',  amount:3200,   description:'Freelance Proje',      categoryId:'cat14', date:'2025-01-15'},
  {id:'t7', type:'EXPENSE', amount:85,     description:'Restoran',             categoryId:'cat1',  date:'2025-01-17'},
  {id:'t8', type:'EXPENSE', amount:250,    description:'Elektrik & Su',        categoryId:'cat11', date:'2025-01-20'},
  {id:'t9', type:'EXPENSE', amount:120,    description:'Sağlık Sigortası',     categoryId:'cat5',  date:'2025-01-22'},
  {id:'t10',type:'INCOME',  amount:15000,  description:'Şubat Maaşı',         categoryId:'cat12', date:'2025-02-01'},
  {id:'t11',type:'EXPENSE', amount:2500,   description:'Kira',                 categoryId:'cat8',  date:'2025-02-03'},
  {id:'t12',type:'EXPENSE', amount:380,    description:'Market',               categoryId:'cat2',  date:'2025-02-07'},
  {id:'t13',type:'EXPENSE', amount:215,    description:'Ulaşım',               categoryId:'cat4',  date:'2025-02-09'},
  {id:'t14',type:'EXPENSE', amount:680,    description:'Yeni Ayakkabı',        categoryId:'cat15', date:'2025-02-12'},
  {id:'t15',type:'INCOME',  amount:1800,   description:'Satış Komisyonu',      categoryId:'cat14', date:'2025-02-16'},
  {id:'t16',type:'EXPENSE', amount:95,     description:'Kafe',                 categoryId:'cat1',  date:'2025-02-19'},
  {id:'t17',type:'EXPENSE', amount:250,    description:'Faturalar',            categoryId:'cat11', date:'2025-02-22'},
  {id:'t18',type:'INCOME',  amount:15000,  description:'Mart Maaşı',          categoryId:'cat12', date:'2025-03-01'},
  {id:'t19',type:'EXPENSE', amount:2500,   description:'Kira',                 categoryId:'cat8',  date:'2025-03-03'},
  {id:'t20',type:'EXPENSE', amount:490,    description:'Market & İhtiyaçlar',  categoryId:'cat2',  date:'2025-03-06'},
  {id:'t21',type:'EXPENSE', amount:340,    description:'Akaryakıt',            categoryId:'cat4',  date:'2025-03-10'},
  {id:'t22',type:'INCOME',  amount:5000,   description:'Yatırım Getirisi',     categoryId:'cat13', date:'2025-03-14'},
  {id:'t23',type:'EXPENSE', amount:1200,   description:'Tatil Uçak Bileti',    categoryId:'cat3',  date:'2025-03-18'},
  {id:'t24',type:'EXPENSE', amount:270,    description:'Faturalar',            categoryId:'cat11', date:'2025-03-22'},
  {id:'t25',type:'INCOME',  amount:15000,  description:'Nisan Maaşı',         categoryId:'cat12', date:'2025-04-01'},
  {id:'t26',type:'EXPENSE', amount:2500,   description:'Kira',                 categoryId:'cat8',  date:'2025-04-03'},
  {id:'t27',type:'EXPENSE', amount:420,    description:'Market',               categoryId:'cat2',  date:'2025-04-05'},
  {id:'t28',type:'EXPENSE', amount:189,    description:'Abonelikler',          categoryId:'cat10', date:'2025-04-07'},
  {id:'t29',type:'EXPENSE', amount:850,    description:'Dişçi',                categoryId:'cat9',  date:'2025-04-11'},
  {id:'t30',type:'INCOME',  amount:2500,   description:'Danışmanlık',          categoryId:'cat14', date:'2025-04-15'},
  {id:'t31',type:'EXPENSE', amount:310,    description:'Akaryakıt',            categoryId:'cat4',  date:'2025-04-17'},
  {id:'t32',type:'EXPENSE', amount:260,    description:'Faturalar',            categoryId:'cat11', date:'2025-04-21'},
];

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
      transactions: JSON.parse(JSON.stringify(DEMO_TRANSACTIONS))
    };
  }

  // Otomatik olarak 2025 yılı demo verilerini 2026'ya taşır ki grafikler boş kalmasın
  const currentYear = new Date().getFullYear();
  if (currentYear >= 2026 && data.transactions) {
    let changed = false;
    data.transactions.forEach(t => {
      if (t.date && t.date.startsWith('2025-')) {
        t.date = t.date.replace('2025-', '2026-');
        changed = true;
      }
    });
    if (changed) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
    }
  }

  return data;
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

const uid = () => 't_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);

export const getCat = (id) => CATEGORIES.find(c => c.id === id) || {name:'Diğer', icon:'📦', color:'#9E9E9E'};

// Utility formatter methods
export const fmt = (amount, currency = 'TRY') => {
  const symbols = { TRY:'₺', USD:'$', EUR:'€' };
  return (symbols[currency] || '₺') + Number(amount).toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2});
};

export const fmtDate = (d) => {
  return new Date(d).toLocaleDateString('tr-TR', {day:'numeric', month:'short', year:'numeric'});
};

export const useStore = create((set, get) => {
  const initial = loadData();
  return {
    user: initial.user,
    transactions: initial.transactions,
    toastMsg: null,
    
    showToast: (msg, type = 'info') => {
      const id = Date.now();
      set({ toastMsg: { msg, type, id } });
      setTimeout(() => {
        if (get().toastMsg?.id === id) {
          set({ toastMsg: null });
        }
      }, 3000);
    },

    login: (email) => {
      const user = { id:'u1', name: email === 'demo@fintech.app' ? 'Demo Kullanıcı' : email.split('@')[0], email, currency:'TRY' };
      set((state) => {
        saveData({ user, transactions: state.transactions });
        return { user };
      });
    },

    register: (name, email) => {
      const user = { id: 'u_' + Date.now(), name, email, currency:'TRY' };
      set(() => {
        saveData({ user, transactions: [] });
        return { user, transactions: [] };
      });
    },

    logout: () => {
      set((state) => {
        saveData({ user: null, transactions: state.transactions });
        return { user: null };
      });
    },

    updateUser: (updates) => {
      set((state) => {
        const user = { ...state.user, ...updates };
        saveData({ user, transactions: state.transactions });
        return { user };
      });
    },

    addTransaction: (type, amount, desc, date, categoryId) => {
      set((state) => {
        const newTx = {
          id: uid(),
          type: type.toUpperCase(),
          amount: parseFloat(amount),
          description: desc,
          date,
          categoryId: categoryId || null
        };
        const nextTransactions = [newTx, ...state.transactions];
        saveData({ user: state.user, transactions: nextTransactions });
        return { transactions: nextTransactions };
      });
    },

    updateTransaction: (id, updates) => {
      set((state) => {
        const nextTransactions = state.transactions.map(t => t.id === id ? { ...t, ...updates } : t);
        saveData({ user: state.user, transactions: nextTransactions });
        return { transactions: nextTransactions };
      });
    },

    deleteTransaction: (id) => {
      set((state) => {
        const nextTransactions = state.transactions.filter(t => t.id !== id);
        saveData({ user: state.user, transactions: nextTransactions });
        return { transactions: nextTransactions };
      });
    }
  };
});
