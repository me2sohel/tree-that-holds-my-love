const KEY = "tree-that-holds-my-love-progress-v1";

export function createInitialState() {
  return {
    discoveries: [],
    unlocked: { canopy: true, river: true, roots: false, nightGarden: false, finalBloom: false },
    atmosphere: "daylight",
    finaleSeen: false
  };
}

export function loadState() {
  try {
    const saved = localStorage.getItem(KEY);
    if (!saved) return createInitialState();
    const parsed = JSON.parse(saved);
    return { ...createInitialState(), ...parsed,
      unlocked: { ...createInitialState().unlocked, ...(parsed.unlocked || {}) },
      discoveries: Array.isArray(parsed.discoveries) ? parsed.discoveries : []
    };
  } catch {
    return createInitialState();
  }
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode or storage disabled */ }
}

export function resetState() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  return createInitialState();
}
