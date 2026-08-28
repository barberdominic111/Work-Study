import React from 'react';
import { formatSeconds } from '../lib/simulationEngine.js';

// Renders a proportional VA (green) vs NVA (gray) bar for the representative
// unit's journey, with per-process VA segments labeled above.
export default function VaNvaTimeline({ timeline, totalVA, totalNVA }) {
  const total = totalVA + totalNVA || 1;
  const vaPct = (totalVA / total) * 100;
  const nvaPct = 100 - vaPct;

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${timeline.length}, 1fr)`,
          gap: 4,
          marginBottom: 6,
        }}
      >
        {timeline.map((t, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>
              {t.name}
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--status-green)' }}>
              {formatSeconds(t.vaSec)}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          height: 14,
          borderRadius: 7,
          overflow: 'hidden',
          display: 'flex',
          border: '1px solid var(--border-card)',
        }}
      >
        <div style={{ width: `${vaPct}%`, background: 'var(--status-green)' }} title="VA time" />
        <div style={{ width: `${nvaPct}%`, background: 'var(--accent-gray)' }} title="NVA time" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <Legend color="var(--status-green)" label={`VA ${formatSeconds(totalVA)}`} />
        <Legend color="var(--accent-gray)" label={`NVA ${formatSeconds(totalNVA)}`} />
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid var(--border-card)',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Total Lead Time
        </div>
        <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)' }}>
          {formatSeconds(totalVA + totalNVA)}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
      {label}
    </div>
  );
}
