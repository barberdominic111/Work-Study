import React, { useEffect, useRef, useState } from 'react';
import { card, sectionLabel, btnPrimary, btnSecondary, btnActive, fieldLabel, inputStyle } from '../lib/styles.js';
import { simulateValueStream } from '../lib/simulationEngine.js';

const SPEEDS = [1, 2, 4];

export default function SimulationPage({ vsm, setVsm, onResults }) {
  const [running, setRunning] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 animation progress
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const quantity = vsm.simulationQuantity;

  function setQuantity(q) {
    setVsm({ ...vsm, simulationQuantity: Math.max(1, Math.round(q)) });
  }

  function runSimulation() {
    // Deterministic calculation happens instantly...
    const results = simulateValueStream({
      processes: vsm.processes,
      inventories: vsm.inventories,
      simulationQuantity: quantity,
    });
    onResults(results);
    // ...the animation below is purely illustrative and does not affect the numbers.
    setProgress(0);
    setRunning(true);
    startRef.current = null;
  }

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const durationMs = 3000 / SPEEDS[speedIdx];
    const step = (ts) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(1, elapsed / durationMs);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setRunning(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [running, speedIdx]);

  function pause() {
    setRunning(false);
  }
  function reset() {
    setRunning(false);
    setProgress(0);
  }

  const stages = vsm.processes;

  return (
    <div>
      <div style={card}>
        <div style={sectionLabel}>Simulation Quantity</div>
        <label style={fieldLabel}>Pieces to push through the value stream</label>
        <input
          type="number"
          style={inputStyle}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {[100, 500, 1000, 10000].map((q) => (
            <button
              key={q}
              style={q === quantity ? btnActive : btnSecondary}
              onClick={() => setQuantity(q)}
            >
              {q.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={sectionLabel}>Run</div>
        <button style={btnPrimary} onClick={runSimulation}>
          ▶ SIMULATE
        </button>

        {stages.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <AnimatedFlow stages={stages} inventories={vsm.inventories} progress={progress} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'center' }}>
              <button style={btnSecondary} onClick={pause}>⏸ Pause</button>
              <button style={btnSecondary} onClick={reset}>⟲ Reset</button>
              <button
                style={btnSecondary}
                onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
              >
                ⏩ {SPEEDS[speedIdx]}x
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>
        The animation is illustrative only — it shows the general direction of flow.
        The lead time, VA/NVA, throughput, and bottleneck numbers are computed
        deterministically by the simulation engine from your process and
        inventory data, not from the animation.
      </div>
    </div>
  );
}

function AnimatedFlow({ stages, inventories, progress }) {
  // Simple left-to-right dot that sweeps across process boxes as "progress" advances.
  const n = stages.length;
  const dotIndex = Math.min(n - 1, Math.floor(progress * n));

  return (
    <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', gap: 6, paddingBottom: 8 }}>
      {stages.map((s, i) => (
        <React.Fragment key={s.id}>
          <div
            style={{
              minWidth: 84,
              textAlign: 'center',
              border: i === dotIndex ? '2px solid var(--brand)' : '1.5px solid var(--border-card)',
              borderRadius: 10,
              padding: '10px 6px',
              background: i === dotIndex ? 'var(--brand-light-bg)' : 'var(--bg-card)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-primary)',
              position: 'relative',
            }}
          >
            {s.name}
            {i === dotIndex && (
              <div
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'var(--brand)',
                }}
              />
            )}
          </div>
          {i < inventories.length && (
            <div style={{ fontSize: 16, color: 'var(--text-placeholder)' }}>→△→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
