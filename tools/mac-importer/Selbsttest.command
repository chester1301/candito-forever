#!/bin/bash
# Candito Forever – Programmbibliothek: Selbsttest des Mac-Importers (Vision-Texterkennung, Parser, Dubletten, Zeit, Speicher).
# Ergebnis: Selbsttest-Ergebnis.txt in diesem Ordner.
DIR="$(cd "$(dirname "$0")" && pwd)"
osascript -l JavaScript "$DIR/importer.js" "$DIR" --selbsttest
echo
read -n 1 -s -r -p "Fertig. Eine Taste drücken, um das Fenster zu schließen."
echo
