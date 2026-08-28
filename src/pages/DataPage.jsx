import React, { useRef } from 'react';
import { card, sectionLabel, btnPrimary, btnSecondary, emptyState } from '../lib/styles.js';
import { buildExportCsv, downloadCsv, downloadJson } from '../lib/exportCsv.js';

export default function DataPage({ vsm, results, baseline, scenario, onImport }) {
  const fileRef = useRef(null);

  function exportCsv() {
    const csv = buildExportCsv({
      processes: vsm.processes,
      inventories: vsm.inventories,
      simulationQuantity: vsm.simulationQuantity,
      baseline,
      scenario,
    });
    downloadCsv('vsm-simulation-export.csv', csv);
  }

  function exportJson() {
    downloadJson('vsm-simulation-export.json', { vsm, baseline, scenario });
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        onImport(data);
      } catch (err) {
        alert('Could not read that file — expected a VSM Simulator JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div>
      <div style={card}>
        <div style={sectionLabel}>Export</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          CSV export includes VSM configuration, process data, inventory data,
          baseline and scenario results, process performance, inventory
          performance, and a sample of unit-level simulation data — ready to
          open in Excel.
        </div>
        <button style={btnPrimary} onClick={exportCsv}>Export CSV</button>
        <button style={{ ...btnSecondary, marginTop: 10, width: '100%' }} onClick={exportJson}>
          Export JSON (for re-import)
        </button>
      </div>

      <div style={card}>
        <div style={sectionLabel}>Import</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          Import a VSM Simulator JSON export to move your work to another
          computer.
        </div>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} style={{ fontSize: 13 }} />
      </div>

      <div style={card}>
        <div style={sectionLabel}>Raw Data</div>
        <pre
          className="mono"
          style={{
            fontSize: 11,
            background: 'var(--row-alt-bg)',
            padding: 12,
            borderRadius: 8,
            overflowX: 'auto',
            maxHeight: 260,
          }}
        >
          {JSON.stringify(vsm, null, 2)}
        </pre>
      </div>
    </div>
  );
}
