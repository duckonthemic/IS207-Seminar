// Dùng: <ChatWidget backendUrl="https://api.yourdomain.com" />
import { useEffect, useRef, useState } from 'react';

export default function ChatWidget({ backendUrl = 'http://localhost:3001' }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Bạn đang chat với trợ lý tư vấn linh kiện máy tính.' }
  ]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const r = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-12) })
      });
      const data = await r.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'Xin lỗi, chưa trả lời được.' }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Lỗi kết nối server.' }]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 rounded-full px-5 py-3 bg-black text-white text-sm font-medium">💬 Hỗ trợ linh kiện</button>
      {open && (
        <div className="fixed bottom-20 right-6 w-96 max-w-[95vw] bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-black text-white">
            <div className="font-semibold">Tư vấn build PC</div>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div ref={boxRef} className="h-96 overflow-auto p-4 space-y-3 bg-gray-50">
            {messages.filter(m => m.role !== 'system').map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-black text-white' : 'bg-white border'}`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start"><div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-white border">Đang soạn trả lời…</div></div>
            )}
          </div>

          <div className="px-3 pb-3">
            <div className="flex gap-2 flex-wrap px-1 pb-2">
              {['Tư vấn build 15–20tr','So sánh RTX 4060 vs RX 7600','Kiểm tra tương thích case + GPU dài 320mm'].map(s => (
                <button key={s} onClick={() => setInput(s)} className="text-xs bg-gray-200 hover:bg-gray-300 rounded-full px-3 py-1">{s}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black" placeholder="Nhập câu hỏi…" />
              <button onClick={send} className="rounded-xl bg-black text-white px-3 py-2 text-sm">Gửi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
