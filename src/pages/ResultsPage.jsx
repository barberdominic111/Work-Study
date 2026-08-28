import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { card, sectionLabel, statGrid, statCell, statValue, statLabel, emptyState, statusColor } from '../lib/styles.js';
import { formatSeconds } from '../lib/simulationEngine.js';

const PIE_COLORS = ['#10B981', '#CBD5E1'];

export default function ResultsPage({ results }) {
  if (!results || results.processResults.length === 0) {
    return (
      <div style={emptyState}>
        No results yet. Go to the Simulation tab and press SIMULATE.
      </div>
    );
  }

  const {
    totalLeadTime, totalVATime, totalNVATime, throughputPerDay, throughputPerHour,
    bottleneck, processResults, inventoryResults,
  } = results;

  const pieData = [
    { name: 'VA', value: Math.max(0.001, totalVATime) },
    { name: 'NVA', value: Math.max(0.001, totalNVATime) },
  ];

  const capData = processResults.map((p) => ({
    name: p.name,
    capacity: Math.round(p.capacityPerHour),
    isBottleneck: p.isBottleneck,
  }));

  const invChartData = mergeInventoryTraces(inventoryResults);

  return (
    <div>
      <div style={card}>
        <div style={sectionLabel}>Summary</div>
        <div style={statGrid}>
          <Stat label="Lead Time" value={formatSeconds(totalLeadTime)} />
          <Stat label="VA Time" value={formatSeconds(totalVATime)} />
          <Stat label="NVA Time" value={formatSeconds(totalNVATime)} />
          <Stat label="Throughput" value={`${Math.round(throughputPerDay)}/day`} />
          <Stat label="Throughput" value={`${throughputPerHour.toFixed(1)}/hr`} />
          <Stat label="Bottleneck" value={bottleneck?.name || '—'} />
        </div>
      </div>

      <div style={card}>
        <div style={sectionLabel}>Lead Time Composition (VA vs NVA)</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
              {pieData.map((entry, i) => (
                <Cell key={entry.name} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatSeconds(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <div style={sectionLabel}>Process Capacity (pcs/hr)</div>
        <ResponsiveContainer width="100%" height={Math.max(160, processResults.length * 46)}>
          <BarChart data={capData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid stroke="var(--grid-line)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="capacity" radius={[0, 6, 6, 0]}>
              {capData.map((d, i) => (
                <Cell key={i} fill={d.isBottleneck ? '#EF4444' : '#2563EB'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {invChartData.points.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>Inventory Over Time</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={invChartData.points}>
              <CartesianGrid stroke="var(--grid-line)" strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                tickFormatter={(v) => `${(v / 3600).toFixed(1)}h`}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip labelFormatter={(v) => formatSeconds(v)} />
              <Legend />
              {invChartData.keys.map((k, i) => (
                <Line
                  key={k}
                  type="stepAfter"
                  dataKey={k}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={card}>
        <div style={sectionLabel}>Process Utilization</div>
        {processResults.map((p) => (
          <div key={p.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
              <span>{p.name}{p.isBottleneck ? ' (bottleneck)' : ''}</span>
              <span className="mono">{p.utilizationPct.toFixed(0)}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--row-alt-bg)', borderRadius: 4, marginTop: 4 }}>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  width: `${Math.min(100, p.utilizationPct)}%`,
                  background: statusColor(p.utilizationPct),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={sectionLabel}>Inventory Detail</div>
        {inventoryResults.map((inv) => (
          <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-card)', fontSize: 13 }}>
            <span>{inv.name}</span>
            <span className="mono" style={{ color: 'var(--text-muted)' }}>
              start {inv.initialQty} · avg {inv.avgQty} · max {inv.maxQty} · end {inv.finalQty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const LINE_COLORS = ['#2563EB', '#10B981', '#A855F7', '#F59E0B', '#0EA5E9', '#64748B'];

function Stat({ label, value }) {
  return (
    <div style={statCell}>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

// Merge each inventory's {t, level} trace into a single array keyed by inventory name,
// forward-filling so Recharts can plot multiple step lines together.
function mergeInventoryTraces(inventoryResults) {
  const keys = inventoryResults.map((i) => i.name);
  const allTimes = new Set();
  inventoryResults.forEach((inv) => inv.trace.forEach((p) => allTimes.add(p.t)));
  const times = Array.from(allTimes).sort((a, b) => a - b);

  const lastValues = inventoryResults.map((inv) => inv.trace[0]?.level ?? inv.initialQty);
  const traceIdx = inventoryResults.map(() => 0);

  const points = times.map((t) => {
    const row = { t };
    inventoryResults.forEach((inv, i) => {
      while (traceIdx[i] < inv.trace.length && inv.trace[traceIdx[i]].t <= t) {
        lastValues[i] = inv.trace[traceIdx[i]].level;
        traceIdx[i]++;
      }
      row[keys[i]] = lastValues[i];
    });
    return row;
  });

  return { keys, points };
}
