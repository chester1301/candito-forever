# Testsuite

    python3 build.py && node tests/run.js

Startet einen lokalen Server auf `docs/`, öffnet die App in Chromium (Playwright) und führt alle Fälle in
`tests/cases/` aus. Jeder Fall sammelt Seiten- und Konsolenfehler; der Lauf endet mit Exit-Code 1, sobald
eine Prüfung scheitert.

- `node tests/run.js gym swap` – nur Fälle, deren Dateiname eines der Wörter enthält
- `PORT=8766 node tests/run.js` – vorhandenen Server benutzen (sonst wird ein freier Port gewählt)
- `node tests/run.js --update-golden` – Plan-Snapshot (`tests/plan.golden.json`) neu schreiben.
  **Nur nach einer bewussten, mit Canditos Original abgeglichenen Plan-Änderung.** Der Snapshot schützt
  die Vorgaben (Übung, Sätze, Wiederholungen, RPE, Prozente, Deckel, Hype, Alternativen) vor versehentlichen Änderungen.
- `node tests/run.js visual` – Optik-Test (`12-visual.js`): Heute, Training, Progress, Einstellungen, Gym-Satz,
  Pause und Zusammenfassung auf 390×797 und 430×850 werden pixelweise mit `tests/visual/*.png` verglichen
  (feste Uhrzeit 22.10.2026 17:00, Animationen aus, nur Beispieldaten). Bei Abweichung liegen Ist- und
  Differenzbild (rot = geändert) in `tests/visual/_out/`.
- `node tests/run.js visual --update-visual` – Referenzbilder neu schreiben. **Nur nach einer bewussten
  Optik-Änderung**, vorher die Differenzbilder ansehen.

### Schutz-Tests (Candito Forever 2.0)
- `23-berechnung-golden` – Referenzstand **aller berechneten Vorgaben** (Last, Wdh, RPE, Rechenweg je Satz) für alle
  10 Jahresplan-Programme und 13 Side-Quest-Versionen, dazu Aufwärmsätze, e1RM/RPE-Tabelle, Wilks/DOTS/IPF GL,
  Scheiben und Rundung (`tests/calc.golden.json`). Gleiche Eingaben müssen identische Ergebnisse liefern.
- `24-funktionsinventur` – erfasst alle Bedienelemente in allen 59 Ansichten (`tests/views.js`); der Referenzstand
  (`tests/inventory.golden.json`) darf nur wachsen – keine Funktion kann stillschweigend verschwinden.
- `25-responsive-themes` – alle Ansichten bei 320/375/390/430 px, Classic Rot/Gold und Textgröße „Sehr groß“.
- `26-gym-kernwerkzeuge` – Doppelbuchungsschutz, RPE leer, Warm-up, RPE-Planer, Timer, Info, Verlauf, Abschluss.
- `27-sicherung-wiederherstellen` – Sicherung in einer frischen Testkopie einspielen, ungültige Datei, CSV.
- Neu schreiben (nur bewusst!): `node tests/run.js berechnung inventur --update-golden`.

### Performance
`node tests/perf.js <port> <läufe> <cpu-drosselung>` misst Startzeit, Renderzeit je Ansicht (Median) und den
Satzabschluss im Gym, z. B. `node tests/perf.js 8766 9 4` (4-fache CPU-Drosselung ≈ älteres iPhone).

Voraussetzung: `playwright` muss für Node auffindbar sein (global installiert oder `npm i -D playwright`),
Chromium wird von Playwright mitgebracht. `tests/smoke.js` bleibt als schneller Einzeltest erhalten.
