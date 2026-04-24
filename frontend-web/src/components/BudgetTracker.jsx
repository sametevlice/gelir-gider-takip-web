import { useStore, getCat, fmt } from '../store/useStore';

// Mock budget limits per category (will be replaced by backend later)
const BUDGET_LIMITS = {
  cat2:  1500,  // Market
  cat8:  3000,  // Ev (Kira)
  cat4:  800,   // Araç
  cat1:  500,   // Yiyecek
  cat11: 600,   // Faturalar
  cat10: 300,   // Eğlence
  cat9:  400,   // Sağlık
  cat3:  2000,  // Seyahat
};

export default function BudgetTracker() {
  const transactions = useStore(state => state.transactions);
  const user = useStore(state => state.user);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Calculate this month's spending per category
  const catSpend = {};
  transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'EXPENSE' && d.getMonth() === month && d.getFullYear() === year;
    })
    .forEach(t => {
      const cid = t.categoryId || 'cat15';
      catSpend[cid] = (catSpend[cid] || 0) + t.amount;
    });

  // Build budget items (only categories that have a limit)
  const budgetItems = Object.entries(BUDGET_LIMITS)
    .map(([catId, limit]) => {
      const spent = catSpend[catId] || 0;
      const pct = Math.min((spent / limit) * 100, 100);
      const cat = getCat(catId);
      return { catId, limit, spent, pct, cat };
    })
    .sort((a, b) => b.pct - a.pct); // Show most-used budgets first

  return (
    <div className="card budget-tracker-card">
      <div className="section-header">
        <div className="section-title">📊 Kategori Bütçe Takibi</div>
        <span className="budget-month-badge">
          {now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="budget-list">
        {budgetItems.map(({ catId, limit, spent, pct, cat }) => {
          const isWarning = pct >= 70 && pct < 90;
          const isDanger = pct >= 90;
          const barClass = isDanger ? 'budget-bar-danger' : isWarning ? 'budget-bar-warning' : 'budget-bar-normal';
          const remaining = Math.max(limit - spent, 0);

          return (
            <div key={catId} className="budget-item">
              <div className="budget-item-top">
                <div className="budget-cat-info">
                  <div className="budget-cat-icon" style={{ background: `${cat.color}18` }}>
                    {cat.icon}
                  </div>
                  <div>
                    <div className="budget-cat-name">{cat.name}</div>
                    <div className="budget-cat-remaining">
                      {remaining > 0
                        ? <span className="budget-remaining-ok">Kalan: {fmt(remaining, user?.currency)}</span>
                        : <span className="budget-remaining-over">Bütçe aşıldı!</span>
                      }
                    </div>
                  </div>
                </div>
                <div className="budget-amounts">
                  <span className={`budget-spent ${isDanger ? 'danger-text' : ''}`}>
                    {fmt(spent, user?.currency)}
                  </span>
                  <span className="budget-limit">/ {fmt(limit, user?.currency)}</span>
                </div>
              </div>
              <div className="budget-bar-wrap">
                <div
                  className={`budget-bar-fill ${barClass}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="budget-pct-label">
                <span className={`budget-pct ${isDanger ? 'danger-text' : isWarning ? 'warning-text' : ''}`}>
                  %{pct.toFixed(0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
