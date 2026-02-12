import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sandboxApi } from '../services/api';
import { Plus, Trash2, MessageSquare, Edit2 } from 'lucide-react';

export default function Sandbox() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingSandbox, setEditingSandbox] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const { data: sandboxes, isLoading } = useQuery({
        queryKey: ['sandboxes'],
        queryFn: () => sandboxApi.list().then(res => res.data),
    });

    const createMutation = useMutation({
        mutationFn: sandboxApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['sandboxes']);
            setShowModal(false);
            setFormData({ name: '', description: '' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => sandboxApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['sandboxes']);
            setEditingSandbox(null);
            setFormData({ name: '', description: '' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: sandboxApi.delete,
        onSuccess: () => queryClient.invalidateQueries(['sandboxes']),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSandbox) {
            updateMutation.mutate({ id: editingSandbox.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (sandbox) => {
        setEditingSandbox(sandbox);
        setFormData({ name: sandbox.name, description: sandbox.description || '' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Sandbox Projects</h1>
                    <p className="text-slate-600 mt-1">Create AI chat projects and experiments</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Sandbox
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sandboxes?.data?.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <div className="text-slate-400 mb-4">
                                <MessageSquare className="w-16 h-16 mx-auto mb-3" />
                                <p className="text-lg">No sandbox projects yet</p>
                                <p className="text-sm">Create your first sandbox to get started!</p>
                            </div>
                        </div>
                    ) : (
                        sandboxes?.data?.map((sandbox) => (
                            <div
                                key={sandbox.id}
                                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-lg text-slate-900">{sandbox.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(sandbox)}
                                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this sandbox?')) {
                                                    deleteMutation.mutate(sandbox.id);
                                                }
                                            }}
                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {sandbox.description && (
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{sandbox.description}</p>
                                )}
                                <button
                                    onClick={() => navigate(`/sandbox/${sandbox.id}`)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Open Chat
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showModal || editingSandbox) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingSandbox ? 'Edit Sandbox' : 'New Sandbox'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingSandbox(null);
                                        setFormData({ name: '', description: '' });
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
