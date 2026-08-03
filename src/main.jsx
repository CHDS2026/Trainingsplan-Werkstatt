import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { requestPersistentStorage } from "./db.js";

requestPersistentStorage();

// Im Hintergrund nach einer neuen Fassung suchen — OHNE die laufende App neu zu laden.
// Die neue Fassung wird still vorbereitet und greift beim nächsten echten Start.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations()
      .then((rs) => rs.forEach((r) => r.update()))
      .catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
