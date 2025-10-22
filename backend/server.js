import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const app = express();

// ============================================
// Configuration
// ============================================
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim());

const PORT = process.env.PORT || 3001;
const PROVIDER = process.env.PROVIDER || 'gemini';

// ============================================
// Middleware
// ============================================
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: false
}));

app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 60,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// Validation Schema
// ============================================
const InputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(4000)
    })
  ).min(1).max(20),
});

// ============================================
// Optimized System Prompt - Fast & Detailed
// ============================================
const SYSTEM_PROMPT = `Bạn là AI chuyên tư vấn linh kiện PC và build máy tính. Trả lời NGẮN GỌN nhưng ĐẦY ĐỦ THÔNG TIN.

📊 GIÁ LINH KIỆN 2025 (VNĐ):

**CPU Gaming:**
• i5-14400F: 5tr (10 nhân, 1080p-1440p tốt)
• i5-13600K: 6.5tr (14 nhân, gaming + stream)
• i7-13700F: 8tr (16 nhân, đa nhiệm mạnh)
• i7-14700K: 10tr (20 nhân, gaming + workstation)
• Ryzen 5 7600: 5.5tr (6 nhân, IPC cao)
• Ryzen 7 7800X3D: 10tr (8 nhân, gaming tốt nhất)

**GPU Gaming:**
• RTX 4060 8GB: 8-9tr → 1080p Ultra 60+ fps
• RTX 4060 Ti 8GB: 10-11tr → 1440p High-Ultra 60+ fps
• RX 7600 8GB: 7-8tr → 1080p Ultra (giá tốt)
• RTX 4070 12GB: 14-15tr → 1440p Ultra, 4K Medium 60fps
• RTX 4070 Super 12GB: 16-17tr → 1440p-4K Ultra
• RTX 4070 Ti Super 16GB: 21-22tr → 4K Ultra 60+ fps
• RTX 4080 Super 16GB: 28-30tr → 4K Ultra 100+ fps

**Main + RAM:**
• B760 (Intel 12-14 gen): 3tr + DDR4 hoặc DDR5
• B650 (AMD Ryzen 7000): 3.5tr + DDR5 bắt buộc
• DDR4 16GB (2x8) 3200MHz: 1.3tr
• DDR5 16GB (2x8) 5600MHz: 2tr
• DDR5 32GB (2x16) 6000MHz: 4tr

**Lưu trữ + PSU:**
• SSD NVMe Gen4 500GB: 1tr
• SSD NVMe Gen4 1TB: 1.7tr
• SSD NVMe Gen4 2TB: 3tr
• PSU 650W 80+ Gold: 1.7tr
• PSU 750W 80+ Gold: 2.2tr
• PSU 850W 80+ Gold: 2.7tr

**Case + Tản nhiệt:**
• Case ATX airflow tốt: 1.5-2tr
• Tản nhiệt khí tower: 500k-1tr
• AIO 240mm: 2-2.5tr

**Màn hình Gaming:**
• 1080p 144Hz IPS: 3-4tr
• 1440p 165Hz IPS: 5-7tr
• 4K 144Hz IPS: 10-15tr

⚡ NGUYÊN TẮC TƯ VẤN:

1. **Hỏi ngắn gọn:** Ngân sách? Mục đích (game gì/work)? Có màn hình chưa?

2. **ĐỀ XUẤT CHUẨN (3-5 dòng):**
💻 Build Gaming [Độ phân giải] - [Giá]tr
• CPU: [Tên] ([Giá]tr)
• GPU: [Tên] ([Giá]tr) → [Hiệu năng]
• Main: [Tên] + RAM: [Dung lượng] ([Giá]tr)
• SSD: [Dung lượng] ([Giá]tr) + PSU: [Công suất] ([Giá]tr) + Case ([Giá]tr)
💰 Tổng: ~[X]tr
⚠️ [Lưu ý tương thích quan trọng]
Cần gì thêm?

3. **CẢNH BÁO QUAN TRỌNG:**
- Intel 12-14 gen ↔ Main B760/Z790
- AMD Ryzen 7000 ↔ Main B650 + DDR5 bắt buộc
- RTX 4070+ cần PSU 750W+
- GPU dài check case (thường 300-330mm)

4. **SO SÁNH (nếu được hỏi):**
- Nêu điểm mạnh/yếu từng sản phẩm
- Đưa khuyến nghị rõ ràng

5. **LUÔN:** < 150 từ, emoji phù hợp, kết thúc bằng câu hỏi ngắn

VÍ DỤ:
User: "Build gaming 20tr"
Bot: "💻 **Build Gaming 1080p - 20tr**
• CPU: i5-14400F (5tr) + Main B760 + RAM DDR5 16GB (5tr)
• GPU: RTX 4060 8GB (8.5tr) → 1080p Ultra 80+ fps
• SSD 1TB (1.7tr) + PSU 650W (1.7tr) + Case (1.5tr)
💰 Tổng: ~23.4tr
⚠️ Nếu ngân sách gắt → dùng RX 7600 (7tr) thay RTX 4060
Bạn đã có màn hình chưa?"

TRỌNG TÂM: Nhanh, rõ ràng, thực tế, giúp khách quyết định dễ dàng!`;

