import React, { useState, useEffect } from 'react';

const TransactionForm = ({ onSubmitTransaction, initialData = null, isEditing = false, onCancelEdit = null }) => {
    const defaultData = {
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0] // Bugünün tarihi (YYYY-MM-DD)
    };

    const [formData, setFormData] = useState(defaultData);

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData(initialData);
        } else {
            setFormData(defaultData);
        }
    }, [isEditing, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmitTransaction(formData);
        if (!isEditing) {
            setFormData({ ...defaultData, type: formData.type, category: formData.category });
        }
    };

    // Gelir ve Gidere göre değişen dinamik kategoriler
    const categories = formData.type === 'expense'
        ? ['Kira', 'Market', 'Fatura', 'Ulaşım', 'Eğlence', 'Sağlık', 'Eğitim', 'Diğer']
        : ['Maaş', 'Yatırım', 'Freelance', 'Kira Geliri', 'Diğer'];

    return (
        <div className="dash-card" style={{ padding: '2rem', borderTop: isEditing ? '4px solid #3B82F6' : (formData.type === 'expense' ? '4px solid var(--danger)' : '4px solid var(--success)') }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: '800' }}>
                {isEditing ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}
            </h3>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="type">İşlem Tipi</label>
                    <div className="radio-group">
                        <label className={`radio-label expense ${formData.type === 'expense' ? 'active' : ''}`}>
                            <input className="radio-input" type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={handleChange} />
                            Gider / Harcama (-)
                        </label>
                        <label className={`radio-label income ${formData.type === 'income' ? 'active' : ''}`}>
                            <input className="radio-input" type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={handleChange} />
                            Gelir (+)
                        </label>
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
                    <label className="form-label" htmlFor="amount" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>İşlem Tutarı</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '1.2rem', fontSize: '1.8rem', fontWeight: '800', color: formData.type === 'expense' ? 'var(--danger)' : 'var(--success)' }}>₺</span>
                        <input type="number" step="0.01" name="amount" id="amount" className="form-input" value={formData.amount} onChange={handleChange} required placeholder="0.00" 
                               style={{ 
                                   fontSize: '2.5rem', 
                                   fontWeight: '800', 
                                   paddingLeft: '3.5rem', 
                                   height: '4.5rem', 
                                   color: formData.type === 'expense' ? 'var(--danger)' : 'var(--success)',
                                   backgroundColor: formData.type === 'expense' ? 'var(--danger-bg)' : 'var(--success-bg)',
                                   borderColor: 'transparent',
                                   boxShadow: 'none'
                               }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="category">Kategori</label>
                        <select name="category" id="category" className="form-input" value={formData.category} onChange={handleChange} required style={{ height: '3rem', fontSize: '1rem' }}>
                            <option value="" disabled>Seçiniz</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="date">Tarih</label>
                        <input type="date" name="date" id="date" className="form-input" value={formData.date} onChange={handleChange} required style={{ height: '3rem', fontSize: '1rem' }} />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label" htmlFor="description">Kısa Açıklama</label>
                    <input type="text" name="description" id="description" className="form-input" value={formData.description} onChange={handleChange} placeholder="Örn: Aylık Market Alışverişi..." style={{ height: '3rem', fontSize: '1rem' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{
                        flex: 1,
                        background: formData.type === 'expense' ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' : 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '1.2rem',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        boxShadow: formData.type === 'expense' ? '0 4px 14px rgba(239,68,68,0.3)' : '0 4px 14px rgba(16,185,129,0.3)',
                        transition: 'transform 0.1s ease',
                        cursor: 'pointer'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        {isEditing ? 'Değişiklikleri Kaydet' : (formData.type === 'expense' ? 'Gideri Onayla' : 'Geliri Onayla')}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={onCancelEdit} className="btn" style={{
                            flex: 0.4,
                            background: '#F3F4F6',
                            border: 'none',
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--border-radius-md)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}>
                            İptal
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;
