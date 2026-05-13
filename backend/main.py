import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from fpdf import FPDF
from fastapi.responses import FileResponse
import tempfile

load_dotenv(override=True)

# Gemini Config
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    masked_key = f"{api_key[:4]}...{api_key[-4:]}"
    print(f"🚀 Gemini API Key yüklendi: {masked_key}")
else:
    print("⚠️ GEMINI_API_KEY bulunamadı!")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')


app = FastAPI(title="Eko-Portal Backend")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Product(BaseModel):
    id: int
    name: str
    price: float
    img: str
    tag: str
    stock: int
    daily_sales_avg: float

class OrderItem(BaseModel):
    id: int
    name: str
    price: float
    quantity: int

class Order(BaseModel):
    id: int
    user_email: str
    items: List[OrderItem]
    total: float
    address: str
    status: str = "Hazırlanıyor"  # Hazırlanıyor, Yolda, Teslim Edildi, İptal Edildi
    shipping_details: Optional[str] = "Henüz kargoya verilmedi."
    risk_score: float = 0.0 # 0.0 - 1.0 (AI determined risk)

class AddressUpdate(BaseModel):
    new_address: str

class ChatRequest(BaseModel):
    message: str
    user_role: Optional[str] = "visitor"
    user_name: Optional[str] = ""
    user_email: Optional[str] = ""

# In-memory database
products = [
    {"id": 1, "name": "Organik Sızma Zeytinyağı", "price": 280, "img": "🫒", "tag": "En Çok Satan", "stock": 150, "daily_sales_avg": 5.2},
    {"id": 2, "name": "Yerli Besi Köy Yumurtası", "price": 95, "img": "🥚", "tag": "Yeni", "stock": 200, "daily_sales_avg": 12.0},
    {"id": 3, "name": "Taze Bahçe Domatesi", "price": 45, "img": "🍅", "tag": "İndirim", "stock": 42, "daily_sales_avg": 15.5},
    {"id": 4, "name": "Ev Yapımı Erişte", "price": 85, "img": "🍝", "tag": "Doğal", "stock": 80, "daily_sales_avg": 3.1},
    {"id": 5, "name": "Çiçek Balı (850g)", "price": 320, "img": "🍯", "tag": "Sınırlı Stok", "stock": 15, "daily_sales_avg": 1.5},
    {"id": 6, "name": "Kurutulmuş Patlıcan", "price": 60, "img": "🍆", "tag": "Geleneksel", "stock": 100, "daily_sales_avg": 4.0}
]

orders = [
    {
        "id": 1284, 
        "user_email": "sude@eko.com", 
        "items": [{"id": 1, "name": "Organik Sızma Zeytinyağı", "price": 280, "quantity": 1}],
        "total": 280,
        "address": "Kadıköy, İstanbul",
        "status": "Yolda",
        "shipping_details": "Kargo aktarma merkezinde (Tuzla). Tahmini teslim: Yarın.",
        "risk_score": 0.1
    },
    {
        "id": 1285, 
        "user_email": "aysegul@kobicay.com", 
        "items": [{"id": 3, "name": "Taze Bahçe Domatesi", "price": 45, "quantity": 10}],
        "total": 450,
        "address": "Çankaya, Ankara",
        "status": "Hazırlanıyor",
        "shipping_details": "Sipariş onaylandı, paketleme aşamasında.",
        "risk_score": 0.8
    },
    {
        "id": 1286, 
        "user_email": "sude@eko.com", 
        "items": [{"id": 5, "name": "Çiçek Balı (850g)", "price": 320, "quantity": 1}],
        "total": 320,
        "address": "Beşiktaş, İstanbul",
        "status": "Hazırlanıyor",
        "shipping_details": "Sipariş alındı, paketleme bekliyor.",
        "risk_score": 0.2
    }
]

@app.get("/api/products", response_model=List[Product])
async def get_products():
    return products

@app.post("/api/orders")
async def create_order(order: Order):
    orders.append(order.dict())
    return {"message": "Sipariş başarıyla oluşturuldu", "order_id": order.id}

@app.get("/api/orders/{user_email}")
async def get_user_orders(user_email: str):
    user_orders = [o for o in orders if o["user_email"] == user_email]
    return user_orders

@app.post("/api/orders/{order_id}/cancel")
async def cancel_order(order_id: int):
    for order in orders:
        if order["id"] == order_id:
            if order["status"] == "Hazırlanıyor":
                order["status"] = "İptal Edildi"
                return {"message": f"Sipariş #{order_id} iptal edildi."}
            else:
                raise HTTPException(status_code=400, detail="Sadece 'Hazırlanıyor' durumundaki siparişler iptal edilebilir.")
    raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")

