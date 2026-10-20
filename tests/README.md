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

Voraussetzung: `playwright` muss für Node auffindbar sein (global installiert oder `npm i -D playwright`),
Chromium wird von Playwright mitgebracht. `tests/smoke.js` bleibt als schneller Einzeltest erhalten.
