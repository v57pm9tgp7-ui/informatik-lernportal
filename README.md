# MedienInfoLab – Version 1.20

## Neuer dauerhafter Bereich «Projekte»

`projekte.html` bietet fünf vollständige Zusatzprojekte, unabhängig von Unterrichtswochen:

1. **Erklär’s besser:** Bildanleitung oder Mini-Tutorial als Video.
2. **Mein digitales Cockpit:** eine funktionierende OneNote-Startseite.
3. **Alles in einer PDF:** ein geprüftes Dossier aus drei Seiten; Übungs-PDF und Seitenbilder sind enthalten.
4. **Echt oder Fake?:** ein Faktencheck mit zwei Quellen, konkreten Belegen und begründetem Urteil.
5. **Fünf Tricks, die bleiben:** fünf selbst getestete, nachvollziehbar erklärte Digitaltipps.

Jedes Projekt beginnt mit einer Kurzübersicht. Es folgen sechs einzeln aufrufbare Schritte mit Beispielen, Hilfen, einem Kontrollpunkt und freiwilligen Notizen. Vorlagen, sinnvolle Zwischenstände für wenig Zeit, Qualitätslisten, Druckfassungen und zwei Vertiefungen sind vorhanden. Ein neuer Navigationseintrag und ein Kasten auf der Startseite führen dorthin.

### Speicherung und Abgabe

Projekt-Häkchen und Notizen bleiben im lokalen Browser, getrennt nach der eingegebenen Schulmail. Der neue Bereich verändert die bestehende D1-Synchronisation der Workshops nicht. Für Projekte gibt es **keine automatische Gerätesynchronisation, keine automatische Übermittlung an den Lehrpersonenbereich und keine automatische Abgabe**. Die Oberfläche erklärt das ausdrücklich. Lernende können eine JSON-Sicherung exportieren und nach Bestätigung mit derselben Schulmail importieren. Produktdateien bleiben in den verwendeten Schulprogrammen beziehungsweise im schulischen OneDrive.

Die Schulmail-Eingabe ist keine Authentifizierung. Für persönliche Arbeit sind eigene Geräte oder Browserprofile sinnvoll. Die vorhandene Cloudflare-Absicherung des Lehrpersonenbereichs bleibt unverändert.

### Weitere Projekte ergänzen

Die Projektinhalte stehen zentral in `dist/assets/projects-data.js`. Ein weiteres Objekt im `projects`-Array ergänzt automatisch Katalog, Schrittnavigation, Vorlage und Druckansicht. Bestehende Projekt-IDs müssen erhalten bleiben, weil Arbeitsstände daran gebunden sind. Neue IDs dürfen nur Kleinbuchstaben, Ziffern und Bindestriche enthalten. Jedes Objekt braucht dieselben Pflichtfelder und mindestens ein Hilfsangebot je Schritt. Neue Themenfarben beziehungsweise Illustrationen können in `projects.css` und `projects.js` ergänzt werden. Die Datei- und Backup-Version nur bei einer bewusst migrierten Formatänderung erhöhen.

`projects-core.js` kapselt Routen, Validierung, Sicherungsformat und Abschlusslogik. `projects.js` stellt Ansichten und Interaktionen bereit. Die Übungsdateien für das PDF-Projekt liegen in `dist/assets/projects/`.

### Geprüft

- bestehende Struktur- und Syntaxprüfungen: `npm test`
- 14 Projektprüfungen: `npm run test:projects` – darunter alle 41 Bildschirmansichten und 5 Druckfassungen als erzeugtes HTML, Sicherungsrundlauf, Kontotrennung, echte Eingabe- und Abschluss-Ereignisse sowie Verhalten bei blockierter Speicherung
- Übungs-PDF: drei Seiten gerendert und visuell kontrolliert

Die Website wurde in dieser Arbeitsumgebung nicht in einem echten Browser visuell geprüft. Die verfügbaren Tests verwenden Node und eine minimale DOM-Testumgebung; sie ersetzen keine Prüfung im produktiven Schulbrowser.

# MedienInfoLab – Version 1.19

## HP Slim Rechargeable Pen ergänzt

Der DigiPen-Guide enthält neu **drei** in der Klasse verwendete HP-Stiftmodelle. Neu hinzugekommen ist der **HP Slim Rechargeable Pen (630W7AA)** mit der kabelgebundenen **HP Slim Rechargeable Pen Charger-Ladestation (4X491AA)**.

