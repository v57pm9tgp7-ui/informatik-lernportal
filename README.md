# MedienInfoLab – Informatik-Lernportal

## Version 1.15 – Klassenlisten & Lehrpersonenzugang

- 18 Lernende der **GS1B** und 19 Lernende der **GS1D** fest hinterlegt.
- Bekannte Schulmailadressen werden automatisch der richtigen Klasse zugeordnet.
- Auch noch nicht gestartete Lernende erscheinen in der Klassenübersicht mit **Noch nicht gestartet**.
- Die Startseite akzeptiert zusätzlich **christoph.marti@bffbern.ch**.
- Nur bei dieser Lehrpersonenadresse erscheint der Navigationslink **Lehrperson**.
- `/lehrperson/*` bleibt für Cloudflare Access vorgesehen; dort soll ausschliesslich `christoph.marti@bffbern.ch` erlaubt werden.

## Version 1.14 – Lehrpersonenbereich (GS1B / GS1D)

Neu ist ein Cloudflare-Worker mit D1-Anbindung. Der lokale Arbeitsstand der Lernenden bleibt weiterhin im Browser erhalten und wird zusätzlich datensparsam mit der Webseite synchronisiert.

### Lehrpersonenbereich

- erreichbar unter `/lehrperson/`
- vorgesehen für Schutz mit Cloudflare Access
- Klassen **GS1B** und **GS1D**
- neue Lernende erscheinen zunächst unter **Nicht zugeordnet** und können per Dropdown einer Klasse zugewiesen werden
- Übersicht über OneNote (10 Pflichtaufträge), DigiPen (5 Pflichtaufträge) und Scannen (6 Pflichtaufträge)
- Klassenkennzahlen: Lernende, heute aktiv, durchschnittlicher Pflichtfortschritt und Unterstützungsbedarf
- Detailansicht pro Lernender Person mit Status «Offen / Begonnen / Erledigt» je Auftrag
- Such- und Sortierfunktionen
- Fehleinträge können entfernt werden

### Datenschutz der Synchronisation

Übertragen werden Schulmailadresse, erledigte/begonnene Aufträge, zuletzt bearbeiteter Auftrag und Zeit der letzten Synchronisation. **Inhalte aus persönlichen Notizfeldern werden nicht an D1 übertragen.**

### Cloudflare-Einrichtung (einmalig)

1. D1-Datenbank mit dem Namen `mediainfolab` erstellen.
2. `schema.sql` in dieser D1-Datenbank ausführen.
3. Die D1-Datenbank-ID in `wrangler.toml` bei `database_id` einsetzen.
4. Das Projekt als Worker deployen; `dist` wird über Workers Static Assets ausgeliefert.
5. In Cloudflare Access eine Anwendung für `mediainfolab.com/lehrperson/*` erstellen und nur Ihre Lehrpersonen-Anmeldung zulassen. Die API des Cockpits liegt bewusst ebenfalls unter `/lehrperson/api/*` und wird dadurch von derselben Access-Regel geschützt.

> Die Lernenden-Seite selbst bleibt ohne Cloudflare Access. Dort reicht weiterhin die Eingabe einer `@stud.bffbern.ch`-Adresse.

---


## Version 1.11 – Arbeitsstand übertragen

- Interaktiver 3-Schritt-Umzugsassistent für den Wechsel von der bisherigen lokalen OneNote-HTML-Datei auf mediainfolab.com.
- JSON-Sicherungen werden vor dem Import geprüft und mit einer Vorschau zu erledigten Aufträgen, Häkchen und Notizen angezeigt.
- Vorhandene Daten auf der Webseite werden beim Import nicht überschrieben, sondern sicher mit dem alten Stand zusammengeführt.
- Drag-and-drop und Dateiauswahl für die Sicherungsdatei.
- Erfolgsansicht zeigt, was neu übernommen wurde.
- OneNote-Hilfe enthält neu den Reiter «Speichern» mit «Fortschritt als Datei sichern».
# Informatik-Lernportal

Version 1.10.0 · Schulmail-Zugang für Lernende · Schuljahr 2026/27

Statische Lernumgebung für den Informatikunterricht der GS1 an der BFF Bern. Die visuelle Leitidee lautet **«Ruhiger digitaler Arbeitsplatz»**: eine professionelle Arbeitsoberfläche mit klaren Wegen zu Wochen, Training und Fortschritt.

## Enthalten

