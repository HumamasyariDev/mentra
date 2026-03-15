/**
 * MentraAgent.jsx — Manual Tool Calling (JSON-Based)
 *
 * Architecture:
 *  1. System prompt tells Puter.js to output JSON for task actions
 *  2. handleSend() checks if response contains a JSON action block
 *  3. If action = "create_task" → calls createTaskTool() → POST /api/tasks
 *  4. Natural conversation responses pass through as-is
 *
 * This is simpler and more reliable than the ReAct loop approach.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createTaskTool, searchKnowledgeTool } from "./MentraTools.js";

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt
// ─────────────────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

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

// ─────────────────────────────────────────────────────────────────────────────
// JSON Action Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract JSON action from LLM response.
 * Handles:
 *  - ```json { ... } ```  blocks
 *  - Raw { ... } at start of response
 *  - JSON embedded in prose (hallucination fallback)
 *
 * @param {string} text
 * @returns {{ action: string, payload: object } | null}
 */
function parseActionFromResponse(text) {
  if (!text || typeof text !== "string") return null;

  // Strategy 1: Extract from ```json ... ``` block
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    return tryParseAction(codeBlockMatch[1]);
  }

  // Strategy 2: Find first complete {...} in text
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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

const STORAGE_KEY = "mentra_agent_chat_v2";
const MAX_HISTORY = 40;

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

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}
function saveHistory(msgs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY)));
  } catch {
    /* noop */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MentraAgent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [messages, setMessages] = useState(
    () => loadHistory() ?? [WELCOME_MSG],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(""); // live status during tool exec
  // Chat history for Puter.js (role: 'user'|'assistant' messages only)
  const puterHistory = useRef([]);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  // System prompt built once (includes user context from localStorage)
  const systemPrompt = useRef(buildSystemPrompt(buildUserContext()));

  // Scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, statusMsg]);

  // Persist history
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

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

  // ── Core send handler ──────────────────────────────────────────────────

  const handleSend = useCallback(
    async (userText) => {
      const text = String(userText ?? input).trim();
      if (!text || loading) return;

      setInput("");
      setLoading(true);
      setStatusMsg("");

      // Add to UI
      const userMsg = { role: "user", content: text, type: "text" };
      setMessages((prev) => [...prev, userMsg]);

      // Build Puter conversation messages
      const conversation = [
        { role: "system", content: systemPrompt.current },
        ...puterHistory.current,
        { role: "user", content: text },
      ];

      try {
        // ── 1. Call Puter.js ──────────────────────────────────────────
        setStatusMsg("🤔 Thinking…");
        const puterResponse = await window.puter.ai.chat(conversation, {
          model: "claude-sonnet-4-5",
        });

        // Extract text from Puter response
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

        console.debug("[MentraAgent] Raw Puter response:", rawText);

        // ── 2. Parse for JSON action ──────────────────────────────────
        const action = parseActionFromResponse(rawText);

        if (action) {
          await executeAction(action, text);
        } else {
          // ── 3. Regular conversation ───────────────────────────────
          const agentMsg = {
            role: "agent",
            content: rawText.trim(),
            type: "text",
          };
          setMessages((prev) => [...prev, agentMsg]);

          // Update Puter history
          puterHistory.current = [
            ...puterHistory.current,
            { role: "user", content: text },
            { role: "assistant", content: rawText.trim() },
          ].slice(-20); // keep last 10 turns
        }
      } catch (err) {
        console.error("[MentraAgent] Error:", err);
        setMessages((prev) => [
          ...prev,
          { role: "error", content: `Error: ${err.message}`, type: "error" },
        ]);
      } finally {
        setLoading(false);
        setStatusMsg("");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [input, loading],
  );

  // ── Action executor ────────────────────────────────────────────────────

  const executeAction = useCallback(async (action, originalUserText) => {
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
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "error", content: result.error, type: "error" },
        ]);
      }
    } else if (action.action === "search_knowledge") {
      setStatusMsg("🔍 Mencari di knowledge base…");

      const result = await searchKnowledgeTool(action.payload.query);
      const baseContext = result.success ? result.context : "";

      // Use the search result as context, ask Puter to summarize
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

        setMessages((prev) => [
          ...prev,
          { role: "agent", content: summaryText.trim(), type: "text" },
        ]);
      } catch {
        // Fallback: show raw context
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: baseContext || "Tidak ada informasi relevan ditemukan.",
            type: "text",
          },
        ]);
      }
    } else {
      // Unknown action — show raw text
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: `Action "${action.action}" belum didukung.`,
          type: "text",
        },
      ]);
    }
  }, []);

  const handleClear = () => {
    setMessages([WELCOME_MSG]);
    puterHistory.current = [];
    localStorage.removeItem(STORAGE_KEY);
  };

  const puterAvailable = typeof window !== "undefined" && !!window.puter?.ai;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="ag">
      {/* Header */}
      <div className="ag-hdr">
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div className="ag-av">🤖</div>
          <div>
            <h1 className="ag-title">Mentra AI</h1>
            <p className="ag-sub">Puter.js · Manual Tool Calling · Supabase</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div className="ag-status">
            <span
              className={`ag-dot ${puterAvailable ? "dot-on" : "dot-off"}`}
            />
            <span>{puterAvailable ? "Ready" : "Waiting for Puter.js…"}</span>
          </div>
          <button
            className="clear-btn"
            onClick={handleClear}
            title="Clear chat"
          >
            ✕
          </button>
        </div>
      </div>

      {!puterAvailable && (
        <div className="ag-warn">
          ⚠️ <strong>Puter.js belum terdeteksi.</strong> Pastikan kamu sudah
          login di puter.com.
        </div>
      )}

      {/* Messages */}
      <div className="ag-msgs">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} navigate={navigate} />
        ))}

        {/* Live status */}
        {loading && (
          <div className="msg msg-agent">
            <div className="live-bar">
              <span className="ld" />
              <span className="ld" />
              <span className="ld" />
              <span className="live-txt">{statusMsg || "Thinking…"}</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      {!loading && (
        <div className="ag-quick">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.text}
              className="qp"
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
        className="ag-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
      >
        <input
          ref={inputRef}
          className="ag-inp"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Coba: "Buat task persiapan presentasi, deadline besok"'
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          className="ag-send"
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

      <style>{CSS}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ msg, navigate }) {
  if (msg.role === "user")
    return (
      <div className="msg msg-user">
        <div className="bbl bbl-user">{msg.content}</div>
      </div>
    );

  if (msg.role === "error")
    return (
      <div className="msg msg-agent">
        <div className="bbl bbl-err">⚠️ {msg.content}</div>
      </div>
    );

  if (msg.role === "agent") {
    const isTaskCreated = msg.type === "task_created";
    return (
      <div className="msg msg-agent">
        <div className={`bbl bbl-agent ${isTaskCreated ? "bbl-success" : ""}`}>
          <FormattedText text={msg.content} />
        </div>
        {isTaskCreated && (
          <button className="goto-tasks" onClick={() => navigate("/tasks")}>
            📋 Lihat di halaman Tasks →
          </button>
        )}
      </div>
    );
  }
  return null;
}

/** Minimal markdown renderer: **bold**, newlines */
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
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  .ag {
    display: flex; flex-direction: column; height: 100%; max-height: 100vh;
    background: #fafafa; color: #1f2937;
    font-family: 'Inter', -apple-system, sans-serif; overflow: hidden;
  }
  /* header */
  .ag-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1.75rem; border-bottom: 1px solid #e5e7eb;
    background: #ffffff; flex-shrink: 0;
  }
  .ag-av {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    background: #f3f4f6; border: 1px solid #e5e7eb;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.35rem;
  }
  .ag-title { font-size: 1rem; font-weight: 600; margin: 0; color: #111827; }
  .ag-sub   { font-size: .7rem; color: #9ca3af; margin: 0; margin-top: 2px; }
  .ag-status { display: flex; align-items: center; gap: .4rem; font-size: .75rem; color: #6b7280; }
  .ag-dot { width: 6px; height: 6px; border-radius: 50%; }
  .dot-on  { background: #10b981; }
  .dot-off { background: #d1d5db; }
  .clear-btn {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e5e7eb;
    background: #ffffff; color: #6b7280; cursor: pointer; font-size: .85rem;
    display: flex; align-items: center; justify-content: center; transition: all .2s;
  }
  .clear-btn:hover { background: #f9fafb; border-color: #d1d5db; color: #374151; }
  .ag-warn {
    background: #fef2f2; border-bottom: 1px solid #fecaca;
    color: #991b1b; padding: .75rem 1.75rem; font-size: .8rem; flex-shrink: 0;
  }
  /* messages */
  .ag-msgs {
    flex: 1; overflow-y: auto; padding: 2rem 1.75rem;
    display: flex; flex-direction: column; gap: 1.25rem; scroll-behavior: smooth;
  }
  .ag-msgs::-webkit-scrollbar { width: 6px; }
  .ag-msgs::-webkit-scrollbar-track { background: #f9fafb; }
  .ag-msgs::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
  .ag-msgs::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
  .msg { display: flex; animation: fu .25s ease both; }
  @keyframes fu { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  .msg-user  { justify-content: flex-end; }
  .msg-agent { flex-direction: column; gap: .5rem; max-width: 85%; }
  .bbl {
    padding: .875rem 1.125rem; border-radius: 16px;
    font-size: .875rem; line-height: 1.7; word-break: break-word;
  }
  .bbl-user {
    background: #111827; color: #ffffff;
    border-radius: 16px 16px 4px 16px; box-shadow: 0 2px 8px rgba(0,0,0,.08);
    max-width: 70%;
  }
  .bbl-agent {
    background: #ffffff; border: 1px solid #e5e7eb;
    border-radius: 4px 16px 16px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.04);
  }
  .bbl-success {
    border-color: #d1fae5; background: #f0fdf4;
  }
  .bbl-err {
    background: #fef2f2; border: 1px solid #fecaca;
    color: #991b1b; border-radius: 12px; max-width: 85%;
  }
  .goto-tasks {
    align-self: flex-start; padding: .45rem .875rem; border-radius: 10px;
    background: #f9fafb; border: 1px solid #e5e7eb;
    color: #374151; font-size: .75rem; font-weight: 500; cursor: pointer; transition: all .2s;
  }
  .goto-tasks:hover { background: #f3f4f6; border-color: #d1d5db; }
  /* live thinking */
  .live-bar {
    display: flex; align-items: center; gap: .4rem; padding: .75rem 1rem;
    background: #ffffff; border: 1px solid #e5e7eb;
    border-radius: 12px; width: fit-content; box-shadow: 0 1px 3px rgba(0,0,0,.04);
  }
  .ld {
    width: 6px; height: 6px; border-radius: 50%; background: #9ca3af;
    animation: bd 1.2s infinite;
  }
  .ld:nth-child(2){animation-delay:.2s} .ld:nth-child(3){animation-delay:.4s}
  @keyframes bd { 0%,80%,100%{transform:scale(1)} 40%{transform:scale(1.4)} }
  .live-txt { font-size: .8rem; color: #6b7280; }
  /* quick prompts */
  .ag-quick {
    display: flex; flex-wrap: wrap; gap: .5rem;
    padding: 1rem 1.75rem; border-top: 1px solid #e5e7eb; flex-shrink: 0;
    background: #fafafa;
  }
  .qp {
    padding: .5rem .875rem; border-radius: 10px; font-size: .75rem; font-weight: 500;
    background: #ffffff; border: 1px solid #e5e7eb;
    color: #4b5563; cursor: pointer; transition: all .2s;
    white-space: nowrap;
  }
  .qp:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,.04); }
  .qp:disabled { opacity: .5; cursor: not-allowed; }
  /* input */
  .ag-form {
    display: flex; gap: .75rem; padding: 1.25rem 1.75rem;
    border-top: 1px solid #e5e7eb;
    background: #ffffff; flex-shrink: 0;
  }
  .ag-inp {
    flex: 1; padding: .875rem 1.125rem;
    background: #fafafa; border: 1px solid #e5e7eb;
    border-radius: 12px; color: #111827; font-size: .875rem; font-family: inherit;
    outline: none; transition: all .2s;
  }
  .ag-inp:focus { border-color: #d1d5db; background: #ffffff; box-shadow: 0 0 0 3px #f3f4f6; }
  .ag-inp::placeholder { color: #9ca3af; }
  .ag-inp:disabled { opacity: .6; cursor: not-allowed; background: #f9fafb; }
  .ag-send {
    width: 46px; height: 46px; flex-shrink: 0;
    background: #111827;
    border: none; border-radius: 12px; color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
    transition: all .2s;
  }
  .ag-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.15); background: #1f2937; }
  .ag-send:disabled { opacity: .5; cursor: not-allowed; }
  .spinner {
    width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.25);
    border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
  }
  @keyframes spin { to{transform:rotate(360deg)} }
`;
