import React from 'react';

const TABS = [
  { id: 'vsm', label: 'VSM' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'results', label: 'Results' },
  { id: 'scenario', label: 'Scenario' },
  { id: 'data', label: 'Data' },
  { id: 'settings', label: 'Settings' },
];

export default function TabBar({ active, onChange }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-card)',
        display: 'flex',
        width: '100%',
      }}
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: '1 1 0',
              minWidth: 0,
              padding: '8px 2px',
              background: 'transparent',
              border: 'none',
              borderBottom: isActive ? '3px solid var(--brand)' : '3px solid transparent',
              color: isActive ? 'var(--brand)' : 'var(--text-muted)',
              fontSize: 10,
              lineHeight: 1.2,
              fontWeight: isActive ? 700 : 600,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              textAlign: 'center',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