- eigenständige Startseite als Arbeitsgrundlage für den Informatikunterricht bei Herrn Marti
- dreispaltige Kurzübersicht mit dem Stand aller Aufträge aus Woche 37 und 38
- klar sichtbare Wechselpunkte nach den verpflichtenden Aufträgen
- direkter Einstieg in die aktuelle Woche 38
- Wochenübersicht mit Woche 37 und Woche 38
- Unterrichtseinheit «DigiPen sinnvoll nutzen»
- Unterrichtseinheit «Scannen mit OneDrive»
- eigener OneDrive-Scan-Guide vom Schulkonto bis zur kontrollierten PDF
- sechs vergrösserbare, eigens erstellte Schrittgrafiken für die aktuelle Scanlogik
- deutschsprachige Videohilfe, die erst nach einem bewussten Klick geladen wird
- genaue Fehlerhilfe für Kamera, Randerkennung, Licht, Speicherort und Synchronisation
- fünf DigiPen-Pflichtaufträge mit vier Zusatzaufträgen sowie sechs Scan-Pflichtaufträge mit zwei Zusatzaufträgen
- gestufte Hilfe zu jedem Auftrag mit Startweg, Problemlösungen und Ersatzwegen
- OneNote Workshop ausschliesslich in Woche 37
- sicherer Import des bisherigen OneNote-Arbeitsstands aus einer JSON-Sicherung
- echte Screenshots aus dem anonymen OneNote-Demo-Notizbuch als vergrösserbare Orientierungshilfen im Seitendialog
- kompakter Trainingsbereich mit vorhandenen Wiederholungsaufträgen
- gemeinsame Fortschrittsansicht mit Sicherung und Wiederherstellung
- freie Navigation, Browser-Zurück und Rückkehr zum zuletzt bearbeiteten Auftrag
- lokale Speicherung der bisherigen Häkchen und Notizen
- deutlich vergrösserbare Schrift, Tastaturfokus, reduzierte Bewegung und Druckansicht
- vorgeschalteter Schulmail-Zugang für Lernende mit der Endung `@stud.bffbern.ch` ohne Passwort

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

Die neue Portaloberfläche ergänzt `informatikPortal_ui_v1`. Der Schulmail-Zugang speichert zusätzlich `mediainfolab_student_access_v1` lokal im Browser. Die eingegebene Adresse wird nicht an einen Server gesendet. Bestehende Antworten und Fortschritte werden nicht umbenannt oder gelöscht. Ohne Cloud-Anmeldung bleiben die Daten an den verwendeten Browser und das Gerät gebunden. Über «Fortschritt» lässt sich eine gemeinsame JSON-Sicherung erstellen und wieder laden.

## Prüfen

```bash
npm test
```

Der Test kontrolliert Einstiegspunkte, lokale Verknüpfungen, eindeutige IDs, JavaScript-Syntax, Navigation, Speicherschlüssel, Fortschrittszählung, Rückkehrzustand, Schriftvergrösserung und offensichtliche Zugangsdaten.

Die Tests prüfen zusätzlich die dreispaltige Kurzübersicht, die Wechselpunkte, die getrennten Wochenansichten, den OneNote-Import, alle Hilfen, beide Abschlussübersichten, die Screenshot-Vergrösserung, den Scan-Guide, seine sechs lokalen Grafiken, die verzögerte Videoladung und die eindeutigen Scan-Speicherorte.

Für die browsergestützten Prüfungen muss Playwright mit Chromium installiert sein:

```bash
npm run test:browser
```

## Änderungen in Version 1.10.0

- vorgeschaltete Schulmail-Abfrage auf allen fünf HTML-Einstiegspunkten ergänzt
- nur Adressen mit der Endung `@stud.bffbern.ch` werden akzeptiert
- kein Passwort und kein One-Time-PIN erforderlich
- Anmeldung wird lokal im verwendeten Browser gespeichert und gilt über Seitenwechsel hinweg
- kleine Funktion «Schulmail wechseln» ergänzt; Lernfortschritte bleiben dabei erhalten
- Hinweis zur lokalen Speicherung und zur fehlenden Serverübermittlung direkt im Anmeldefenster ergänzt
- bestehende Fortschritts- und Navigationslogik unverändert beibehalten

## Änderungen in Version 1.9.0

- Pflichtaufträge in der Kurzübersicht deutlich hellblau hinterlegt und mit «Pflicht» beschriftet
- Zusatzaufträge deutlich violett hinterlegt und mit «Zusatz» beschriftet
- farbige Legende für beide Auftragsarten direkt über der Übersicht ergänzt
- Bearbeitungsstatus weiterhin separat als «Offen», «In Arbeit» oder «Erledigt» dargestellt
- Kennzeichnung für Smartphone, grosse Schrift und Tastaturbedienung geprüft

## Änderungen in Version 1.8.0

