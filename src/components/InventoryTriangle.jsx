import React from 'react';

export default function InventoryTriangle({ inventory, currentQty, onClick }) {
  const qty = currentQty != null ? Math.round(currentQty) : inventory.initialQty;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'transparent',
        border: 'none',
        padding: '6px 0',
        width: '100%',
      }}
    >
      <svg width="28" height="24" viewBox="0 0 28 24">
        <polygon
          points="14,1 27,22 1,22"
          fill="var(--brand-light-bg)"
          stroke="var(--brand)"
          strokeWidth="1.5"
        />
      </svg>
      <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
        {qty.toLocaleString()}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {inventory.unit}
      </div>
    </button>
  );
}
