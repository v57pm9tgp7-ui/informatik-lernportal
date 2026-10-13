# MedienInfoLab – Version 1.24

## Einheitliche Tastenbeschriftung «Ctrl»

Alle sichtbaren Tastenkombinationen, Hilfetexte, Projektvorlagen und Projektmedien verwenden neu die auf den Schulgeräten sichtbare Bezeichnung `Ctrl` statt der deutschen Alternativbezeichnung. Die zugrunde liegenden Medienquellen und Generatoren sind ebenfalls angepasst, damit die Schreibweise bei späteren Aktualisierungen erhalten bleibt.

### Feste redaktionelle Konvention

Auf MedienInfoLab wird die Steuerungstaste immer als `Ctrl` bezeichnet. Andere Abkürzungen dürfen in neuen oder überarbeiteten Lerninhalten nicht verwendet werden. Vor einer Veröffentlichung prüft `npm test` diese Vorgabe für alle ausgelieferten Textdateien.

---

# MedienInfoLab – Version 1.23

## Woche 42: Pflichtteil, Wahlbereich, Projekte nach Absprache

`index.html#woche-42` ist die aktuelle Wochenansicht für den 12.–16. Oktober 2026. Startseite und Wochenliste führen dorthin. Die Anleitung erklärt Vorbereitung, Pflichtabschluss, Wahlaufgaben, das Gespräch vor dem Projektstart sowie den Abschluss der Lektion.

Die Übersicht übernimmt vorhandene Workshop-Häkchen und berücksichtigt die Klasseneinstellungen der Lehrperson. Standardmässig umfasst der Pflichtteil zehn OneNote-, fünf DigiPen- und sechs Scan-Aufträge. Die Scan-Anzeige «Auftrag 6» verwendet weiterhin die bestehende interne ID 7. Pflicht- und Wahlbereiche verlinken direkt zu den richtigen Aufträgen. Der nächste offene Pflichtauftrag hat Vorrang vor Wahlaufgaben. Fertige Häkchen erteilen nie eine Projektfreigabe; dafür bleibt die Absprache mit Herrn Marti erforderlich. Der Wahlbereich ist eine Auswahl, keine neue Pflicht, alle Zusatzaufgaben zu erledigen.

Prüfung: `npm test` und `npm run test:week42` (Routen, vorhandene Arbeitsstände, Scan-Nummerierung, Bereichswechsel und Klasseneinstellungen). Eine visuelle Browserprüfung ist in dieser Arbeitsumgebung nicht verfügbar.

---

# MedienInfoLab – Version 1.22

## Alle fünf Beispielvideos mit Sprecherinnenstimme

Die fünf Projektfilme enthalten jetzt eine fest eingebaute deutsche AAC-Tonspur mit derselben weiblichen neuronalen Stimme (Seraphina). Das redaktionelle Stimmprofil ist eine sympathische junge erwachsene Lernbegleiterin. Die Kommentare erklären Entscheidungen, lenken den Blick, benennen typische Schwierigkeiten und führen zu einem konkreten eigenen Versuch. Sie sind für alle 36 Szenen eigens geschrieben und lesen die Bildschirmkarten nicht einfach vor.

- Die tatsächlich erzeugte Sprechdauer bestimmt Szenenlänge und Kapitelmarken. Hervorhebungen folgen den gesprochenen Abschnitten; Denkpausen bleiben erhalten.
- Deutsche VTT-Untertitel enthalten den vollständigen gesprochenen Text. Ihre Zeitmarken stammen aus den Wortzeiten der Sprachsynthese. Im Video bleibt unterhalb der Beispiele Platz für zwei Untertitelzeilen.
- Die ganze Erklärung steht zusätzlich bei jeder Grafik und als herunterladbare Textdatei zur Verfügung. Zeitangaben bleiben auch bei Sekundenbruchteilen lesbar.
- Die Filme bleiben lokal bereitgestellte MP4-Dateien ohne Autoplay. Zum Abspielen wird kein Sprachdienst aufgerufen. Die Website kennzeichnet die KI-generierte Stimme.
- Alle Tonspuren werden in zwei Durchgängen auf vergleichbare Lautheit gebracht: Ziel −16 LUFS, maximale True Peaks −1,5 dBTP, keine Hintergrundmusik.

