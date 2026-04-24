import { useState } from 'react';
import { useStore, fmt } from '../store/useStore';

const INITIAL_PAYMENTS = [
  { id: 'p1', name: 'Netflix Abonelik',    amount: 99.99,   dueDate: '2026-05-01', icon: '🎬', paid: false },
  { id: 'p2', name: 'Spotify Premium',     amount: 59.99,   dueDate: '2026-05-03', icon: '🎵', paid: false },
  { id: 'p3', name: 'Kira Ödemesi',        amount: 2500,    dueDate: '2026-05-05', icon: '🏠', paid: false },
  { id: 'p4', name: 'Elektrik Faturası',   amount: 180,     dueDate: '2026-05-10', icon: '💡', paid: false },
  { id: 'p5', name: 'İnternet Faturası',   amount: 120,     dueDate: '2026-05-12', icon: '🌐', paid: false },
];

function getDaysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

function formatDueLabel(dateStr) {
  const days = getDaysUntil(dateStr);
  if (days < 0) return { text: `${Math.abs(days)} gün geçti`, className: 'due-overdue' };
  if (days === 0) return { text: 'Bugün', className: 'due-today' };
  if (days === 1) return { text: 'Yarın', className: 'due-soon' };
  return { text: `${days} gün kaldı`, className: 'due-normal' };
}

export default function UpcomingPayments() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const user = useStore(state => state.user);
  const showToast = useStore(state => state.showToast);

  const togglePaid = (id) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newPaid = !p.paid;
          if (newPaid) showToast(`${p.name} ödendi ✓`, 'success');
          return { ...p, paid: newPaid };
        }
        return p;
      })
    );
  };

  const unpaid = payments.filter(p => !p.paid);
  const paid = payments.filter(p => p.paid);

  return (
    <div className="payments-container">
      {/* Yaklaşan Ödemeler Kartı */}
      <div className="card upcoming-payments-card">
        <div className="section-header">
          <div className="section-title">📅 Yaklaşan Ödemeler</div>
          <span className="upcoming-count-badge">{unpaid.length} Bekleyen</span>
        </div>

        <div className="upcoming-list">
          {unpaid.length === 0 ? (
            <div className="empty-payments">🎉 Tüm ödemeler tamamlandı!</div>
          ) : (
            unpaid.map(p => {
              const due = formatDueLabel(p.dueDate);
              return (
                <div key={p.id} className="upcoming-item anim-slide-in">
                  <button className="payment-checkbox" onClick={() => togglePaid(p.id)}>
                    <div className="circle-check-empty"></div>
                  </button>
                  <div className="upcoming-icon">{p.icon}</div>
                  <div className="upcoming-info">
                    <div className="upcoming-name">{p.name}</div>
                    <div className={`upcoming-due ${due.className}`}>{due.text}</div>
                  </div>
                  <div className="upcoming-amount">{fmt(p.amount, user?.currency)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ödediklerim Kartı */}
      <div className="card paid-payments-card mt-20">
        <div className="section-header">
          <div className="section-title">✅ Ödediklerim</div>
        </div>

        <div className="upcoming-list">
          {paid.length === 0 ? (
            <div className="empty-payments-muted">Henüz ödenmiş bir işlem bulunmuyor.</div>
          ) : (
            paid.map(p => (
              <div key={p.id} className="upcoming-item paid anim-fade-in">
                <button className="payment-checkbox checked" onClick={() => togglePaid(p.id)}>
                  <div className="circle-check-filled">✓</div>
                </button>
                <div className="upcoming-icon grayscale">{p.icon}</div>
                <div className="upcoming-info">
                  <div className="upcoming-name strikethrough">{p.name}</div>
                  <div className="upcoming-due due-paid">Ödendi</div>
                </div>
                <div className="upcoming-amount strikethrough">{fmt(p.amount, user?.currency)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
