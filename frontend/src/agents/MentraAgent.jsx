/**
 * MentraAgent.jsx
 *
 * AI Agentic Interface for Mentra.
 *
 * Custom ReAct (Reasoning + Acting) Agent Loop:
 *  - PuterChatModel as LLM (no OpenAI needed)
 *  - Manual ReAct prompt template (embedded, no langchain/hub needed)
 *  - Tools: search_knowledge, create_task, add_knowledge
 *  - Shows full reasoning chain: Thought → Action → Observation → Final Answer
 *
 * Compatible with: langchain@1.x, @langchain/core@1.x
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { HumanMessage } from '@langchain/core/messages';
import { PuterChatModel } from '../utils/PuterLangChain.js';
import { mentraTools } from './MentraTools.js';

// ─────────────────────────────────────────────────────────────────────────────
// ReAct Prompt Template
// ─────────────────────────────────────────────────────────────────────────────
function buildReActPrompt(toolsDescription, query, userContext = '') {
    const toolNames = mentraTools.map((t) => t.name).join(', ');
    return `You are Mentra AI, a smart productivity assistant embedded in a personal productivity app.
${userContext ? `\nCurrent user context:\n${userContext}` : ''}

You have access to these tools:
${toolsDescription}

IMPORTANT RULES:
- For search_knowledge: Action Input must be a plain string query (no JSON).
- For create_task: Action Input must be a JSON object with at least "title".
- For add_knowledge: Action Input must be a JSON object with "content".
- Always end with Final Answer when you have enough info.
- Do NOT call a tool if you already have the answer.

Use this format EXACTLY (no deviation):

Thought: [your reasoning]
Action: [one of: ${toolNames}]
Action Input: [tool input — plain string or JSON]
Observation: [result from tool]
... (repeat as needed, max 5 cycles)
Thought: I now know the final answer
Final Answer: [your response to the user]

Question: ${query}
Thought:`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ReAct Parser
// ─────────────────────────────────────────────────────────────────────────────
function parseReActOutput(text) {
    // Final answer (greedy: captures everything after Final Answer:)
    const finalMatch = text.match(/Final Answer:\s*([\s\S]+)$/);
    if (finalMatch) {
        return { type: 'final', answer: finalMatch[1].trim() };
    }

    // Action + Action Input
    // Action Input may be multi-line JSON — capture until next known keyword or end
    const actionMatch = text.match(/Action:\s*(.+)/);
    const inputMatch = text.match(/Action Input:\s*([\s\S]+?)(?=\nObservation:|\nThought:|\nAction:|\nFinal Answer:|$)/);

    if (actionMatch && inputMatch) {
        return {
            type: 'action',
            tool: actionMatch[1].trim(),
            input: inputMatch[1].trim(),
        };
    }

    return { type: 'unknown', raw: text };
}

// ─────────────────────────────────────────────────────────────────────────────
// Execute a named tool
// ─────────────────────────────────────────────────────────────────────────────
async function executeTool(toolName, toolInput) {
    const tool = mentraTools.find(
        (t) => t.name.toLowerCase() === toolName.toLowerCase().trim()
    );

    if (!tool) {
        return `Tool "${toolName}" not found. Available: ${mentraTools.map((t) => t.name).join(', ')}`;
    }

    try {
        // Pass raw string — MentraTools.js func() handles JSON parsing internally
        const result = await tool.invoke(toolInput);
        return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (err) {
        return `Error executing ${toolName}: ${err.message}`;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build tools description for the prompt
// ─────────────────────────────────────────────────────────────────────────────
function buildToolsDescription() {
    return mentraTools
        .map((t) => `- ${t.name}: ${t.description}`)
        .join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ReAct Agent Runner
// ─────────────────────────────────────────────────────────────────────────────

/** Build a brief user context string from localStorage for the prompt */
function buildUserContext() {
    try {
        const raw = localStorage.getItem('mentra_user');
        if (!raw) return '';
        const u = JSON.parse(raw);
        return [
            u.name ? `- Name: ${u.name}` : '',
            u.level ? `- Level: ${u.level}` : '',
            u.total_exp ? `- Total EXP: ${u.total_exp}` : '',
        ].filter(Boolean).join('\n');
    } catch { return ''; }
}

