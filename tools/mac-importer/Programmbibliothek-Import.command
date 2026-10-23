#!/bin/bash
# Candito Forever – Programmbibliothek: Bild-PDFs auf dem Mac lokal erkennen (macOS-Texterkennung) und als JSON für die App ausgeben.
# Ohne Angabe fragt das Programm nach dem Ordner mit den PDFs. Mit Angabe: ./Programmbibliothek-Import.command <Ordner|PDFs …>
DIR="$(cd "$(dirname "$0")" && pwd)"
osascript -l JavaScript "$DIR/importer.js" "$DIR" "$@"
echo
read -n 1 -s -r -p "Fertig. Eine Taste drücken, um das Fenster zu schließen."
echo
