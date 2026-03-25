import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Sparkles } from "lucide-react";
import { aiApi } from "../../services/api";
import WateringAnimation from "./WateringAnimation";
import "../../styles/components/InfiniteCanvasMindMap.css";

export default function InfiniteCanvasMindMap({ content, chatMessages = [] }) {
  const [nodes, setNodes] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(["root"]));
  const [transform, setTransform] = useState({ x: 100, y: 100, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);
  const { t } = useTranslation(["sandbox"]);
  const isDraggingRef = useRef(false);

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
          // Convert nodes/edges format to tree format
          const nodesWithIds = convertToTreeFormat(mindMapData);
          setNodes(nodesWithIds);
        } else {
          // Assume it's already in tree format
          const nodesWithIds = addIdsToNodes(mindMapData);
          setNodes(nodesWithIds);
        }
        setExpandedNodes(new Set(["root"]));
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Mind map generation error:", error);
      // Fallback to simple generation
      setNodes(generateFallbackMindMap(content));
    } finally {
      setIsGenerating(false);
    }
  }, [chatMessages, content]);

  // Fixed Pan & Zoom Event Handlers (Bug Fix)
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newScale = Math.min(Math.max(0.3, transform.scale + delta), 3);

      setTransform((prev) => ({
        ...prev,
        scale: newScale,
      }));
    },
    [transform.scale],
  );

  const handlePointerDown = useCallback(
    (e) => {
      // Only start panning if clicking on canvas background, not on cards
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
  }, []);

  // Toggle Node Expansion
  const toggleNode = useCallback((nodeId, e) => {
    e.stopPropagation(); // Prevent triggering pan
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

  // Show loading animation while generating
  if (isGenerating) {
    return (
      <div className="mindmap-generating">
        <WateringAnimation isGenerating={true} />
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
        <h3>Generate Mind Map</h3>
        <p>Klik tombol di bawah untuk membuat mind map dari konteks chat</p>
        <button
          className="mindmap-generate-btn"
          onClick={generateMindMapFromAI}
          disabled={chatMessages.length === 0}
        >
          <Sparkles size={20} />
          Generate Mind Map
        </button>
        {chatMessages.length === 0 && (
          <p className="mindmap-hint">
            Mulai chat terlebih dahulu untuk generate mind map
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="infinite-canvas-container"
      ref={canvasRef}
      onWheel={handleWheel}
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
        />
      </div>

      {/* Canvas Controls */}
      <div className="canvas-controls">
        <button
          className="canvas-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            setTransform((prev) => ({
              ...prev,
              scale: Math.min(3, prev.scale + 0.2),
            }));
          }}
          title="Zoom In"
        >
          +
        </button>
        <button
          className="canvas-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            setTransform((prev) => ({
              ...prev,
              scale: Math.max(0.3, prev.scale - 0.2),
            }));
          }}
          title="Zoom Out"
        >
          −
        </button>
        <button
          className="canvas-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            setTransform({ x: 100, y: 100, scale: 1 });
          }}
          title="Reset View"
        >
          ⟲
        </button>
        <button
          className="canvas-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            generateMindMapFromAI();
          }}
          title="Regenerate"
        >
          <Sparkles size={16} />
        </button>
      </div>

      {/* Zoom Indicator */}
      <div className="canvas-zoom-indicator">
        {Math.round(transform.scale * 100)}%
      </div>
    </div>
  );
}

// Mind Map Node Component (Recursive)
function MindMapNode({ node, level, isExpanded, onToggle, expandedNodes }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="mindmap-node-wrapper" data-level={level}>
      <div
        className={`mindmap-card ${isExpanded ? "expanded" : ""} ${level === 0 ? "root" : ""}`}
        onClick={(e) => hasChildren && onToggle(node.id, e)}
        style={{ cursor: hasChildren ? "pointer" : "default" }}
      >
        <div className="mindmap-card-header">
          <h4 className="mindmap-card-title">{node.title}</h4>
          {hasChildren && (
            <div
              className={`mindmap-expand-icon ${isExpanded ? "expanded" : ""}`}
            >
              <ChevronRight size={18} />
            </div>
          )}
        </div>
        {node.caption && <p className="mindmap-card-caption">{node.caption}</p>}
      </div>

      {hasChildren && isExpanded && (
        <div className="mindmap-children">
          {node.children.map((child, idx) => (
            <div key={child.id} className="mindmap-child-container">
              {/* Connecting Line */}
              <div className="mindmap-connector-line" />

              <MindMapNode
                node={child}
                level={level + 1}
                isExpanded={expandedNodes.has(child.id)}
                onToggle={onToggle}
                expandedNodes={expandedNodes}
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
      title: t("sandbox:mindmapEmptyTitle"),
      caption: t("sandbox:mindmapEmptySubtitle"),
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
