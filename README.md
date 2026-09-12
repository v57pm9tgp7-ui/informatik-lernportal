# Informatik-Lernportal

Version 1.4.0 · Selbstständige Workshop-Hilfen · Schuljahr 2026/27

Statische Lernumgebung für den Informatikunterricht der GS1 an der BFF Bern. Die visuelle Leitidee lautet **«Digitales Werkstattbuch»**: eine ruhige, professionelle Arbeitsoberfläche mit klaren Wegen zu Woche, Grundlagen, Training und Fortschritt.

## Enthalten

- Startseite mit direktem Wiedereinstieg
- Wochenübersicht mit Woche 37 und Woche 38
- Unterrichtseinheit «DigiPen sinnvoll nutzen»
- Unterrichtseinheit «Scannen mit OneDrive»
- je fünf Pflicht- und vier freiwillige Zusatzaufträge für DigiPen und Scannen
- gestufte Hilfe zu jedem Auftrag mit Startweg, Problemlösungen und Ersatzwegen
- OneNote Workshop in Woche 37 und weiterhin als Grundlage erreichbar
- sicherer Import des bisherigen OneNote-Arbeitsstands aus einer JSON-Sicherung
- echte Screenshots aus dem anonymen OneNote-Demo-Notizbuch als vergrösserbare Orientierungshilfen
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

## Änderungen in Version 1.4.0

- DigiPen- und Scan-Aufträge fachlich und didaktisch überarbeitet
- realistische Bearbeitungszeiten und eindeutige Kriterien «Fertig, wenn» ergänzt
- vorhandenes Notizbuch «OneNote Workshop [Vorname] [Nachname]» konsequent eingebunden
- Hilfen zu allen 18 Aufträgen als einblendbare, gestufte Problemlösung aufgebaut
- echte OneNote-Screenshots in den DigiPen- und Transferhilfen ergänzt
- vier freiwillige Zusatzaufträge je Workshop ergänzt; Pflichtfortschritt bleibt bei fünf Aufträgen
- Ersatzwege für fehlende OneNote-, OCR- und Mathematikfunktionen ergänzt
- Datenschutz, sichere Freigaben und Scanqualität stärker berücksichtigt

## Änderungen in Version 1.3.0

- anonymes Demo-Notizbuch mit Abschnitt «Workshop» und fünf realistischen Seiten eingerichtet
- Beispielprodukte für eine Startseite, einen Stift-Test sowie eine Link- und To-do-Seite erstellt
- bisherige leere Ansichten durch aussagekräftige Screenshots der ausgefüllten Demoseiten ersetzt
- zusätzliche Orientierungshilfen bei den Aufträgen 3 und 7 ergänzt

## Änderungen in Version 1.2.0

- echte Screenshots der aktuellen OneNote-Weboberfläche bei den Aufträgen 1, 2, 5, 6 und 9 ergänzt
- Bilder für Notizbuchnavigation, «Einfügen» und «Zeichnen» zugeschnitten und vergrösserbar eingebunden
- Unterschiede zwischen Webversion und installierter OneNote-App dort kenntlich gemacht, wo sie den Auftrag beeinflussen können

## Änderungen in Version 1.1.0

- OneNote Workshop der Woche 37 zugeordnet und zusätzlich unter «Grundlagen» belassen
- Auftrag 1 an das bereits vorbereitete Notizbuch `OneNote Workshop [Vorname] [Nachname]` angepasst
- Import einer bisherigen OneNote-JSON-Sicherung ergänzt
- Import führt alte und vorhandene Angaben zusammen, ohne bestehende Notizen und Häkchen zu überschreiben
- automatische Prüfungen für Woche 37, Notizbuchname und OneNote-Import ergänzt

## Änderungen in Version 1.0.0

- bisherige Einzeldateien zu einer gemeinsamen Lernumgebung verbunden
- einheitliche Hauptnavigation und Orientierungspfad ergänzt
- Start-, Wochen-, Grundlagen-, Trainings- und Fortschrittsansicht aufgebaut
- direkte Vor- und Zurücknavigation bei den geöffneten Aufgaben ergänzt
- OneNote-Fortschrittsanzeige von 10 auf die vorhandenen 12 Aufträge korrigiert
- bestehende Speichermechanismen unverändert weiterverwendet
- gemeinsame Sicherung aller drei Lernbereiche ergänzt
- Lesbarkeit, Tastaturbedienung, responsive Darstellung und Druckansicht verbessert
