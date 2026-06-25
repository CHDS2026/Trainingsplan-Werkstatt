import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { requestPersistentStorage } from "./db.js";

requestPersistentStorage();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
