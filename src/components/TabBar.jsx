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
        overflowX: 'auto',
      }}
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: '1 0 auto',
              minWidth: 76,
              padding: '12px 4px',
              background: 'transparent',
              border: 'none',
              borderBottom: isActive ? '3px solid var(--brand)' : '3px solid transparent',
              color: isActive ? 'var(--brand)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: isActive ? 700 : 600,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
