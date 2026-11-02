# Woche 45

`python tools/week45/build.py` regenerates `dist/werkstatt45.html`, `dist/assets/werkstatt45.js` and the six poster SVGs from content.json, template.html, enhancements.js and graphics.py.

The shared local journal lives in `dist/assets/lernprotokoll.js`; it stores drafts and dated handoffs per school email without network transmission. Its backup is separate from the existing project backups and the students’ result files.

Existing project samples and contextual week-45 guidance are additive in `project-boost.js`; original project storage formats and the Worker API are unchanged.

Validation: `npm test`, `npm run test:projects`, `npm run test:week44`, plus browser checks of interactive stories, app paths, poster download, journal export/import and mobile layout.
