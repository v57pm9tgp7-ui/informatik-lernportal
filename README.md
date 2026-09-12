# Informatik-Lernportal

Version 1.0.0 · Grundstruktur für das Schuljahr 2026/27

Statische Lernumgebung für den Informatikunterricht der GS1 an der BFF Bern. Die visuelle Leitidee lautet **«Digitales Werkstattbuch»**: eine ruhige, professionelle Arbeitsoberfläche mit klaren Wegen zu Woche, Grundlagen, Training und Fortschritt.

## Enthalten

- Startseite mit direktem Wiedereinstieg
- Wochenübersicht mit Woche 38
- Unterrichtseinheit «DigiPen sinnvoll nutzen»
- Unterrichtseinheit «Scannen mit OneDrive»
- Grundlagen-Workshop «OneNote clever nutzen»
- kompakter Trainingsbereich mit vorhandenen Wiederholungsaufträgen
- gemeinsame Fortschrittsansicht mit Sicherung und Wiederherstellung
- freie Navigation, Browser-Zurück und Rückkehr zum zuletzt bearbeiteten Auftrag
- lokale Speicherung der bisherigen Häkchen und Notizen
- deutlich vergrösserbare Schrift, Tastaturfokus, reduzierte Bewegung und Druckansicht

Die Unterrichtspräsentationen sind separate Unterrichtsmaterialien und nicht Teil dieser Website-ZIP.

## Verzeichnisstruktur

```text
dist/
  index.html
  onenote.html
  digipen.html
  scannen.html
  assets/
tests/
package.json
README.md
```

## Lokal öffnen

Die Website kann direkt über `dist/index.html` geöffnet werden. Für einen lokalen Webserver:

```bash
npm run dev
```

Danach ist die Website unter `http://127.0.0.1:4173/` erreichbar.

## Auf GitHub oder Cloudflare Pages übernehmen

Den Inhalt dieser ZIP-Datei in das gewünschte Repository kopieren. Für eine statische Bereitstellung gilt:

- Build-Befehl: keiner
- Veröffentlichungsverzeichnis: `dist`
- Startdatei: `dist/index.html`

## Speicherung

Die Website verwendet weiterhin die bestehenden Browser-Speicherstände:

- `onenoteWorkshopGS1_student_v3`
- `digitalArbeiten_digipen_v1`
- `digitalArbeiten_scannen_v1`

Die neue Portaloberfläche ergänzt nur `informatikPortal_ui_v1`. Bestehende Antworten und Fortschritte werden nicht umbenannt oder gelöscht. Ohne Cloud-Anmeldung bleiben die Daten an den verwendeten Browser und das Gerät gebunden. Über «Fortschritt» lässt sich eine gemeinsame JSON-Sicherung erstellen und wieder laden.

## Prüfen

```bash
npm test
```

Der Test kontrolliert Einstiegspunkte, lokale Verknüpfungen, eindeutige IDs, JavaScript-Syntax, Navigation, Speicherschlüssel, Fortschrittszählung, Rückkehrzustand, Schriftvergrösserung und offensichtliche Zugangsdaten.

Zusätzlich wurde die Website in einem echten Browser auf Navigation, Eingabespeicherung, Browser-Zurück, Auftragswechsel, grosse Schrift und die gemeinsamen Workshop-Kopfzeilen geprüft.

## Änderungen in Version 1.0.0

- bisherige Einzeldateien zu einer gemeinsamen Lernumgebung verbunden
- einheitliche Hauptnavigation und Orientierungspfad ergänzt
- Start-, Wochen-, Grundlagen-, Trainings- und Fortschrittsansicht aufgebaut
- direkte Vor- und Zurücknavigation bei den geöffneten Aufgaben ergänzt
- OneNote-Fortschrittsanzeige von 10 auf die vorhandenen 12 Aufträge korrigiert
- bestehende Speichermechanismen unverändert weiterverwendet
- gemeinsame Sicherung aller drei Lernbereiche ergänzt
- Lesbarkeit, Tastaturbedienung, responsive Darstellung und Druckansicht verbessert

