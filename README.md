# MedienInfoLab – Woche 43

Diese Ergänzung ist für das bestehende GitHub-Repository `v57pm9tgp7-ui/informatik-lernportal` mit Cloudflare Worker und statischen Assets im Verzeichnis `dist/` vorbereitet.

## Dateien

- `dist/woche-43.html`: kompletter 90-Minuten-Lerncoach, 15 Übungen, drei Wissenstests, 40-Minuten-Probeprüfung, Hilfen und Reserve
- `dist/woche-43-vorlagen.html`: vier fiktive A4-Scanvorlagen zum Drucken

**Wichtig:** Die beiden Dateien ergänzen die bestehende Website. Bestehende Dateien, Datenbanken, Lehrpersonenbereich, Häkchen und die Wochen 37, 38 und 42 werden nicht ersetzt.

## Upload

1. ZIP entpacken.
2. Im bestehenden Repository unter `dist/` die beiden HTML-Dateien hochladen (nicht in ein zweites `dist`-Unterverzeichnis verschieben).
3. Auf der Startseite und im Wochenverzeichnis führt der Link «Woche 43» zur Datei `woche-43.html`. Bei einem Neuaufbau aus diesem ZIP muss dieser Link im bestehenden `dist/index.html` ergänzt werden; siehe `GITHUB-HINWEISE.md`.
4. Nach dem Commit auf `main` das Cloudflare-Deployment prüfen.

Die HTML-Seiten binden die bereits vorhandenen Schulmail-Zugangskomponenten aus `dist/assets/` ein. Als eigenständige Kopien ausserhalb des Repositorys funktionieren diese Komponenten nicht automatisch.

Lehrpersonenunterlagen sind **nicht** Bestandteil des öffentlichen `dist`-Uploads. Für den Unterricht wurden sie separat als Worddateien erstellt.
