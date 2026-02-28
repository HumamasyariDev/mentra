import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Trash2, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-500" />
            Mentra AI
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Powered by Puter.js · Your productivity assistant
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-indigo-50 p-4 rounded-2xl mb-4">
              <Bot className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Hi! I'm Mentra AI</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">
              Ask me anything about productivity, focus techniques, task management, and more!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.message)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-md'
                    : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-md'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
                    }`}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      className="prose prose-sm prose-slate max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul]:list-disc [&>ul]:pl-4"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                    />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <p
                    className={`text-xs mt-2 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-slate-200">
        <input
          ref={inputRef}
          type="text"
          className="input-field flex-1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about productivity, tasks, focus..."
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-primary px-4"
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
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
