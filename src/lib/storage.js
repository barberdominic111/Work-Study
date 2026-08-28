const STORAGE_KEY = 'vsm-simulator-state-v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved VSM state', e);
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save VSM state', e);
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear VSM state', e);
  }
}

let idCounter = 0;
export function makeId(prefix = 'id') {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}
