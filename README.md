# 🤖 PC Parts Store - AI Chatbot

> Chatbot AI thông minh hỗ trợ tư vấn linh kiện máy tính, build PC gaming/workstation với Gemini Pro hoặc Cloudflare Workers AI.

![Demo](https://img.shields.io/badge/Status-Ready-brightgreen) ![AI](https://img.shields.io/badge/AI-Gemini%20Pro-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Tính năng nổi bật

- 🎯 **Tư vấn thông minh**: AI phân tích nhu cầu và đề xuất cấu hình tối ưu
- 💰 **Tối ưu ngân sách**: Đưa ra 2-3 phương án phù hợp với túi tiền
- ✅ **Kiểm tra tương thích**: Cảnh báo vấn đề về socket, PSU, kích thước
- 📊 **So sánh hiệu năng**: Phân tích chi tiết các linh kiện
- 🎨 **UI/UX chuyên nghiệp**: Gradient design, animations, responsive
- 💾 **Lưu lịch sử chat**: Tự động lưu conversation vào localStorage
- 🚀 **Phản hồi nhanh**: Real-time response với typing indicator
- 🔒 **Bảo mật**: API key được giữ ở backend, không expose ra frontend

## 📁 Cấu trúc dự án

```
chatbot-pc/
├── backend/
│   ├── server.js           # Express server với Gemini/Cloudflare AI
│   ├── package.json
│   ├── .env                # Config (không commit)
│   └── .env.example        # Template config
├── frontend/
│   ├── index.html          # Landing page + chat widget (Vanilla JS)
│   └── react/
│       └── ChatWidget.jsx  # React component (tùy chọn)
├── .gitignore
└── README.md
```

## 🚀 Hướng dẫn cài đặt

### Bước 1: Clone & Setup Backend

```bash
cd backend
cp .env.example .env
npm install
```

### Bước 2: Cấu hình API

**Option 1: Dùng Gemini Pro (Khuyến nghị)**

1. Lấy API key miễn phí tại: https://aistudio.google.com/app/apikey
2. Cập nhật file `.env`:

```env
PROVIDER=gemini
GOOGLE_API_KEY=AIzaSy...your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
PORT=3001
CORS_ORIGIN=http://localhost:5500,http://localhost:3000
```

**Option 2: Dùng Cloudflare Workers AI (Miễn phí, không cần thẻ)**

1. Đăng ký Cloudflare: https://dash.cloudflare.com
2. Lấy Account ID & API Token tại Workers AI
3. Cập nhật `.env`:

```env
PROVIDER=cloudflare
CF_ACCOUNT_ID=your_account_id
CF_API_TOKEN=your_api_token
CF_MODEL=@cf/meta/llama-3-8b-instruct
```

### Bước 3: Chạy Backend

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3001`

### Bước 4: Chạy Frontend

**Cách 1: Dùng Python HTTP Server**
```bash
cd ../frontend
python -m http.server 5500
```

**Cách 2: Dùng Live Server (VS Code Extension)**
- Cài extension "Live Server"
- Right-click vào `index.html` → "Open with Live Server"

**Cách 3: Dùng npx serve**
```bash
npx serve frontend
```

Truy cập: `http://localhost:5500`

## 🎨 Demo Screenshots

### Landing Page
- Hero section với gradient design
- Feature cards
- Call-to-action buttons

### Chat Widget
- Floating button với unread badge
- Chat panel với typing indicator
- Quick suggestions
- Markdown support
- Chat history

## 🔧 Tùy biến

### Thay đổi System Prompt

Edit file `backend/server.js`, tìm `SYSTEM_PROMPT`:

```javascript
const SYSTEM_PROMPT = `
Bạn là trợ lý AI chuyên nghiệp...
// Thêm chính sách của bạn ở đây
`;
```

### Cập nhật giá sản phẩm

Trong `SAMPLE_PRODUCTS`, cập nhật giá và linh kiện mới:

```javascript
const SAMPLE_PRODUCTS = `
CPU Gaming phổ biến:
- Intel i5-14400F: ~5.2tr
// Thêm sản phẩm mới...
`;
```

### Thay đổi màu sắc

Trong `frontend/index.html`, tìm các class `gradient-bg`:

```css
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Đổi màu gradient tại đây */
}
```

### CORS Configuration

Thêm domain vào `.env`:

```env
CORS_ORIGIN=http://localhost:5500,https://yourdomain.com,https://www.yourdomain.com
```

## 🧩 Tích hợp React Component

```jsx
import ChatWidget from './frontend/react/ChatWidget';

function App() {
  return (
    <div>
      <ChatWidget backendUrl="http://localhost:3001" />
    </div>
  );
}
```

## 📊 API Endpoints

### POST `/api/chat`
Gửi tin nhắn và nhận phản hồi từ AI

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Tư vấn build gaming 20tr" }
  ]
}
```

**Response:**
```json
{
  "reply": "🎮 Build Gaming 1440p...",
  "provider": "gemini"
}
```

### GET `/health`
Kiểm tra trạng thái server

**Response:**
```json
{
  "ok": true,
  "provider": "gemini",
  "timestamp": "2025-10-22T..."
}
```

### GET `/api/stats`
Thống kê server (optional)

## 🛡️ Bảo mật

- ✅ API key được lưu trong `.env` (backend only)
- ✅ `.gitignore` bảo vệ file nhạy cảm
- ✅ Rate limiting: 60 requests/phút
- ✅ Input validation với Zod
- ✅ CORS configuration
- ✅ Error handling toàn diện

## 🐛 Troubleshooting

### Lỗi: Port 3001 đã được sử dụng

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Lỗi: API key không hợp lệ

- Kiểm tra file `.env` đã được tạo chưa
- Verify API key tại Google AI Studio
- Đảm bảo không có khoảng trắng thừa

### Lỗi: CORS blocked

- Thêm origin của bạn vào `CORS_ORIGIN` trong `.env`
- Restart backend sau khi thay đổi

### Chat không phản hồi

1. Kiểm tra backend đã chạy chưa: `http://localhost:3001/health`
2. Mở DevTools → Console để xem lỗi
3. Kiểm tra API key và model name
4. Xem logs trong terminal backend

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📄 License

MIT License - feel free to use for your projects!

## 👨‍💻 Author

**IS207 Seminar Project**
- Demo: [GitHub Repository](https://github.com/duckonthemic/IS207-Seminar)
- Powered by: Gemini AI / Cloudflare Workers AI
- Built with: Express.js, Vanilla JS, TailwindCSS

## 🙏 Credits

- [Google Gemini AI](https://ai.google.dev/)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- [TailwindCSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)

---

⭐ **Star this repo nếu bạn thấy hữu ích!**
