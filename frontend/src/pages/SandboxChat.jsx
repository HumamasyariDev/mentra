import { usePageTitle } from "../hooks/usePageTitle";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { sandboxApi, aiApi } from "../services/api";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import InfiniteCanvasMindMap from "../components/sandbox/InfiniteCanvasMindMap.jsx";
import { parseMarkdownToReact } from "../utils/markdownParser.jsx";
import "../styles/pages/SandboxChat.css";
import "../styles/utils/markdown.css";

export default function SandboxChat() {
  usePageTitle("sandbox:pageTitle");

  const { t } = useTranslation(["sandbox", "common"]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [outputContent, setOutputContent] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch sandbox metadata
  const { data: sandbox, isLoading } = useQuery({
    queryKey: ["sandbox", id],
    queryFn: () => sandboxApi.get(id).then((res) => res.data),
  });

  // Load persisted messages on mount
  useEffect(() => {
    if (!id) return;

    const loadMessages = async () => {
      try {
        const res = await sandboxApi.getMessages(id);
        const dbMessages = res.data || [];
        if (dbMessages.length > 0) {
          setMessages(
            dbMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          );
          // Set the last assistant message as output content
          const lastAssistant = [...dbMessages]
            .reverse()
            .find((m) => m.role === "assistant");
          if (lastAssistant) {
            setOutputContent(lastAssistant.content);
          }
        }
      } catch (err) {
        console.error("[SandboxChat] Failed to load messages:", err);
      } finally {
        setMessagesLoaded(true);
      }
    };

    loadMessages();
  }, [id]);

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const userContent = input.trim();
      const userMessage = { role: "user", content: userContent };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        // Save user message to DB
        await sandboxApi.storeMessage(id, "user", userContent);

        // Build conversation for AI
        const conversation = [
          {
            role: "system",
            content:
              "Kamu adalah asisten AI yang membantu pengguna dalam sandbox eksperimen mereka.",
          },
          ...messages.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
          { role: "user", content: userContent },
        ];

        const response = await aiApi.sandboxChat(conversation);
        const aiText = (response.data?.message || "").trim();

        // Save AI response to DB
        await sandboxApi.storeMessage(id, "assistant", aiText);

        const aiMessage = { role: "assistant", content: aiText };
        setMessages((prev) => [...prev, aiMessage]);
        setOutputContent(aiText);
      } catch (err) {
        console.error("[SandboxChat] Error:", err);
        const errorMsg = { role: "error", content: `Error: ${err.message}` };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, id],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading || !messagesLoaded) {
    return (
      <div className="sandbox-workspace">
        <div className="sandbox-loading-container">
          <Loader2 size={48} className="sandbox-loading-spinner" />
          <p>{t("sandbox:loadingSandbox")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sandbox-workspace">
      {/* Header */}
      <div className="sandbox-workspace-header">
        <button
          onClick={() => navigate("/sandbox")}
          className="sandbox-back-btn"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="sandbox-workspace-info">
          <h2>{sandbox?.name || t("sandbox:pageTitle")}</h2>
          {sandbox?.description && <p>{sandbox.description}</p>}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="sandbox-workspace-content">
        {/* Left Column: Chat */}
        <div className="sandbox-chat-column">
          <div className="sandbox-chat-header">
            <h3>{t("sandbox:chatTitle")}</h3>
          </div>

          <div className="sandbox-chat-messages">
            {messages.length === 0 ? (
              <div className="sandbox-chat-empty">
                <div className="sandbox-empty-icon">💬</div>
                <p>{t("sandbox:chatEmpty")}</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`sandbox-message ${msg.role}`}>
                  <div className="sandbox-message-bubble">
                    {msg.role === "assistant" ? (
                      <div className="markdown-content">
                        {parseMarkdownToReact(msg.content)}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="sandbox-message assistant">
                <div className="sandbox-message-bubble loading">
                  <Loader2 size={20} className="sandbox-message-spinner" />
                  <span>{t("sandbox:chatThinking")}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="sandbox-chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("sandbox:chatInputPlaceholder")}
              className="sandbox-chat-input"
              disabled={loading}
            />
            <button
              type="submit"
              className="sandbox-chat-send"
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Right Column: Mind Map Output */}
        <div className="sandbox-output-column">
          <div className="sandbox-output-content mindmap-mode">
            <InfiniteCanvasMindMap
              content={outputContent}
              chatMessages={messages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
