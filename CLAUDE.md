# Hinweise für Claude

Dieses Repository ist Marcels Candito-Forever-App (PWA für das iPhone) – eine 1:1-Umsetzung des Dashboards
„Candito Forever Programm“ (Artifact https://claude.ai/artifact/BEbYNKfhLTv7Vkdwse19Z6). Antworten immer auf Deutsch.

## Arbeitsweise
- Quelltext der App: `source/src.html` (+ `source/data.js`, `source/data_sq.js`). Die PWA-Schicht liegt in `src/`.
- Nach jeder Änderung: `python3 build.py`, dann `cd docs && python3 -m http.server 8765` und `node tests/smoke.js`.
- `docs/` ist die veröffentlichte App (GitHub Pages, Branch `main`, Ordner `/docs`). Nie von Hand bearbeiten.
- Commit + Push auf `main` veröffentlicht. Auf dem iPhone erscheint dann „Neue Version verfügbar“.
- Soll das Artifact auf claude.ai gleich bleiben: `build/claude-artifact.html` (entsteht beim Bauen) dort veröffentlichen.

## Fachliche Regeln (von Marcel festgelegt)
- Programme exakt nach Canditos Vorgaben umsetzen; keine Gewichte erfinden.
- Gewichts-Empfehlungen sind erlaubt, müssen aber klar als Empfehlung gekennzeichnet sein (Vorgabe ≠ Empfehlung).
- RPE nie automatisch vorbelegen; Lasten nicht automatisch anpassen.
- Trainingsdaten liegen nur auf dem iPhone (localStorage + IndexedDB) – niemals Daten ins Repository schreiben.
- Das produktive Powerlifting Coach Cockpit wird von hier aus nie verändert.
