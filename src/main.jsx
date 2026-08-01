import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { requestPersistentStorage } from "./db.js";

requestPersistentStorage();

// Beim Öffnen aktiv nach einer neuen Fassung suchen (PWA bleibt sonst lange auf altem Stand)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.update())).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;            // Endlosschleife vermeiden
    reloaded = true;
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
