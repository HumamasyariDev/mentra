/**
 * MentraAgentWithSessions.jsx — Chat with Session Management
 *
 * Features:
 * - Sidebar with session list (like ChatGPT/Gemini)
 * - Create new sessions
 * - Switch between sessions
 * - Rename/delete sessions
 * - Messages persisted to database
 * - Pure CSS styling
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { chatSessionApi } from "../services/api";
import { createTaskTool, searchKnowledgeTool } from "./MentraTools.js";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Menu,
  ChevronLeft,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt & Helpers (same as original)
// ─────────────────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10);

function buildSystemPrompt(userCtx = "") {
  return `Kamu adalah Mentra AI — asisten produktivitas personal yang cerdas dan ramah.
${userCtx ? `\nKonteks user:\n${userCtx}\n` : ""}
Tanggal hari ini: ${TODAY}.

=== ATURAN PENTING ===

JIKA user meminta membuat task, to-do, jadwal, atau reminder — KELUARKAN HANYA format JSON ini (tanpa teks lain):
\`\`\`json
{
  "action": "create_task",
  "payload": {
    "title": "Judul task yang jelas dan singkat",
    "deadline": "YYYY-MM-DD",
    "difficulty": "Easy | Medium | Hard",
    "description": "Deskripsi opsional"
  }
}
\`\`\`

JIKA user meminta informasi atau tips produktivitas — KELUARKAN format ini:
\`\`\`json
{
  "action": "search_knowledge",
  "payload": {
    "query": "kata kunci pencarian dalam bahasa Inggris"
  }
}
\`\`\`

ATURAN konversi tanggal (deadline):
- "besok" → ${getDateOffset(1)}
- "lusa" → ${getDateOffset(2)}
- "minggu depan" → ${getDateOffset(7)}
- "akhir bulan" → ${getEndOfMonth()}
- Jika tidak ada deadline → null

ATURAN difficulty:
- "mudah", "gampang", "santai" → Easy
- "sedang", "biasa", "normal" → Medium  
- "susah", "sulit", "rumit", "penting", "urgent" → Hard

JIKA hanya percakapan biasa (greeting, tanya kabar, diskusi umum) — jawab NATURAL dalam bahasa Indonesia, TANPA JSON.

=== KEMAMPUANMU ===
- Membuat task dan menyimpannya ke database
- Mencari tips produktivitas dari knowledge base
- Menjawab pertanyaan umum seputar produktivitas

Selalu ramah, singkat, dan to the point.`.trim();
}

function getDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getEndOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
}

function parseActionFromResponse(text) {
  if (!text || typeof text !== "string") return null;

  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    return tryParseAction(codeBlockMatch[1]);
  }

  const jsonMatch = text.match(/(\{[\s\S]*"action"[\s\S]*\})/);
  if (jsonMatch) {
    return tryParseAction(jsonMatch[1]);
  }

  return null;
}

function tryParseAction(str) {
  try {
    const parsed = JSON.parse(str.trim());
    if (parsed && typeof parsed.action === "string" && parsed.payload) {
      return parsed;
    }
  } catch {
    /* ignore parse errors */
  }
  return null;
}

