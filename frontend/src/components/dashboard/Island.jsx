import React, { useState, useMemo, memo } from 'react';
import planetTasksSvg from '../../assets/dashboard_planets/planet_tasks.svg';
import planetPomodoroSvg from '../../assets/dashboard_planets/planet_pomodoro.svg';
import planetForestSvg from '../../assets/dashboard_planets/planet_forest.svg';
import planetScheduleSvg from '../../assets/dashboard_planets/planet_schedule.svg';
import planetChatSvg from '../../assets/dashboard_planets/planet_ai_chat.svg';
import planetForumSvg from '../../assets/dashboard_planets/planet_forum.svg';
import '../../styles/components/dashboard/Island.css';

/**
 * Planet accent colors for tooltips and glows
 */
const PLANET_COLORS = {
  tasks: { accent: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)' },
  pomodoro: { accent: '#f87171', glow: 'rgba(248, 113, 113, 0.4)' },
  forest: { accent: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)' },
  schedules: { accent: '#4ade80', glow: 'rgba(74, 222, 128, 0.4)' },
  chat: { accent: '#22d3ee', glow: 'rgba(34, 211, 238, 0.4)' },
  forum: { accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
};

/** Map of planet IDs to their SVG assets (stable, defined once) */
const PLANET_SVGS = {
  tasks: planetTasksSvg,
  pomodoro: planetPomodoroSvg,
  forest: planetForestSvg,
  schedules: planetScheduleSvg,
  chat: planetChatSvg,
  forum: planetForumSvg,
};

/**
 * Tooltip position config per planet — offset direction so tooltip doesn't tower above.
 * dx/dy are offsets from planet center in SVG units.
 */
const TOOLTIP_POSITIONS = {
  tasks:     { dx: 130, dy: -80 },   // upper-right
  pomodoro:  { dx: -170, dy: -80 },  // upper-left (planet is far right)
  forest:    { dx: 170, dy: -40 },   // right
  schedules: { dx: -180, dy: -60 },  // left (planet is far right)
  chat:      { dx: 170, dy: -50 },   // right
  forum:     { dx: 130, dy: -80 },   // upper-right
};

/**
 * Build tooltip content for each planet based on dashboard API data
 */
function getTooltipContent(id, dashboardData) {
  if (!dashboardData) return null;

  switch (id) {
    case 'tasks': {
      const t = dashboardData.tasks;
      if (!t) return null;
      return {
        title: 'Tasks',
        lines: [
          { label: 'Pending', value: `${t.pending ?? 0}` },
          { label: 'In progress', value: `${t.in_progress ?? 0}` },
          { label: 'Done today', value: `${t.today_completed ?? 0}` },
        ],
      };
    }
    case 'pomodoro': {
      const p = dashboardData.pomodoro;
      if (!p) return null;
      return {
        title: 'Pomodoro',
        lines: [
          { label: 'Sessions', value: `${p.today_sessions ?? 0}` },
          { label: 'Focused', value: `${p.today_minutes ?? 0}m` },
        ],
      };
    }
    case 'schedules': {
      const schedules = dashboardData.today_schedules ?? [];
      const upcoming = schedules.slice(0, 2);
      if (upcoming.length === 0) return { title: 'Schedule', lines: [{ label: 'No events today', value: '' }] };
      return {
        title: 'Schedule',
        lines: upcoming.map(s => ({ label: s.title ?? 'Untitled', value: '' })),
      };
    }
    case 'forest':
      return { title: 'Forest', lines: [{ label: 'Grow your forest', value: '' }] };
    case 'chat':
      return { title: 'AI Agent', lines: [{ label: 'Your AI assistant', value: '' }] };
    case 'forum':
      return { title: 'Forum', lines: [{ label: 'Community hub', value: '' }] };
    default:
      return null;
  }
}

export const Island = memo(function Island({ island, dashboardData, isZooming }) {
  const { id, x, y, label, size = 200 } = island;
  const [hovered, setHovered] = useState(false);

  const tooltip = useMemo(() => getTooltipContent(id, dashboardData), [id, dashboardData]);
  const colors = PLANET_COLORS[id] || PLANET_COLORS.tasks;
  const tooltipPos = TOOLTIP_POSITIONS[id] || { dx: 140, dy: -70 };

  const svgImage = PLANET_SVGS[id];
  const svgSize = size;

  const handleMouseEnter = () => {
    if (!isZooming) setHovered(true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
  };

  // If SVG asset exists for this planet, render it
  if (svgImage) {
    // Tooltip positioning — side/diagonal, not directly above
    const tooltipWidth = 180;
    const lineCount = tooltip ? tooltip.lines.length : 0;
    const tooltipHeight = 32 + lineCount * 24 + 12; // title + lines + padding
    const tooltipX = x + tooltipPos.dx;
    const tooltipY = y + tooltipPos.dy;

    // Connector line from planet edge to tooltip
    const connectorStartX = x + (tooltipPos.dx > 0 ? svgSize / 2 + 6 : -svgSize / 2 - 6);
    const connectorStartY = y;
    const connectorEndX = tooltipPos.dx > 0 ? tooltipX : tooltipX + tooltipWidth;
    const connectorEndY = tooltipY + tooltipHeight / 2;

    const showTooltip = hovered && tooltip && !isZooming;

    return (
      <g
        className="island-group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${id}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Larger clickable hitbox */}
        <circle
          cx={x}
          cy={y}
          r={svgSize / 2 + 30}
          fill="transparent"
          className="island-clickable"
          role="button"
          tabIndex={0}
        />

        {/* Subtle atmosphere circle */}
        <circle
          cx={x}
          cy={y}
          r={svgSize / 2 + 8}
          fill="none"
          stroke="rgba(96, 165, 250, 0.2)"
          strokeWidth="1.5"
          className="planet-atmosphere"
          pointerEvents="none"
        />

        {/* SVG Planet Image */}
        <image
          href={svgImage}
          x={x - svgSize / 2}
          y={y - svgSize / 2}
          width={svgSize}
          height={svgSize}
          className={`island-svg-image ${id}-planet`}
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Island label - Simple and clean */}
        <text
          x={x}
          y={y + svgSize / 2 + 50}
          textAnchor="middle"
          fontSize="20"
          fontWeight="600"
          fill="rgba(255, 255, 255, 0.85)"
          className="island-label"
          pointerEvents="none"
          letterSpacing="0.3"
        >
          {label}
        </text>

        {/* Hover effect background */}
        <circle
          cx={x}
          cy={y}
          r={svgSize / 2 + 15}
          fill="none"
          stroke="rgba(96, 165, 250, 0.5)"
          strokeWidth="3"
          opacity="0"
          className="island-hover-ring"
          pointerEvents="none"
        />

        {/* Tooltip — redesigned card with connector line */}
        {showTooltip && (
          <>
            {/* Connector line from planet to tooltip */}
            <line
              x1={connectorStartX}
              y1={connectorStartY}
              x2={connectorEndX}
              y2={connectorEndY}
              stroke={colors.accent}
              strokeWidth="1.5"
              strokeOpacity="0.5"
              strokeDasharray="4 3"
              pointerEvents="none"
              className="tooltip-connector"
            />
            {/* Small dot at connector start (on planet edge) */}
            <circle
              cx={connectorStartX}
              cy={connectorStartY}
              r="3"
              fill={colors.accent}
              fillOpacity="0.7"
              pointerEvents="none"
              className="tooltip-connector-dot"
            />

            <foreignObject
              x={tooltipX}
              y={tooltipY}
              width={tooltipWidth}
              height={tooltipHeight + 8}
              pointerEvents="none"
              className="planet-tooltip-fo"
            >
              <div
                className="planet-tooltip"
                xmlns="http://www.w3.org/1999/xhtml"
                style={{ '--tooltip-accent': colors.accent, '--tooltip-glow': colors.glow }}
              >
                <div className="planet-tooltip-header">
                  <span className="planet-tooltip-accent-bar" />
                  <span className="planet-tooltip-title">{tooltip.title}</span>
                </div>
                <div className="planet-tooltip-body">
                  {tooltip.lines.map((line, i) => (
                    <div key={i} className="planet-tooltip-row">
                      <span className="planet-tooltip-label">{line.label}</span>
                      {line.value && <span className="planet-tooltip-value">{line.value}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </foreignObject>
          </>
        )}
      </g>
    );
  }

  // Fallback for planets without SVG (shouldn't happen now)
  return null;
});

/**
 * Island configuration with positions, sizes, and routes
 * Positions are in SVG viewBox coordinates (0 0 2000 1400)
 * Sizes can be customized per planet (in pixels)
 * 6 core planets scattered across space
 */
export const ISLANDS = [
  {
    id: 'tasks',
    label: 'Tasks',
    x: 400,
    y: 400,
    size: 200, // Individual size for Tasks
    route: '/tasks',
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    x: 1600,
    y: 300,
    size: 220, // Individual size for Pomodoro
    route: '/pomodoro',
  },
  {
    id: 'forum',
    label: 'Forum',
    x: 550,
    y: 1100,
    size: 200, // Individual size for Forest
    route: '/forum',
  },
  {
    id: 'schedules',
    label: 'Schedules',
    x: 1400,
    y: 1000,
    size: 240, // Individual size for Schedules
    route: '/schedules',
  },
  {
    id: 'chat',
    label: 'AI Agent',
    x: 1200,
    y: 550,
    size: 300, // Individual size for AI Agent
    route: '/agent',
  },
  {
    id: 'forest',
    label: 'Forest',
    x: 750,
    y: 700,
    size: 300, // Individual size for Forum
    route: '/forest',
  },
];
