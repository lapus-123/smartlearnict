import AsyncStorage from "@react-native-async-storage/async-storage";

const SEEN_KEY = "smartlearn_last_seen_material_ts";
const SEEN_IDS_KEY = "smartlearn_seen_material_ids";

// ── Tab badge (unseen updates indicator) ──────────────────────────────────────

export const markUpdatesAsSeen = async () => {
  try {
    await AsyncStorage.setItem(SEEN_KEY, new Date().toISOString());
  } catch (err) {
    console.warn("markUpdatesAsSeen error:", err);
  }
};

export const hasUnseenUpdates = async (materials = []) => {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    if (!raw) return materials.length > 0;
    const lastSeen = new Date(raw).getTime();
    return materials.some((m) => new Date(m.createdAt).getTime() > lastSeen);
  } catch (err) {
    console.warn("hasUnseenUpdates error:", err);
    return false;
  }
};

// ── Per-material NEW badge ─────────────────────────────────────────────────────

// Load the set of material IDs the user has already tapped/seen
export const getSeenIds = async () => {
  try {
    const raw = await AsyncStorage.getItem(SEEN_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

// Mark a single material as seen (called when tapped in Updates)
export const markMaterialSeen = async (materialId) => {
  try {
    const ids = await getSeenIds();
    ids.add(String(materialId));
    await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify([...ids]));
  } catch (err) {
    console.warn("markMaterialSeen error:", err);
  }
};
