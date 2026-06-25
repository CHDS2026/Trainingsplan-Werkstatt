# Trainingsplan-Werkstatt — installierbare PWA

Persönlicher Trainingsplan-Generator. Läuft offline, regelbasiert, ohne laufende Kosten.
Daten bleiben dauerhaft lokal auf dem Gerät (IndexedDB) — keine Cloud, kein Server, keine Synchronisation.

## Was du brauchst (einmalig)
- Node.js (Version 18 oder neuer) — kostenlos von https://nodejs.org
- Ein kostenloses Konto bei GitHub und bei Cloudflare (für die Veröffentlichung)

## 1. Lokal testen
```
npm install
npm run dev
```
Dann die angezeigte Adresse (z. B. http://localhost:5173) im Browser öffnen.

## 2. Für die Veröffentlichung bauen
```
npm run build
```
Das erzeugt den Ordner `dist/` — das ist die fertige, installierbare App.

## 3. Kostenlos veröffentlichen (Cloudflare Pages)
1. Lege ein kostenloses GitHub-Konto an und lade dieses Projekt als Repository hoch.
2. Gehe zu https://dash.cloudflare.com → "Workers & Pages" → "Create" → "Pages" → "Connect to Git".
3. Wähle dein Repository. Bei den Build-Einstellungen:
   - Framework-Preset: **Vite**
   - Build-Befehl: **npm run build**
   - Build-Ausgabeverzeichnis: **dist**
4. "Save and Deploy". Nach ca. einer Minute ist die App unter
   `https://dein-projektname.pages.dev` erreichbar — mit HTTPS, kostenlos, dauerhaft.

## 4. Auf dem Handy installieren
- **Android (Chrome):** Adresse öffnen → es erscheint "App installieren" bzw. über das Menü "Zum Startbildschirm hinzufügen".
- **iPhone (Safari):** Adresse in **Safari** öffnen (nicht Chrome) → Teilen-Symbol → "Zum Home-Bildschirm" → "Hinzufügen".

Danach liegt das App-Icon auf dem Startbildschirm und öffnet sich im Vollbild wie eine echte App.

## Datensicherung
Im Tab "Sicherung" kannst du jederzeit ein Backup als Datei exportieren und wieder importieren.
Da es keine Cloud-Synchronisation gibt, ist das deine Absicherung bei Gerätewechsel.

## Aufbau des Projekts
- `src/App.jsx` — die komplette App (Logik, Übungsdatenbank, UI)
- `src/db.js` — dauerhafte Speicherung über IndexedDB (Dexie)
- `src/main.jsx` — Einstiegspunkt, fordert dauerhaften Speicher an
- `vite.config.js` — PWA-Konfiguration (Manifest, Service Worker)
- `public/` — App-Icons
