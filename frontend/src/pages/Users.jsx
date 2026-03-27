import { useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { usersApi } from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../contexts/ToastContext";
import {
  Users as UsersIcon,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Shield,
  User,
} from "lucide-react";
import "../styles/pages/Users.css";

export default function Users() {
  usePageTitle("Users Management");

  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    is_admin: false,
    level: 1,
    total_exp: 0,
  });

  // Fetch users with React Query
  const {
    data: users = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await usersApi.getAll();
      return response.data;
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create user");
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update user");
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete user");
    },
  });

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      name: "",
      email: "",
      password: "",
      is_admin: false,
      level: 1,
      total_exp: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      is_admin: user.is_admin,
      level: user.level,
      total_exp: user.total_exp,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      is_admin: false,
      level: 1,
      total_exp: 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modalMode === "create") {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate({ id: selectedUser.id, data: formData });
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    deleteMutation.mutate(userId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="users-loading">
          <div className="users-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="users-error">
          <p>{error.response?.data?.message || "Failed to load users"}</p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["users"] })
            }
            className="users-btn users-btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-header">
        <div className="users-header-left">
          <div className="users-header-icon">
            <UsersIcon size={28} />
          </div>
          <div>
            <h1 className="users-title">Users Management</h1>
            <p className="users-subtitle">Manage all users in the system</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="users-btn users-btn-primary"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Level</th>
              <th>Total EXP</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="users-table-empty">
                  <User size={48} />
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="users-table-name">{user.name}</div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="users-badge users-badge-level">
                      Lv. {user.level}
                    </span>
                  </td>
                  <td>{user.total_exp.toLocaleString()} XP</td>
                  <td>
                    {user.is_admin ? (
                      <span className="users-badge users-badge-admin">
                        <Shield size={14} />
                        Admin
                      </span>
                    ) : (
                      <span className="users-badge users-badge-user">
                        <User size={14} />
                        User
                      </span>
                    )}
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="users-table-actions">
                      <button
                        onClick={() => openEditModal(user)}
                        className="users-action-btn users-action-btn-edit"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="users-action-btn users-action-btn-delete"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="users-modal-overlay" onClick={closeModal}>
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="users-modal-header">
              <h2>{modalMode === "create" ? "Add New User" : "Edit User"}</h2>
              <button onClick={closeModal} className="users-modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="users-modal-form">
              <div className="users-form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Enter user name"
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="password">
                  Password{" "}
                  {modalMode === "edit" && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={modalMode === "create"}
                  placeholder="Enter password"
                  minLength={8}
                />
              </div>

              <div className="users-form-row">
                <div className="users-form-group">
                  <label htmlFor="level">Level</label>
                  <input
                    type="number"
                    id="level"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    required
                  />
                </div>

                <div className="users-form-group">
                  <label htmlFor="total_exp">Total EXP</label>
                  <input
                    type="number"
                    id="total_exp"
                    value={formData.total_exp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_exp: parseInt(e.target.value),
                      })
                    }
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="users-form-group">
                <label className="users-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) =>
                      setFormData({ ...formData, is_admin: e.target.checked })
                    }
                  />
                  <span>Admin privileges</span>
                </label>
              </div>

              <div className="users-modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="users-btn users-btn-secondary"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="users-btn users-btn-primary"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Create User"
                      : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
