# Cloudflare-Einrichtung für den Lehrpersonenbereich

Diese Version braucht zusätzlich zu den statischen Dateien einen Cloudflare Worker und eine D1-Datenbank.

## 1. D1-Datenbank erstellen

- Datenbankname: `mediainfolab`
- Danach den Inhalt von `schema.sql` einmal ausführen.
- Die angezeigte Database ID kopieren.

## 2. D1 mit dem Worker verbinden

In `wrangler.toml` ersetzen:

`4b3129c5-09a0-46e6-bc4a-8f952142af59`

mit der echten Database ID.

Binding-Name muss `DB` bleiben.

## 3. Projekt deployen

Das vollständige Projekt deployen. `dist/` enthält die Webseite, `src/worker.js` die API für die Synchronisation und das Lehrpersonen-Cockpit.

## 4. Lehrpersonenbereich schützen

Cloudflare Access nur für diesen Pfad einrichten:

`mediainfolab.com/lehrperson/*`

Die Lehrpersonen-API liegt ebenfalls unter `/lehrperson/api/*` und wird dadurch mit derselben Access-Regel geschützt.

Die Lernenden-Webseite (`mediainfolab.com/`) bleibt ausserhalb von Access.

## 5. Erster Test

1. Lernenden-Webseite mit einer Testadresse `...@stud.bffbern.ch` öffnen.
2. Einen Auftrag bzw. ein Häkchen bearbeiten.
3. Lehrpersonenbereich öffnen: `https://mediainfolab.com/lehrperson/`
4. Die neue Adresse sollte unter «Nicht zugeordnet» erscheinen.
5. Adresse GS1B oder GS1D zuweisen.

## Gespeicherte Daten

In D1 werden gespeichert:
- Schulmailadresse
- Klassenzuordnung GS1B / GS1D
- begonnene bzw. erledigte Aufträge
- zuletzt bearbeiteter Auftrag
- Zeit der letzten Aktivität

Nicht in D1 gespeichert werden die Inhalte der persönlichen Notizfelder.


### Bereits erledigt in Version 1.13
Das D1-Binding `DB` zur Datenbank `mediainfolab` ist bereits in `wrangler.toml` hinterlegt. Wenn das Projekt über diese Wrangler-Konfiguration deployt wird, ist kein manuelles Binding im Cloudflare-Dashboard nötig.