function buildUserContext() {
  try {
    const u = JSON.parse(localStorage.getItem("mentra_user") ?? "{}");
    return [
      u.name ? `- Nama: ${u.name}` : "",
      u.level ? `- Level: ${u.level}` : "",
      u.total_exp ? `- Total EXP: ${u.total_exp}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  } catch {
    return "";
  }
}

const WELCOME_MSG = {
  role: "agent",
  content: `👋 Hai! Saya **Mentra AI** — asisten produktivitas kamu.\n\nSaya bisa:\n• ✅ **Membuat task** dan menyimpannya langsung ke database\n• 🔍 **Mencari tips** produktivitas dari knowledge base\n• 💬 **Ngobrol** seputar produktivitas & belajar\n\nCoba bilang: *"Buat task belajar React besok"* atau *"Apa itu teknik Pomodoro?"*`,
  type: "text",
};

const QUICK_PROMPTS = [
  {
    label: "➕ Buat Task",
    text: "Buatkan task: belajar pgvector, deadline besok, prioritas sedang",
  },
  { label: "📖 Pomodoro", text: "Jelaskan teknik Pomodoro" },
  { label: "🎯 SMART Goal", text: "Apa itu SMART goals?" },
  { label: "🧘 Fokus Tips", text: "Tips agar lebih fokus belajar" },
  { label: "⏰ Deep Work", text: "Apa itu Deep Work?" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MentraAgentWithSessions() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const puterHistory = useRef([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const systemPrompt = useRef(buildSystemPrompt(buildUserContext()));

  // Fetch sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: () => chatSessionApi.list().then((r) => r.data),
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data) => chatSessionApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      setCurrentSessionId(response.data.id);
      setMessages([WELCOME_MSG]);
      puterHistory.current = [];
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => chatSessionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      setEditingSessionId(null);
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (id) => chatSessionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      if (currentSessionId === deleteSessionMutation.variables) {
        setCurrentSessionId(null);
        setMessages([WELCOME_MSG]);
        puterHistory.current = [];
      }
    },
  });

  // Store message mutation
  const storeMessageMutation = useMutation({
    mutationFn: ({ sessionId, message }) =>
      chatSessionApi.storeMessage(sessionId, message),
  });

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      chatSessionApi.getMessages(currentSessionId).then((response) => {
        const dbMessages = response.data.map((msg) => ({
          role: msg.role,
          content: msg.content,
          type: msg.type,
          task: msg.metadata?.task,
        }));
        setMessages(dbMessages.length > 0 ? dbMessages : [WELCOME_MSG]);
      });
    }
  }, [currentSessionId]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, statusMsg]);

  // React Query invalidation listener
  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };
    window.addEventListener("mentra:task-created", refresh);
    window.addEventListener("mentra:task-completed", refresh);
    return () => {
      window.removeEventListener("mentra:task-created", refresh);
      window.removeEventListener("mentra:task-completed", refresh);
    };
  }, [queryClient]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleCreateSession = () => {
    createSessionMutation.mutate({ title: "New Chat" });
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  const handleRenameSession = (sessionId, newTitle) => {
    updateSessionMutation.mutate({ id: sessionId, data: { title: newTitle } });
  };

  const handleDeleteSession = (sessionId) => {
    if (window.confirm("Hapus sesi chat ini?")) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  const handleSend = useCallback(
    async (userText) => {
      const text = String(userText ?? input).trim();
      if (!text || loading) return;

      // Ensure we have a session
      let sessionId = currentSessionId;
      let isNewSession = false;
      if (!sessionId) {
        const newSession = await createSessionMutation.mutateAsync({
          title: text.slice(0, 50) || "New Chat",
        });
        sessionId = newSession.data.id;
        setCurrentSessionId(sessionId);
        isNewSession = true;
      }

      setInput("");
      setLoading(true);
      setStatusMsg("");

      const userMsg = { role: "user", content: text, type: "text" };
      setMessages((prev) => [...prev, userMsg]);

      // Store user message to DB
      storeMessageMutation.mutate({
        sessionId,
        message: { role: "user", content: text, type: "text" },
      });

      const conversation = [
        { role: "system", content: systemPrompt.current },
        ...puterHistory.current,
        { role: "user", content: text },
      ];

      try {
        setStatusMsg("🤔 Thinking…");
        const puterResponse = await window.puter.ai.chat(conversation, {
          model: "claude-sonnet-4-5",
        });

        let rawText = "";
        if (typeof puterResponse === "string") {
          rawText = puterResponse;
        } else if (puterResponse?.message?.content) {
          const c = puterResponse.message.content;
          rawText = Array.isArray(c)
            ? c.map((x) => x.text ?? "").join("")
            : String(c);
        } else if (puterResponse?.text) {
          rawText = puterResponse.text;
        } else {
          rawText = String(puterResponse);
        }

        const action = parseActionFromResponse(rawText);

        if (action) {
          await executeAction(action, text, sessionId);
        } else {
          const agentMsg = {
            role: "agent",
            content: rawText.trim(),
            type: "text",
          };
          setMessages((prev) => [...prev, agentMsg]);

          // Store agent message to DB
          storeMessageMutation.mutate({
            sessionId,
            message: { role: "agent", content: rawText.trim(), type: "text" },
          });

          // Update session title if this is a new session
          if (isNewSession) {
            updateSessionMutation.mutate({
              id: sessionId,
              data: { title: text.slice(0, 50) || "New Chat" },
            });
          }

          puterHistory.current = [
            ...puterHistory.current,
            { role: "user", content: text },
            { role: "assistant", content: rawText.trim() },
          ].slice(-20);
        }
      } catch (err) {
        console.error("[MentraAgent] Error:", err);
        const errorMsg = {
          role: "error",
          content: `Error: ${err.message}`,
          type: "error",
        };
        setMessages((prev) => [...prev, errorMsg]);

        storeMessageMutation.mutate({
          sessionId,
          message: errorMsg,
        });
      } finally {
        setLoading(false);
        setStatusMsg("");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [input, loading, currentSessionId],
  );

  const executeAction = useCallback(
    async (action, originalUserText, sessionId) => {
      if (action.action === "create_task") {
        setStatusMsg("⚙️ Menyimpan task ke database…");

        const result = await createTaskTool(action.payload);

        if (result.success) {
          const t = result.task;
          const successMsg = {
            role: "agent",
            type: "task_created",
            content: `✅ **Task berhasil disimpan!**\n\n📌 **${t.title}**\nPriority: ${t.priority} | XP: +${t.exp_reward}${t.due_date ? ` | Deadline: ${t.due_date}` : ""}\nID: #${t.id}`,
            task: t,
          };
          setMessages((prev) => [...prev, successMsg]);

          storeMessageMutation.mutate({
            sessionId,
            message: {
              ...successMsg,
              metadata: { task: t },
            },
          });
        } else {
          const errorMsg = {
            role: "error",
            content: result.error,
            type: "error",
          };
          setMessages((prev) => [...prev, errorMsg]);
          storeMessageMutation.mutate({ sessionId, message: errorMsg });
        }
      } else if (action.action === "search_knowledge") {
        setStatusMsg("🔍 Mencari di knowledge base…");

        const result = await searchKnowledgeTool(action.payload.query);
        const baseContext = result.success ? result.context : "";

        setStatusMsg("💭 Merangkum hasil pencarian…");
        const followUp = [
          {
            role: "system",
            content:
              "Kamu adalah Mentra AI, asisten produktivitas. Jawab secara ramah dalam bahasa Indonesia.",
          },
          { role: "user", content: originalUserText },
          {
            role: "assistant",
            content: baseContext
              ? `Saya temukan info ini:\n${baseContext}`
              : "Maaf, tidak ada informasi relevan.",
          },
          {
            role: "user",
            content:
              "Ringkaskan dan jelaskan kepada saya dengan bahasa yang mudah dipahami.",
          },
        ];

        try {
          const summary = await window.puter.ai.chat(followUp, {
            model: "claude-sonnet-4-5",
          });
          let summaryText =
            typeof summary === "string"
              ? summary
              : (summary?.message?.content?.[0]?.text ??
                summary?.text ??
                String(summary));

          const agentMsg = {
            role: "agent",
            content: summaryText.trim(),
            type: "text",
          };
          setMessages((prev) => [...prev, agentMsg]);
          storeMessageMutation.mutate({ sessionId, message: agentMsg });
        } catch {
          const fallbackMsg = {
            role: "agent",
            content: baseContext || "Tidak ada informasi relevan ditemukan.",
            type: "text",
          };
          setMessages((prev) => [...prev, fallbackMsg]);
          storeMessageMutation.mutate({ sessionId, message: fallbackMsg });
        }
      }
    },
    [],
  );

  const puterAvailable = typeof window !== "undefined" && !!window.puter?.ai;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="agent-container">
      {/* Sidebar */}
      <div className={`agent-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Chat Sessions</h2>
          <button
            className="btn-new-chat"
            onClick={handleCreateSession}
            title="New Chat"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="sessions-list">
          {sessionsLoading ? (
            <div className="sessions-loading">Loading...</div>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${currentSessionId === session.id ? "active" : ""}`}
                onClick={() => handleSelectSession(session.id)}
              >
                {editingSessionId === session.id ? (
                  <div className="session-edit">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRenameSession(session.id, editingTitle);
                        } else if (e.key === "Escape") {
                          setEditingSessionId(null);
                        }
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      className="btn-icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameSession(session.id, editingTitle);
                      }}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className="btn-icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(null);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="session-info">
                      <MessageSquare size={16} />
                      <span className="session-title">{session.title}</span>
                    </div>
                    <div className="session-actions">
                      <button
                        className="btn-icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.id);
                          setEditingTitle(session.title);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn-icon-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="sessions-empty">
              <p>Belum ada sesi chat</p>
              <p className="text-sm">Klik "New Chat" untuk memulai</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="agent-main">
        {/* Toggle Sidebar Button */}
        <button
          className="btn-toggle-sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>

        {/* Header */}
        <div className="agent-header">
          <div className="header-info">
            <div className="agent-avatar">🤖</div>
            <div>
              <h1 className="agent-title">Mentra AI</h1>
              <p className="agent-subtitle">
                Puter.js · Manual Tool Calling · Supabase
              </p>
            </div>
          </div>
          <div className="agent-status">
            <span
              className={`status-dot ${puterAvailable ? "online" : "offline"}`}
            />
            <span>{puterAvailable ? "Ready" : "Waiting for Puter.js…"}</span>
          </div>
        </div>

        {!puterAvailable && (
          <div className="agent-warning">
            ⚠️ <strong>Puter.js belum terdeteksi.</strong> Pastikan kamu sudah
            login di puter.com.
          </div>
        )}

        {/* Messages */}
        <div className="agent-messages">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} navigate={navigate} />
          ))}

          {loading && (
            <div className="message message-agent">
              <div className="loading-indicator">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
                <span className="loading-text">{statusMsg || "Thinking…"}</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Prompts */}
        {!loading && (
          <div className="quick-prompts">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.text}
                className="quick-prompt-btn"
                onClick={() => handleSend(p.text)}
                disabled={loading}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          className="agent-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
        >
          <input
            ref={inputRef}
            className="agent-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Coba: "Buat task persiapan presentasi, deadline besok"'
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="submit"
            className="agent-send-btn"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="18"
                height="18"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </form>
      </div>

      <style>{CSS}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble Component
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ msg, navigate }) {
  if (msg.role === "user")
    return (
      <div className="message message-user">
        <div className="bubble bubble-user">{msg.content}</div>
      </div>
    );

  if (msg.role === "error")
    return (
      <div className="message message-agent">
        <div className="bubble bubble-error">⚠️ {msg.content}</div>
      </div>
    );

  if (msg.role === "agent") {
    const isTaskCreated = msg.type === "task_created";
    return (
      <div className="message message-agent">
        <div
          className={`bubble bubble-agent ${isTaskCreated ? "bubble-success" : ""}`}
        >
          <FormattedText text={msg.content} />
        </div>
        {isTaskCreated && (
          <button className="goto-tasks-btn" onClick={() => navigate("/tasks")}>
            📋 Lihat di halaman Tasks →
          </button>
        )}
      </div>
    );
  }
  return null;
}

