import { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export default function Account() {
  const user = useStore(state => state.user);
  const login = useStore(state => state.login);
  const showToast = useStore(state => state.showToast);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    currency: user?.currency || 'TRY',
    notifications: true
  });

  const handleSave = () => {
    updateUser({
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number,
      currency: formData.currency
    });
    showToast('Değişiklikler başarıyla kaydedildi!', 'success');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      updateUser({ avatar: base64String });
      showToast('Profil fotoğrafı güncellendi.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    updateUser({ avatar: null });
    showToast('Profil fotoğrafı kaldırıldı.', 'success');
  };

  const updateUser = useStore(state => state.updateUser);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        id="avatar-input" 
        className="hidden" 
        accept="image/*" 
        onChange={handleAvatarUpload} 
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#11142D] mb-1 tracking-tight">Hesap Ayarları</h1>
          <p className="text-sm text-gray-400 font-bold tracking-tight">Profilini ve tercihlerini buradan yönet.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-[#11142D] text-white px-8 py-3.5 rounded-2xl font-extrabold text-[13px] hover:scale-105 transition-all shadow-lg shadow-gray-200 active:scale-95 uppercase tracking-widest"
        >
          Değişiklikleri Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 flex flex-col gap-8">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-[40px] bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center text-5xl mb-6 text-indigo-500 relative overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                '🧑‍💻'
              )}
              <button 
                onClick={() => document.getElementById('avatar-input').click()}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-tl-2xl bg-[#11142D] text-white flex items-center justify-center hover:bg-black transition-all shadow-lg active:scale-90"
              >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </button>
            </div>
            <h2 className="text-[20px] font-extrabold text-[#11142D] tracking-tight">{user?.full_name || 'Kullanıcı'}</h2>
            <p className="text-[13px] font-bold text-gray-400 mt-1">{user?.email || ''}</p>
            
            <div className="mt-8 w-full flex flex-col gap-3">
              <button 
                onClick={() => document.getElementById('avatar-input').click()}
                className="w-full bg-[#FAFBFC] border border-gray-100 text-[#11142D] py-3.5 rounded-2xl text-[12px] font-extrabold uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                Profil Fotoğrafı Yükle
              </button>
              <button 
                onClick={handleRemoveAvatar}
                className="w-full bg-red-50 border border-red-100 text-red-500 py-3.5 rounded-2xl text-[12px] font-extrabold uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
              >
                Fotoğrafı Kaldır
              </button>
            </div>
          </div>

        </div>


        <div className="col-span-1 lg:col-span-2 bg-white rounded-[32px] p-10 shadow-sm border border-gray-50">
          <h3 className="text-[19px] font-extrabold text-[#11142D] mb-8 tracking-tight">Kişisel Bilgiler</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] block mb-3">Tam İsim</label>
              <input 
                type="text" 
                className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#11142D] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm" 
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] block mb-3">E-posta Adresi</label>
              <input 
                type="email" 
                className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#11142D] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] block mb-3">Telefon Numarası</label>
              <input 
                type="text" 
                className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#11142D] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm" 
                value={formData.phone_number}
                onChange={e => setFormData({...formData, phone_number: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] block mb-3">Para Birimi</label>
              <div className="relative">
                <select 
                  className="w-full bg-[#FAFBFC] border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#11142D] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all appearance-none cursor-pointer shadow-sm"
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="my-12 border-t border-gray-50"></div>
          
          <h3 className="text-[19px] font-extrabold text-[#11142D] mb-8 tracking-tight">Tercihler</h3>
          
          <div className="space-y-4">
            <label 
              onClick={() => setFormData({...formData, notifications: !formData.notifications})}
              className="flex items-center justify-between p-6 rounded-3xl bg-[#FAFBFC] border border-gray-100 cursor-pointer hover:border-gray-200 transition-all shadow-sm"
            >
              <div>
                <div className="text-[15px] font-extrabold text-[#11142D]">E-posta Bildirimleri</div>
                <div className="text-[12px] font-bold text-gray-400 mt-1">Hesap aktivitelerin hakkında güncellemeler al.</div>
              </div>
              <div className={`w-12 h-7 rounded-full relative transition-all ${formData.notifications ? 'bg-[#11142D]' : 'bg-gray-200'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all ${formData.notifications ? 'right-1' : 'left-1'}`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
