import { usePageTitle } from "../hooks/usePageTitle";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { chatSessionApi, aiApi } from "../services/api";
import { useToast } from "../contexts/ToastContext";
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
import "../styles/pages/Agent.css";

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
  content: `Hai! Saya **Mentra AI**, asisten produktivitas personal kamu.\n\nSaya bisa membantu:\n• **Membuat task** dan menyimpannya ke database\n• **Mencari tips** produktivitas dari knowledge base\n• **Menjawab pertanyaan** seputar produktivitas`,
  type: "text",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MentraAgentWithSessions() {
  const { t } = useTranslation(["agent", "common"]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const chatHistory = useRef([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const systemPrompt = useRef(buildSystemPrompt(buildUserContext()));
  const skipSessionLoadRef = useRef(false);

  const QUICK_PROMPTS = [
    {
      label: t("agent:quickPrompts.createTask"),
      text: "Buatkan task: belajar pgvector, deadline besok, prioritas sedang",
    },
    { label: t("agent:quickPrompts.pomodoro"), text: "Jelaskan teknik Pomodoro" },
    { label: t("agent:quickPrompts.smartGoal"), text: "Apa itu SMART goals?" },
    { label: t("agent:quickPrompts.focusTips"), text: "Tips agar lebih fokus belajar" },
    { label: t("agent:quickPrompts.deepWork"), text: "Apa itu Deep Work?" },
  ];

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
      // NOTE: Do NOT reset messages/history here!
      // When called from handleSend, messages already contain the conversation.
      // Resetting here would wipe the AI response that was just added.
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
        chatHistory.current = [];
      }
      toast.success(t('agent:toast_session_deleted'));
    },
  });

  // Store message mutation
  const storeMessageMutation = useMutation({
    mutationFn: ({ sessionId, message }) =>
      chatSessionApi.storeMessage(sessionId, message),
  });

  // Load messages when session changes (user clicks sidebar session)
  useEffect(() => {
    if (currentSessionId) {
      // Skip loading from DB if we just created the session during a send
      if (skipSessionLoadRef.current) {
        skipSessionLoadRef.current = false;
        return;
      }
      chatSessionApi.getMessages(currentSessionId).then((response) => {
        const dbMessages = response.data.map((msg) => ({
          role: msg.role,
          content: msg.content,
          type: msg.type,
          task: msg.metadata?.task,
        }));
        setMessages(dbMessages.length > 0 ? dbMessages : [WELCOME_MSG]);
        // Build chat history from stored messages for API context
        chatHistory.current = dbMessages
          .filter((m) => m.role === "user" || m.role === "agent")
          .map((m) => ({
            role: m.role === "agent" ? "assistant" : "user",
            content: m.content,
          }))
          .slice(-20);
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
    // Don't create session in DB yet, just reset to new chat state
    setCurrentSessionId(null);
    setMessages([WELCOME_MSG]);
    chatHistory.current = [];
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  const handleRenameSession = (sessionId, newTitle) => {
    updateSessionMutation.mutate({ id: sessionId, data: { title: newTitle } });
  };

  const handleDeleteSession = (sessionId) => {
    if (window.confirm(t("agent:deleteSessionConfirm"))) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  const handleSend = useCallback(
    async (userText) => {
      const text = String(userText ?? input).trim();
      if (!text || loading) return;

      setInput("");
      setLoading(true);
      setStatusMsg("");

      const userMsg = { role: "user", content: text, type: "text" };
      setMessages((prev) => [...prev, userMsg]);

      // Track if we need to create session after AI responds
      let sessionId = currentSessionId;

      try {
        setStatusMsg("🤔 " + t("agent:statusThinking"));
        
        // Call backend AI API
        const response = await aiApi.agentChat(
          text,
          chatHistory.current,
          systemPrompt.current
        );

        const rawText = response.data?.message || "";
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

          // Create session in DB only after first AI response
          if (!sessionId) {
            const newSession = await createSessionMutation.mutateAsync({
              title: text.slice(0, 50) || "New Chat",
            });
            sessionId = newSession.data.id;
            skipSessionLoadRef.current = true;
            setCurrentSessionId(sessionId);
          }

          // Store user message to DB (now that we have sessionId)
          await storeMessageMutation.mutateAsync({
            sessionId,
            message: { role: "user", content: text, type: "text" },
          });

          // Store agent message to DB
          await storeMessageMutation.mutateAsync({
            sessionId,
            message: { role: "agent", content: rawText.trim(), type: "text" },
          });

          // Update chat history for context
          chatHistory.current = [
            ...chatHistory.current,
            { role: "user", content: text },
            { role: "assistant", content: rawText.trim() },
          ].slice(-20);
        }
      } catch (err) {
        console.error("[MentraAgent] Error:", err);
        toast.error(t('agent:toast_error'));
        const errorMsg = {
          role: "error",
          content: `Error: ${err.message}`,
          type: "error",
        };
        setMessages((prev) => [...prev, errorMsg]);

        // Only store to DB if session exists
        if (sessionId) {
          await storeMessageMutation.mutateAsync({
            sessionId,
            message: errorMsg,
          });
        }
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
        setStatusMsg("⚙️ " + t("agent:statusSavingTask"));

        const result = await createTaskTool(action.payload);

        if (result.success) {
          const task = result.task;
          const successMsg = {
            role: "agent",
            type: "task_created",
            content: `✅ **Task berhasil disimpan!**\n\n📌 **${task.title}**\nPriority: ${task.priority} | XP: +${task.exp_reward}${task.due_date ? ` | Deadline: ${task.due_date}` : ""}\nID: #${task.id}`,
            task: task,
          };
          setMessages((prev) => [...prev, successMsg]);

          // Create session if not exists
          if (!sessionId) {
            const newSession = await createSessionMutation.mutateAsync({
              title: originalUserText.slice(0, 50) || "New Chat",
            });
            sessionId = newSession.data.id;
            skipSessionLoadRef.current = true;
            setCurrentSessionId(sessionId);
          }

          // Store user message first
          await storeMessageMutation.mutateAsync({
            sessionId,
            message: { role: "user", content: originalUserText, type: "text" },
          });

          // Store task creation message
          await storeMessageMutation.mutateAsync({
            sessionId,
            message: {
              ...successMsg,
              metadata: { task: task },
            },
          });
        } else {
          const errorMsg = {
            role: "error",
            content: result.error,
            type: "error",
          };
          setMessages((prev) => [...prev, errorMsg]);

          if (sessionId) {
            await storeMessageMutation.mutateAsync({
              sessionId,
              message: errorMsg,
            });
          }
        }
      } else if (action.action === "search_knowledge") {
        setStatusMsg("🔍 " + t("agent:statusSearching"));

        const result = await searchKnowledgeTool(action.payload.query);
        const baseContext = result.success ? result.context : "";

        setStatusMsg("💭 " + t("agent:statusSummarizing"));
        const followUp = [
          {
            role: "system",
            content:
              "Kamu adalah Mentra AI, asisten produktivitas. Jawab secara ramah dalam bahasa Indonesia.",
          },
          { role: "user", content: originalUserText },
          {
            role: "assistant",
            content: `Saya menemukan informasi berikut:\n${baseContext}`,
          },
          {
            role: "user",
            content:
              "Ringkaskan dan jelaskan kepada saya dengan bahasa yang mudah dipahami.",
          },
        ];

        try {
          const summaryResponse = await aiApi.sandboxChat(followUp);
          const summaryText = summaryResponse.data?.message || "";

          const agentMsg = {
            role: "agent",
            content: summaryText.trim(),
            type: "text",
          };
          setMessages((prev) => [...prev, agentMsg]);

          // Create session if not exists
          if (!sessionId) {
            const newSession = await createSessionMutation.mutateAsync({
              title: originalUserText.slice(0, 50) || "New Chat",
            });
            sessionId = newSession.data.id;
            skipSessionLoadRef.current = true;
            setCurrentSessionId(sessionId);
          }

          // Store user message first
          await storeMessageMutation.mutateAsync({
            sessionId,
            message: { role: "user", content: originalUserText, type: "text" },
          });

          // Store agent message
          await storeMessageMutation.mutateAsync({
            sessionId,
            message: agentMsg,
          });
        } catch {
          const fallbackMsg = {
            role: "agent",
            content: baseContext || "Tidak ada informasi relevan ditemukan.",
            type: "text",
          };
          setMessages((prev) => [...prev, fallbackMsg]);

          // Create session if not exists
          if (!sessionId) {
            const newSession = await createSessionMutation.mutateAsync({
              title: originalUserText.slice(0, 50) || "New Chat",
            });
            sessionId = newSession.data.id;
            skipSessionLoadRef.current = true;
            setCurrentSessionId(sessionId);
          }

          // Store user message first
          await storeMessageMutation.mutateAsync({
            sessionId,
            message: { role: "user", content: originalUserText, type: "text" },
          });

          // Store agent message
          await storeMessageMutation.mutateAsync({
            sessionId,
            message: fallbackMsg,
          });
        }
      }
    },
    [t],
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="agent-page">
      {/* Sidebar */}
      <div className={`agent-page-sidebar ${sidebarOpen ? "" : "closed"}`}>
        <div className="agent-page-sidebar-header">
          <h2 className="agent-page-sidebar-title">{t("agent:sidebarTitle")}</h2>
          <button
            className="agent-page-btn-new"
            onClick={handleCreateSession}
            title={t("agent:newChat")}
          >
            <Plus size={18} />
            <span>{t("agent:newChat")}</span>
          </button>
        </div>

        <div className="agent-page-sessions">
          {sessionsLoading ? (
            <div className="agent-page-sessions-loading">{t("agent:sessionsLoading")}</div>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`agent-page-session-item ${currentSessionId === session.id ? "active" : ""}`}
                onClick={() => handleSelectSession(session.id)}
              >
                {editingSessionId === session.id ? (
                  <div className="agent-page-session-edit">
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
                      className="agent-page-btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameSession(session.id, editingTitle);
                      }}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className="agent-page-btn-icon"
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
                    <MessageSquare
                      className="agent-page-session-icon"
                      size={18}
                    />
                    <span className="agent-page-session-title">
                      {session.title}
                    </span>
                    <div className="agent-page-session-actions">
                      <button
                        className="agent-page-btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.id);
                          setEditingTitle(session.title);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="agent-page-btn-icon danger"
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
            <div className="agent-page-sessions-empty">
              <p>{t("agent:sessionsEmpty")}</p>
              <p>{t("agent:sessionsEmptyHint")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="agent-page-main">
        <button
          className="agent-page-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>

        <div className="agent-page-header">
          <div className="agent-page-header-info">
            <div className="agent-page-avatar">
              <img src="/mentra_title_logo.svg" alt="Mentra AI" className="agent-avatar-logo" />
            </div>
            <div>
              <h1 className="agent-page-title">{t("agent:pageTitle")}</h1>
              <p className="agent-page-subtitle">{t("agent:pageSubtitle")}</p>
            </div>
          </div>
          <div className="agent-page-status online">
            <span className="agent-page-status-dot" />
            <span>{t("agent:statusOnline")}</span>
          </div>
        </div>

        <div className="agent-page-messages">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} navigate={navigate} t={t} />
          ))}

          {loading && (
            <div className="agent-page-message agent">
              <div className="agent-page-loading">
                <span className="agent-page-loading-dot" />
                <span className="agent-page-loading-dot" />
                <span className="agent-page-loading-dot" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {!loading && (
          <div className="agent-page-quick-prompts">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.text}
                className="agent-page-quick-btn"
                onClick={() => handleSend(p.text)}
                disabled={loading}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        <form
          className="agent-page-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
        >
          <input
            ref={inputRef}
            className="agent-page-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("agent:inputPlaceholder")}
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="submit"
            className="agent-page-send"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className="agent-page-spinner" />
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble Component
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ msg, navigate, t }) {
  if (msg.role === "user")
    return (
      <div className="agent-page-message user">
        <div className="agent-page-bubble user">{msg.content}</div>
      </div>
    );

  if (msg.role === "error")
    return (
      <div className="agent-page-message agent">
        <div className="agent-page-bubble error">⚠️ {msg.content}</div>
      </div>
    );

  if (msg.role === "agent") {
    const isTaskCreated = msg.type === "task_created";
    return (
      <div className="agent-page-message agent">
        <div
          className={`agent-page-bubble agent ${isTaskCreated ? "success" : ""}`}
        >
          <FormattedText text={msg.content} />
        </div>
        {isTaskCreated && (
          <button
            className="agent-page-goto-tasks"
            onClick={() => navigate("/tasks")}
          >
            📋 {t("agent:viewTasks")} →
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

// Styles are in ../styles/pages/Agent.css