async function runReActAgent(query, onStep, maxIter = 6) {
    const model = new PuterChatModel({ modelName: 'claude-sonnet-4-5', temperature: 0.15 });
    const toolsDesc = buildToolsDescription();
    const userCtx = buildUserContext();

    let scratchpad = buildReActPrompt(toolsDesc, query, userCtx);
    const steps = [];

    for (let i = 0; i < maxIter; i++) {
        const aiMessage = await model.invoke([new HumanMessage(scratchpad)]);
        const text = typeof aiMessage === 'string' ? aiMessage : (aiMessage.content ?? String(aiMessage));

        const parsed = parseReActOutput(text);

        if (parsed.type === 'final') {
            return { answer: parsed.answer, steps };
        }

        if (parsed.type === 'action') {
            onStep?.({ type: 'action', tool: parsed.tool, input: parsed.input, thought: text });

            const observation = await executeTool(parsed.tool, parsed.input);

            steps.push({
                action: {
                    tool: parsed.tool,
                    toolInput: parsed.input,
                    log: text,
                },
                observation,
            });

            onStep?.({ type: 'observation', observation });

            // Append to scratchpad for next iteration
            scratchpad += `${text}\nObservation: ${observation}\nThought:`;
        } else {
            // Can't parse — return raw text as final answer
            return {
                answer: text || 'I was unable to produce a structured response.',
                steps,
            };
        }
    }

    return {
        answer: 'I reached the maximum number of reasoning steps. Here is my last observation: ' +
            (steps.at(-1)?.observation ?? 'none.'),
        steps,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────
function ThoughtStep({ step, index }) {
    const [expanded, setExpanded] = useState(true);
    const { action, observation } = step;

    const thoughtText = action?.log?.split('\nAction:')[0]?.replace(/^Thought:/i, '').trim() ?? '';

    return (
        <div className="thought-step">
            <button className="thought-header" onClick={() => setExpanded((v) => !v)}>
                <span className="thought-icon">⚙️</span>
                <span className="thought-label">
                    Step {index + 1}: <strong>{action?.tool ?? 'Thinking…'}</strong>
                </span>
                <span className="thought-chevron">{expanded ? '▾' : '▸'}</span>
            </button>
            {expanded && (
                <div className="thought-body">
                    {thoughtText && (
                        <div className="thought-section">
                            <span className="thought-tag thought-tag--thought">Thought</span>
                            <pre className="thought-text">{thoughtText}</pre>
                        </div>
                    )}
                    {action?.tool && (
                        <div className="thought-section">
                            <span className="thought-tag thought-tag--action">Action</span>
                            <code className="thought-code">
                                {action.tool}({action.toolInput})
                            </code>
                        </div>
                    )}
                    {observation !== undefined && (
                        <div className="thought-section">
                            <span className="thought-tag thought-tag--observation">Observation</span>
                            <pre className="thought-text">{String(observation)}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MessageBubble({ msg }) {
    if (msg.role === 'user') {
        return (
            <div className="msg msg--user">
                <div className="msg__bubble">{msg.content}</div>
            </div>
        );
    }
    if (msg.role === 'agent') {
        return (
            <div className="msg msg--agent">
                {msg.steps?.length > 0 && (
                    <div className="thought-chain">
                        <div className="thought-chain-header">
                            <span>🧠 Agent Reasoning</span>
                            <span className="thought-chain-count">
                                {msg.steps.length} step{msg.steps.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {msg.steps.map((step, i) => (
                            <ThoughtStep key={i} step={step} index={i} />
                        ))}
                    </div>
                )}
                <div className="msg__bubble msg__bubble--agent">{msg.content}</div>
            </div>
        );
    }
    if (msg.role === 'error') {
        return (
            <div className="msg msg--error">
                <div className="msg__bubble msg__bubble--error">⚠️ {msg.content}</div>
            </div>
        );
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function MentraAgent() {
    const [messages, setMessages] = useState([
        {
            role: 'agent',
            content:
                "👋 Hi! I'm your Mentra AI Agent. I can:\n\n• 🔍 Search your knowledge base\n• ✅ Create new tasks\n• 📚 Save notes to your knowledge base\n\nJust tell me what you'd like to do!",
            steps: [],
        },
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (!input.trim() || isThinking) return;

            const userMessage = input.trim();
            setInput('');
            setIsThinking(true);
            setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

            try {
                const { answer, steps } = await runReActAgent(
                    userMessage,
                    null,  // onStep callback — could stream steps in future
                    6
                );

                setMessages((prev) => [
                    ...prev,
                    { role: 'agent', content: answer, steps },
                ]);
            } catch (err) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'error', content: `Agent error: ${err.message}` },
                ]);
            } finally {
                setIsThinking(false);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        },
        [input, isThinking]
    );

    const puterAvailable = typeof window !== 'undefined' && window.puter?.ai;

    return (
        <div className="agent-page">
            {/* Header */}
            <div className="agent-header">
                <div className="agent-header-left">
                    <div className="agent-avatar">🤖</div>
                    <div>
                        <h1 className="agent-title">Mentra Agent</h1>
                        <p className="agent-subtitle">Puter.js + LangChain ReAct + pgvector</p>
                    </div>
                </div>
                <div className="agent-status">
                    <span className={`agent-status-dot ${puterAvailable ? 'agent-status-dot--ready' : 'agent-status-dot--loading'}`} />
                    <span>{puterAvailable ? 'Ready' : 'Waiting for Puter.js…'}</span>
                </div>
            </div>

            {!puterAvailable && (
                <div className="agent-error-banner">
                    ⚠️ <strong>Puter.js not detected.</strong> Make sure Puter is loaded and you are logged in.
                </div>
            )}

            {/* Messages */}
            <div className="agent-messages">
                {messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} />
                ))}
                {isThinking && (
                    <div className="msg msg--agent">
                        <div className="agent-thinking">
                            <span className="thinking-dot" />
                            <span className="thinking-dot" />
                            <span className="thinking-dot" />
                            <span className="thinking-label">Agent is thinking…</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="agent-input-form" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    className="agent-input"
                    placeholder='Try: "Create a task: learn pgvector, priority high"'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isThinking}
                />
                <button
                    type="submit"
                    className="agent-send-btn"
                    disabled={isThinking || !input.trim()}
                    aria-label="Send"
                >
                    {isThinking ? (
                        <span className="btn-spinner" />
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    )}
                </button>
            </form>

            <style>{agentStyles}</style>
        </div>
    );
}

const agentStyles = `
  .agent-page {
    display: flex; flex-direction: column; height: 100%; max-height: 100vh;
    background: var(--bg, #0f0f1a); color: var(--text, #e2e8f0);
    font-family: 'Inter', sans-serif; overflow: hidden;
  }
  .agent-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.5rem; border-bottom: 1px solid rgba(99,102,241,0.2);
    background: rgba(15,15,26,0.95); backdrop-filter: blur(12px); flex-shrink: 0;
  }
  .agent-header-left { display: flex; align-items: center; gap: 0.75rem; }
  .agent-avatar {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; box-shadow: 0 0 20px rgba(99,102,241,0.4);
  }
  .agent-title { font-size: 1.1rem; font-weight: 700; margin: 0; line-height: 1.2; }
  .agent-subtitle { font-size: 0.7rem; color: #64748b; margin: 0; }
  .agent-status { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #94a3b8; }
  .agent-status-dot { width: 8px; height: 8px; border-radius: 50%; animation: pulse-dot 2s infinite; }
  .agent-status-dot--ready { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
  .agent-status-dot--loading { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .agent-error-banner {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5; padding: 0.75rem 1.5rem; font-size: 0.85rem;
  }

  .agent-messages {
    flex: 1; overflow-y: auto; padding: 1.5rem;
    display: flex; flex-direction: column; gap: 1rem; scroll-behavior: smooth;
  }
  .agent-messages::-webkit-scrollbar { width: 4px; }
  .agent-messages::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 99px; }

  .msg { display: flex; animation: fadeUp 0.3s ease both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .msg--user { justify-content: flex-end; }
  .msg--agent { justify-content: flex-start; flex-direction: column; gap: 0.5rem; max-width: 90%; }
  .msg--error { justify-content: flex-start; }

  .msg__bubble {
    padding: 0.8rem 1rem; border-radius: 12px;
    font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word;
  }
  .msg--user .msg__bubble {
    background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
    border-radius: 12px 12px 4px 12px; box-shadow: 0 4px 15px rgba(99,102,241,0.3);
    max-width: 70%;
  }
  .msg__bubble--agent {
    background: rgba(30,30,50,0.8); border: 1px solid rgba(99,102,241,0.2);
    border-radius: 4px 12px 12px 12px; color: #e2e8f0;
  }
  .msg__bubble--error {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5; border-radius: 12px; max-width: 85%;
  }

  .agent-thinking {
    display: flex; align-items: center; gap: 0.4rem; padding: 0.75rem 1rem;
    background: rgba(30,30,50,0.6); border: 1px solid rgba(99,102,241,0.15); border-radius: 12px;
  }
  .thinking-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #6366f1;
    animation: bounce-dot 1.2s infinite;
  }
  .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
  .thinking-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce-dot { 0%,80%,100%{transform:scale(1)} 40%{transform:scale(1.4)} }
  .thinking-label { font-size: 0.8rem; color: #64748b; margin-left: 0.25rem; }

  .thought-chain {
    background: rgba(15,15,30,0.6); border: 1px solid rgba(99,102,241,0.2);
    border-radius: 10px; overflow: hidden; font-size: 0.82rem; width: 100%;
  }
  .thought-chain-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0.8rem; background: rgba(99,102,241,0.08);
    border-bottom: 1px solid rgba(99,102,241,0.15);
    font-size: 0.75rem; font-weight: 600; color: #818cf8;
  }
  .thought-chain-count {
    background: rgba(99,102,241,0.15); padding: 0.1rem 0.4rem;
    border-radius: 99px; font-size: 0.7rem;
  }
  .thought-step { border-bottom: 1px solid rgba(99,102,241,0.1); }
  .thought-step:last-child { border-bottom: none; }
  .thought-header {
    width: 100%; padding: 0.5rem 0.8rem; display: flex; align-items: center; gap: 0.5rem;
    background: none; border: none; color: #cbd5e1; cursor: pointer; text-align: left;
    font-size: 0.8rem; transition: background 0.15s;
  }
  .thought-header:hover { background: rgba(99,102,241,0.05); }
  .thought-label { flex: 1; }
  .thought-chevron { color: #475569; font-size: 0.7rem; }
  .thought-body { padding: 0.5rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .thought-section { display: flex; flex-direction: column; gap: 0.25rem; }
  .thought-tag {
    display: inline-block; padding: 0.1rem 0.4rem; border-radius: 4px;
    font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; width: fit-content;
  }
  .thought-tag--thought { background: rgba(168,85,247,0.15); color: #c084fc; }
  .thought-tag--action  { background: rgba(99,102,241,0.15); color: #818cf8; }
  .thought-tag--observation { background: rgba(34,197,94,0.1); color: #86efac; }
  .thought-text {
    font-size: 0.78rem; color: #94a3b8; white-space: pre-wrap; word-break: break-word;
    margin: 0; font-family: inherit; line-height: 1.5;
  }
  .thought-code {
    font-size: 0.75rem; color: #a5b4fc;
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    background: rgba(0,0,0,0.3); padding: 0.4rem 0.6rem;
    border-radius: 6px; white-space: pre-wrap; word-break: break-all; display: block;
  }

  .agent-input-form {
    display: flex; gap: 0.75rem; padding: 1rem 1.5rem;
    border-top: 1px solid rgba(99,102,241,0.2);
    background: rgba(15,15,26,0.95); backdrop-filter: blur(12px); flex-shrink: 0;
  }
  .agent-input {
    flex: 1; padding: 0.75rem 1rem;
    background: rgba(30,30,50,0.8); border: 1px solid rgba(99,102,241,0.2);
    border-radius: 10px; color: #e2e8f0; font-size: 0.9rem; font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .agent-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
  .agent-input::placeholder { color: #475569; }
  .agent-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .agent-send-btn {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 10px; color: white; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    box-shadow: 0 4px 15px rgba(99,102,241,0.3); flex-shrink: 0;
  }
  .agent-send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
  .agent-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-spinner {
    width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to{transform:rotate(360deg)} }
`;
