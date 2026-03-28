import { usePageTitle } from "../hooks/usePageTitle";
import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sandboxApi } from "../services/api";
import {
  Plus,
  Trash2,
  MessageSquare,
  Pencil,
  Clock,
  GraduationCap,
  Briefcase,
  Lightbulb,
  BarChart3,
  Gamepad2,
  LayoutGrid,
  Tag,
  Check,
  X,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "../styles/pages/Sandbox.css";

const PRESET_IDS = ["learning", "working", "ideation", "business", "entertainment"];

const PURPOSE_ICONS = {
  learning: GraduationCap,
  working: Briefcase,
  ideation: Lightbulb,
  business: BarChart3,
  entertainment: Gamepad2,
};

export default function Sandbox() {
  usePageTitle("sandbox:pageTitle");

  const { t, i18n } = useTranslation(["sandbox", "common"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSandbox, setEditingSandbox] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    purposes: [],
  });

  const pageRef = useRef(null);

  const PURPOSE_OPTIONS = useMemo(() => [
    { id: "learning", label: t("sandbox:purposes.learning") },
    { id: "working", label: t("sandbox:purposes.working") },
    { id: "ideation", label: t("sandbox:purposes.ideation") },
    { id: "business", label: t("sandbox:purposes.business") },
    { id: "entertainment", label: t("sandbox:purposes.entertainment") },
  ], [t]);

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
    setIsAddingCustom(false);
    setCustomInput("");
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

  const confirmCustomPurpose = () => {
    const trimmed = customInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed || formData.purposes.includes(trimmed)) {
      setIsAddingCustom(false);
      setCustomInput("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      purposes: [...prev.purposes, trimmed],
    }));
    setIsAddingCustom(false);
    setCustomInput("");
  };

  const cancelCustomPurpose = () => {
    setIsAddingCustom(false);
    setCustomInput("");
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm(t("sandbox:deleteConfirm"))) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(
      i18n.language === "id" ? "id-ID" : "en-US",
      {
        month: "short",
        day: "numeric",
      },
    );
  };

  const allSandboxes = sandboxes?.data || [];
  const sandboxCount = allSandboxes.length;

  // Collect custom purposes from all sandboxes + current form
  const customPurposes = useMemo(() => {
    const customs = new Set();
    allSandboxes.forEach((s) => {
      if (s.purposes) {
        s.purposes.forEach((p) => {
          if (!PRESET_IDS.includes(p)) customs.add(p);
        });
      }
    });
    formData.purposes.forEach((p) => {
      if (!PRESET_IDS.includes(p)) customs.add(p);
    });
    return [...customs];
  }, [allSandboxes, formData.purposes]);

  // All purposes = preset + custom (for filter cards)
  const allPurposeOptions = useMemo(() => {
    const options = [...PURPOSE_OPTIONS];
    customPurposes.forEach((cp) => {
      options.push({ id: cp, label: cp.replace(/-/g, " ") });
    });
    return options;
  }, [PURPOSE_OPTIONS, customPurposes]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allSandboxes.length };
    allPurposeOptions.forEach((p) => {
      counts[p.id] = allSandboxes.filter(
        (s) => s.purposes && s.purposes.includes(p.id),
      ).length;
    });
    return counts;
  }, [allSandboxes, allPurposeOptions]);

  // Filter sandboxes by active category
  const filteredSandboxes = useMemo(() => {
    if (activeFilter === "all") return allSandboxes;
    return allSandboxes.filter(
      (s) => s.purposes && s.purposes.includes(activeFilter),
    );
  }, [allSandboxes, activeFilter]);

  // Animate on mount
  useGSAP(
    () => {
      if (!pageRef.current) return;

      gsap.fromTo(
        ".sandbox-orb",
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2,
        },
      );

      gsap.fromTo(
        ".sandbox-hero-title",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.1 },
      );

      gsap.fromTo(
        ".sandbox-hero-subtitle",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.2 },
      );

      gsap.fromTo(
        ".sandbox-category-card",
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.25,
        },
      );

      gsap.fromTo(
        ".sandbox-card",
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.4,
        },
      );

      gsap.fromTo(
        ".sandbox-empty",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.3 },
      );
    },
    { scope: pageRef, dependencies: [isLoading, sandboxes] },
  );

  return (
    <div className="sandbox-page" ref={pageRef}>
      {/* Ambient background orbs */}
      <div className="sandbox-bg">
        <div className="sandbox-orb sandbox-orb--1" />
        <div className="sandbox-orb sandbox-orb--2" />
        <div className="sandbox-orb sandbox-orb--3" />
      </div>

      <div className="sandbox-scroll">
        <div className="sandbox-inner">
          {/* Hero Header */}
          <div className="sandbox-hero">
            <div className="sandbox-hero-text">
              <h1 className="sandbox-hero-title">{t("sandbox:pageTitle")}</h1>
              <p className="sandbox-hero-subtitle">
                {t("sandbox:pageSubtitle")}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="sandbox-new-btn"
            >
              <Plus />
              {t("sandbox:newSandbox")}
            </button>
          </div>

          {/* Category Filter Cards */}
          {!isLoading && sandboxCount > 0 && (
            <div className="sandbox-categories">
              <button
                className={`sandbox-category-card ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                <div className="sandbox-category-icon">
                  <LayoutGrid size={20} />
                </div>
                <div className="sandbox-category-info">
                  <span className="sandbox-category-count">
                    {categoryCounts.all}
                  </span>
                  <span className="sandbox-category-label">
                    {t("sandbox:categoryAll")}
                  </span>
                </div>
              </button>
              {allPurposeOptions.map((purpose) => {
                const Icon = PURPOSE_ICONS[purpose.id] || Tag;
                const count = categoryCounts[purpose.id] || 0;
                return (
                  <button
                    key={purpose.id}
                    className={`sandbox-category-card ${activeFilter === purpose.id ? "active" : ""} ${count === 0 ? "empty" : ""}`}
                    onClick={() => setActiveFilter(purpose.id)}
                  >
                    <div className="sandbox-category-icon">
                      <Icon size={20} />
                    </div>
                    <div className="sandbox-category-info">
                      <span className="sandbox-category-count">{count}</span>
                      <span className="sandbox-category-label">
                        {purpose.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="sandbox-loading">
              <div className="sandbox-spinner" />
            </div>
          ) : sandboxCount === 0 ? (
            <div className="sandbox-empty">
              <div className="sandbox-empty-icon">
                <MessageSquare />
              </div>
              <h3>{t("sandbox:emptyTitle")}</h3>
              <p>{t("sandbox:emptySubtitle")}</p>
            </div>
          ) : filteredSandboxes.length === 0 ? (
            <div className="sandbox-empty">
              <div className="sandbox-empty-icon">
                <MessageSquare />
              </div>
              <h3>{t("sandbox:filterEmptyTitle")}</h3>
              <p>{t("sandbox:filterEmptySubtitle")}</p>
            </div>
          ) : (
            <div className="sandbox-grid">
              {filteredSandboxes.map((sandbox) => (
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
                  <div className="sandbox-card-meta">
                    {sandbox.purposes &&
                      sandbox.purposes.length > 0 && (
                        <div className="sandbox-card-tags">
                          {sandbox.purposes.map((pId) => {
                            const TagIcon = PURPOSE_ICONS[pId];
                            const isPreset = PRESET_IDS.includes(pId);
                            return (
                              <span key={pId} className="sandbox-card-tag">
                                {TagIcon ? (
                                  <TagIcon size={12} />
                                ) : (
                                  <Tag size={12} />
                                )}
                                {isPreset
                                  ? t(`sandbox:purposes.${pId}`)
                                  : pId.replace(/-/g, " ")}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    {sandbox.created_at && (
                      <div className="sandbox-card-footer">
                        <Clock size={13} />
                        {formatDate(sandbox.created_at)}
                        {sandbox.messages_count != null && (
                          <span className="sandbox-card-msg-count">
                            <MessageSquare size={12} />
                            {sandbox.messages_count}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {(showModal || editingSandbox) && (
        <div className="sandbox-modal-overlay" onClick={closeModal}>
          <div className="sandbox-modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {editingSandbox
                ? t("sandbox:modalTitleEdit")
                : t("sandbox:modalTitleNew")}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="sandbox-form-group">
                <label>{t("sandbox:formName")}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="sandbox-form-input"
                  placeholder={t("sandbox:formNamePlaceholder")}
                  required
                  autoFocus
                />
              </div>
              <div className="sandbox-form-group">
                <label>
                  {t("sandbox:formDescription")}{" "}
                  <span>({t("common:optional")})</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="sandbox-form-textarea"
                  placeholder={t("sandbox:formDescriptionPlaceholder")}
                  rows="3"
                />
              </div>
              <div className="sandbox-form-group">
                <label>{t("sandbox:formPurposeLabel")}</label>
                <div className="sandbox-purposes">
                  {/* Preset purposes */}
                  {PURPOSE_OPTIONS.map((purpose) => {
                    const Icon = PURPOSE_ICONS[purpose.id];
                    const isChecked = formData.purposes.includes(purpose.id);
                    return (
                      <label 
                        key={purpose.id} 
                        className={`sandbox-purpose-item ${isChecked ? 'checked' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePurpose(purpose.id)}
                        />
                        <div className="sandbox-purpose-icon">
                          {Icon && <Icon size={18} />}
                        </div>
                        <span>{purpose.label}</span>
                      </label>
                    );
                  })}

                  {/* Custom purposes from existing sandboxes */}
                  {customPurposes.map((cp) => (
                    <label key={cp} className="sandbox-purpose-item custom">
                      <input
                        type="checkbox"
                        checked={formData.purposes.includes(cp)}
                        onChange={() => togglePurpose(cp)}
                      />
                      <Tag size={14} />
                      <span>{cp.replace(/-/g, " ")}</span>
                    </label>
                  ))}

                  {/* Add custom purpose button / input */}
                  {isAddingCustom ? (
                    <div className="sandbox-purpose-add-input">
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            confirmCustomPurpose();
                          }
                          if (e.key === "Escape") cancelCustomPurpose();
                        }}
                        placeholder={t("sandbox:customPurposePlaceholder")}
                        autoFocus
                        maxLength={50}
                      />
                      <button
                        type="button"
                        className="sandbox-purpose-confirm"
                        onClick={confirmCustomPurpose}
                        disabled={!customInput.trim()}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        className="sandbox-purpose-cancel"
                        onClick={cancelCustomPurpose}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="sandbox-purpose-add-btn"
                      onClick={() => setIsAddingCustom(true)}
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="sandbox-modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="sandbox-btn-cancel"
                >
                  {t("common:cancel")}
                </button>
                <button
                  type="submit"
                  className="sandbox-btn-save"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t("common:saving")
                    : t("common:save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
