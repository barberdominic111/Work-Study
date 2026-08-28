// simulationEngine.js
// Deterministic, discrete, unit-by-unit simulation of material flowing through
// a value stream. No randomness, no hard-coded results — every number returned
// is derived from the processes/inventories/quantity the caller supplies.
//
// Model summary (see README for the full write-up):
//  - Each process has 1..N parallel machines. A unit is assigned to whichever
//    machine becomes free earliest (a standard multi-server queue).
//  - Setup/changeover time is charged once every `batchSize` units on a
//    process's shared line clock (amortized changeover), not against VA time.
//  - Uptime inflates the effective cycle time (cycleTime / uptime).
//  - A unit cannot start at a process until the corresponding upstream unit
//    (offset by any starting inventory buffer) has finished — this is what
//    produces queueing/blocking and, when a downstream process is slower,
//    inventory buildup between stages.

const toSeconds = (value, unit) => {
  const v = Number(value) || 0;
  switch (unit) {
    case 'hours':
      return v * 3600;
    case 'minutes':
      return v * 60;
    case 'seconds':
    default:
      return v;
  }
};

export function normalizeProcess(p) {
  const cycleTimeSec = toSeconds(p.cycleTimeValue, p.cycleTimeUnit || 'seconds');
  const setupTimeSec = toSeconds(p.setupTimeValue, p.setupTimeUnit || 'minutes');
  const availableTimeSec = Number(p.availableTimeSec) || 27000; // default 7.5hr shift
  const machines = Math.max(1, Number(p.machines) || 1);
  const operators = Math.max(0, Number(p.operators) || 0);
  const uptime = Math.min(1, Math.max(0.01, (Number(p.uptimePct) || 100) / 100));
  const batchSize = Math.max(1, Number(p.batchSize) || 1);
  const demand = Number(p.demand) || 0;

  return {
    id: p.id,
    name: p.name || 'Process',
    cycleTimeSec,
    setupTimeSec,
    availableTimeSec,
    machines,
    operators,
    uptime,
    batchSize,
    demand,
  };
}

export function normalizeInventory(inv) {
  return {
    id: inv.id,
    name: inv.name || 'Inventory',
    initialQty: Math.max(0, Number(inv.initialQty) || 0),
    unit: inv.unit || 'pieces',
  };
}

// Effective, formula-based throughput capacity for a process (pieces/hour).
// Used for bottleneck detection and utilization — independent of the
// unit-by-unit walk so it stays stable and easy to sanity-check.
export function effectiveCapacityPerHour(proc) {
  const amortizedCycle =
    proc.cycleTimeSec + proc.setupTimeSec / proc.batchSize; // sec/piece incl. changeover
  if (amortizedCycle <= 0) return 0;
  const perMachinePerHour = (3600 / amortizedCycle) * proc.uptime;
  return perMachinePerHour * proc.machines;
}

