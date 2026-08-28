import React, { useState } from 'react';
import ProcessBox from '../components/ProcessBox.jsx';
import InventoryTriangle from '../components/InventoryTriangle.jsx';
import VaNvaTimeline from '../components/VaNvaTimeline.jsx';
import ProcessEditorModal from '../components/ProcessEditorModal.jsx';
import InventoryEditorModal from '../components/InventoryEditorModal.jsx';
import { card, sectionLabel, btnPrimary, btnSecondary, emptyState } from '../lib/styles.js';
import { newProcess, reconcileInventories } from '../lib/model.js';
import { effectiveCapacityPerHour, normalizeProcess } from '../lib/simulationEngine.js';

export default function VsmPage({ vsm, setVsm, results }) {
  const [editingProcess, setEditingProcess] = useState(null); // {id} or 'new'
  const [editingInventory, setEditingInventory] = useState(null);

  const { processes, inventories } = vsm;

  const capacities = processes.map((p) => effectiveCapacityPerHour(normalizeProcess(p)));
  const bottleneckIdx = capacities.length
    ? capacities.indexOf(Math.min(...capacities))
    : -1;

  const invLevelFor = (idx) => {
    if (!results) return null;
    const r = results.inventoryResults?.[idx];
    return r ? r.finalQty : null;
  };

  function addProcess() {
    const p = newProcess({ name: `Process ${processes.length + 1}` });
    const nextProcesses = [...processes, p];
    setVsm({
      ...vsm,
      processes: nextProcesses,
      inventories: reconcileInventories(nextProcesses, inventories),
    });
  }

  function saveProcess(form) {
    let nextProcesses;
    if (editingProcess === 'new') {
      nextProcesses = [...processes, form];
    } else {
      nextProcesses = processes.map((p) => (p.id === form.id ? form : p));
    }
    setVsm({ ...vsm, processes: nextProcesses, inventories: reconcileInventories(nextProcesses, inventories) });
    setEditingProcess(null);
  }

  function deleteProcess(id) {
    const nextProcesses = processes.filter((p) => p.id !== id);
    setVsm({ ...vsm, processes: nextProcesses, inventories: reconcileInventories(nextProcesses, inventories) });
    setEditingProcess(null);
  }

  function saveInventory(form) {
    const next = inventories.map((i) => (i.id === form.id ? form : i));
    setVsm({ ...vsm, inventories: next });
    setEditingInventory(null);
  }

  return (
    <div>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={sectionLabel}>Value Stream Map</div>
          <button style={{ ...btnSecondary, padding: '6px 12px', fontSize: 12 }} onClick={addProcess}>
            + Process
          </button>
        </div>

        {processes.length === 0 ? (
          <div style={emptyState}>
            No processes yet. Add your first process to start building the value stream.
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-placeholder)', marginBottom: 4 }}>
              SUPPLIER ↓
            </div>
            {processes.map((p, i) => (
              <React.Fragment key={p.id}>
                <ProcessBox
                  process={p}
                  isBottleneck={i === bottleneckIdx}
                  capacityPerHour={capacities[i]}
                  onClick={() => setEditingProcess(p.id)}
                />
                {i < inventories.length && (
                  <InventoryTriangle
                    inventory={inventories[i]}
                    currentQty={invLevelFor(i)}
                    onClick={() => setEditingInventory(inventories[i].id)}
                  />
                )}
              </React.Fragment>
            ))}
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-placeholder)', marginTop: 4 }}>
              ↓ CUSTOMER
            </div>
          </div>
        )}
      </div>

      {results && results.timeline.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>VA / NVA Timeline</div>
          <VaNvaTimeline
            timeline={results.timeline}
            totalVA={results.totalVATime}
            totalNVA={results.totalNVATime}
          />
        </div>
      )}

      {!results && processes.length > 0 && (
        <div style={{ ...emptyState, padding: '24px' }}>
          Run a simulation to see lead time, VA/NVA split, and the bottleneck.
        </div>
      )}

      {editingProcess && (
        <ProcessEditorModal
          process={editingProcess === 'new' ? newProcess() : processes.find((p) => p.id === editingProcess)}
          onSave={saveProcess}
          onDelete={processes.length > 1 ? deleteProcess : undefined}
          onClose={() => setEditingProcess(null)}
        />
      )}
      {editingInventory && (
        <InventoryEditorModal
          inventory={inventories.find((i) => i.id === editingInventory)}
          onSave={saveInventory}
          onClose={() => setEditingInventory(null)}
        />
      )}
    </div>
  );
}
