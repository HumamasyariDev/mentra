import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { sandboxApi } from "../services/api";
import { Plus, Trash2, MessageSquare, Pencil, Clock } from "lucide-react";
import "../styles/pages/Sandbox.css";

export default function Sandbox() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSandbox, setEditingSandbox] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    purposes: [],
  });

  const PURPOSE_OPTIONS = [
    { id: "learning", label: "Belajar" },
    { id: "working", label: "Bekerja" },
    { id: "ideation", label: "Eksplorasi Ide" },
    { id: "business", label: "Riset Bisnis" },
    { id: "entertainment", label: "Hiburan" },
  ];

  const { data: sandboxes, isLoading } = useQuery({
    queryKey: ["sandboxes"],
    queryFn: () => sandboxApi.list().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: sandboxApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["sandboxes"]);
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sandboxApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["sandboxes"]);
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sandboxApi.delete,
    onSuccess: () => queryClient.invalidateQueries(["sandboxes"]),
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingSandbox(null);
    setFormData({ name: "", description: "", purposes: [] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSandbox) {
      updateMutation.mutate({ id: editingSandbox.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (e, sandbox) => {
    e.stopPropagation();
    setEditingSandbox(sandbox);
    setFormData({
      name: sandbox.name,
      description: sandbox.description || "",
      purposes: sandbox.purposes || [],
    });
  };

  const togglePurpose = (purposeId) => {
    setFormData((prev) => ({
      ...prev,
      purposes: prev.purposes.includes(purposeId)
        ? prev.purposes.filter((p) => p !== purposeId)
        : [...prev.purposes, purposeId],
    }));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm("Delete this sandbox?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="sandbox-page">
      <div className="sandbox-header">
        <div className="sandbox-header-text">
          <h1>Sandbox</h1>
          <p>Create and manage your AI chat experiments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="sandbox-new-btn">
          <Plus />
          New Sandbox
        </button>
      </div>

      {isLoading ? (
        <div className="sandbox-loading">
          <div className="sandbox-spinner" />
        </div>
      ) : sandboxes?.data?.length === 0 ? (
        <div className="sandbox-empty">
          <div className="sandbox-empty-icon">
            <MessageSquare />
          </div>
          <h3>No sandbox projects yet</h3>
          <p>Create your first sandbox to start experimenting</p>
        </div>
      ) : (
        <div className="sandbox-grid">
          {sandboxes?.data?.map((sandbox) => (
            <div
              key={sandbox.id}
              className="sandbox-card"
              onClick={() => navigate(`/sandbox/${sandbox.id}`)}
            >
              <div className="sandbox-card-top">
                <div className="sandbox-card-icon">
                  <MessageSquare />
                </div>
                <div className="sandbox-card-actions">
                  <button
                    onClick={(e) => handleEdit(e, sandbox)}
                    className="sandbox-card-action-btn"
                  >
                    <Pencil />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, sandbox.id)}
                    className="sandbox-card-action-btn danger"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
              <div className="sandbox-card-body">
                <h3>{sandbox.name}</h3>
                {sandbox.description && <p>{sandbox.description}</p>}
              </div>
              {sandbox.created_at && (
                <div className="sandbox-card-footer">
                  <Clock />
                  {formatDate(sandbox.created_at)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(showModal || editingSandbox) && (
        <div className="sandbox-modal-overlay" onClick={closeModal}>
          <div className="sandbox-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSandbox ? "Edit Sandbox" : "New Sandbox"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="sandbox-form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="sandbox-form-input"
                  placeholder="e.g. Code Assistant"
                  required
                  autoFocus
                />
              </div>
              <div className="sandbox-form-group">
                <label>
                  Description <span>(optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="sandbox-form-textarea"
                  placeholder="What is this sandbox for?"
                  rows="3"
                />
              </div>
              <div className="sandbox-form-group">
                <label>Tujuan Sandbox</label>
                <div className="sandbox-purposes">
                  {PURPOSE_OPTIONS.map((purpose) => (
                    <label key={purpose.id} className="sandbox-purpose-item">
                      <input
                        type="checkbox"
                        checked={formData.purposes.includes(purpose.id)}
                        onChange={() => togglePurpose(purpose.id)}
                      />
                      <span>{purpose.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="sandbox-modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="sandbox-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sandbox-btn-save"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