export function simulateValueStream({ processes, inventories, simulationQuantity }) {
  const N = Math.max(1, Math.floor(Number(simulationQuantity) || 0));
  const procs = processes.map(normalizeProcess);
  const invs = inventories.map(normalizeInventory);

  if (procs.length === 0) {
    return emptyResult();
  }

  const stageCount = procs.length;
  // start[s][u], finish[s][u]
  const start = procs.map(() => new Float64Array(N));
  const finish = procs.map(() => new Float64Array(N));
  const waitBeforeStage = procs.map(() => new Float64Array(N));

  const setupEventsPerStage = procs.map(() => 0);
  const busyTimePerStage = procs.map(() => 0);

  for (let s = 0; s < stageCount; s++) {
    const proc = procs[s];
    const machineFree = new Float64Array(proc.machines);
    const effectiveCycle = proc.cycleTimeSec / proc.uptime;
    let setupCounter = 0;
    const offset = s === 0 ? 0 : invs[s - 1]?.initialQty || 0;

    for (let u = 0; u < N; u++) {
      // material availability
      let materialAvail;
      if (s === 0) {
        materialAvail = 0;
      } else if (u < offset) {
        materialAvail = 0;
      } else {
        materialAvail = finish[s - 1][u - offset];
      }

      // pick earliest-free machine
      let m = 0;
      for (let k = 1; k < machineFree.length; k++) {
        if (machineFree[k] < machineFree[m]) m = k;
      }

      setupCounter++;
      let setupAdd = 0;
      if (setupCounter > proc.batchSize) {
        setupAdd = proc.setupTimeSec;
        setupEventsPerStage[s]++;
        setupCounter = 1;
      }

      const readyMachine = machineFree[m] + setupAdd;
      const st = Math.max(materialAvail, readyMachine);
      const fin = st + effectiveCycle;
      machineFree[m] = fin;

      start[s][u] = st;
      finish[s][u] = fin;
      waitBeforeStage[s][u] = st - materialAvail;
      busyTimePerStage[s] += effectiveCycle;
    }
  }

  const lastStage = stageCount - 1;

  // Per-unit lead/VA/NVA time (entry = start at stage 0, exit = finish at last stage)
  const leadTimes = new Float64Array(N);
  const vaTimes = new Float64Array(N);
  for (let u = 0; u < N; u++) {
    let va = 0;
    for (let s = 0; s < stageCount; s++) va += finish[s][u] - start[s][u];
    const lead = finish[lastStage][u] - start[0][u];
    leadTimes[u] = lead;
    vaTimes[u] = va;
  }

  // steady-state window: last 20% of units (min 1, at least last unit)
  const windowSize = Math.max(1, Math.round(N * 0.2));
  const windowStart = N - windowSize;
  let avgLead = 0;
  let avgVA = 0;
  for (let u = windowStart; u < N; u++) {
    avgLead += leadTimes[u];
    avgVA += vaTimes[u];
  }
  avgLead /= windowSize;
  avgVA /= windowSize;
  const avgNVA = Math.max(0, avgLead - avgVA);

  const makespan = finish[lastStage][N - 1] - start[0][0];
  const makespanHours = makespan / 3600;
  const throughputPerHour = makespanHours > 0 ? N / makespanHours : 0;
  const throughputPerDay = throughputPerHour * 24;

  // capacity / utilization / bottleneck
  const capacities = procs.map(effectiveCapacityPerHour);
  let bottleneckIdx = 0;
  for (let s = 1; s < stageCount; s++) {
    if (capacities[s] < capacities[bottleneckIdx]) bottleneckIdx = s;
  }

  const processResults = procs.map((proc, s) => {
    // "busy" for utilization purposes includes changeover time — the machine
    // isn't producing during setup, but it also isn't available for other work.
    const occupiedTime = busyTimePerStage[s] + setupEventsPerStage[s] * proc.setupTimeSec;
    const utilization =
      makespan > 0 ? (occupiedTime / (proc.machines * makespan)) * 100 : 0;
    let avgWait = 0;
    for (let u = windowStart; u < N; u++) avgWait += waitBeforeStage[s][u];
    avgWait /= windowSize;
    return {
      id: proc.id,
      name: proc.name,
      cycleTimeSec: proc.cycleTimeSec,
      setupTimeSec: proc.setupTimeSec,
      machines: proc.machines,
      uptimePct: proc.uptime * 100,
      batchSize: proc.batchSize,
      capacityPerHour: capacities[s],
      capacityPerDay: capacities[s] * 24,
      utilizationPct: Math.min(100, utilization),
      avgWaitSec: avgWait,
      isBottleneck: s === bottleneckIdx,
      setupEvents: setupEventsPerStage[s],
    };
  });

  // inventory occupancy over time (event-based level trace)
  const inventoryResults = invs.map((inv, i) => {
    const events = [];
    events.push({ t: 0, d: inv.initialQty });
    const arrivals = finish[i]; // units arriving into this buffer
    for (let u = 0; u < N; u++) {
      events.push({ t: arrivals[u], d: +1 });
      events.push({ t: start[i + 1][u], d: -1 });
    }
    events.sort((a, b) => a.t - b.t);
    let level = inv.initialQty;
    let maxLevel = inv.initialQty;
    let sumLevel = 0;
    const trace = [{ t: 0, level }];
    for (const ev of events) {
      if (ev.t === 0 && ev.d === inv.initialQty) continue;
      level += ev.d;
      if (level < 0) level = 0;
      maxLevel = Math.max(maxLevel, level);
      trace.push({ t: ev.t, level });
    }
    // downsample trace to <= 200 points for charting
    const sampled = downsample(trace, 200);
    sumLevel = sampled.reduce((a, p) => a + p.level, 0);
    const avgLevel = sampled.length ? sumLevel / sampled.length : inv.initialQty;

    return {
      id: inv.id,
      name: inv.name,
      afterProcess: procs[i]?.name,
      beforeProcess: procs[i + 1]?.name,
      initialQty: inv.initialQty,
      finalQty: Math.round(level),
      maxQty: Math.round(maxLevel),
      avgQty: Math.round(avgLevel * 10) / 10,
      trace: sampled,
    };
  });

  // representative single-unit journey for the VA/NVA bottom timeline
  const repUnit = Math.max(0, N - 2);
  const timeline = procs.map((proc, s) => ({
    name: proc.name,
    startSec: start[s][repUnit],
    finishSec: finish[s][repUnit],
    vaSec: finish[s][repUnit] - start[s][repUnit],
    waitBeforeSec: waitBeforeStage[s][repUnit],
  }));

  const unitSampleIdx = sampleIndices(N, 100);
  const unitResults = unitSampleIdx.map((u) => ({
    unit: u + 1,
    leadTimeSec: leadTimes[u],
    vaTimeSec: vaTimes[u],
    nvaTimeSec: Math.max(0, leadTimes[u] - vaTimes[u]),
  }));

  return {
    simulationQuantity: N,
    totalLeadTime: avgLead,
    totalVATime: avgVA,
    totalNVATime: avgNVA,
    throughputPerHour,
    throughputPerDay,
    makespanSec: makespan,
    bottleneck: processResults[bottleneckIdx],
    processResults,
    inventoryResults,
    unitResults,
    timeline,
  };
}

