import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sandboxApi } from '../services/api';
import { Plus, Trash2, MessageSquare, Edit2 } from 'lucide-react';
import '../styles/pages/CommonPages.css';

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
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sandbox Projects</h1>
                    <p className="page-subtitle">Create AI chat projects and experiments</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="page-action-btn"
                >
                    <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                    New Sandbox
                </button>
            </div>

            {isLoading ? (
                <div className="page-loading">Loading...</div>
            ) : (
                <div className="card-grid">
                    {sandboxes?.data?.length === 0 ? (
                        <div className="page-empty-state" style={{ gridColumn: '1 / -1' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                                <MessageSquare style={{ width: '4rem', height: '4rem', margin: '0 auto 0.75rem' }} />
                                <p style={{ fontSize: '1.125rem' }}>No sandbox projects yet</p>
                                <p style={{ fontSize: '0.875rem' }}>Create your first sandbox to get started!</p>
                            </div>
                        </div>
                    ) : (
                        sandboxes?.data?.map((sandbox) => (
                            <div
                                key={sandbox.id}
                                className="sandbox-card"
                            >
                                <div className="sandbox-card-header">
                                    <h3 className="sandbox-card-title">{sandbox.name}</h3>
                                    <div className="sandbox-card-actions">
                                        <button
                                            onClick={() => handleEdit(sandbox)}
                                            className="sandbox-edit-btn"
                                        >
                                            <Edit2 style={{ width: '1rem', height: '1rem' }} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this sandbox?')) {
                                                    deleteMutation.mutate(sandbox.id);
                                                }
                                            }}
                                            className="sandbox-delete-btn"
                                        >
                                            <Trash2 style={{ width: '1rem', height: '1rem' }} />
                                        </button>
                                    </div>
                                </div>
                                {sandbox.description && (
                                    <p className="sandbox-card-description">{sandbox.description}</p>
                                )}
                                <button
                                    onClick={() => navigate(`/sandbox/${sandbox.id}`)}
                                    className="sandbox-open-btn"
                                >
                                    <MessageSquare style={{ width: '1rem', height: '1rem' }} />
                                    Open Chat
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showModal || editingSandbox) && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '28rem' }}>
                        <h2 className="modal-title">
                            {editingSandbox ? 'Edit Sandbox' : 'New Sandbox'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="form-textarea"
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingSandbox(null);
                                        setFormData({ name: '', description: '' });
                                    }}
                                    className="modal-cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="modal-submit-btn"
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