app.post('/api/chat', async (req, res) => {
  const parsed = InputSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log('[ERROR] Validation failed:', parsed.error);
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }

  const { messages } = parsed.data;
  console.log('[DEBUG] Received messages:', messages.length);

  try {
    if (PROVIDER === 'gemini') {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      
      console.log('[DEBUG] Using model:', modelName);
      
      // Optimized generation config for faster responses
      const model = genAI.getGenerativeModel({ 
        model: modelName, 
        systemInstruction: SYSTEM_PROMPT + "\n\nIMPORTANT: Respond directly without extended thinking. Be concise.",
        generationConfig: {
          temperature: 1.0,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "text/plain",
        }
      });

      // Get only user messages (ignore system and assistant for simplicity)
      const userMessages = messages.filter(m => m.role === 'user');
      
      if (userMessages.length === 0) {
        return res.status(400).json({ error: 'No user message found' });
      }
      
      // Get last user message
      const lastUserMessage = userMessages[userMessages.length - 1].content;
      console.log('[DEBUG] Last user message:', lastUserMessage.substring(0, 50));
      
      // For first message or simple conversation, just send the message directly
      if (userMessages.length === 1) {
        const result = await model.generateContent(lastUserMessage);
        console.log('[DEBUG] Result candidates:', result.response.candidates?.length);
        
        // Check if response was blocked
        if (result.response.promptFeedback?.blockReason) {
          console.log('[ERROR] Content blocked:', result.response.promptFeedback.blockReason);
          return res.json({ reply: 'Xin lỗi, nội dung bị chặn bởi AI. Vui lòng thử câu hỏi khác.', provider: 'gemini' });
        }
        
        // Extract text safely
        let text = '';
        try {
          text = result.response.text();
        } catch (e) {
          console.log('[ERROR] text() method failed:', e.message);
          // Fallback: extract from candidates
          if (result.response.candidates && result.response.candidates[0]) {
            const parts = result.response.candidates[0].content.parts;
            text = parts.map(p => p.text).join('');
          }
        }
        
        console.log('[DEBUG] Response length:', text.length);
        console.log('[DEBUG] Response text:', text.substring(0, 100));
        
        if (!text || text.length === 0) {
          console.log('[ERROR] Empty response despite successful API call');
          console.log('[DEBUG] Full response object:', JSON.stringify(result.response, null, 2));
          return res.json({ reply: 'Xin lỗi, tôi không thể tạo câu trả lời. Vui lòng thử lại.', provider: 'gemini' });
        }
        
        return res.json({ reply: text, provider: 'gemini' });
      }
      
      // For multi-turn conversation, build history properly
      const history = [];
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i];
        if (msg.role === 'user') {
          history.push({ role: 'user', parts: [{ text: msg.content }] });
        } else if (msg.role === 'assistant') {
          history.push({ role: 'model', parts: [{ text: msg.content }] });
        }
      }
      
      // Ensure history starts with user
      if (history.length > 0 && history[0].role !== 'user') {
        history.shift();
      }
      
      console.log('[DEBUG] History length:', history.length);
      
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastUserMessage);
      
      console.log('[DEBUG] Result candidates:', result.response.candidates?.length);
      
      // Check if response was blocked
      if (result.response.promptFeedback?.blockReason) {
        console.log('[ERROR] Content blocked:', result.response.promptFeedback.blockReason);
        return res.json({ reply: 'Xin lỗi, nội dung bị chặn bởi AI. Vui lòng thử câu hỏi khác.', provider: 'gemini' });
      }
      
      // Extract text safely
      let text = '';
      try {
        text = result.response.text();
      } catch (e) {
        console.log('[ERROR] text() method failed:', e.message);
        // Fallback: extract from candidates
        if (result.response.candidates && result.response.candidates[0]) {
          const parts = result.response.candidates[0].content.parts;
          text = parts.map(p => p.text).join('');
        }
      }
      
      console.log('[DEBUG] Response length:', text.length);
      console.log('[DEBUG] Response text:', text.substring(0, 100));
      
      if (!text || text.length === 0) {
        console.log('[ERROR] Empty response despite successful API call');
        console.log('[DEBUG] Full response object:', JSON.stringify(result.response, null, 2));
        return res.json({ reply: 'Xin lỗi, tôi không thể tạo câu trả lời. Vui lòng thử lại.', provider: 'gemini' });
      }
      
      return res.json({ reply: text, provider: 'gemini' });
    }

    if (PROVIDER === 'cloudflare') {
      const accountId = process.env.CF_ACCOUNT_ID;
      const aiToken = process.env.CF_API_TOKEN;
      const cfModel = process.env.CF_MODEL || '@cf/meta/llama-3-8b-instruct';
      if (!accountId || !aiToken) throw new Error('Missing CF_ACCOUNT_ID or CF_API_TOKEN');

      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`;
      
      // Only keep last 8 messages for faster processing
      const recentMessages = messages.slice(-9); // system + 8 messages
      const cfMessages = [ { role: 'system', content: SYSTEM_PROMPT }, ...recentMessages.filter(m => m.role !== 'system') ];

      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: cfMessages,
          max_tokens: 400  // Limit for faster responses
        })
      });

      const data = await r.json();
      if (!data.success) {
        const errMsg = data.errors?.[0]?.message || 'Cloudflare AI error';
        throw new Error(errMsg);
      }

      const text = data.result?.response || data.result?.output_text || data.result?.message?.content || JSON.stringify(data.result);
      return res.json({ reply: text, provider: 'cloudflare' });
    }

    return res.status(400).json({ error: 'Unsupported provider' });
  } catch (err) {
    console.error(`[ERROR] Chat API:`, err.message);
    console.error(`[ERROR] Stack:`, err.stack);
    return res.status(500).json({ error: err.message || 'Server error', details: err.toString() });
  }
});

// ============================================
// Health Check
// ============================================
app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    provider: PROVIDER,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Stats endpoint (optional)
// ============================================
let requestCount = 0;
app.get('/api/stats', (_req, res) => {
  requestCount++;
  res.json({
    requests: requestCount,
    uptime: process.uptime(),
    provider: PROVIDER
  });
});

// ============================================
// Error handling
// ============================================
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  🚀 PC Parts Chatbot Backend                  ║
║  📡 Server: http://localhost:${PORT}           ║
║  🤖 Provider: ${PROVIDER.toUpperCase()}                      ║
║  ⚡ Status: Ready                              ║
╚════════════════════════════════════════════════╝
  `);
});
