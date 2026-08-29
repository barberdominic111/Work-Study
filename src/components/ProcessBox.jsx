import React from 'react';
import { formatSeconds } from '../lib/simulationEngine.js';

export default function ProcessBox({ process, isBottleneck, capacityPerHour, onClick, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 6,
        marginBottom: 4,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={!canMoveUp}
          aria-label="Move process earlier"
          style={arrowBtnStyle(canMoveUp)}
        >
          ▲
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={!canMoveDown}
          aria-label="Move process later"
          style={arrowBtnStyle(canMoveDown)}
        >
          ▼
        </button>
      </div>
      <button
        onClick={onClick}
        style={{
          display: 'block',
          flex: 1,
          textAlign: 'left',
          background: isBottleneck ? 'var(--status-red-bg)' : 'var(--bg-card)',
          border: isBottleneck ? '2px solid var(--status-red)' : '1.5px solid var(--border-card)',
          borderRadius: 12,
          padding: '14px 16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>
            {process.name}
          </div>
          {isBottleneck && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: 'var(--status-red)',
                background: '#fff',
                border: '1px solid var(--status-red)',
                borderRadius: 6,
                padding: '2px 6px',
              }}
            >
              BOTTLENECK
            </span>
          )}
        </div>
        <div
          className="mono"
          style={{
            marginTop: 8,
            fontSize: 12,
            color: 'var(--text-muted)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
          }}
        >
          <div>CT: {process.cycleTimeValue}{unitAbbr(process.cycleTimeUnit)}</div>
          <div>C/O: {process.setupTimeValue}{unitAbbr(process.setupTimeUnit)}</div>
          <div>Machines: {process.machines}</div>
          <div>Uptime: {process.uptimePct}%</div>
          <div>Batch: {process.batchSize}</div>
          {capacityPerHour != null && <div>Cap: {Math.round(capacityPerHour)}/hr</div>}
        </div>
      </button>
    </div>
  );
}

function arrowBtnStyle(enabled) {
  return {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: '1.5px solid var(--border-card)',
    background: 'var(--bg-card)',
    color: enabled ? 'var(--brand)' : 'var(--text-placeholder)',
    fontSize: 11,
    opacity: enabled ? 1 : 0.4,
    cursor: enabled ? 'pointer' : 'default',
  };
}

function unitAbbr(u) {
  if (u === 'seconds') return 's';
  if (u === 'minutes') return 'm';
  if (u === 'hours') return 'h';
  return '';
}
