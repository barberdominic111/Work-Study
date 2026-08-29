import React, { useState } from 'react';
import ProcessBox from '../components/ProcessBox.jsx';
import InventoryTriangle from '../components/InventoryTriangle.jsx';
import VaNvaTimeline from '../components/VaNvaTimeline.jsx';
import ProcessEditorModal from '../components/ProcessEditorModal.jsx';
import InventoryEditorModal from '../components/InventoryEditorModal.jsx';
import { card, sectionLabel, btnPrimary, btnSecondary, emptyState } from '../lib/styles.js';
import { newProcess, newInventory, reconcileInventories } from '../lib/model.js';
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
    insertProcessAt(processes.length);
  }

  // Insert a brand-new process at array position `i` (0..processes.length),
  // shifting everything at/after i to the right. Existing process names and
  // parameters are never touched — this is how you slot a forgotten step
  // between two you've already built without renaming anything.
  function insertProcessAt(i) {
    const p = newProcess({ name: `Process ${processes.length + 1}` });
    const nextProcesses = [...processes.slice(0, i), p, ...processes.slice(i)];

    let nextInventories;
    if (processes.length === 0) {
      nextInventories = [];
    } else if (i <= 0) {
      // new process becomes the first step; add a fresh buffer ahead of the old first step
      nextInventories = [newInventory({ name: `Inventory ${inventories.length + 1}` }), ...inventories];
    } else if (i >= processes.length) {
      // append at the very end
      nextInventories = [...inventories, newInventory({ name: `Inventory ${inventories.length + 1}` })];
    } else {
      // inserted in the middle: the old buffer that used to connect the
      // neighbors now connects the new step to its downstream neighbor;
      // a fresh buffer is added upstream of the new step
      nextInventories = [
        ...inventories.slice(0, i - 1),
        newInventory({ name: `Inventory ${inventories.length + 1}` }),
        ...inventories.slice(i - 1),
      ];
    }

    setVsm({ ...vsm, processes: nextProcesses, inventories: nextInventories });
  }

  // Reorder without touching names/params — swap two adjacent steps.
  function moveProcess(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= processes.length) return;
    const next = [...processes];
    [next[index], next[target]] = [next[target], next[index]];
    setVsm({ ...vsm, processes: next });
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

            <InsertLink onClick={() => insertProcessAt(0)} />

            {processes.map((p, i) => (
              <React.Fragment key={p.id}>
                <ProcessBox
                  process={p}
                  isBottleneck={i === bottleneckIdx}
                  capacityPerHour={capacities[i]}
                  onClick={() => setEditingProcess(p.id)}
                  onMoveUp={() => moveProcess(i, -1)}
                  onMoveDown={() => moveProcess(i, 1)}
                  canMoveUp={i > 0}
                  canMoveDown={i < processes.length - 1}
                />
                {i < inventories.length && (
                  <>
                    <InventoryTriangle
                      inventory={inventories[i]}
                      currentQty={invLevelFor(i)}
                      onClick={() => setEditingInventory(inventories[i].id)}
                    />
                    <InsertLink onClick={() => insertProcessAt(i + 1)} />
                  </>
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

function InsertLink({ onClick }) {
  return (
    <div style={{ textAlign: 'center', margin: '2px 0' }}>
      <button
        onClick={onClick}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--brand)',
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 8px',
        }}
      >
        + Insert Step Here
      </button>
    </div>
  );
}