@app.patch("/api/orders/{order_id}/address")
async def update_order_address(order_id: int, update: AddressUpdate):
    for order in orders:
        if order["id"] == order_id:
            if order["status"] == "Hazırlanıyor":
                order["address"] = update.new_address
                return {"message": f"Sipariş #{order_id} adresi güncellendi."}
            else:
                raise HTTPException(status_code=400, detail="Yoldaki siparişlerin adresi değiştirilemez.")
    raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")

@app.get("/api/admin/daily-brief")
async def get_daily_brief():
    pending_orders = [o for o in orders if o["status"] == "Hazırlanıyor"]
    high_risk_orders = [o for o in orders if o["risk_score"] > 0.5]
    low_stock = [p for p in products if p["stock"] < 50]
    
    return {
        "date": "13 Mayıs 2026",
        "summary": f"Bugün hazırlanması gereken {len(pending_orders)} sipariş var. {len(high_risk_orders)} siparişte gecikme riski tespit edildi.",
        "tasks": [
            f"{len(pending_orders)} adet paketi saat 12:00'ye kadar kargoya hazırla.",
            f"Kritik stok seviyesindeki {len(low_stock)} ürün için tedarikçilerle görüş."
        ],
        "optimized_route": ["Depo", "Kadıköy Aktarma", "Tuzla Lojistik Merkezi", "Depo Dönüş"]
    }

@app.get("/api/admin/inventory/forecast")
async def get_inventory_forecast():
    forecasts = []
    for p in products:
        days_left = p["stock"] / p["daily_sales_avg"] if p["daily_sales_avg"] > 0 else 999
        forecasts.append({
            "product": p["name"],
            "current_stock": p["stock"],
            "days_until_empty": round(days_left, 1),
            "recommendation": "Acil Sipariş" if days_left < 3 else "Takipte Kal"
        })
    return forecasts

@app.get("/api/admin/stats")
async def get_admin_stats():
    return {
        "today_orders": len(orders),
        "stock_warnings": len([p for p in products if p["stock"] < 50]),
        "ai_suggestions": [
            {
                "type": "logistic",
                "title": "Rota Optimizasyonu",
                "message": "İstanbul içi teslimatlar için Tuzla üzerinden geçmek yakıt tasarrufu sağlayacaktır."
            },
            {
                "type": "stock",
                "title": "Tedarik Tahmini",
                "message": f"{products[2]['name']} stoğu 3 gün içinde bitebilir."
            }
        ]
    }

@app.get("/api/admin/orders")
async def get_all_orders():
    return orders

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") == "buraya_kendi_api_keyinizi_yazin":
         return {"response": "⚠️ Gemini API Anahtarı eksik veya hatalı! Lütfen backend/.env dosyanızı kontrol edin. (Sistem şu an simülasyon modunda)"}
    
    user_orders = [o for o in orders if o["user_email"] == request.user_email]
    orders_info = "\n".join([f"- Sipariş #{o['id']}: Durum: {o['status']}, Adres: {o['address']}, Detay: {o['shipping_details']}" for o in user_orders])
    product_info = "\n".join([f"- {p['name']}: {p['price']} TL (Stok: {p['stock']})" for p in products])
    
    system_prompt = f"""
    Sen Eko-Portal'ın aksiyon alabilen yapay zeka asistanı Eko-Rehber'sin. 
    Kullanıcı: {request.user_name} ({request.user_role})
    
    Ürün Bilgileri:
    {product_info}
    
    Kullanıcının Siparişleri:
    {orders_info if user_orders else "Kullanıcının henüz siparişi yok."}
    
    Yeteneklerin & Kuralların:
    1. Ürünler ve sipariş durumu hakkında bilgi ver.
    2. Eğer kullanıcı bir siparişi İPTAL etmek isterse ve durumu 'Hazırlanıyor' ise, direkt iptal etme. Önce "Siparişinizi iptal etmek istediğinizden emin misiniz? Onaylamak için 'onaylıyorum' yazın." de.
    3. Eğer kullanıcı 'onaylıyorum' yazarsa ve bekleyen bir iptal talebi varsa (Hazırlanıyor durumunda siparişi varsa), SİSTEME ÖZEL BİR KOMUT GÖNDER: [ACTION:CANCEL_ORDER_1286] (Buradaki ID kullanıcının hazırlanan sipariş ID'si olmalı).
    4. İptal işlemi başarılı olursa kullanıcıya bilgi ver.
    5. Kargo gecikme riski varsa (risk_score > 0.5), kullanıcıyı nazikçe bilgilendir.
    6. Cevapların kısa, çözüm odaklı ve profesyonel olsun.
    
    Kullanıcı Mesajı: {request.message}
    """
    
    try:
        response = model.generate_content(system_prompt)
        ai_response = response.text
        
        # Action Handler: CANCEL_ORDER
        if "[ACTION:CANCEL_ORDER_" in ai_response:
            import re
            match = re.search(r"\[ACTION:CANCEL_ORDER_(\d+)\]", ai_response)
            if match:
                order_id = int(match.group(1))
                # Call internal cancel logic
                for order in orders:
                    if order["id"] == order_id and order["status"] == "Hazırlanıyor":
                        order["status"] = "İptal Edildi"
                        ai_response = ai_response.replace(f"[ACTION:CANCEL_ORDER_{order_id}]", "")
                        ai_response += f"\n\n✅ Sipariş #{order_id} başarıyla iptal edildi."
        
        return {"response": ai_response}
    except Exception as e:
        return {"response": f"🌱 Eko-Rehber şu anda bir teknik zorluk yaşıyor. Hata: {str(e)}"}

