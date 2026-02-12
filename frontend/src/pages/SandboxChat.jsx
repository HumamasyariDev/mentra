import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sandboxApi } from '../services/api';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';

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
            <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate('/sandbox')}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">{sandbox?.name}</h2>
                    {sandbox?.description && (
                        <p className="text-sm text-slate-500">{sandbox.description}</p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    {sandbox?.messages?.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p>No messages yet. Start a conversation!</p>
                        </div>
                    ) : (
                        sandbox?.messages?.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-slate-800 shadow-sm border border-slate-200'
                                        }`}
                                >
                                    <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                                    <div
                                        className={`text-xs mt-1 ${message.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                                            }`}
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
            <div className="bg-white border-t border-slate-200 p-4">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={sendMutation.isPending}
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={sendMutation.isPending || !input.trim()}
                    >
                        {sendMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        Send
                    </button>
                </form>
                <p className="text-xs text-slate-400 text-center mt-2">
                    Currently using mock AI responses. Puter.com integration coming soon!
                </p>
            </div>
        </div>
    );
}
