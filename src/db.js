// Dauerhafte lokale Speicherung über IndexedDB (Dexie) + localStorage-Fallback.
// Keine Cloud, keine Kosten, keine Konten.
import Dexie from "dexie";

const LS_KEY = "twerkstatt_state_v1";
const LS_STAMP = "twerkstatt_stamp_v1";

export const db = new Dexie("trainingsplan_werkstatt");
db.version(1).stores({ state: "key" });

// --- Hilfsfunktionen für den localStorage-Spiegel ---
function lsRead() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return { value: JSON.parse(raw), stamp: Number(localStorage.getItem(LS_STAMP) || 0) };
  } catch { return null; }
}
function lsWrite(value, stamp) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(value));
    localStorage.setItem(LS_STAMP, String(stamp));
    return true;
  } catch { return false; }
}

// Zustand laden: nimmt die JÜNGERE der beiden Quellen (IndexedDB / localStorage).
// So gehen Daten auch dann nicht verloren, wenn eine Quelle geleert wurde.
export async function loadState() {
  let idb = null;
  try {
    const row = await db.state.get("app");
    if (row && row.value) idb = { value: row.value, stamp: row.stamp || 0 };
  } catch (e) { console.warn("loadState (IndexedDB) fehlgeschlagen", e); }

  const ls = lsRead();
  if (idb && ls) return (ls.stamp > idb.stamp ? ls.value : idb.value);
  if (idb) return idb.value;
  if (ls) return ls.value;
  return null;
}

// Zustand speichern: schreibt in BEIDE Speicher. Erfolgreich, sobald einer klappt.
export async function saveState(value) {
  const stamp = Date.now();
  const lsOk = lsWrite(value, stamp);
  let idbOk = false;
  try {
    await db.state.put({ key: "app", value, stamp });
    idbOk = true;
  } catch (e) { console.warn("saveState (IndexedDB) fehlgeschlagen", e); }
  return idbOk || lsOk;
}

// Prüft, ob das Speichern grundsätzlich funktioniert (für die Anzeige in der App).
export async function storageHealth() {
  let idb = false, ls = false, persisted = false;
  try { await db.state.put({ key: "__probe", value: 1, stamp: Date.now() }); await db.state.delete("__probe"); idb = true; } catch {}
  try { localStorage.setItem("__probe", "1"); localStorage.removeItem("__probe"); ls = true; } catch {}
  try { if (navigator.storage && navigator.storage.persisted) persisted = await navigator.storage.persisted(); } catch {}
  return { idb, ls, persisted };
}

// Dauerhaften Speicher anfordern (schützt vor automatischer Löschung auf iOS/Android)
export async function requestPersistentStorage() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const already = await navigator.storage.persisted();
      if (!already) await navigator.storage.persist();
    }
  } catch { /* best effort */ }
}
