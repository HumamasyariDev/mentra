import React from 'react';
import planetTasksSvg from '../../assets/dashboard_planets/planet_tasks.svg';
import planetPomodoroSvg from '../../assets/dashboard_planets/planet_pomodoro.svg';
import planetForestSvg from '../../assets/dashboard_planets/planet_forest.svg';
import planetScheduleSvg from '../../assets/dashboard_planets/planet_schedule.svg';
import planetChatSvg from '../../assets/dashboard_planets/planet_ai_chat.svg';
import planetForumSvg from '../../assets/dashboard_planets/planet_forum.svg';
import '../../styles/components/dashboard/Island.css';

export function Island({ island }) {
  const { id, x, y, label, size = 200 } = island;

  // Map of planet IDs to their SVG assets
  const planetSvgs = {
    tasks: planetTasksSvg,
    pomodoro: planetPomodoroSvg,
    forest: planetForestSvg,
    schedules: planetScheduleSvg,
    chat: planetChatSvg,
    forum: planetForumSvg,
  };

  const svgImage = planetSvgs[id];
  const svgSize = size; // Use individual size from island config

  // If SVG asset exists for this planet, render it
  if (svgImage) {
    return (
      <g className="island-group">
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
      </g>
    );
  }

  // Fallback for planets without SVG (shouldn't happen now)
  return null;
}

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
    label: 'AI & Chat',
    x: 1200,
    y: 550,
    size: 300, // Individual size for AI & Chat
    route: '/chat',
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
