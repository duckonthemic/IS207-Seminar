// PC Parts Chatbot React Component
// Usage: <ChatWidget backendUrl="http://localhost:3001" />

import { useEffect, useRef, useState } from 'react';

export default function ChatWidget({ backendUrl = 'http://localhost:3001' }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Xin chào! 👋 Tôi là trợ lý tư vấn linh kiện PC. Tôi có thể giúp bạn:\n\n• Tư vấn build PC theo ngân sách\n• So sánh hiệu năng linh kiện\n• Kiểm tra tương thích\n• Đề xuất nâng cấp\n\nBạn cần tư vấn gì?' 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => { 
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Load chat history
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save chat history
    if (messages.length > 1) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const parseMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    
    const userMessage = { role: 'user', content: text };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const systemMessage = { role: 'system', content: 'Bạn đang chat với trợ lý tư vấn linh kiện máy tính.' };
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [systemMessage, ...next.slice(-12)] 
        })
      });
      
      const data = await response.json();
      const assistantMessage = { 
        role: 'assistant', 
        content: data.reply || 'Xin lỗi, hiện tại tôi không thể trả lời. Vui lòng thử lại sau.' 
      };
      
      setMessages(m => [...m, assistantMessage]);
      
      if (minimized) {
        setUnreadCount(c => c + 1);
      }
    } catch (e) {
      setMessages(m => [...m, { 
        role: 'assistant', 
        content: '❌ Lỗi kết nối server. Vui lòng kiểm tra và thử lại.' 
      }]);
      console.error('Chat error:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setUnreadCount(0);
  };

  const handleMinimize = () => {
    setMinimized(true);
    setOpen(false);
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      setMessages([{
        role: 'assistant',
        content: 'Xin chào! 👋 Tôi là trợ lý tư vấn linh kiện PC. Bạn cần tư vấn gì?'
      }]);
      localStorage.removeItem('chatHistory');
    }
  };

  const suggestions = [
    { icon: '🎮', text: 'Build gaming 20tr' },
    { icon: '⚖️', text: 'So sánh RTX 4060 vs RX 7600' },
    { icon: '✅', text: 'Kiểm tra tương thích' }
  ];

  if (!open && !minimized) {
    return (
      <button 
        onClick={handleOpen}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center text-2xl transform hover:scale-110 transition-all z-50"
      >
        💬
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  if (minimized) {
    return (
      <button 
        onClick={handleOpen}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center text-2xl transform hover:scale-110 transition-all z-50"
      >
        💬
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl overflow-hidden z-50 animate-slideUp">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <div className="font-semibold">Trợ lý Build PC</div>
              <div className="text-xs opacity-90 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Đang hoạt động
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleClear}
              className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
              title="Xóa lịch sử"
            >
              🗑️
            </button>
            <button 
              onClick={handleMinimize}
              className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
              title="Thu nhỏ"
            >
              ➖
            </button>
            <button 
              onClick={() => setOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={boxRef} className="h-[500px] overflow-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' ? (
              <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs text-purple-600">🤖</span>
                  <span className="text-xs text-gray-500">AI Assistant</span>
                </div>
                <div 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(m.content) }}
                />
              </div>
            ) : (
              <div className="max-w-[85%] bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white px-4 py-4">
        <div className="flex gap-2 flex-wrap mb-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s.text)}
              className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 rounded-full px-3 py-1.5 transition"
            >
              {s.icon} {s.text}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition"
            placeholder="Nhập câu hỏi của bạn..."
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📤
          </button>
        </div>
        
        <div className="text-xs text-gray-400 text-center mt-2">
          🔒 Dữ liệu được bảo mật
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease;
        }
      `}</style>
    </div>
  );
}
