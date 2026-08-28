import React from 'react';
import { card, sectionLabel, btnActive, btnSecondary, btnDestructive } from '../lib/styles.js';

const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'warm', label: 'Warm' },
  { id: 'dark', label: 'Dark' },
];

export default function SettingsPage({ theme, setTheme, onResetAll }) {
  return (
    <div>
      <div style={card}>
        <div style={sectionLabel}>Theme</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              style={{ ...(theme === t.id ? btnActive : btnSecondary), flex: 1 }}
              onClick={() => setTheme(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={sectionLabel}>About</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          VSM Simulator computes lead time, VA/NVA time, throughput, WIP, and
          bottleneck directly from the process and inventory data you enter —
          nothing is hard-coded. All data is stored locally in this browser.
        </div>
      </div>

      <div style={card}>
        <div style={sectionLabel}>Reset</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          Clears your saved VSM, baseline, and scenario from this browser.
          This cannot be undone.
        </div>
        <button style={btnDestructive} onClick={onResetAll}>Clear All Data</button>
      </div>
    </div>
  );
}
