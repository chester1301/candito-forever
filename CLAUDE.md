# Hinweise für Claude

Dieses Repository ist Marcels Candito-Forever-App (PWA für das iPhone) – eine 1:1-Umsetzung des Dashboards
„Candito Forever Programm“ (Artifact https://claude.ai/artifact/BEbYNKfhLTv7Vkdwse19Z6). Antworten immer auf Deutsch.

## Arbeitsweise
- Quelltext der App: `source/src.html` (+ `source/data.js`, `source/data_sq.js`, `source/bib-core.js` = Parser-Kern der Programmbibliothek, `source/bib.js` = Programmbibliothek in der App). Die PWA-Schicht liegt in `src/`.
- `tools/mac-importer/` = Mac-Batch-Importer für Bild-PDFs (nutzt denselben Kern; `bib-core.js` dort wird beim Bauen kopiert, die ZIP landet in `docs/tools/`).
- Nach jeder Änderung: `python3 build.py`, dann `node tests/run.js` (komplette Suite, startet den Server selbst; `tests/README.md`).
  Scheitert `Plan-Daten – Snapshot`, wurde der Plan geändert: nur nach Abgleich mit Canditos Original `--update-golden`.
  Scheitert `Optik – Screenshots`, Differenzbilder in `tests/visual/_out/` ansehen; nur gewollte Änderungen mit
  `node tests/run.js visual --update-visual` übernehmen.
- `docs/` ist die veröffentlichte App (GitHub Pages, Branch `main`, Ordner `/docs`). Nie von Hand bearbeiten.
- Commit + Push auf `main` veröffentlicht. Auf dem iPhone erscheint dann „Neue Version verfügbar“.
- Soll das Artifact auf claude.ai gleich bleiben: `build/claude-artifact.html` (entsteht beim Bauen) dort veröffentlichen.

## Fachliche Regeln (von Marcel festgelegt)
- Programme exakt nach Canditos Vorgaben umsetzen; keine Gewichte erfinden.
- Gewichts-Empfehlungen sind erlaubt, müssen aber klar als Empfehlung gekennzeichnet sein (Vorgabe ≠ Empfehlung).
- RPE nie automatisch vorbelegen; Lasten nicht automatisch anpassen.
- Trainingsdaten liegen nur auf dem iPhone (localStorage + IndexedDB) – niemals Daten ins Repository schreiben.
- Programmbibliothek: importierte Programme liegen in `cf-bib` (+ IndexedDB `bib/lib`, in jeder Sicherung). Freigegebene Erweiterung des Datenmodells: `S.meta.lib = {act, st, rm}`; trainierte Bibliotheksprogramme speichern unter eigenem Präfix `lb…-wNdM`. Nur vollständige, eindeutige Tage sind trainierbar.
- Das produktive Powerlifting Coach Cockpit wird von hier aus nie verändert.
