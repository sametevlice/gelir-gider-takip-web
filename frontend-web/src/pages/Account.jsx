import { useState } from 'react';
import { useStore, fmt } from '../store/useStore';

export default function Account() {
  const user = useStore(state => state.user);
  const updateUser = useStore(state => state.updateUser);
  const showToast = useStore(state => state.showToast);
  const transactions = useStore(state => state.transactions);

  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editCurr, setEditCurr] = useState(user?.currency || 'TRY');

  const [notifOn, setNotifOn] = useState(true);
  const [reportOn, setReportOn] = useState(false);
  const [budgetOn, setBudgetOn] = useState(true);

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  
  const now = new Date();
  const thisMonthExp = transactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date).getMonth() === now.getMonth())
    .reduce((s, t) => s + t.amount, 0);
  const budget = 5000;
  const budgetPct = Math.min(thisMonthExp / budget * 100, 100).toFixed(0);

  const savings = Math.max(totalIncome - totalExpense, 0);
  const savingsPct = totalIncome > 0 ? Math.min(savings / totalIncome * 100, 100).toFixed(0) : 0;

  const handleSave = () => {
    if (!editName.trim() || !editEmail.trim()) return showToast('Ad ve e-posta gerekli', 'error');
    updateUser({ name: editName, email: editEmail, currency: editCurr });
    showToast('Profil kaydedildi ✓', 'success');
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Hesabım</div>
          <div className="page-sub">Profil & Ayarlar</div>
        </div>
      </div>
      
      <div className="account-grid">
        <div>
          <div className="card profile-card">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-since">Üye: Nisan 2026</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r12)', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green)' }}>{fmt(totalIncome, user?.currency)}</div>
                <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '3px', fontWeight: '600' }}>Toplam Gelir</div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r12)', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--red)' }}>{fmt(totalExpense, user?.currency)}</div>
                <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '3px', fontWeight: '600' }}>Toplam Gider</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '16px', padding: '20px' }}>
            <div className="section-title" style={{ marginBottom: '16px' }}>🎯 Hedefler</div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span>Aylık Bütçe</span>
                <span>{fmt(thisMonthExp, user?.currency)} / {fmt(budget, user?.currency)}</span>
              </div>
              <div className="progress-wrap">
                <div className="progress-fill" style={{ background: parseFloat(budgetPct) > 80 ? 'var(--red)' : 'var(--purple)', width: `${budgetPct}%` }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span>Tasarruf Hedefi</span>
                <span style={{ color: 'var(--green)' }}>{fmt(savings, user?.currency)}</span>
              </div>
              <div className="progress-wrap">
                <div className="progress-fill" style={{ background: 'var(--green)', width: `${savingsPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card card-lg" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ marginBottom: '20px' }}>✏️ Profili Düzenle</div>
            
            <label className="modal-label">Ad Soyad</label>
            <input className="modal-input" type="text" value={editName} onChange={e => setEditName(e.target.value)} />
            
            <label className="modal-label">E-posta</label>
            <input className="modal-input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            
            <label className="modal-label">Para Birimi</label>
            <select className="modal-select" value={editCurr} onChange={e => setEditCurr(e.target.value)}>
              <option value="TRY">₺ Türk Lirası</option>
              <option value="USD">$ Amerikan Doları</option>
              <option value="EUR">€ Euro</option>
            </select>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-purple" onClick={handleSave}>Kaydet</button>
              <button className="btn btn-ghost" onClick={() => {
                setEditName(user?.name || '');
                setEditEmail(user?.email || '');
                setEditCurr(user?.currency || 'TRY');
              }}>İptal</button>
            </div>
          </div>

          <div className="card card-lg">
            <div className="section-title" style={{ marginBottom: '4px' }}>⚙️ Ayarlar</div>
            <div className="setting-row">
              <div>
                <div className="setting-label">🔔 Bildirimler</div>
                <div className="setting-desc">İşlem hatırlatmaları al</div>
              </div>
              <div className={`toggle ${notifOn ? 'on' : ''}`} onClick={() => setNotifOn(!notifOn)}></div>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">📊 Haftalık Rapor</div>
                <div className="setting-desc">Her Pazartesi özet e-postası</div>
              </div>
              <div className={`toggle ${reportOn ? 'on' : ''}`} onClick={() => setReportOn(!reportOn)}></div>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">🎯 Bütçe Uyarıları</div>
                <div className="setting-desc">%80'e ulaşınca bildirim</div>
              </div>
              <div className={`toggle ${budgetOn ? 'on' : ''}`} onClick={() => setBudgetOn(!budgetOn)}></div>
            </div>
            <div className="setting-row" style={{ borderBottom: 'none' }}>
              <div>
                <div className="setting-label">☀️ Açık Mod</div>
                <div className="setting-desc">Şu an aktif</div>
              </div>
              <div className="toggle on" onClick={() => showToast('Zaten en iyisindesin!', 'info')}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
