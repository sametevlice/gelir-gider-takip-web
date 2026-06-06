import axios from 'axios';

const API_BASE_URL = 'http://18.185.39.181:5005/api';

// Axios örneği oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek öncesi araya girerek (interceptor) token ekle
import { supabase } from '../supabaseClient';

api.interceptors.request.use(
  async (config) => {
    // Önce localStorage'da eski usül access_token var mı bakalım
    let token = localStorage.getItem('access_token');
    
    // Eğer yoksa Supabase session'dan alalım
    if (!token) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        token = session.access_token;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıtları dinleyerek 401 hatalarını yakala
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token geçersiz veya süresi dolmuş
      console.error("401 Hatası: Oturum süresi doldu.");
      localStorage.removeItem('access_token');
      localStorage.removeItem('cashio_data'); // Opsiyonel: Store verilerini temizle

      // Kullanıcıyı bilgilendirip sayfayı yenile veya login'e yönlendir
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth Servisleri ---
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  // Giriş başarılıysa token'ı kaydet
  if (response.data.session?.access_token) {
    localStorage.setItem('access_token', response.data.session.access_token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
};

// --- Transaction Servisleri ---
export const addTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

export const getBalance = async () => {
  const response = await api.get('/transactions/balance');
  return response.data;
};

export const updateTransaction = async (id, transactionData) => {
  const response = await api.put(`/transactions/${id}`, transactionData);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// --- Planned Payments Servisleri ---
export const getPlannedPayments = async () => {
  const response = await api.get('/planned-payments');
  return response.data;
};

export const addPlannedPayment = async (data) => {
  const response = await api.post('/planned-payments', data);
  return response.data;
};

export const deletePlannedPayment = async (id) => {
  const response = await api.delete(`/planned-payments/${id}`);
  return response.data;
};

// --- AI Servisleri ---
export const getAiHealthCache = async () => {
  const response = await api.get('/ai/health');
  return response.data;
};

export const refreshAiHealth = async (transactions) => {
  const response = await api.post('/ai/health', { transactions });
  return response.data;
};

export const askAiAssistant = async (transactions, question) => {
  const response = await api.post('/ai/chat', { transactions, question });
  return response.data;
};

export default api;
