import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sandboxApi } from '../services/api';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import '../styles/pages/CommonPages.css';

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
            <div className="page-loading" style={{ height: 'calc(100vh - 12rem)' }}>
                <Loader2 className="page-loading-spinner" style={{ width: '2rem', height: '2rem' }} />
            </div>
        );
    }

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)' }}>
            {/* Header */}
            <div className="sandbox-chat-header">
                <button
                    onClick={() => navigate('/sandbox')}
                    className="sandbox-back-btn"
                >
                    <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
                <div>
                    <h2 className="sandbox-chat-title">{sandbox?.name}</h2>
                    {sandbox?.description && (
                        <p className="sandbox-chat-subtitle">{sandbox.description}</p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="message-list" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc', padding: '1.5rem' }}>
                <div style={{ maxWidth: '48rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sandbox?.messages?.length === 0 ? (
                        <div className="chat-empty-state" style={{ padding: '3rem 0' }}>
                            <p>No messages yet. Start a conversation!</p>
                        </div>
                    ) : (
                        sandbox?.messages?.map((message) => (
                            <div
                                key={message.id}
                                className="message-item"
                                style={{ justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}
                            >
                                <div
                                    style={{
                                        maxWidth: '70%',
                                        borderRadius: '1rem',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: message.role === 'user' ? '#6366f1' : '#ffffff',
                                        color: message.role === 'user' ? '#ffffff' : '#1e293b',
                                        boxShadow: message.role === 'user' ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                        border: message.role === 'user' ? 'none' : '1px solid #e2e8f0'
                                    }}
                                >
                                    <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</div>
                                    <div
                                        style={{
                                            fontSize: '0.75rem',
                                            marginTop: '0.25rem',
                                            color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : '#94a3b8'
                                        }}
                                    >
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

            {/* Input */}
            <div className="message-input-container" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1rem' }}>
                <form onSubmit={handleSend} className="message-input-form" style={{ maxWidth: '48rem', margin: '0 auto' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="message-input"
                        disabled={sendMutation.isPending}
                    />
                    <button
                        type="submit"
                        className="message-send-btn"
                        disabled={sendMutation.isPending || !input.trim()}
                        style={{ padding: '0.5rem 1.5rem' }}
                    >
                        {sendMutation.isPending ? (
                            <Loader2 className="page-loading-spinner" style={{ width: '1.25rem', height: '1.25rem' }} />
                        ) : (
                            <Send style={{ width: '1.25rem', height: '1.25rem' }} />
                        )}
                        Send
                    </button>
                </form>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.5rem' }}>
                    Currently using mock AI responses. Puter.com integration coming soon!
                </p>
            </div>
        </div>
    );
}
