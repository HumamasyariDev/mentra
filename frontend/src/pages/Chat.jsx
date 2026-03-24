import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, Trash2 } from 'lucide-react';
import '../styles/pages/Chat.css';

const SYSTEM_PROMPT = `You are Mentra AI, a helpful and friendly productivity assistant built into the Mentra app. 
You help users manage their tasks, focus sessions (Pomodoro), schedules, mood tracking, and streaks. 
Keep responses concise, motivating, and actionable. Use friendly, supportive language.
Respond in the same language as the user (Indonesian or English).
User says: `;

export default function Chat() {
  const { t } = useTranslation(['chat', 'common']);
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
          t('chat:aiFallback');

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
          content: t('chat:aiError'),
          created_at: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
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
    { label: t('chat:quickActions.sayHi'), message: t('chat:quickActions.sayHiMessage') },
    { label: t('chat:quickActions.productivityTips'), message: t('chat:quickActions.productivityTipsMessage') },
    { label: t('chat:quickActions.pomodoroTechnique'), message: t('chat:quickActions.pomodoroTechniqueMessage') },
    { label: t('chat:quickActions.motivation'), message: t('chat:quickActions.motivationMessage') },
  ];

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-page-header">
        <div>
          <h1 className="chat-page-title">{t('chat:pageTitle')}</h1>
          <p className="chat-page-subtitle">{t('chat:pageSubtitle')}</p>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} className="chat-clear-btn">
            <Trash2 size={14} />
            {t('chat:clear')}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chat-message-list">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <h3 className="chat-empty-title">{t('chat:emptyTitle')}</h3>
            <p className="chat-empty-subtitle">
              {t('chat:emptySubtitle')}
            </p>
            <div className="chat-quick-actions">
              <p className="chat-quick-actions-label">{t('chat:suggestions')}</p>
              <div className="chat-quick-actions-grid">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(action.message)}
                    className="chat-quick-action-btn"
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
                className={`chat-message-item ${msg.role}`}
              >
                <div className={`chat-message-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
                  {msg.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="chat-message-item assistant">
                <div className="chat-message-bubble assistant chat-typing">
                  <span className="chat-typing-dot"></span>
                  <span className="chat-typing-dot"></span>
                  <span className="chat-typing-dot"></span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('chat:inputPlaceholder')}
            disabled={isLoading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="chat-send-btn"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
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