function FormattedText({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p === "\n") return <br key={i} />;
        return p;
      })}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure CSS Styling
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
  .agent-container {
    display: flex;
    height: 100vh;
    background: #f5f5f5;
    font-family: 'Inter', -apple-system, sans-serif;
    overflow: hidden;
    color: #1f2937;
  }

  /* ── Sidebar ────────────────────────────────────────────────── */
  .agent-sidebar {
    width: 280px;
    background: #ffffff;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
    border-radius: 0 12px 12px 0;
    margin: 12px 0 12px 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .agent-sidebar.closed {
    transform: translateX(-100%);
    position: absolute;
    z-index: 10;
  }

  .sidebar-header {
    padding: 1.25rem 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .sidebar-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.75rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .btn-new-chat {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: #111827;
    color: #ffffff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    margin: 0 auto;
  }

  .btn-new-chat:hover {
    background: #1f2937;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .sessions-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .sessions-list::-webkit-scrollbar {
    width: 6px;
  }

  .sessions-list::-webkit-scrollbar-track {
    background: #f9fafb;
  }

  .sessions-list::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 99px;
  }

  .session-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    margin-bottom: 0.25rem;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
  }

  .session-item:hover {
    background: #f9fafb;
  }

  .session-item.active {
    background: #eff6ff;
    border-color: #3b82f6;
  }

  .session-info {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex: 1;
    min-width: 0;
  }

  .session-info svg {
    flex-shrink: 0;
    color: #6b7280;
  }

  .session-title {
    font-size: 0.875rem;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .session-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 1;
    transition: opacity 0.15s;
  }

  .session-edit {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
  }

  .session-edit input {
    flex: 1;
    padding: 0.375rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    outline: none;
  }

  .session-edit input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .btn-icon-sm {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    color: #6b7280;
    flex-shrink: 0;
  }

  .btn-icon-sm:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #374151;
  }

  .btn-icon-sm.btn-danger {
    color: #dc2626;
  }

  .btn-icon-sm.btn-danger:hover {
    background: #fef2f2;
    border-color: #fecaca;
    color: #b91c1c;
  }

  .sessions-loading,
  .sessions-empty {
    padding: 2rem 1rem;
    text-align: center;
    color: #9ca3af;
    font-size: 0.875rem;
  }

  .sessions-empty .text-sm {
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }

  /* ── Main Chat Area ────────────────────────────────────────── */
  .agent-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    background: #ffffff;
    border-radius: 12px;
    margin: 12px 12px 12px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .btn-toggle-sidebar {
    position: absolute;
    top: 1.25rem;
    left: 1rem;
    z-index: 5;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    color: #374151;
  }

  .btn-toggle-sidebar:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .agent-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.75rem 1.25rem 4rem;
    border-bottom: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 12px 12px 0 0;
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .agent-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
  }

  .agent-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #111827;
  }

  .agent-subtitle {
    font-size: 0.7rem;
    color: #9ca3af;
    margin: 2px 0 0 0;
  }

  .agent-status {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .status-dot.online {
    background: #10b981;
  }

  .status-dot.offline {
    background: #d1d5db;
  }

  .agent-warning {
    background: #fef2f2;
    border-bottom: 1px solid #fecaca;
    color: #991b1b;
    padding: 0.75rem 1.75rem;
    font-size: 0.8rem;
  }

  .agent-messages {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    scroll-behavior: smooth;
  }

  .agent-messages::-webkit-scrollbar {
    width: 6px;
  }

  .agent-messages::-webkit-scrollbar-track {
    background: #f9fafb;
  }

  .agent-messages::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 99px;
  }

  .agent-messages::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  .message {
    display: flex;
    animation: fadeUp 0.25s ease both;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .message-user {
    justify-content: flex-end;
  }

  .message-agent {
    flex-direction: column;
    gap: 0.5rem;
    max-width: 85%;
  }

  .bubble {
    padding: 0.875rem 1.125rem;
    border-radius: 16px;
    font-size: 0.875rem;
    line-height: 1.7;
    word-break: break-word;
  }

  .bubble-user {
    background: #111827;
    color: #ffffff;
    border-radius: 18px 18px 4px 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    max-width: 70%;
  }

  .bubble-agent {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px 18px 18px 18px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    color: #1f2937;
  }

  .bubble-success {
    border-color: #d1fae5;
    background: #f0fdf4;
  }

  .bubble-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
    border-radius: 12px;
    max-width: 85%;
  }

  .goto-tasks-btn {
    align-self: flex-start;
    padding: 0.45rem 0.875rem;
    border-radius: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    color: #374151;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .goto-tasks-btn:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    width: fit-content;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #9ca3af;
    animation: bounce 1.2s infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.4);
    }
  }

  .loading-text {
    font-size: 0.8rem;
    color: #6b7280;
  }

  .quick-prompts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem 1.75rem;
    border-top: 1px solid #e5e7eb;
    background: #fafafa;
  }

  .quick-prompt-btn {
    padding: 0.5rem 0.875rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .quick-prompt-btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  }

  .quick-prompt-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .agent-input-form {
    display: flex;
    gap: 0.75rem;
    padding: 1.25rem 1.75rem;
    border-top: 1px solid #e5e7eb;
    background: #ffffff;
  }

  .agent-input {
    flex: 1;
    padding: 0.875rem 1.125rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    color: #1f2937;
    font-size: 0.875rem;
    font-family: inherit;
    outline: none;
    transition: all 0.2s;
  }

  .agent-input:focus {
    border-color: #d1d5db;
    background: #ffffff;
    box-shadow: 0 0 0 3px #f3f4f6;
  }

  .agent-input::placeholder {
    color: #9ca3af;
  }

  .agent-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f9fafb;
  }

  .agent-send-btn {
    width: 46px;
    height: 46px;
    background: #111827;
    border: none;
    border-radius: 14px;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
  }

  .agent-send-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: #1f2937;
  }

  .agent-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ── Responsive ────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .agent-sidebar {
      position: absolute;
      z-index: 10;
      height: 100%;
    }

    .agent-sidebar.closed {
      transform: translateX(-100%);
    }

    .agent-header {
      padding-left: 4rem;
    }
  }
`;