### Reproduzierbare Erstellung

`tools/project-narration.json` enthält das Stimmbriefing und die vollständigen Kommentare mit Bildfokus und Denkpausen. `tools/build-project-audio.py` erzeugt daraus Audio und Wortzeiten mit `edge-tts==7.2.8` (Microsoft Online Speech). Dabei werden nur die öffentlichen Unterrichtstexte übertragen, keine Daten von Lernenden. Die Synthese setzt Zugang zum Sprachdienst voraus. Zwischenstände werden nach Text und Stimme gehasht; unveränderte Passagen werden wiederverwendet.

```sh
python tools/build-project-audio.py --output /absoluter/pfad/audio-cache
python tools/build-project-media.py --audio-manifest /absoluter/pfad/audio-cache/manifest.json
```

Voraussetzungen: Python, Pillow, edge-tts und ffmpeg mit libx264/AAC. Der Audio-Cache liegt ausserhalb des Repositorys. Die endgültigen Filme, Untertitel, Sprechtexte, Grafiken und Kapitelmetadaten werden gemeinsam versioniert. Der Mediengenerator akzeptiert keine stummen neuen Filme und lehnt Tonspuren ab, deren Textgrundlage nicht mehr aktuell ist. `--stills-only` benötigt ebenfalls das passende Audiomanifest, damit Laufzeiten und Transkripte konsistent bleiben.

### Prüfung

`npm test` und `npm run test:projects` prüfen die Website und die vollständige Übereinstimmung von Sprechtexten, Untertiteln und sichtbaren Transkripten. Zusätzlich werden Audio-/Videostreams, Decodierung, Laufzeit, Lautheit und Spitzenpegel mit ffmpeg/ffprobe überprüft. Eine Hörabnahme und die visuelle Prüfung im produktiven Schulbrowser sind durch diese technischen Prüfungen nicht ersetzt.

---

# MedienInfoLab – Version 1.21

## Projekte mit Cockpit, Werkbank und Beispielvideos

Der eigenständige Bereich `/projekte.html` führt weiterhin zuerst in die Kurzübersicht. Die fünf Aufträge wurden zu einer zusammenhängenden Arbeitsumgebung ausgebaut:

- **Mein Cockpit:** aktueller Klassenfokus aus der vorhandenen `/api/today`-Schnittstelle, bewusste Einschätzung der Pflichtarbeit, frei wählbare Zeit für heute, Abschlussreserve, konkrete Arbeitsetappe und Vorschau auf die Folgelektion. Eine Start-/Pause-Funktion misst das gewählte Zeitfenster. Nur ein Projekt-Timer läuft gleichzeitig. Zeitablauf setzt keine Häkchen. Teilweise erledigte Schritte können mit einer Restzeitschätzung geplant werden. Zu viel Pflichtarbeit wird ausdrücklich als Überhang angezeigt.
- **Wiedereinstieg:** Am Lektionsende tatsächlichen Speicherort, nächsten Handgriff und gegebenenfalls übrige Pflichtarbeit festhalten. Die letzten zwölf Etappen bleiben sichtbar. Das Folgedatum ist eine Planungshilfe, keine Benachrichtigung.
- **Übersichtliche Schritte:** kleine Teilaufgaben, aufklappbare Erklärungen, passende grafische Beispiele, Hilfe am richtigen Ort und eigener Ergebnischeck. Auf kleinen Bildschirmen ist die Schrittnavigation zunächst eingeklappt.
- **Meine Werkbank:** drei wählbare Vorlagen pro Projekt (einschliesslich freier Eingabe), direkt bearbeitbare Texte, eigene Bereiche, Reihenfolge ändern, Bild-Upload und Einfügen aus der Zwischenablage. Vorlagen werden erst nach einer Vorschau und ausdrücklicher Übernahme eingesetzt. Ein Vorlagenwechsel ist innerhalb der Sitzung rückgängig zu machen. Ersetzen und Entfernen erfordern eine konkrete Bestätigung.
- **Weiterverwenden:** Vorschau, Kopieren für OneNote/Word, Druck als PDF, selbstständige HTML-Ansicht und bearbeitbare JSON-Sicherung. Das OneNote-Cockpit wird im eigentlichen OneNote funktionsfähig gemacht; der PDF-Plan ersetzt die zu erstellende dreiseitige PDF nicht. Die Oberfläche erklärt diese Unterschiede.
- **Video & Beispiele:** fünf lokal bereitgestellte MP4-Videos (viermal 100 Sekunden, einmal 108 Sekunden), 36 originale SVG-Grafiken, Kapitelmarken, VTT-Texterläuterungen, schriftliche Bildfolgen und vergrösserbare Ansichten. Keine externen Video-Einbettungen und kein Autoplay. Die Filme verwenden bewegte Hervorhebungen und eingeblendete Texte, **keine Sprecherstimme**. Beispieloberflächen sind ausdrücklich als Beispielaufbau bezeichnet.

