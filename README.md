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
