import React from 'react';
import '../../styles/components/dashboard/Island.css';

export function Island({ island }) {
  const { id, x, y, label, color } = island;

  return (
    <g className="island-group">
      {/* Island shadow */}
      <defs>
        <filter id={`shadow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15" />
        </filter>
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color.light} />
          <stop offset="100%" stopColor={color.dark} />
        </linearGradient>
      </defs>

      {/* Clickable circular hitbox - transparent but large enough for easy targeting */}
      <circle
        cx={x}
        cy={y}
        r="55"
        fill="transparent"
        className="island-clickable"
        role="button"
        tabIndex={0}
      />

      {/* Island base (circle) */}
      <circle
        cx={x}
        cy={y}
        r="45"
        fill={`url(#gradient-${id})`}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="2"
        filter={`url(#shadow-${id})`}
        className="island-base"
        pointerEvents="none"
      />

      {/* Island border highlight */}
      <circle
        cx={x}
        cy={y}
        r="45"
        fill="none"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
        opacity="0.6"
        pointerEvents="none"
      />

      {/* Icon placeholder (we'll render a simple circle with text for now) */}
      <circle cx={x} cy={y} r="20" fill="rgba(255, 255, 255, 0.2)" className="icon-placeholder" pointerEvents="none" />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fill="white"
        fontWeight="600"
        className="island-icon-text"
        pointerEvents="none"
      >
        {label.charAt(0).toUpperCase()}
      </text>

      {/* Island label */}
      <text
        x={x}
        y={y + 65}
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#1f2937"
        className="island-label"
        pointerEvents="none"
      >
        {label}
      </text>

      {/* Hover effect background (hidden by default, shown on hover via CSS) */}
      <circle
        cx={x}
        cy={y}
        r="50"
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="2"
        opacity="0"
        className="island-hover-ring"
        pointerEvents="none"
      />
    </g>
  );
}

/**
 * Island configuration with positions and colors
 * Positions are in SVG viewBox coordinates (0 0 2000 1400)
 * 6 core planets scattered across space
 */
export const ISLANDS = [
  {
    id: 'tasks',
    label: 'Tasks',
    x: 400,
    y: 300,
    color: { light: '#60a5fa', dark: '#0c4a6e' },
    route: '/tasks',
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    x: 1600,
    y: 350,
    color: { light: '#f87171', dark: '#7c2d12' },
    route: '/pomodoro',
  },
  {
    id: 'forest',
    label: 'Forest',
    x: 300,
    y: 1050,
    color: { light: '#4ade80', dark: '#15803d' },
    route: '/forest',
  },
  {
    id: 'schedules',
    label: 'Schedules',
    x: 1300,
    y: 1100,
    color: { light: '#c084fc', dark: '#581c87' },
    route: '/schedules',
  },
  {
    id: 'chat',
    label: 'AI & Chat',
    x: 1700,
    y: 750,
    color: { light: '#22d3ee', dark: '#164e63' },
    route: '/chat',
  },
  {
    id: 'forum',
    label: 'Forum',
    x: 600,
    y: 600,
    color: { light: '#fbbf24', dark: '#78350f' },
    route: '/forum',
  },
];
