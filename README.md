# 🌿 Eko-Portal: Akıllı Kooperatif & Üretici Yönetim Sistemi

Eko-Portal, yerel üreticileri ve kooperatifleri dijitalleştirerek modern teknoloji ve yapay zeka ile buluşturan, sürdürülebilir bir operasyon yönetim platformudur.

## Temel Özellikler

###  Müşteri Deneyimi
- **Akıllı Alışveriş:** Yerel kooperatif ürünlerini keşfetme, sepete ekleme ve satın alma.
- **Hızlı Ödeme (Hızlı Doldur):** Demo kolaylığı için tek tıkla mock kart ve adres bilgisi doldurma.
- **Dinamik Sipariş Takibi:** Siparişlerin durumunu (Onay, Hazırlık, Yolda, Teslim) canlı takip etme.
- **Kolay İptal & Tekrar Sipariş:** Hazırlanan siparişleri iptal etme veya teslim edilenleri tek tıkla yeniden sepetine ekleme.

###  AI-Rehber (Yapay Zeka Asistanı)
- **Aksiyon Alabilen Asistan:** Chatbot üzerinden sipariş durumunu sorma ve direkt aksiyon alma.
- **Akıllı İptal Akışı:** Chate "siparişimi iptal et" yazınca AI'nın onay istemesi ve "onaylıyorum" denince işlemi iptal eder.
- **Ürün Danışmanlığı:** Mevcut stoklar ve ürün fiyatları hakkında anlık bilgilendirme.

###  Yönetici (Admin) Paneli
- **Stratejik Dashboard:** Toplam sipariş, stok uyarıları ve operasyonel özet.
- **VRP Rota Optimizasyonu:** Dağıtım araçları için AI destekli en verimli rota önerileri.
- **Stok Tahminleme:** Satış hızına göre ürünlerin ne zaman biteceğine dair AI tahminleri.
- **AI Stratejik Rapor (PDF):** Satış verilerini analiz ederek profesyonel strateji raporu oluşturma ve indirme.

##  Teknik Kurulum

### 1. Backend (FastAPI + Gemini AI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
- `.env` dosyasına geçerli bir `GEMINI_API_KEY` eklenmelidir.
- Sistem varsayılan olarak `gemini-2.5-flash` modelini kullanır.

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

##  Giriş Bilgileri

| Rol | E-posta | Şifre |
| :--- | :--- | :--- |
| **Yönetici** | `admin@ekosistem.ai` | `admin123` |
| **Müşteri** | `sude@eko.com` | `password123` |

*Not: Kendi hesabınızı oluşturmak için "Kaydolun" seçeneğini kullanabilirsiniz (Tarayıcı hafızasına kaydedilir).*

##  Teknolojiler
- **Frontend:** React, Lucide Icons, Vanilla CSS
- **Backend:** Python, FastAPI, Gemini AI API, FPDF
- **Veritabanı:** Bellek içi (In-memory) mock veritabanı

---
*Bu proje sürdürülebilir tarım ve teknoloji dayanışması amacıyla geliştirilmiştir.*