function downsample(trace, maxPoints) {
  if (trace.length <= maxPoints) return trace;
  const step = trace.length / maxPoints;
  const out = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(trace[Math.floor(i * step)]);
  }
  out.push(trace[trace.length - 1]);
  return out;
}

function sampleIndices(n, maxCount) {
  if (n <= maxCount) return Array.from({ length: n }, (_, i) => i);
  const out = [];
  const step = n / maxCount;
  for (let i = 0; i < maxCount; i++) out.push(Math.floor(i * step));
  if (out[out.length - 1] !== n - 1) out.push(n - 1);
  return out;
}

function emptyResult() {
  return {
    simulationQuantity: 0,
    totalLeadTime: 0,
    totalVATime: 0,
    totalNVATime: 0,
    throughputPerHour: 0,
    throughputPerDay: 0,
    makespanSec: 0,
    bottleneck: null,
    processResults: [],
    inventoryResults: [],
    unitResults: [],
    timeline: [],
  };
}

// ---- formatting helpers used across the app ----
export function formatSeconds(sec) {
  if (!isFinite(sec) || sec == null) return '—';
  const s = Math.abs(sec);
  if (s < 60) return `${sec.toFixed(1)} sec`;
  if (s < 3600) return `${(sec / 60).toFixed(1)} min`;
  const hours = Math.floor(s / 3600);
  const mins = Math.round((s % 3600) / 60);
  const sign = sec < 0 ? '-' : '';
  return `${sign}${hours} hr ${mins} min`;
}

export function formatHMS(sec) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}h ${m}m ${ss}s`;
}
