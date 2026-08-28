import React, { useEffect, useRef, useState } from 'react';
import { card, sectionLabel, btnPrimary, btnSecondary, btnActive, fieldLabel, inputStyle, overlay } from '../lib/styles.js';
import { simulateValueStream } from '../lib/simulationEngine.js';
import AnimatedFlow from '../components/AnimatedFlow.jsx';

const SPEEDS = [1, 2, 4];

export default function SimulationPage({ vsm, setVsm, onResults }) {
  const [running, setRunning] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 animation progress
  const [expanded, setExpanded] = useState(false);
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button style={{ ...btnSecondary, padding: '6px 12px', fontSize: 12 }} onClick={() => setExpanded(true)}>
                ⤢ Expand
              </button>
            </div>
            <AnimatedFlow stages={stages} inventories={vsm.inventories} progress={progress} />
            <PlaybackControls running={running} pause={pause} reset={reset} speedIdx={speedIdx} setSpeedIdx={setSpeedIdx} runSimulation={runSimulation} />
          </div>
        )}
      </div>

      <div style={{ ...card, color: 'var(--text-muted)', fontSize: 13 }}>
        The animation is illustrative only — it shows the general direction of flow.
        The lead time, VA/NVA, throughput, and bottleneck numbers are computed
        deterministically by the simulation engine from your process and
        inventory data, not from the animation.
      </div>

      {expanded && (
        <div style={{ ...overlay, padding: 0, alignItems: 'stretch' }}>
          <div
            style={{
              background: 'var(--bg-page)',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-card)',
                background: 'var(--bg-card)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>
                Simulation Flow
              </div>
              <button style={{ ...btnSecondary, padding: '6px 14px' }} onClick={() => setExpanded(false)}>
                ✕ Close
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px' }}>
              <AnimatedFlow
                stages={stages}
                inventories={vsm.inventories}
                progress={progress}
                orientation="vertical"
                size="large"
              />
            </div>
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-card)', background: 'var(--bg-card)' }}>
              <PlaybackControls running={running} pause={pause} reset={reset} speedIdx={speedIdx} setSpeedIdx={setSpeedIdx} runSimulation={runSimulation} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlaybackControls({ running, pause, reset, speedIdx, setSpeedIdx, runSimulation }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button style={btnPrimary2} onClick={runSimulation}>▶ Run</button>
      <button style={btnSecondary} onClick={pause}>⏸ Pause</button>
      <button style={btnSecondary} onClick={reset}>⟲ Reset</button>
      <button style={btnSecondary} onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}>
        ⏩ {SPEEDS[speedIdx]}x
      </button>
    </div>
  );
}

const btnPrimary2 = {
  background: 'var(--brand)',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 10,
  padding: '10px 16px',
  fontSize: 13,
  fontWeight: 700,
};
