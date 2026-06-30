# 🚀 FinTech - Yeni Nesil Akıllı Finans Yönetimi (Web Uygulaması)

Modern tasarımı, yapay zeka destekli asistanı ve güçlü veritabanı altyapısıyla finansal hayatınızı tek bir yerden kontrol etmenizi sağlayan, uçtan uca akıllı bir gelir-gider takip ve bütçe planlama platformu.

![Landing Page](./screenshots/5.png)

## ✨ Projenin Güçlü Yönleri ve Mimari

### 🧠 Gemini 1.5 Flash Tabanlı İnteraktif AI Finansal Asistan
Uygulamamız, Google'ın en yeni ve performanslı dil modeli **Gemini 1.5 Flash** ile güçlendirilmiş entegre bir yapay zeka asistanına sahiptir. Klasik finans uygulamalarından farklı olarak projemiz veriyi sadece göstermez, yorumlar:
- **Akıllı Tasarruf Önerileri:** Harcama alışkanlıklarınızı analiz ederek size özel bütçe optimizasyon tavsiyeleri sunar.
- **Dinamik Bütçe Analiz Skoru:** Finansal sağlığınızı gerçek zamanlı olarak değerlendirir.
- **İnteraktif Soru-Cevap:** "Nasıl tasarruf edebilirim?", "En kritik harcamam ne?" gibi sorularınıza anında, veriye dayalı asistan yanıtları üretir.

![Dashboard ve AI Asistan](./screenshots/4.png)

### 📊 Detaylı Finansal Analiz ve Görsel Raporlama
Kullanıcıların finansal durumlarını en iyi şekilde analiz edebilmesi için gelişmiş grafik kütüphaneleri kullanılmıştır.
- **Gelir & Gider Akışı:** Belirli periyotlardaki nakit akışını interaktif bar grafiklerle karşılaştırmalı olarak sunar.
- **Kategori Dağılımı:** Harcamalarınızı (Ev & Yaşam, Abonelikler, Faturalar vb.) otomatik kategorize ederek dairesel grafiklerle (Pie Chart) oransal olarak gösterir.

![Finansal Analiz ve Grafikler](./screenshots/9.png)

### ⚡ Hızlı ve Pratik İşlem Ekleme Modülü
Kullanıcı deneyimi (UX) odaklı tasarlanan kayıt modülü sayesinde finansal hareketleri sisteme işlemek saniyeler sürer.
- Gelir ve Gider için optimize edilmiş, animasyonlu modal (popup) pencereleri.
- Kategori, tutar ve tarih seçimlerinin pratik bir arayüzle sunulması.

![Yeni Gider Ekleme](./screenshots/6.png)
![Yeni Gelir Ekleme](./screenshots/7.png)

### 🗄️ Merkezi Supabase (PostgreSQL) Veritabanı Yapısı
Projenin veri mimarisi, modern ve ölçeklenebilir bir Backend-as-a-Service olan **Supabase** üzerine inşa edilmiştir.
- **Güçlü ve İlişkisel Altyapı:** PostgreSQL'in tüm gücüyle veri bütünlüğü sağlayan sağlam veritabanı şeması.
- **Gerçek Zamanlı (Real-time) Senkronizasyon:** Gelir/gider kayıtlarındaki değişikliklerin anında tüm grafiklere ve arayüze yansıması.

![Bütçe ve Hedefler](./screenshots/2.png)

### 📅 Gelişmiş Ödeme Takvimi ve Abonelik Yönetimi
Kullanıcıların nakit akışını en iyi şekilde yönetebilmesi için geliştirilen interaktif takvim modülü:
- Gelecek aylardaki ödemelerinizi takvim üzerinde görselleştirerek nakit darboğazlarını önceden tespit etmenizi sağlar.
- Netflix, Apple, Disney+ vb. tekrar eden aboneliklerin yıllık bazda maliyet analizini çıkarır ve tasarruf ipuçları sunar.

![Ödeme Takvimi](./screenshots/1.png)

### ⚙️ Kişiselleştirilmiş Hesap Yönetimi
Kullanıcıların platform deneyimini özelleştirebileceği modern ayarlar sayfası. Profil, iletişim bilgileri, para birimi tercihleri ve bildirim izinlerinin tek bir merkezden yönetimi sağlanır.

![Hesap Ayarları](./screenshots/8.png)

---

## 🛠️ Kullanılan Temel Teknolojiler

- **Frontend:** React / Next.js (Modern, Glassmorphism ve dinamik animasyonlar)
- **Backend & Veritabanı:** Supabase (PostgreSQL)
- **Yapay Zeka:** Google Gemini 1.5 Flash API
- **Stil & Tasarım:** TailwindCSS, Özel Renk Paletleri

---

## 💻 Yerelde Kurulum Adımları (Geliştirici Rehberi)

Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla izleyebilirsiniz.

1. **Projeyi Klonlayın ve Frontend Klasörüne Girin:**
   ```bash
   git clone <github-repo-linkiniz>
   cd web-gelir-takip/frontend-web
   ```

2. **Gerekli Paketleri (Dependencies) Yükleyin:**
   ```bash
   npm install
   ```

3. **Çevre Değişkenlerini (Environment Variables) Yapılandırın:**
   `frontend-web` dizininde bir `.env` (veya `.env.local`) dosyası oluşturun ve aşağıdaki değişkenleri kendi anahtarlarınızla doldurun:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=senin_supabase_url_adresin
   NEXT_PUBLIC_SUPABASE_ANON_KEY=senin_supabase_anon_key_degerin
   GEMINI_API_KEY=senin_gemini_api_anahtarin
   ```

4. **Uygulamayı Başlatın:**
   ```bash
   npm run dev
   ```
   *Uygulama başarıyla başlatıldığında `http://localhost:3000` adresinden projeyi görüntüleyebilirsiniz.*
