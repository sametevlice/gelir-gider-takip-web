import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirm_password) {
            return setError('Şifreler eşleşmiyor, lütfen kontrol ediniz.');
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5050/api/auth/register', {
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password
            });

            setSuccess('Account created successfully! You can sign in now.');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Kayıt olurken bir hata oluştu. Sunucu bağlantısını kontrol edin.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-split-bg">
            <div className="auth-overlay"></div>

            <div className="auth-content-wrapper">
                <div className="auth-left-pane">
                    <h1 className="auth-left-text">Start your<br />financial<br />journey!</h1>
                </div>

                <div className="auth-right-pane">
                    <div className="auth-white-card" style={{ padding: '2rem 3.5rem' }}>
                        <h2 className="auth-title">Create an account</h2>

                        {error && <div className="error-msg">{error}</div>}
                        {success && <div className="success-msg">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="auth-label">
                                <label htmlFor="full_name">Full Name</label>
                            </div>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                className="auth-input"
                                style={{ marginBottom: '1rem' }}
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />

                            <div className="auth-label">
                                <label htmlFor="email">Email Address</label>
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="auth-input"
                                style={{ marginBottom: '1rem' }}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <div className="auth-label">
                                <label htmlFor="password">Password</label>
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="auth-input"
                                style={{ marginBottom: '1rem' }}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />

                            <div className="auth-label">
                                <label htmlFor="confirm_password">Confirm Password</label>
                            </div>
                            <input
                                type="password"
                                id="confirm_password"
                                name="confirm_password"
                                className="auth-input"
                                style={{ marginBottom: '1rem' }}
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                            />

                            <button type="submit" className="btn-green" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Sign up'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </div>

                        <div className="auth-terms-text">
                            Application collects and uses personal data in accordance with our <a href="#">Privacy Policy</a>. By creating an account, you agree to our <a href="#">User Terms</a>, including our <a href="#">Fair Use Policy</a>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
