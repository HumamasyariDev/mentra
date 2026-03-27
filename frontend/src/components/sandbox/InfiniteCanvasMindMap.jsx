import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2,
  Info,
  X,
  Loader2,
} from "lucide-react";
import { aiApi } from "../../services/api";
import "../../styles/components/InfiniteCanvasMindMap.css";

export default function InfiniteCanvasMindMap({ content, chatMessages = [] }) {
  const [nodes, setNodes] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(["root"]));
  const [detailNodes, setDetailNodes] = useState(new Set());
  const [transform, setTransform] = useState({ x: 100, y: 100, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef(null);
  const { t } = useTranslation(["sandbox"]);
  const isDraggingRef = useRef(false);
  const lastTouchDistRef = useRef(null);

  // Generate Mind Map from AI with proper prompting
  const generateMindMapFromAI = useCallback(async () => {
    if (chatMessages.length === 0) {
      return;
    }

    setIsGenerating(true);

    try {
      // Call backend AI API to generate mindmap
      const response = await aiApi.generateMindMap(chatMessages);

      if (response.data?.success && response.data?.mindmap) {
        const mindMapData = response.data.mindmap;
        // If mindmap has nodes array format, convert to tree format
        if (mindMapData.nodes && Array.isArray(mindMapData.nodes)) {
          const nodesWithIds = convertToTreeFormat(mindMapData);
          setNodes(nodesWithIds);
        } else {
          const nodesWithIds = addIdsToNodes(mindMapData);
          setNodes(nodesWithIds);
        }
        setExpandedNodes(new Set(["root"]));
        setDetailNodes(new Set());
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Mind map generation error:", error);
      setNodes(generateFallbackMindMap(content));
    } finally {
      setIsGenerating(false);
    }
  }, [chatMessages, content]);

  // Wheel zoom
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY * -0.001;
      const newScale = Math.min(Math.max(0.2, transform.scale + delta), 4);

      // Zoom towards cursor position
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleChange = newScale / transform.scale;

      setTransform((prev) => ({
        x: mouseX - (mouseX - prev.x) * scaleChange,
        y: mouseY - (mouseY - prev.y) * scaleChange,
        scale: newScale,
      }));
    },
    [transform.scale, transform.x, transform.y],
  );

  // Pointer pan
  const handlePointerDown = useCallback(
    (e) => {
      if (
        e.target.classList.contains("infinite-canvas-container") ||
        e.target.classList.contains("infinite-canvas-board")
      ) {
        e.preventDefault();
        isDraggingRef.current = true;
        setIsPanning(true);
        setStartPos({
          x: e.clientX - transform.x,
          y: e.clientY - transform.y,
        });
      }
    },
    [transform.x, transform.y],
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (isPanning && isDraggingRef.current) {
        e.preventDefault();
        setTransform((prev) => ({
          ...prev,
          x: e.clientX - startPos.x,
          y: e.clientY - startPos.y,
        }));
      }
    },
    [isPanning, startPos],
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsPanning(false);
    lastTouchDistRef.current = null;
  }, []);

  // Touch pinch-to-zoom
  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );

        if (lastTouchDistRef.current !== null) {
          const delta = (dist - lastTouchDistRef.current) * 0.005;
          const newScale = Math.min(Math.max(0.2, transform.scale + delta), 4);
          setTransform((prev) => ({ ...prev, scale: newScale }));
        }
        lastTouchDistRef.current = dist;
      }
    },
    [transform.scale],
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchDistRef.current = null;
  }, []);

  // Attach wheel listener with passive:false for preventDefault
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleWheel, handleTouchMove, handleTouchEnd]);

  // Escape key exits fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Toggle Node Expansion
  const toggleNode = useCallback((nodeId, e) => {
    e.stopPropagation();
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Toggle Detail
  const toggleDetail = useCallback((nodeId, e) => {
    e.stopPropagation();
    setDetailNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Toggle Fullscreen
  const toggleFullscreen = useCallback((e) => {
    e.stopPropagation();
    setIsFullscreen((prev) => !prev);
  }, []);

  // Show loading state while generating
  if (isGenerating) {
    return (
      <div className="mindmap-generating">
        <Loader2 size={48} className="mindmap-loading-spinner" />
        <p className="mindmap-loading-text">AI Thinking...</p>
        <p className="mindmap-loading-subtext">
          Generating mind map from conversation
        </p>
      </div>
    );
  }

  // Show generate button if no nodes
  if (!nodes) {
    return (
      <div className="mindmap-empty-state">
        <div className="mindmap-empty-icon">
          <Sparkles size={48} />
        </div>
        <h3>{t("sandbox:mindmapGenerateTitle")}</h3>
        <p>{t("sandbox:mindmapGenerateDesc")}</p>
        <button
          className="mindmap-generate-btn"
          onClick={generateMindMapFromAI}
          disabled={chatMessages.length === 0}
        >
          <Sparkles size={20} />
          {t("sandbox:mindmapGenerateBtn")}
        </button>
        {chatMessages.length === 0 && (
          <p className="mindmap-hint">{t("sandbox:mindmapChatFirst")}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`infinite-canvas-container ${isFullscreen ? "mindmap-fullscreen" : ""}`}
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        className="infinite-canvas-board"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          pointerEvents: isPanning ? "none" : "auto",
        }}
      >
        <MindMapNode
          node={nodes}
          level={0}
          isExpanded={expandedNodes.has(nodes.id)}
          onToggle={toggleNode}
          expandedNodes={expandedNodes}
          detailNodes={detailNodes}
          onToggleDetail={toggleDetail}
          t={t}
        />
      </div>

      {/* Canvas Controls */}
      <div className="canvas-controls">
        <button
          className="canvas-control-btn"
          onClick={toggleFullscreen}
          title={
            isFullscreen
              ? t("sandbox:mindmapExitFullscreen")
              : t("sandbox:mindmapFullscreen")
          }
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button
          className="canvas-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            setTransform((prev) => ({
              ...prev,
              scale: Math.min(4, prev.scale + 0.2),
            }));
          }}
          title={t("sandbox:mindmapZoomIn")}
        >
          +
        </button>
        <button
          className="canvas-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            setTransform((prev) => ({
              ...prev,
              scale: Math.max(0.2, prev.scale - 0.2),
            }));
          }}
          title={t("sandbox:mindmapZoomOut")}
        >
          −
        </button>
        <button
          className="canvas-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            setTransform({ x: 100, y: 100, scale: 1 });
          }}
          title={t("sandbox:mindmapResetView")}
        >
          ⟲
        </button>
        <button
          className="canvas-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            generateMindMapFromAI();
          }}
          title={t("sandbox:mindmapRegenerate")}
        >
          <Sparkles size={16} />
        </button>
      </div>

      {/* Zoom Indicator */}
      <div className="canvas-zoom-indicator">
        {Math.round(transform.scale * 100)}%
      </div>

      {/* Fullscreen hint */}
      {isFullscreen && (
        <div className="canvas-fullscreen-hint">
          {t("sandbox:mindmapEscHint")}
        </div>
      )}
    </div>
  );
}