- eigenes Modellbild im Stil der bisherigen DigiPen-Grafiken
- klare Unterscheidung der Ladearten
- Slim Pen: Laden über Pogo-Pins in der USB-A-Ladestation
- Hinweis: 20 Sekunden Laden reichen laut HP für bis zu 70 Minuten Schreiben
- OneNote- und DigiPen-Hilfen wurden so angepasst, dass sie nicht mehr pauschal ein USB-C-Kabel verlangen
- die zwei bisherigen Modelle und alle bestehenden Aufträge bleiben erhalten

# MedienInfoLab – Version 1.18

## Persönlicher Link zum Lehrpersonenbereich

Auf der normalen Webseite erscheint der Link **Lehrpersonenbereich** ausschliesslich dann, wenn lokal exakt `christoph.marti@bffbern.ch` als BFF-Adresse verwendet wird. Auf der Startseite erscheint zusätzlich ein persönlicher Lehrpersonen-Kasten. Für Lernende mit `@stud.bffbern.ch` werden weder Navigationslink noch Kasten erzeugt. Der eigentliche Pfad `/lehrperson/` bleibt zusätzlich durch Cloudflare Access geschützt und erlaubt nur `christoph.marti@bffbern.ch`.

# MedienInfoLab – Informatik-Lernportal

## Version 1.17 – Lehrpersonenbereich fertig ausgebaut

Der Lehrpersonenbereich unter `/lehrperson/` ist nun als vollständiges Unterrichts-Cockpit für **GS1B** und **GS1D** aufgebaut.

### Neu im Lehrpersonenbereich

- **«Unterricht heute»** pro Klasse: bis zu 8 Fokus-Aufträge auswählen, Überschrift und kurzen Hinweis schreiben und direkt für die Lernenden sichtbar machen.
- Fokus von **GS1B auf GS1D** bzw. umgekehrt kopieren.
- Live-Auswertung des heutigen Fokus: **fertig / in Arbeit / noch nicht begonnen**.
- **Fokus-Matrix**: alle Lernenden und alle heutigen Fokus-Aufträge in einer kompakten Tabelle.
- Verbesserte Klassenübersicht mit Filtern: Dringend, Beobachten, Nicht gestartet, Auf Kurs, Fertig und **Heute noch offen**.
- Such- und Sortierfunktionen sowie Fortschrittsbalken für OneNote, DigiPen und Scannen.
- Detailansicht pro Lernender Person mit heutigem Fokus und jedem einzelnen Auftrag.
- **CSV-Export** der aktuell gewählten Klasse bzw. Ansicht.
- Druckansicht für Klassenübersichten.
- Auftragssteuerung weiterhin pro Klasse: **Pflicht / Zusatz / Verborgen / Abgeschlossen**.
- 18 Lernende der GS1B und 19 Lernende der GS1D fest hinterlegt und automatisch zugeordnet.

### Neu für Lernende

Auf der Startseite erscheint – wenn von der Lehrperson aktiviert – ein deutlicher Bereich **«Unterricht heute»**. Er zeigt:

- die aktuelle Überschrift und den Hinweis von Herrn Marti,
- die ausgewählten Fokus-Aufträge,
- den eigenen Status **Offen / In Arbeit / Erledigt**,
- direkte Links zum passenden Auftrag,
- den eigenen Fortschritt innerhalb des heutigen Fokus.

Die Anzeige aktualisiert sich aus D1; die persönlichen Notiztexte bleiben weiterhin ausschliesslich lokal auf dem Gerät.

## Datenschutz / gespeicherte Daten

D1 speichert nur die für die Unterrichtsübersicht nötigen Daten:

- Schulmailadresse,
- Klassenzuordnung,
- begonnene und erledigte Aufträge,
- Zeit der letzten Aktivität,
- Auftragssteuerung pro Klasse,
- von der Lehrperson festgelegten Unterrichtsfokus.

**Keine persönlichen Notiztexte der Lernenden werden an D1 übertragen.**

## Cloudflare

Das D1-Binding ist bereits in `wrangler.toml` eingetragen:

- Binding: `DB`
- Datenbank: `mediainfolab`
- Database ID: `4b3129c5-09a0-46e6-bc4a-8f952142af59`

Die Tabellen `assignment_settings` und `class_today` werden vom Worker bei Bedarf automatisch angelegt. Für Version 1.17 ist daher **kein zusätzlicher manueller SQL-Schritt** nötig.

Der Lehrpersonenbereich und seine API bleiben durch Cloudflare Access unter `mediainfolab.com/lehrperson/*` geschützt. Die Allow-Regel soll ausschliesslich `christoph.marti@bffbern.ch` zulassen.

## Projektstruktur

```text
dist/
  index.html
  onenote.html
  digipen.html
  scannen.html
  lehrperson/index.html
  assets/
src/
  worker.js
schema.sql
wrangler.toml
tests/
```

## Prüfen

```bash
npm test
```
