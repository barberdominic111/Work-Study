import React, { useEffect, useRef } from 'react';

// Shows the process sequence with a moving highlight as `progress` (0..1)
// advances. Auto-scrolls its container so the active stage stays in view —
// horizontally in compact mode, vertically in the expanded full-screen mode.
export default function AnimatedFlow({ stages, inventories, progress, orientation = 'horizontal', size = 'compact' }) {
  const n = stages.length;
  const dotIndex = Math.min(n - 1, Math.floor(progress * n));
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const el = itemRefs.current[dotIndex];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: orientation === 'vertical' ? 'center' : 'nearest',
        inline: orientation === 'horizontal' ? 'center' : 'nearest',
      });
    }
  }, [dotIndex, orientation]);

  const boxMinSize = size === 'large' ? 140 : 84;
  const fontSize = size === 'large' ? 15 : 11;
  const arrow = size === 'large' ? 26 : 16;
  const padding = size === 'large' ? '20px 14px' : '10px 6px';

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        alignItems: orientation === 'vertical' ? 'stretch' : 'center',
        overflowX: orientation === 'horizontal' ? 'auto' : 'visible',
        overflowY: orientation === 'vertical' ? 'auto' : 'visible',
        gap: 6,
        paddingBottom: orientation === 'horizontal' ? 8 : 0,
        maxHeight: orientation === 'vertical' ? '100%' : undefined,
      }}
    >
      {stages.map((s, i) => (
        <React.Fragment key={s.id}>
          <div
            ref={(el) => (itemRefs.current[i] = el)}
            style={{
              minWidth: orientation === 'horizontal' ? boxMinSize : undefined,
              textAlign: 'center',
              border: i === dotIndex ? '2px solid var(--brand)' : '1.5px solid var(--border-card)',
              borderRadius: 10,
              padding,
              background: i === dotIndex ? 'var(--brand-light-bg)' : 'var(--bg-card)',
              fontSize,
              fontWeight: 700,
              color: 'var(--text-primary)',
              position: 'relative',
              transition: 'background 0.2s, border-color 0.2s',
              flexShrink: 0,
            }}
          >
            {s.name}
            {i === dotIndex && (
              <div
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: size === 'large' ? 18 : 12,
                  height: size === 'large' ? 18 : 12,
                  borderRadius: '50%',
                  background: 'var(--brand)',
                  boxShadow: '0 0 0 4px var(--brand-light-bg)',
                }}
              />
            )}
            {size === 'large' && (
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
                CT {s.cycleTimeValue}{unitAbbr(s.cycleTimeUnit)} · {s.machines} machine{s.machines > 1 ? 's' : ''}
              </div>
            )}
          </div>
          {i < inventories.length && (
            <div
              style={{
                fontSize: arrow,
                color: 'var(--text-placeholder)',
                textAlign: 'center',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {orientation === 'vertical' ? '↓ △ ↓' : '→ △ →'}
              {size === 'large' && (
                <div className="mono" style={{ fontSize: 12, marginTop: 2 }}>
                  {inventories[i].name}
                </div>
              )}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function unitAbbr(u) {
  if (u === 'seconds') return 's';
  if (u === 'minutes') return 'm';
  if (u === 'hours') return 'h';
  return '';
}