# Mock Sales Data for Statistics
sales_data = {
    "monthly_revenue": [
        {"month": "Ocak", "revenue": 12500},
        {"month": "Şubat", "revenue": 15200},
        {"month": "Mart", "revenue": 18900},
        {"month": "Nisan", "revenue": 22400},
        {"month": "Mayıs", "revenue": 14200}
    ],
    "category_distribution": [
        {"category": "Sıvı Yağlar", "value": 45},
        {"category": "Şarküteri", "value": 25},
        {"category": "Sebze/Meyve", "value": 20},
        {"category": "Diğer", "value": 10}
    ],
    "top_products": [
        {"name": "Organik Sızma Zeytinyağı", "sales": 124},
        {"name": "Yerli Besi Köy Yumurtası", "sales": 98},
        {"name": "Taze Bahçe Domatesi", "sales": 85}
    ]
}

@app.get("/api/admin/sales-stats")
async def get_sales_stats():
    return sales_data

@app.get("/api/admin/ai-report")
async def generate_ai_report():
    stats_summary = f"""
    Satış Verileri:
    Aylık Gelir: {sales_data['monthly_revenue']}
    Kategori Dağılımı: {sales_data['category_distribution']}
    En Çok Satanlar: {sales_data['top_products']}
    Kritik Stoklar: {[p['name'] for p in products if p['stock'] < 50]}
    """
    
    prompt = f"""
    Sen bir kıdemli iş analisti ve kooperatif danışmanısın. Aşağıdaki verileri analiz ederek bir 'Eko-Portal Stratejik Operasyon Raporu' oluştur.
    
    {stats_summary}
    
    Rapor şunları içermeli:
    1. Satış Performans Özeti (Gelir artış/azalış trendi).
    2. Kategori Bazlı Analiz (Hangi alanlara yatırım yapılmalı?).
    3. Stok ve Tedarik Önerileri.
    4. Gelecek Ay İçin Tahmin ve Strateji.
    
    Cevabı profesyonel bir rapor formatında ver.
    """
    
    try:
        response = model.generate_content(prompt)
        return {"report": response.text}
    except Exception:
        return {"report": "Rapor oluşturulurken bir hata oluştu."}

def fix_turkish_chars(text):
    # FPDF standard fonts have issues with 'ı' and 'ğ' specifically.
    # We'll replace them with characters that exist in Latin-1/Latin-5 more reliably.
    mapping = {
        'ı': 'i', 'İ': 'I',
        'ğ': 'g', 'Ğ': 'G',
        'ş': 's', 'Ş': 'S',
        'ç': 'c', 'Ç': 'C',
        'ü': 'u', 'Ü': 'U',
        'ö': 'o', 'Ö': 'O'
    }
    for search, replace in mapping.items():
        text = text.replace(search, replace)
    return text

@app.get("/api/admin/download-report")
async def download_ai_report():
    report_data = await generate_ai_report()
    report_text = report_data.get("report", "Rapor verisi alinamadi.")
    
    # Fix characters before PDF generation
    report_text = fix_turkish_chars(report_text)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(200, 10, txt="Eko-Portal Stratejik AI Raporu", ln=True, align="C")
    pdf.set_font("Arial", size=10)
    pdf.ln(10)
    
    # After replacement, we can use simple latin-1 or the encode/decode trick
    clean_text = report_text.encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 10, txt=clean_text)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf.output(tmp.name)
        return FileResponse(tmp.name, media_type='application/pdf', filename="Eko_Portal_AI_Raporu.pdf")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
