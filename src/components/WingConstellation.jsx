import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';

// A wing drawn as its own constellation: named stars joined by lines that trace in.
export default function WingConstellation({ chart, title, showLabels = true, className = '', animateKey }) {
  const [hovered, setHovered] = useState(null);
  const gid = useId().replace(/:/g, '');
  if (!chart) return null;

  const connected = (i) => hovered !== null && chart.edges.some(([a, b]) => (a === hovered && b === i) || (b === hovered && a === i));

  return (
    <svg viewBox="-12 -8 124 116" className={`w-full h-auto overflow-visible ${className}`} role="img" aria-label={title ? `Star chart of ${title}` : 'Wing star chart'}>
      <defs>
        <radialGradient id={`glow-${gid}`}>
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#dfe6ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#dfe6ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* faint chart grid: RA/Dec style */}
      <g stroke="#fff" strokeOpacity="0.06" strokeWidth="0.25">
        {[10, 30, 50, 70, 90].map((v) => (
          <React.Fragment key={v}>
            <line x1={v} y1="-4" x2={v} y2="104" />
            <line x1="-8" y1={v} x2="108" y2={v} />
          </React.Fragment>
        ))}
      </g>
      <circle cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="0.3" strokeDasharray="0.6 2" />

      {chart.edges.map(([a, b], i) => {
        const A = chart.nodes[a];
        const B = chart.nodes[b];
        const lit = hovered !== null && (a === hovered || b === hovered);
        return (
          <motion.line
            key={`${animateKey}-${i}`}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke="#e9eefc"
            strokeWidth={lit ? 0.7 : 0.4}
            strokeOpacity={hovered === null ? 0.55 : lit ? 0.95 : 0.18}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: 'easeInOut' }}
          />
        );
      })}

      {chart.nodes.map((n, i) => {
        const r = n.mag === 1 ? 2.2 : n.mag === 2 ? 1.6 : 1.2;
        const dim = hovered !== null && hovered !== i && !connected(i);
        return (
          <g
            key={`${animateKey}-n${i}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            tabIndex={0}
            className="cursor-default focus:outline-none"
            style={{ opacity: dim ? 0.35 : 1, transition: 'opacity .3s' }}
          >
            <circle cx={n.x} cy={n.y} r={r * 4.5} fill={`url(#glow-${gid})`} />
            <motion.path
              d={`M${n.x} ${n.y - r * 2.6} L${n.x + r * 0.35} ${n.y - r * 0.35} L${n.x + r * 2.6} ${n.y} L${n.x + r * 0.35} ${n.y + r * 0.35} L${n.x} ${n.y + r * 2.6} L${n.x - r * 0.35} ${n.y + r * 0.35} L${n.x - r * 2.6} ${n.y} L${n.x - r * 0.35} ${n.y - r * 0.35} Z`}
              fill="#fff"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            />
            {showLabels && n.name && (
              <text
                x={n.x}
                y={n.y + (n.y > 80 ? -r * 3.4 : r * 3.4 + 3)}
                textAnchor="middle"
                className="font-display"
                fontSize="3.1"
                letterSpacing="0.25"
                fill={hovered === i ? '#ffffff' : '#9aa3b4'}
              >
                {n.name.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
