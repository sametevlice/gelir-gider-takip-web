import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

const TransactionsPage = () => {
    const navigate = useNavigate();
    const handleAuthError = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Ortak axios ayarları (Token göndermek için)
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:5050/api',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    // Sayfa yüklendiğinde işlemleri getir
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/transactions');
            setTransactions(res.data.transactions || []);
            setError(null);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleAuthError();
            } else {
                setError('İşlemler yüklenirken bir hata oluştu.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = async (formData) => {
        try {
            const res = await axiosInstance.post('/transactions', formData);
            setTransactions([res.data.transaction, ...transactions]);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleAuthError();
            } else {
                alert('İşlem eklenemedi: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    const handleEditSubmit = async (formData) => {
        try {
            const res = await axiosInstance.put(`/transactions/${editingTransaction.id}`, formData);
            const updatedTx = res.data.transaction;
            setTransactions(transactions.map(t => t.id === updatedTx.id ? updatedTx : t));
            setEditingTransaction(null);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleAuthError();
            } else {
                alert('Güncelleme başarısız: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm("Bu işlemi silmek istediğinize emin misiniz?")) return;

        try {
            await axiosInstance.delete(`/transactions/${id}`);
            setTransactions(transactions.filter(t => t.id !== id));
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleAuthError();
            } else {
                alert('Silme başarısız: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>Gelir ve Giderler</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Günlük harcamalarınızı ve gelirlerinizi buradan yönetin.</p>
                </div>
            </div>

            {error && <div className="error-msg" style={{ marginBottom: '1.5rem' }}>{error}</div>}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(450px, 1fr) 1.2fr',
                gap: '2.5rem',
                alignItems: 'start'
            }}>

                {/* Sol Sütun: Form */}
                <div>
                    <TransactionForm 
                        onSubmitTransaction={editingTransaction ? handleEditSubmit : handleAddTransaction}
                        initialData={editingTransaction}
                        isEditing={!!editingTransaction}
                        onCancelEdit={() => setEditingTransaction(null)}
                    />
                </div>

                {/* Sağ Sütun: Liste */}
                <div className="dash-card">
                    <h3 className="dash-card-title" style={{ marginBottom: '1.2rem' }}>İşlem Geçmişiniz</h3>
                    {loading ? (
                        <div style={{ color: 'var(--text-secondary)' }}>İşlemler yükleniyor...</div>
                    ) : (
                        <TransactionList
                            transactions={transactions}
                            onDeleteTransaction={handleDeleteTransaction}
                            onEditTransaction={(tx) => {
                                // Seçilen transaction'ı edit moduna al. Date format düzeltilmeli:
                                setEditingTransaction({
                                    ...tx,
                                    date: tx.date ? tx.date.split('T')[0] : ''
                                });
                            }}
                        />
                    )}
                </div>

            </div>
        </div>
    );
};

export default TransactionsPage;
