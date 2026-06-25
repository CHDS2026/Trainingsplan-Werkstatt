// Dauerhafte lokale Speicherung über IndexedDB (Dexie). Keine Cloud, keine Kosten.
import Dexie from "dexie";

export const db = new Dexie("trainingsplan_werkstatt");
db.version(1).stores({
  state: "key" // einzelne App-Zustände unter festen Schlüsseln
});

// kompletten App-Zustand laden (ein Objekt)
export async function loadState() {
  try {
    const row = await db.state.get("app");
    return row ? row.value : null;
  } catch (e) {
    console.warn("loadState fehlgeschlagen", e);
    return null;
  }
}

// App-Zustand speichern (wird bei jeder Änderung aufgerufen)
export async function saveState(value) {
  try {
    await db.state.put({ key: "app", value });
  } catch (e) {
    console.warn("saveState fehlgeschlagen", e);
  }
}

// Dauerhaften Speicher anfordern (schützt vor automatischer Löschung auf iOS/Android)
export async function requestPersistentStorage() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const already = await navigator.storage.persisted();
      if (!already) await navigator.storage.persist();
    }
  } catch (e) {
    /* still ok – best effort */
  }
}
