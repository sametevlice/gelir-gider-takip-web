import { useState, useEffect, useRef } from 'react';
import { useStore, getCat, fmt } from '../store/useStore';
import BudgetTracker from '../components/BudgetTracker';
import UpcomingPayments from '../components/UpcomingPayments';

const INITIAL_GOALS = [
  { id: 'g1', name: 'Tatil Fonu', target: 15000, saved: 6800, icon: '✈️', color: '#2196F3' },
  { id: 'g2', name: 'Acil Durum', target: 20000, saved: 14200, icon: '🛡️', color: '#10B981' },
  { id: 'g3', name: 'Yeni Laptop', target: 8000, saved: 3500, icon: '💻', color: '#8552FF' },
  { id: 'g4', name: 'Araba Tamiri', target: 5000, saved: 5000, icon: '🚗', color: '#FF9800' },
];

export default function BudgetManagement() {
  const user = useStore(state => state.user);
  const showToast = useStore(state => state.showToast);
  const transactions = useStore(state => state.transactions);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [animateIn, setAnimateIn] = useState(false);
  const barRefs = useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const totalBudget = 11600;
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const thisMonthExpense = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'EXPENSE' && d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((s, t) => s + t.amount, 0);

  const budgetUsedPct = Math.min((thisMonthExpense / totalBudget) * 100, 100);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  const catSpend = {};
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    catSpend[t.categoryId || 'cat15'] = (catSpend[t.categoryId || 'cat15'] || 0) + t.amount;
  });
  const topCats = Object.entries(catSpend).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxSpend = topCats[0]?.[1] || 1;

  const addToGoal = (goalId, amount) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g
    ));
    showToast('Birikime eklendi ✓', 'success');
  };

  return (
    <div className="page active bm-page">
      <div className="page-header">
        <div>
          <div className="page-title">💰 Bütçe Yönetimi</div>
          <div className="page-sub">Bütçe limitleri, birikimler ve ödemeler</div>
        </div>
      </div>

      <div className="bm-summary-row">
        <div className="card bm-summary-card">
          <div className="bm-summary-icon" style={{ background: 'var(--purple3)' }}>📊</div>
          <div className="bm-summary-info">
            <div className="bm-summary-label">Aylık Bütçe</div>
            <div className="bm-summary-value">{fmt(totalBudget, user?.currency)}</div>
          </div>
          <div className="bm-summary-badge">
            <div className="bm-mini-bar">
              <div className="bm-mini-bar-fill" style={{ width: animateIn ? `${budgetUsedPct}%` : '0%', background: budgetUsedPct > 80 ? 'var(--red)' : 'var(--purple)' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--t2)' }}>%{budgetUsedPct.toFixed(0)} kullanıldı</span>
          </div>
        </div>
        <div className="card bm-summary-card">
          <div className="bm-summary-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>🎯</div>
          <div className="bm-summary-info">
            <div className="bm-summary-label">Toplam Birikim</div>
            <div className="bm-summary-value" style={{ color: 'var(--green)' }}>{fmt(totalSaved, user?.currency)}</div>
          </div>
        </div>
        <div className="card bm-summary-card">
          <div className="bm-summary-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>💸</div>
          <div className="bm-summary-info">
            <div className="bm-summary-label">Bu Ay Harcama</div>
            <div className="bm-summary-value" style={{ color: 'var(--red)' }}>{fmt(thisMonthExpense, user?.currency)}</div>
          </div>
        </div>
      </div>

      <div className="card card-lg" style={{ marginBottom: '20px' }}>
        <div className="section-header">
          <div className="section-title">📌 En Çok Harcama Kategorileri</div>
        </div>
        <div className="category-dist">
          {!topCats.length ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="empty-text">Henüz harcama yok</div>
            </div>
          ) : topCats.map(([cid, amt]) => {
            const cat = getCat(cid);
            const pct = (amt / maxSpend * 100).toFixed(0);
            return (
              <div key={cid} className="cat-dist-row">
                <div className="cat-dist-icon" style={{ background: `${cat.color}20` }}>{cat.icon}</div>
                <div className="cat-dist-name">{cat.name}</div>
                <div className="cat-dist-bar-wrap">
                  <div className="cat-dist-bar" style={{ width: animateIn ? `${pct}%` : '0%', background: cat.color, transition: 'width .8s ease' }}></div>
                </div>
                <div className="cat-dist-amount">{fmt(amt)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bm-grid">
        <div className="bm-left">
          <BudgetTracker />
          <div className="card bm-goals-card">
            <div className="section-header">
              <div className="section-title">🎯 Birikim Hedefleri</div>
            </div>
            <div className="bm-goals-list">
              {goals.map((g, i) => {
                const pct = Math.min((g.saved / g.target) * 100, 100);
                const isComplete = g.saved >= g.target;
                return (
                  <div key={g.id} className={`bm-goal-item ${isComplete ? 'complete' : ''}`}>
                    <div className="bm-goal-top">
                      <div className="bm-goal-info">
                        <div className="bm-goal-icon" style={{ background: `${g.color}18` }}>{g.icon}</div>
                        <div>
                          <div className="bm-goal-name">{g.name}</div>
                          <div className="bm-goal-amounts">{fmt(g.saved)} / {fmt(g.target)}</div>
                        </div>
                      </div>
                      <div className="bm-goal-actions">
                        {!isComplete && <button className="btn btn-ghost btn-sm" onClick={() => addToGoal(g.id, 500)}>+ ₺500</button>}
                      </div>
                    </div>
                    <div className="bm-goal-bar-wrap">
                      <div className="bm-goal-bar-fill" style={{ width: animateIn ? `${pct}%` : '0%', background: isComplete ? 'var(--green)' : g.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="bm-right">
          <UpcomingPayments />
        </div>
      </div>
    </div>
  );
}
