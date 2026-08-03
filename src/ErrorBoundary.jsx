import React from "react";

// Zeigt bei einem Absturz die echte Fehlermeldung an, statt eines weißen Bildschirms.
export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null, info: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { this.setState({ info }); console.error("App-Fehler:", err, info); }

  render() {
    if (!this.state.err) return this.props.children;
    const msg = String(this.state.err && (this.state.err.stack || this.state.err.message || this.state.err));
    return (
      <div style={{ minHeight: "100vh", background: "#0F1216", color: "#ECF1F6", padding: 20, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Es ist ein Fehler aufgetreten</div>
        <div style={{ fontSize: 13, color: "#98A2AE", marginBottom: 16, lineHeight: 1.5 }}>
          Deine gespeicherten Trainingsdaten sind davon nicht betroffen. Schick mir den folgenden Text, dann finde ich die Ursache.
        </div>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#161B22", border: "1px solid #29313B",
                      borderRadius: 10, padding: 12, fontSize: 11.5, lineHeight: 1.5, color: "#FF7A80", maxHeight: "50vh", overflow: "auto" }}>
          {msg}
        </pre>
        <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(msg); }}
          style={{ marginTop: 12, padding: "12px 16px", borderRadius: 10, border: "1px solid #39434F",
                   background: "transparent", color: "#ECF1F6", fontSize: 14, fontWeight: 700, width: "100%" }}>
          Fehlertext kopieren
        </button>
        <button onClick={() => window.location.reload()}
          style={{ marginTop: 10, padding: "12px 16px", borderRadius: 10, border: "none",
                   background: "#2C63C9", color: "#fff", fontSize: 14, fontWeight: 700, width: "100%" }}>
          App neu laden
        </button>
      </div>
    );
  }
}
