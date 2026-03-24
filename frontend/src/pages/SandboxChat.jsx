import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sandboxApi } from "../services/api";
import { Send, ArrowLeft, FileText, Network } from "lucide-react";
import InfiniteCanvasMindMap from "../components/sandbox/InfiniteCanvasMindMap.jsx";
import WateringAnimation from "../components/sandbox/WateringAnimation.jsx";
import { parseMarkdownToReact } from "../utils/markdownParser.jsx";
import "../styles/pages/SandboxChat.css";
import "../styles/utils/markdown.css";

export default function SandboxChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [outputType, setOutputType] = useState("text"); // text, mindmap
  const [outputContent, setOutputContent] = useState("");
  const messagesEndRef = useRef(null);

  const { data: sandbox, isLoading } = useQuery({
    queryKey: ["sandbox", id],
    queryFn: () => sandboxApi.get(id).then((res) => res.data),
  });

  const puterAvailable = typeof window !== "undefined" && !!window.puter?.ai;

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (!input.trim() || loading || !puterAvailable) return;

      const userMessage = { role: "user", content: input.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
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
          { role: "user", content: input.trim() },
        ];

        const response = await window.puter.ai.chat(conversation, {
          model: "claude-sonnet-4-5",
        });

        let aiText = "";
        if (typeof response === "string") {
          aiText = response;
        } else if (response?.message?.content) {
          const c = response.message.content;
          aiText = Array.isArray(c)
            ? c.map((x) => x.text ?? "").join("")
            : String(c);
        } else if (response?.text) {
          aiText = response.text;
        } else {
          aiText = String(response);
        }

        const aiMessage = { role: "assistant", content: aiText.trim() };
        setMessages((prev) => [...prev, aiMessage]);
        setOutputContent(aiText.trim());
      } catch (err) {
        console.error("[SandboxChat] Error:", err);
        const errorMsg = { role: "error", content: `Error: ${err.message}` };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, puterAvailable],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="sandbox-workspace">
        <div className="sandbox-loading-container">
          <WateringAnimation />
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
          <h2>{sandbox?.name || "Sandbox"}</h2>
          {sandbox?.description && <p>{sandbox.description}</p>}
        </div>
        {!puterAvailable && (
          <div className="sandbox-warning">Puter.js tidak tersedia</div>
        )}
      </div>

      {/* 2-Column Layout */}
      <div className="sandbox-workspace-content">
        {/* Left Column: Chat */}
        <div className="sandbox-chat-column">
          <div className="sandbox-chat-header">
            <h3>Chat Assistant</h3>
          </div>

          <div className="sandbox-chat-messages">
            {messages.length === 0 ? (
              <div className="sandbox-chat-empty">
                <div className="sandbox-empty-icon">💬</div>
                <p>Mulai percakapan dengan AI</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`sandbox-message ${msg.role}`}>
                  <div className="sandbox-message-bubble">{msg.content}</div>
                </div>
              ))
            )}
            {loading && (
              <div className="sandbox-message assistant">
                <div className="sandbox-message-bubble loading">
                  <WateringAnimation />
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
              placeholder="Ketik pesan Anda..."
              className="sandbox-chat-input"
              disabled={loading || !puterAvailable}
            />
            <button
              type="submit"
              className="sandbox-chat-send"
              disabled={loading || !input.trim() || !puterAvailable}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Output */}
        <div className="sandbox-output-column">
          <div className="sandbox-output-header">
            <button
              className={`sandbox-output-tab ${outputType === "text" ? "active" : ""}`}
              onClick={() => setOutputType("text")}
            >
              <FileText size={18} />
              <span>Text</span>
            </button>
            <button
              className={`sandbox-output-tab ${outputType === "mindmap" ? "active" : ""}`}
              onClick={() => setOutputType("mindmap")}
            >
              <Network size={18} />
              <span>Mind Map</span>
            </button>
          </div>

          <div className="sandbox-output-content">
            {outputType === "text" && (
              <div className="sandbox-output-text">
                {outputContent ? (
                  <div className="sandbox-text-display markdown-content">
                    {parseMarkdownToReact(outputContent)}
                  </div>
                ) : (
                  <div className="sandbox-output-empty">
                    <FileText size={48} />
                    <p>Output teks akan muncul di sini</p>
                  </div>
                )}
              </div>
            )}

            {outputType === "mindmap" && (
              <InfiniteCanvasMindMap
                content={outputContent}
                chatMessages={messages}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
