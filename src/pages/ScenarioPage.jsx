import React from 'react';
import { card, sectionLabel, btnPrimary, btnSecondary, emptyState } from '../lib/styles.js';
import { formatSeconds } from '../lib/simulationEngine.js';
import { cloneVsm } from '../lib/model.js';

export default function ScenarioPage({ vsm, results, baseline, scenario, setBaseline, setScenario, setVsm, setActiveTab }) {
  function saveBaseline() {
    if (!results) return;
    setBaseline({ vsm: cloneVsm(vsm), results });
  }

  function duplicateAsScenario() {
    if (!baseline) return;
    setScenario({ vsm: cloneVsm(baseline.vsm), results: null });
    setVsm(cloneVsm(baseline.vsm));
    setActiveTab('vsm');
  }

  function saveScenarioResults() {
    if (!results) return;
    setScenario({ vsm: cloneVsm(vsm), results });
  }

  return (
    <div>
      <div style={card}>
        <div style={sectionLabel}>Baseline</div>
        {baseline ? (
          <MetricList results={baseline.results} />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>
            Run a simulation, then save it as your baseline.
          </div>
        )}
        <button style={{ ...btnPrimary, marginTop: 10 }} onClick={saveBaseline} disabled={!results}>
          Save Current Simulation as Baseline
        </button>
      </div>

      <div style={card}>
        <div style={sectionLabel}>Scenario</div>
        {scenario?.results ? (
          <MetricList results={scenario.results} />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>
            Duplicate the baseline, change a parameter on the VSM tab, run the
            simulation again, then save it here.
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button style={{ ...btnSecondary, flex: 1 }} onClick={duplicateAsScenario} disabled={!baseline}>
            Duplicate as Scenario
          </button>
          <button style={{ ...btnPrimary, flex: 1 }} onClick={saveScenarioResults} disabled={!results || !baseline}>
            Save as Scenario
          </button>
        </div>
      </div>

      {baseline && scenario?.results && (
        <div style={card}>
          <div style={sectionLabel}>Comparison</div>
          <CompareTable baseline={baseline.results} scenario={scenario.results} />
        </div>
      )}

      {!baseline && (
        <div style={emptyState}>
          Save a baseline first, then create a scenario to compare against it.
        </div>
      )}
    </div>
  );
}

function MetricList({ results }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
      <Metric label="Lead Time" value={formatSeconds(results.totalLeadTime)} />
      <Metric label="VA Time" value={formatSeconds(results.totalVATime)} />
      <Metric label="NVA Time" value={formatSeconds(results.totalNVATime)} />
      <Metric label="Throughput" value={`${Math.round(results.throughputPerDay)}/day`} />
      <Metric label="Bottleneck" value={results.bottleneck?.name || '—'} />
      <Metric label="Max WIP" value={maxWip(results)} />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-placeholder)', textTransform: 'uppercase' }}>{label}</div>
      <div className="mono" style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{value}</div>
    </div>
  );
}

function maxWip(results) {
  const total = results.inventoryResults.reduce((sum, i) => sum + i.maxQty, 0);
  return total.toLocaleString();
}

function CompareTable({ baseline, scenario }) {
  const rows = [
    ['Lead Time', formatSeconds(baseline.totalLeadTime), formatSeconds(scenario.totalLeadTime), scenario.totalLeadTime < baseline.totalLeadTime],
    ['VA Time', formatSeconds(baseline.totalVATime), formatSeconds(scenario.totalVATime), null],
    ['NVA Time', formatSeconds(baseline.totalNVATime), formatSeconds(scenario.totalNVATime), scenario.totalNVATime < baseline.totalNVATime],
    ['WIP (max)', maxWip(baseline), maxWip(scenario), null],
    ['Throughput/day', Math.round(baseline.throughputPerDay), Math.round(scenario.throughputPerDay), scenario.throughputPerDay > baseline.throughputPerDay],
    ['Bottleneck', baseline.bottleneck?.name || '—', scenario.bottleneck?.name || '—', null],
  ];

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>
          <th style={th}>Metric</th>
          <th style={th}>Baseline</th>
          <th style={th}>Scenario</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, b, s, improved], i) => (
          <tr key={label} style={{ background: i % 2 ? 'var(--row-alt-bg)' : 'transparent' }}>
            <td style={td}>{label}</td>
            <td style={{ ...td, fontFamily: 'var(--font-mono)' }}>{b}</td>
            <td
              style={{
                ...td,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: improved === null ? 'var(--text-primary)' : improved ? 'var(--status-green)' : 'var(--status-red)',
              }}
            >
              {s}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th = { textAlign: 'left', padding: '6px 8px', color: 'var(--text-placeholder)', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid var(--border-card)' };
const td = { padding: '8px', borderBottom: '1px solid var(--border-card)' };