// Mind Map Node Component (Recursive)
function MindMapNode({
  node,
  level,
  isExpanded,
  onToggle,
  expandedNodes,
  detailNodes,
  onToggleDetail,
  t,
}) {
  const hasChildren = node.children && node.children.length > 0;
  const showDetail = detailNodes.has(node.id);
  const hasCaption = !!node.caption;
  const isRoot = level === 0;

  return (
    <div className="mindmap-node-wrapper" data-level={level}>
      <div
        className={`mindmap-card ${isExpanded ? "expanded" : ""} ${isRoot ? "root" : ""} ${showDetail ? "show-detail" : ""}`}
        onClick={(e) => hasChildren && onToggle(node.id, e)}
        style={{ cursor: hasChildren ? "pointer" : "default" }}
      >
        <div className="mindmap-card-header">
          <h4 className="mindmap-card-title">{node.title}</h4>
          <div className="mindmap-card-header-actions">
            {hasCaption && !isRoot && (
              <button
                className={`mindmap-detail-btn ${showDetail ? "active" : ""}`}
                onClick={(e) => onToggleDetail(node.id, e)}
                title={
                  showDetail
                    ? t("sandbox:mindmapHideDetail")
                    : t("sandbox:mindmapShowDetail")
                }
              >
                {showDetail ? <X size={14} /> : <Info size={14} />}
              </button>
            )}
            {hasChildren && (
              <div
                className={`mindmap-expand-icon ${isExpanded ? "expanded" : ""}`}
              >
                <ChevronRight size={18} />
              </div>
            )}
          </div>
        </div>

        {/* Caption: truncated by default, full when detail is open */}
        {hasCaption && (
          <p className={`mindmap-card-caption ${showDetail ? "full" : ""}`}>
            {node.caption}
          </p>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mindmap-children">
          {node.children.map((child) => (
            <div key={child.id} className="mindmap-child-container">
              {/* Connecting Line */}
              <div className="mindmap-connector-line" />

              <MindMapNode
                node={child}
                level={level + 1}
                isExpanded={expandedNodes.has(child.id)}
                onToggle={onToggle}
                expandedNodes={expandedNodes}
                detailNodes={detailNodes}
                onToggleDetail={onToggleDetail}
                t={t}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Utility: Add IDs to nodes recursively
function addIdsToNodes(node, parentId = "root", index = 0) {
  const id = parentId === "root" ? "root" : `${parentId}-${index}`;
  return {
    ...node,
    id,
    children: node.children
      ? node.children.map((child, idx) => addIdsToNodes(child, id, idx))
      : [],
  };
}

// Convert nodes/edges format to tree format
function convertToTreeFormat(data) {
  if (!data.nodes || data.nodes.length === 0) {
    return {
      id: "root",
      title: "Mind Map",
      caption: "",
      children: [],
    };
  }

  // Find root node (first node or node with no incoming edges)
  const rootNode = data.nodes[0];

  // Build tree from nodes
  const buildTree = (node) => ({
    id: node.id || "root",
    title: node.label || node.title || "Node",
    caption: node.caption || "",
    children: data.edges
      ? data.edges
          .filter((e) => e.source === node.id)
          .map((e) => {
            const childNode = data.nodes.find((n) => n.id === e.target);
            return childNode ? buildTree(childNode) : null;
          })
          .filter(Boolean)
      : [],
  });

  return buildTree(rootNode);
}

// Fallback: Generate simple mind map from content
function generateFallbackMindMap(content) {
  if (!content) {
    return {
      id: "root",
      title: "Mind Map",
      caption: "No content yet",
      children: [],
    };
  }

  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  if (sentences.length === 0) {
    return {
      id: "root",
      title: content.slice(0, 50),
      caption: "Main idea",
      children: [],
    };
  }

  const rootTitle = sentences[0].trim().slice(0, 60);
  const children = sentences.slice(1, 6).map((sentence, i) => ({
    id: `node-${i}`,
    title: sentence.trim().slice(0, 50),
    caption: `Point ${i + 1}`,
    children: [],
  }));

  return {
    id: "root",
    title: rootTitle,
    caption: "Ide Utama",
    children: children,
  };
}