- Kurzübersicht direkt unter dem Startbild ergänzt
- Woche 37, DigiPen und Scannen in drei klar getrennten Spalten dargestellt
- alle Grund-, Pflicht- und Zusatzaufträge mit «Offen», «In Arbeit» oder «Erledigt» angezeigt
- jede Aufgabe aus der Kurzübersicht direkt aufrufbar gemacht
- Wechsel nach OneNote-Auftrag 10, DigiPen-Pflichtauftrag 5 und Scan-Pflichtauftrag 6 sichtbar erklärt
- Wechselhinweis automatisch grün markiert, sobald alle erforderlichen Aufträge erledigt sind
- nächster noch offener Pflichtauftrag automatisch verlinkt
- Darstellung für Tablet, Smartphone und grosse Schrift angepasst

## Änderungen in Version 1.7.0

- Scan-Guide so angepasst, dass die Sprungnavigation beim Scrollen keine Inhalte oder Videos mehr verdeckt
- Scan-Workshop auf sechs Pflichtaufträge und zwei freiwillige Zusatzaufträge fokussiert
- OneDrive auf Microsoft365.com als verbindlichen Weg zum Wiederfinden der PDF ergänzt
- OCR-Auftrag als alltagsnahes Problem mit Infozettel und kontrollierter Nachricht neu aufgebaut
- Abschlussübersicht für den Scan-Workshop mit direkten Wegen zu offenen Aufträgen ergänzt
- Scan-Duell und wenig ergiebige Aufgaben entfernt; Aushang und Mini-Comic als freiwillige Reserve beibehalten
- DigiPen-Auftrag zur Partyplanung konkretisiert
- realistische Workshopdauer von 90–100 Minuten ausgewiesen
- automatisierte Browserprüfung für Navigation, Abschlusswege und responsive Darstellung ergänzt

## Änderungen in Version 1.6.0

- Scan-Guide als eigener, frei erreichbarer Bereich in der Hauptnavigation ergänzt
- vollständigen Ablauf vom richtigen Schulkonto über Ordner, Aufnahme und Bearbeitung bis zur kontrollierten PDF erklärt
- sechs ruhige und einheitliche Schrittgrafiken mit vergrösserbarer Ansicht und zuverlässiger Rückkehr eingebaut
- Speicherwege für PDF, Webseitendaten, OneNote und Teams klar voneinander abgegrenzt
- acht konkrete Problemlösungen für typische Fehler ergänzt
- deutschsprachiges OneDrive-Praxisvideo datensparsam als freiwillige Hilfe eingebunden
- Guide aus Woche 38, Scan-Workshop und jeder Auftragshilfe direkt erreichbar gemacht
- mobile Navigation und Scan-Kopfzeile für kleine Bildschirme angepasst
- deutsche Microsoft-Seite und Microsoft-Support als fachliche Grundlage im Guide ausgewiesen

## Änderungen in Version 1.5.0

- professionelle Startseite mit direktem Menü für Woche 38 neu gestaltet
- Woche 37 und Woche 38 als vollständig getrennte Ansichten umgesetzt
- genauen Importweg aus der bisherigen OneNote-HTML-Datei im Ordner `Dokumente` ergänzt
- Screenshot-Vergrösserung in einen Dialog auf derselben Seite verlegt; Rückkehr und Fokus bleiben erhalten
- redundante Sicherungs- und Reset-Schaltflächen aus den einzelnen Workshops entfernt
- DigiPen-Aufträge sprachlich vereinfacht und konsequent an Freizeit und Alltag ausgerichtet
- genaue OneNote-Vorbereitung vor jedem DigiPen-Auftrag ergänzt
- grafische Erklärung der Tastenkombination für Bildschirmfotos eingebaut
- konkretes Mindmap-Beispiel sowie echte OneNote-Screenshots ergänzt
- Abschlussübersicht nach DigiPen-Auftrag 9 mit direkten Wegen zu offenen Aufträgen ergänzt
- Scan-Aufträge mit eindeutigen OneDrive-Speicherorten und klarer Abgrenzung zu OneNote, Teams und Webseite versehen
- wenig ergiebigen Qualitätsvergleich durch eine handgeschriebene Packliste ersetzt
- neue Zusatzaufträge: Tafelbild, Papier-Rätsel, Mini-Comic und Scan-Duell
- Hilfen und Ersatzwege für alle Aufträge in allen drei Workshops geprüft

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


## D1-Binding
Das D1-Binding ist in `wrangler.toml` bereits vollständig eingetragen:
- Binding: `DB`
- Datenbank: `mediainfolab`
- Database ID: `4b3129c5-09a0-46e6-bc4a-8f952142af59`
Beim Deployment über Wrangler/GitHub muss das Binding deshalb nicht zusätzlich im Dashboard angelegt werden.
