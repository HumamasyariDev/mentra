import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sandboxApi } from '../services/api';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import '../styles/pages/Sandbox.css';

export default function SandboxChat() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const { data: sandbox, isLoading } = useQuery({
        queryKey: ['sandbox', id],
        queryFn: () => sandboxApi.get(id).then(res => res.data),
    });

    const sendMutation = useMutation({
        mutationFn: (content) => sandboxApi.sendMessage(id, content),
        onSuccess: () => {
            queryClient.invalidateQueries(['sandbox', id]);
            setInput('');
        },
    });

    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim()) {
            sendMutation.mutate(input);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sandbox?.messages]);

    if (isLoading) {
        return (
            <div className="sandbox-chat-page">
                <div className="sandbox-loading">
                    <div className="sandbox-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="sandbox-chat-page">
            <div className="sandbox-chat-top">
                <button onClick={() => navigate('/sandbox')} className="sandbox-back-button">
                    <ArrowLeft />
                </button>
                <div className="sandbox-chat-info">
                    <h2>{sandbox?.name}</h2>
                    {sandbox?.description && <p>{sandbox.description}</p>}
                </div>
            </div>

            <div className="sandbox-messages">
                <div className="sandbox-messages-inner">
                    {sandbox?.messages?.length === 0 ? (
                        <div className="sandbox-chat-empty">
                            <div className="sandbox-chat-empty-icon">
                                <MessageSquare />
                            </div>
                            <h4>Start a conversation</h4>
                            <p>Send a message to begin chatting</p>
                        </div>
                    ) : (
                        sandbox?.messages?.map((message) => (
                            <div
                                key={message.id}
                                className={`sandbox-msg-row ${message.role}`}
                            >
                                <div>
                                    <div className="sandbox-msg-bubble">
                                        {message.content}
                                    </div>
                                    <div className="sandbox-msg-time">
                                        {new Date(message.created_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="sandbox-input-area">
                <form onSubmit={handleSend} className="sandbox-input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="sandbox-chat-input"
                        disabled={sendMutation.isPending}
                    />
                    <button
                        type="submit"
                        className="sandbox-send-btn"
                        disabled={sendMutation.isPending || !input.trim()}
                    >
                        {sendMutation.isPending ? (
                            <div className="sandbox-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        ) : (
                            <Send />
                        )}
                    </button>
                </form>
                <p className="sandbox-input-hint">
                    AI-powered sandbox — responses are experimental
                </p>
            </div>
        </div>
    );
}