### Speicherung und Kompatibilität

Bestehende v1-Arbeitsstände bleiben lesbar; der Speicherschlüssel wird beibehalten. Die validierte Struktur wird um `planner`, `studio` und kleine Teilaufgaben-Häkchen erweitert. Projektdaten bleiben lokal und von der bestehenden D1-Workshop-Synchronisation getrennt. Die Sicherung enthält jetzt auch Werkbank-Texte und eingefügte Bilder. Externe Video-, PDF- und OneNote-Produkte müssen zusätzlich gesichert werden. Änderungen an einem bereits geprüften Werkbank-Produkt setzen dessen Qualitätscheck zurück. Ein Wechsel des Arbeitswegs verlangt bei bestehendem Fortschritt eine Bestätigung.

Bilder werden lokal über Canvas auf maximal 1280 Pixel Breite, 1600 Pixel Höhe und 180.000 Data-URL-Zeichen reduziert; die zusätzliche Bildaufnahme endet bei rund 2,2 Millionen Zeichen Gesamtstand. Browserquoten können wegen anderer Daten früher erreicht werden. In diesem Fall bleibt die Sitzung exportierbar und zeigt eine deutliche Speicherwarnung. Importdateien sind auf 6 MB begrenzt, kontogebunden und werden nur nach Bestätigung übernommen. Kontowechsel verwerfen offene Übernahmeaktionen.

### Inhalte und weitere Projekte

- `projects-data.js`: die vollständigen Lernaufträge, Qualitätskriterien und Quellen.
- `projects-learning.js`: Zeitplanung, validierte Daten und die 15 Vorlagen.
- `projects-workspace.js`: Cockpit, Werkbank, Medienansichten und zugehörige Abläufe.
- `projects-core.js` / `projects.js`: Kontostand, Routing und allgemeine Oberfläche.
- `tools/project-media.json`: redaktionelle Grundlage der 36 Szenen.
- `tools/build-project-media.py`: reproduzierbare Erstellung der SVGs, Poster, VTT-Dateien, Kapitelmetadaten und MP4s mit Pillow/ffmpeg. `--stills-only` überspringt das Rendern der Videos.

Beim Erweitern eine stabile Projekt-ID, sechs Lernschritte, Qualitätskriterien, Vorlagen und passende Medien ergänzen. Bestehende IDs nicht ändern. Die neue Struktur bleibt unabhängig von einzelnen Unterrichtswochen.

### Prüfung

`npm test` prüft die gesamte vorhandene Seitenstruktur und JavaScript-Syntax. `npm run test:projects` prüft 56 Bildschirmansichten und 5 Druckansichten als erzeugtes HTML sowie die tatsächlichen Ereignisabläufe in einer DOM-Testumgebung. Dazu gehören Zeitbudget und Überhang, Pausieren, Wiedereinstieg, Altstände, Sicherungsrundlauf mit Bildern, Kontotrennung, Vorlagenvorschau und -ersetzung, Bearbeiten, Sortieren, Entfernen, HTML-Ausgabe und ungültig gewordene Qualitätschecks. Die fünf H.264-Videos werden zusätzlich vollständig mit ffmpeg decodiert; Originalgrafiken werden visuell kontrolliert.

Eine visuelle Prüfung der Website und realer Zwischenablage-/Druck-/Upload-Abläufe im Browser ist in dieser Arbeitsumgebung nicht verfügbar. Automatisierte Struktur- und Ereignisprüfungen ersetzen diesen Schritt nicht.

---

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
