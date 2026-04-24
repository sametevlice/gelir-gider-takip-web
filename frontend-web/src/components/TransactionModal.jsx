import { useState, useEffect, useRef } from 'react';
import { useStore, CATEGORIES } from '../store/useStore';

export default function TransactionModal({ isOpen, onClose, editId = null }) {
  const transactions = useStore(state => state.transactions);
  const addTx = useStore(state => state.addTransaction);
  const updateTx = useStore(state => state.updateTransaction);
  const showToast = useStore(state => state.showToast);
  const user = useStore(state => state.user);

  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [catId, setCatId] = useState('');
  const [note, setNote] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const panelRef = useRef(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      if (editId) {
        const t = transactions.find(x => x.id === editId);
        if (t) {
          setType(t.type);
          setAmount(t.amount.toString());
          setDesc(t.description);
          setDate(t.date.split('T')[0]);
          setCatId(t.categoryId || '');
          setNote(t.note || '');
          setCurrency(user?.currency || 'TRY');
        }
      } else {
        setType('EXPENSE');
        setAmount('');
        setDesc('');
        setDate(new Date().toISOString().split('T')[0]);
        setCatId('');
        setNote('');
        setCurrency(user?.currency || 'TRY');
      }
    }
  }, [isOpen, editId, transactions, user?.currency]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return showToast('Geçerli bir miktar gir', 'error');
    if (!desc.trim()) return showToast('Açıklama gerekli', 'error');
    if (!date) return showToast('Tarih seç', 'error');

    if (editId) {
      updateTx(editId, { type, amount: amt, description: desc, date, categoryId: catId || null, note });
      showToast('İşlem güncellendi ✓', 'success');
    } else {
      addTx(type, amt, desc, date, catId);
      showToast('İşlem eklendi ✓', 'success');
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    showToast('Dosya yükleme yakında aktif olacak 📎', 'info');
  };

  const currSymbol = { TRY: '₺', USD: '$', EUR: '€' }[currency] || '₺';

  return (
    <div className="drawer-overlay open" onClick={handleOverlayClick}>
      <div className="drawer-panel" ref={panelRef}>
        {/* Header */}
        <div className="drawer-header">
          <div>
            <div className="drawer-title">{editId ? '✏️ İşlemi Düzenle' : '✨ Yeni İşlem'}</div>
            <div className="drawer-subtitle">İşlem detaylarını gir</div>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Type Toggle */}
          <div className="drawer-type-tabs">
            <button
              className={`drawer-tab ${type === 'EXPENSE' ? 'active-expense' : ''}`}
              onClick={() => setType('EXPENSE')}
            >
              <span className="drawer-tab-icon">💸</span> Gider
            </button>
            <button
              className={`drawer-tab ${type === 'INCOME' ? 'active-income' : ''}`}
              onClick={() => setType('INCOME')}
            >
              <span className="drawer-tab-icon">💰</span> Gelir
            </button>
          </div>

          {/* Amount + Currency */}
          <div className="drawer-field">
            <label className="drawer-label">Miktar</label>
            <div className="drawer-amount-row">
              <div className="drawer-amount-input-wrap">
                <span className="drawer-currency-symbol">{currSymbol}</span>
                <input
                  className="drawer-amount-input"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  autoFocus
                />
              </div>
              <select
                className="drawer-currency-select"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="drawer-field">
            <label className="drawer-label">İşlem Adı</label>
            <input
              className="drawer-input"
              type="text"
              placeholder="Örn: Market alışverişi"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="drawer-field">
            <label className="drawer-label">Tarih</label>
            <input
              className="drawer-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="drawer-field">
            <label className="drawer-label">Kategori</label>
            <div className="drawer-cat-grid">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`drawer-cat-btn ${catId === c.id ? 'selected' : ''}`}
                  onClick={() => setCatId(c.id)}
                  style={catId === c.id ? { borderColor: c.color, background: `${c.color}12` } : {}}
                >
                  <span className="drawer-cat-emoji">{c.icon}</span>
                  <span className="drawer-cat-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="drawer-field">
            <label className="drawer-label">Not (İsteğe Bağlı)</label>
            <textarea
              className="drawer-textarea"
              placeholder="Ek notlar..."
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* File Upload Area */}
          <div className="drawer-field">
            <label className="drawer-label">Fiş / Dosya Ekle</label>
            <div
              className={`drawer-upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📎</div>
              <div className="upload-text">Fiş veya fatura sürükle</div>
              <div className="upload-subtext">veya tıklayarak seç</div>
              <div className="upload-formats">PNG, JPG, PDF — Max 5MB</div>
              <input ref={fileInputRef} type="file" className="upload-hidden-input" accept="image/*,.pdf" onChange={(e) => { e.target.value = ''; showToast('Dosya yükleme yakında aktif olacak 📎', 'info'); }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button className="btn btn-ghost" onClick={onClose}>İptal</button>
          <button className="btn btn-purple" onClick={handleSave}>
            {editId ? 'Güncelle' : 'Kaydet'} →
          </button>
        </div>
      </div>
    </div>
  );
}
