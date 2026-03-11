import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Trash2, Sparkles } from 'lucide-react';
import '../styles/pages/CommonPages.css';

const SYSTEM_PROMPT = `You are Mentra AI, a helpful and friendly productivity assistant built into the Mentra app. 
You help users manage their tasks, focus sessions (Pomodoro), schedules, mood tracking, and streaks. 
Keep responses concise, motivating, and actionable. Use friendly, supportive language.
Respond in the same language as the user (Indonesian or English).
User says: `;

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageText) => {
    const content = (messageText ?? inputValue).trim();
    if (!content || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await window.puter.ai.chat(SYSTEM_PROMPT + content);

      const aiContent =
        typeof response === 'string'
          ? response
          : response?.message?.content?.[0]?.text ??
          response?.message?.content ??
          response?.content ??
          'Maaf, tidak bisa membaca respons AI.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: aiContent,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Puter AI error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Maaf, sistem AI sedang sibuk. Coba lagi nanti. 🙏',
          created_at: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      // Re-focus input
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleClear = () => {
    setMessages([]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const quickActions = [
    { label: '👋 Say Hi', message: 'Halo! Apa yang bisa kamu bantu?' },
    { label: '📋 Tips Produktivitas', message: 'Berikan saya tips produktivitas terbaik!' },
    { label: '⏱️ Teknik Pomodoro', message: 'Jelaskan teknik Pomodoro dan bagaimana cara terbaik menggunakannya.' },
    { label: '💡 Motivasi', message: 'Saya butuh motivasi untuk tetap fokus hari ini.' },
  ];

  return (
    <div className="page-container" style={{ maxWidth: '48rem', margin: '0 auto', height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: 'none', padding: '0' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} style={{ color: '#6366f1' }} />
            Mentra AI
          </h1>
          <p className="page-subtitle">Your productivity AI assistant</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#475569', borderRadius: '0.5rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.target.style.color = '#0f172a'; e.target.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.target.style.color = '#475569'; e.target.style.backgroundColor = 'transparent'; }}
          >
            <Trash2 size={16} />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="message-list" style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem', paddingRight: '0.25rem' }}>
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <Bot size={40} style={{ color: '#6366f1' }} />
            </div>
            <h3 className="chat-empty-title">Hi! I'm Mentra AI</h3>
            <p className="chat-empty-subtitle">
              Ask me anything about productivity, focus techniques, task management, and more!
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Quick Actions</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(action.message)}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'left', border: '1px solid #e2e8f0', borderRadius: '0.5rem', transition: 'all 0.2s', background: '#ffffff', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.backgroundColor = '#eef2ff'; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#ffffff'; }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="message-item"
                style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                {msg.role === 'assistant' && (
                  <div className="message-avatar" style={{ backgroundColor: '#eef2ff' }}>
                    <Bot size={16} style={{ color: '#6366f1' }} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '80%',
                    borderRadius: '1rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    backgroundColor: msg.role === 'user' ? '#6366f1' : msg.isError ? '#fef2f2' : '#ffffff',
                    color: msg.role === 'user' ? '#ffffff' : msg.isError ? '#991b1b' : '#334155',
                    border: msg.role === 'user' ? 'none' : msg.isError ? '1px solid #fecaca' : '1px solid #e2e8f0',
                    borderBottomRightRadius: msg.role === 'user' ? '0.25rem' : '1rem',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '0.25rem' : '1rem'
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      style={{ maxWidth: '100%' }}
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                    />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <p
                    style={{
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : '#94a3b8'
                    }}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="message-avatar" style={{ backgroundColor: '#6366f1' }}>
                    <User size={16} style={{ color: '#ffffff' }} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="message-item">
                <div className="message-avatar" style={{ backgroundColor: '#6366f1' }}>
                  <Bot size={18} style={{ color: '#ffffff' }} />
                </div>
                <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '1rem' }}>
                  <Loader2 size={16} className="page-loading-spinner" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything about productivity..."
          disabled={isLoading}
          className="message-input"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="message-send-btn"
        >
          {isLoading ? (
            <Loader2 size={20} className="page-loading-spinner" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n- /g, '</p><ul><li>')
    .replace(/\n/g, '<br>')
    .replace(/<ul><li>/g, '</p><ul><li>')
    .replace(/<\/li><\/ul>/g, '</li></ul><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    .replace(/<p><\/p>/g, '');
}
