import { makeId } from './storage.js';

export function newProcess(overrides = {}) {
  return {
    id: makeId('proc'),
    name: 'New Process',
    cycleTimeValue: 20,
    cycleTimeUnit: 'seconds',
    setupTimeValue: 15,
    setupTimeUnit: 'minutes',
    availableTimeSec: 27000,
    machines: 1,
    operators: 1,
    uptimePct: 95,
    batchSize: 30,
    demand: 2500,
    ...overrides,
  };
}

export function newInventory(overrides = {}) {
  return {
    id: makeId('inv'),
    name: 'Inventory',
    initialQty: 100,
    unit: 'pieces',
    ...overrides,
  };
}

export function defaultVsm() {
  const p1 = newProcess({ name: 'Process 1', cycleTimeValue: 20, setupTimeValue: 15, machines: 1 });
  const p2 = newProcess({ name: 'Process 2', cycleTimeValue: 10, setupTimeValue: 5, machines: 1 });
  const p3 = newProcess({ name: 'Process 3', cycleTimeValue: 30, setupTimeValue: 20, machines: 1 });
  const i1 = newInventory({ name: 'Inventory 1', initialQty: 250 });
  const i2 = newInventory({ name: 'Inventory 2', initialQty: 100 });
  return {
    processes: [p1, p2, p3],
    inventories: [i1, i2],
    simulationQuantity: 500,
  };
}

export function cloneVsm(vsm) {
  return JSON.parse(JSON.stringify(vsm));
}

// Keep inventories array length in sync with processes.length - 1
export function reconcileInventories(processes, inventories) {
  const needed = Math.max(0, processes.length - 1);
  const next = inventories.slice(0, needed);
  while (next.length < needed) {
    next.push(newInventory({ name: `Inventory ${next.length + 1}` }));
  }
  return next;
}
