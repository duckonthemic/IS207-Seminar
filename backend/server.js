import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim());

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
app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }));

const InputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(4000)
    })
  ).min(1),
});

const SYSTEM_PROMPT = `Bạn là trợ lý bán hàng cho web linh kiện máy tính. Nói tiếng Việt, ngắn gọn, hữu ích.
Nguyên tắc:
- Hỏi rõ nhu cầu trước khi tư vấn (mục đích dùng, ngân sách, game/app, màn hình, kích thước case).
- Gợi ý cấu hình/tương thích (socket CPU-main, chuẩn RAM/GPU/PSU, kích thước case, khe M.2, PCIe).
- Không bịa giá/kho; nếu thiếu dữ liệu thì đề nghị người dùng cung cấp hoặc hướng dẫn họ tìm sản phẩm.
- Đưa 2–3 lựa chọn theo mức giá (tiết kiệm / cân bằng / cao cấp) khi phù hợp.
- Luôn đưa cảnh báo tương thích khi đề xuất build.
- Kết thúc bằng một câu hỏi ngắn để tiếp tục hỗ trợ.
`;

app.post('/api/chat', async (req, res) => {
  const parsed = InputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }

  const { messages } = parsed.data;
  const provider = process.env.PROVIDER || 'gemini';

  try {
    if (provider === 'gemini') {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_PROMPT });

      // Lịch sử cho Gemini: 'assistant' -> 'model'
      const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
      const lastIndex = lastUserIndex === -1 ? messages.length - 1 : messages.length - 1 - lastUserIndex;
      const history = messages.slice(0, lastIndex).filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const lastUser = messages[lastIndex];
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastUser?.content || messages[messages.length - 1].content);
      const text = result.response.text();
      return res.json({ reply: text, provider: 'gemini' });
    }

    if (provider === 'cloudflare') {
      const accountId = process.env.CF_ACCOUNT_ID;
      const aiToken = process.env.CF_API_TOKEN;
      const cfModel = process.env.CF_MODEL || '@cf/meta/llama-3-8b-instruct';
      if (!accountId || !aiToken) throw new Error('Missing CF_ACCOUNT_ID or CF_API_TOKEN');

      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`;
      const cfMessages = [ { role: 'system', content: SYSTEM_PROMPT }, ...messages ];

      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: cfMessages })
      });

      const data = await r.json();
      if (!data.success) {
        const errMsg = data.errors?.[0]?.message || 'Cloudflare AI error';
        throw new Error(errMsg);
      }

      // Workers AI trả về nhiều dạng khác nhau tuỳ model
      const text = data.result?.response || data.result?.output_text || data.result?.message?.content || JSON.stringify(data.result);
      return res.json({ reply: text, provider: 'cloudflare' });
    }

    return res.status(400).json({ error: 'Unsupported provider' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`⚡ Chat backend running on http://localhost:${PORT}`));
