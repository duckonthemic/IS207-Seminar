# Chatbot AI cho web bán linh kiện (Gemini Pro hoặc API miễn phí Cloudflare)

## Cấu trúc
```
chatbot-pc/
  backend/
    package.json
    .env.example
    server.js
  frontend/
    index.html
    react/ChatWidget.jsx
```

## Chạy thử

### 1) Backend
```bash
cd backend
cp .env.example .env   # chỉnh biến môi trường phù hợp
npm i
npm start              # chạy http://localhost:3001
```

- **Dùng Gemini (nếu có Gemini Pro):**
  - `PROVIDER=gemini`
  - `GOOGLE_API_KEY=<key>`
  - `GEMINI_MODEL=gemini-1.5-flash` (nhanh) hoặc `gemini-1.5-pro`

- **Dùng Cloudflare Workers AI (miễn phí):**
  - `PROVIDER=cloudflare`
  - `CF_ACCOUNT_ID=<id>`
  - `CF_API_TOKEN=<token>`
  - `CF_MODEL=@cf/meta/llama-3-8b-instruct`

> Lưu ý: Frontend **không** chứa API key. Chỉ gọi tới backend `/api/chat`.

### 2) Frontend
- Mở `frontend/index.html` bằng Live Server hoặc `npx serve frontend`
- Hoặc tích hợp vào site: copy panel + script trong `index.html` vào layout của bạn.
- Có thể dùng component React ở `frontend/react/ChatWidget.jsx`.

## Tuỳ biến nhanh
- Sửa `SYSTEM_PROMPT` trong `server.js` để thêm chính sách bảo hành, đổi trả, giờ mở cửa.
- Cấu hình CORS trong `.env` qua `CORS_ORIGIN` (danh sách domain, phân tách dấu phẩy).
- Nếu cần streaming SSE, có thể nâng cấp endpoint `/api/chat` sau.
