import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5050/api/auth/login', formData);

            // Token ve kullanıcı bilgisini locale kaydet
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Başarılı girişten sonra dashboard'a yönlendir
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Giriş yapılırken bir hata oluştu. Sunucuya ulaşılamıyor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">FinansTakip</h1>
                <p className="auth-subtitle">Tekrar hoş geldiniz, bilgilerinizi giriniz.</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">E-posta Adresi</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="ornek@posta.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Şifre</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '1rem' }}>
                        {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Hesabınız yok mu? <Link to="/register" style={{ fontWeight: '500' }}>Hemen Kayıt Olun</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
