function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function section(title, rows) {
  const lines = [`## ${title}`];
  rows.forEach((row) => lines.push(row.map(csvEscape).join(',')));
  lines.push('');
  return lines.join('\n');
}

export function buildExportCsv({ processes, inventories, simulationQuantity, baseline, scenario }) {
  const parts = [];

  parts.push(
    section('VSM Configuration', [
      ['Simulation Quantity', simulationQuantity],
      ['Process Count', processes.length],
      ['Inventory Count', inventories.length],
    ])
  );

  parts.push(
    section(
      'Process Data',
      [
        [
          'Name',
          'Cycle Time',
          'Cycle Time Unit',
          'Setup Time',
          'Setup Time Unit',
          'Available Time (sec/day)',
          'Machines',
          'Operators',
          'Uptime %',
          'Batch Size',
          'Demand (pcs/day)',
        ],
        ...processes.map((p) => [
          p.name,
          p.cycleTimeValue,
          p.cycleTimeUnit,
          p.setupTimeValue,
          p.setupTimeUnit,
          p.availableTimeSec,
          p.machines,
          p.operators,
          p.uptimePct,
          p.batchSize,
          p.demand,
        ]),
      ]
    )
  );

  parts.push(
    section(
      'Inventory Data',
      [
        ['Name', 'Initial Qty', 'Unit'],
        ...inventories.map((i) => [i.name, i.initialQty, i.unit]),
      ]
    )
  );

  const resultBlock = (label, res) => {
    if (!res) return;
    parts.push(
      section(`${label} — Summary`, [
        ['Metric', 'Value'],
        ['Lead Time (sec)', res.totalLeadTime?.toFixed(2)],
        ['VA Time (sec)', res.totalVATime?.toFixed(2)],
        ['NVA Time (sec)', res.totalNVATime?.toFixed(2)],
        ['Throughput (pcs/hr)', res.throughputPerHour?.toFixed(2)],
        ['Throughput (pcs/day)', res.throughputPerDay?.toFixed(2)],
        ['Bottleneck', res.bottleneck?.name],
      ])
    );
    parts.push(
      section(`${label} — Process Performance`, [
        [
          'Process',
          'Cycle Time (s)',
          'Setup Time (s)',
          'Machines',
          'Uptime %',
          'Batch Size',
          'Capacity (pcs/hr)',
          'Utilization %',
          'Avg Wait (s)',
          'Bottleneck?',
        ],
        ...res.processResults.map((p) => [
          p.name,
          p.cycleTimeSec,
          p.setupTimeSec,
          p.machines,
          p.uptimePct?.toFixed(1),
          p.batchSize,
          p.capacityPerHour?.toFixed(1),
          p.utilizationPct?.toFixed(1),
          p.avgWaitSec?.toFixed(1),
          p.isBottleneck ? 'YES' : '',
        ]),
      ])
    );
    parts.push(
      section(`${label} — Inventory Performance`, [
        ['Inventory', 'Between', 'Initial Qty', 'Final Qty', 'Max Qty', 'Avg Qty'],
        ...res.inventoryResults.map((i) => [
          i.name,
          `${i.afterProcess} -> ${i.beforeProcess}`,
          i.initialQty,
          i.finalQty,
          i.maxQty,
          i.avgQty,
        ]),
      ])
    );
    parts.push(
      section(`${label} — Unit Sample`, [
        ['Unit #', 'Lead Time (s)', 'VA Time (s)', 'NVA Time (s)'],
        ...res.unitResults.map((u) => [
          u.unit,
          u.leadTimeSec.toFixed(2),
          u.vaTimeSec.toFixed(2),
          u.nvaTimeSec.toFixed(2),
        ]),
      ])
    );
  };

  resultBlock('Baseline', baseline?.results);
  resultBlock('Scenario', scenario?.results);

  return parts.join('\n');
}

export function downloadCsv(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
