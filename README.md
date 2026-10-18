# Candito Forever – iPhone-App (PWA)

Die App ist eine 1:1-Umsetzung des Dashboards „Candito Forever Programm“ als installierbare Web-App.

## Aufbau

| Ordner | Inhalt |
|---|---|
| `source/` | Quelltext des Dashboards (`src.html`, Programmdaten `data.js`, Side Quests `data_sq.js`) |
| `source/generator/` | Skripte, mit denen `data_sq.js` aus Canditos Excel-Tabellen erzeugt wurde |
| `src/` | PWA-Schicht: lokaler Speicher (IndexedDB), Offline/Updates (Service Worker), Manifest, Hinweise |
| `docs/` | **Fertige App** – wird von GitHub Pages veröffentlicht. Nie von Hand bearbeiten. |
| `logo/` | App-Logo als SVG |
| `tests/` | Rauchtest |

## Änderungen veröffentlichen

1. Änderung in `source/src.html` (bzw. `src/…`) vornehmen.
2. `python3 build.py` – baut `docs/` neu und vergibt eine neue Version (nur wenn sich etwas geändert hat).
3. Test: `cd docs && python3 -m http.server 8765` und `node tests/smoke.js`.
4. Commit + Push auf `main`. GitHub Pages veröffentlicht nach ca. 1 Minute.
5. Auf dem iPhone erscheint beim nächsten Öffnen „Neue Version verfügbar → Aktualisieren“.

Zurück zu einer früheren Version: den entsprechenden Commit wiederherstellen (`git revert`) und pushen.

## Daten

Trainingsdaten liegen **nur auf dem iPhone** (localStorage + IndexedDB, die letzten 60 Sicherungsstände)
und in den iCloud-Sicherungen, die du über „Sicherung herunterladen“ speicherst. Im Repository liegen keine Trainingsdaten.
`build/claude-artifact.html` ist dieselbe App für das Artifact auf claude.ai.
