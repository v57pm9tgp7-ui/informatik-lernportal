/* Shared project selection for Woche 45 and Projekte. Stable links preserve saved work. */
(()=>{'use strict';
const items=[
  {
    "key": "werkstatt-werbespot",
    "title": "Ein Werbespot für einen Alltagsgegenstand",
    "category": "Gestalten",
    "description": "Machen Sie einen gewöhnlichen Gegenstand interessant. Ihr Spot dauert 15 bis 30 Sekunden.",
    "product": "Ein Video von 15–30 Sekunden oder eine Bildwerbung mit vier Folien zu je fünf Sekunden.",
    "duration": "90 Min.",
    "tool": "PowerPoint oder Video",
    "href": "werkstatt45.html#werbespot",
    "image": "assets/week45/cover-werbespot.svg"
  },
  {
    "key": "werkstatt-geschichte",
    "title": "Eine Geschichte zum Anklicken",
    "category": "Erklären",
    "description": "Eine Nachricht, zwei Entscheidungen und drei mögliche Enden. Wer Ihre Geschichte spielt, entscheidet den Weg.",
    "product": "Eine PowerPoint mit sechs Folien, zwei Entscheidungsstellen und drei unterschiedlichen Enden.",
    "duration": "90 Min.",
    "tool": "PowerPoint",
    "href": "werkstatt45.html#geschichte",
    "image": "assets/week45/cover-geschichte.svg"
  },
  {
    "key": "werkstatt-plakat",
    "title": "Ein Plakat verbessern",
    "category": "Gestalten",
    "description": "Drei Themen, drei Gestaltungsprobleme. Machen Sie aus einem unübersichtlichen Entwurf ein verständliches Informationsplakat.",
    "product": "Ein verbessertes Plakat, die Ausgangsversion und eine kurze Erklärung von drei Änderungen.",
    "duration": "90 Min.",
    "tool": "PowerPoint",
    "href": "werkstatt45.html#plakat",
    "image": "assets/week45/cover-plakat.svg"
  },
  {
    "key": "werkstatt-app",
    "title": "Eine eigene App entwerfen",
    "category": "Gestalten",
    "description": "Planen Sie eine kleine App und bauen Sie fünf Bildschirme, die sich anklicken lassen.",
    "product": "Eine PowerPoint mit fünf verbundenen App-Bildschirmen und ein dokumentierter Bedienungstest.",
    "duration": "90 Min.",
    "tool": "PowerPoint",
    "href": "werkstatt45.html#app",
    "image": "assets/week45/cover-app.svg"
  },
  {
    "key": "kurz-nachrichten",
    "title": "Würden Sie reagieren?",
    "category": "Prüfen",
    "description": "Ein Paket, ein Gewinn, eine Kontomeldung: Was steckt hinter der Nachricht?",
    "product": "Drei geprüfte Nachrichten mit Ihrer Entscheidung und einem sicheren nächsten Schritt.",
    "duration": "15–20 Min.",
    "tool": "Direkt im Browser",
    "href": "projekt.html?thema=nachrichten&kurs=woche45",
    "image": "assets/nachrichtenbild.svg"
  },
  {
    "key": "kurz-bildausschnitt",
    "title": "Ein Bild. Zwei Eindrücke.",
    "category": "Gestalten",
    "description": "Was fehlt ausserhalb des Bildrandes? Verändern Sie den Ausschnitt und vergleichen Sie.",
    "product": "Zwei Bildausschnitte mit Überschriften und einer Erklärung zur Wirkung.",
    "duration": "20–25 Min.",
    "tool": "Direkt im Browser",
    "href": "projekt.html?thema=bildausschnitt&kurs=woche45",
    "image": "assets/parkbild.jpg"
  },
  {
    "key": "kurz-plakat",
    "title": "Was muss ich zuerst sehen?",
    "category": "Gestalten",
    "description": "Alle Informationen sind da. Aber findet man sie? Machen Sie aus einem Durcheinander einen klaren Aushang.",
    "product": "Ein übersichtliches Plakat und drei begründete Verbesserungen.",
    "duration": "20–30 Min.",
    "tool": "Direkt im Browser",
    "href": "projekt.html?thema=plakat&kurs=woche45",
    "image": "assets/plakatbild.svg"
  },
  {
    "key": "kurz-storyboard",
    "title": "Eine Geschichte in sechs Bildern",
    "category": "Erklären",
    "description": "Eine kleine Panne, ein Versuch, eine Lösung. Erzählen Sie eine Geschichte ganz ohne gesprochene Worte.",
    "product": "Ein Plan mit sechs Szenen, Bildausschnitten und einem nachvollziehbaren Ende.",
    "duration": "20–30 Min.",
    "tool": "Direkt im Browser",
    "href": "projekt.html?thema=storyboard&kurs=woche45",
    "image": "assets/storyboardbild.svg"
  },
  {
    "key": "projekt-tutorial",
    "title": "Erklär’s besser",
    "category": "Erklären",
    "description": "Jemand fragt zum dritten Mal: «Wie geht das?» Ihre Anleitung liefert die Antwort.",
    "product": "Eine Bildanleitung mit mindestens 5 Schritten oder ein Erklärvideo von 60–90 Sekunden.",
    "duration": "45–65 Min.",
    "tool": "Bilder oder Video",
    "href": "projekte.html?kurs=woche45#tutorial",
    "image": "assets/projects/media/tutorial-02.svg"
  },
  {
    "key": "projekt-cockpit",
    "title": "Mein digitales Cockpit",
    "category": "Organisieren",
    "description": "Aufgaben in Teams, Termine im Kopf, Dateien irgendwo. Bringen Sie das Wichtigste auf eine Seite.",
    "product": "Eine funktionierende OneNote-Seite mit 4 Bereichen: Aufgaben, Termine, Schnellzugriffe und ein nächstes Ziel.",
    "duration": "40–55 Min.",
    "tool": "OneNote",
    "href": "projekte.html?kurs=woche45#cockpit",
    "image": "assets/projects/media/cockpit-02.svg"
  },
  {
    "key": "projekt-dokumente",
    "title": "Alles in einer PDF",
    "category": "Organisieren",
    "description": "Drei wichtige Blätter. Gleich müssen Sie los. Machen Sie daraus eine Datei, auf die Sie sich verlassen können.",
    "product": "Eine einzige PDF mit 3 lesbaren, richtig sortierten Seiten; dazu ein kurzer Qualitätscheck.",
    "duration": "35–50 Min.",
    "tool": "PDF",
    "href": "projekte.html?kurs=woche45#dokumente",
    "image": "assets/projects/media/dokumente-02.svg"
  },
  {
    "key": "projekt-faktencheck",
    "title": "Echt oder Fake?",
    "category": "Prüfen",
    "description": "Eine Behauptung klingt überzeugend. Aber hält sie einer Prüfung stand?",
    "product": "Eine Faktencheck-Karte auf 1–2 Seiten mit Behauptung, 2 Quellen, Belegen und Urteil.",
    "duration": "45–60 Min.",
    "tool": "Webrecherche",
    "href": "projekte.html?kurs=woche45#faktencheck",
    "image": "assets/projects/media/faktencheck-02.svg"
  },
  {
    "key": "projekt-lifehacks",
    "title": "Fünf Tricks, die bleiben",
    "category": "Entdecken",
    "description": "Weniger klicken. Schneller finden. Sauberer abgeben. Welche Tricks helfen Ihnen wirklich?",
    "product": "Ein Infoblatt auf 1–2 Seiten oder 5 kurze Folien. Jeder Trick enthält Nutzen, Anleitung und eigenen Testnachweis.",
    "duration": "45–65 Min.",
    "tool": "Computer und Browser",
    "href": "projekte.html?kurs=woche45#lifehacks",
    "image": "assets/projects/media/lifehacks-02.svg"
  }
];
const filters=['Alle','Gestalten','Erklären','Prüfen','Organisieren','Entdecken'];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(p){return `<article class="selection-card" data-project-key="${p.key}"><a class="selection-image" href="${escape(p.href)}" tabindex="-1" aria-hidden="true"><img src="${p.image}" alt="" width="900" height="506" loading="lazy"></a><div class="selection-body"><p class="selection-category">${escape(p.category)}</p><h3><a href="${escape(p.href)}">${escape(p.title)}</a></h3><p class="selection-description">${escape(p.description)}</p><div class="selection-meta"><span>${escape(p.duration)}</span><span>${escape(p.tool)}</span></div><p class="selection-product"><b>Ihr Ergebnis</b>${escape(p.product)}</p><a class="selection-open" href="${escape(p.href)}" aria-label="Projekt öffnen: ${escape(p.title)}">Projekt öffnen <span aria-hidden="true">→</span></a></div></article>`;}
function markup(filter='Alle'){const shown=items.filter(p=>filter==='Alle'||p.category===filter);return `<div class="selection-toolbar"><div class="selection-filters" role="group" aria-label="Projekte nach Interesse filtern">${filters.map(f=>`<button type="button" data-catalogue-filter="${f}" aria-pressed="${f===filter}">${f}</button>`).join('')}</div><p class="selection-count" role="status">${shown.length} von ${items.length} Projekten</p></div><div class="selection-grid">${shown.map(card).join('')}</div>`;}
function mount(){document.querySelectorAll('[data-project-catalogue]').forEach(root=>{if(!root.children.length)root.innerHTML=markup();});}
document.addEventListener('click',ev=>{const button=ev.target.closest('[data-catalogue-filter]');if(!button?.dataset.catalogueFilter)return;const root=button.closest('[data-project-catalogue]');if(!root)return;const filter=button.dataset.catalogueFilter;root.innerHTML=markup(filter);root.querySelector(`[data-catalogue-filter="${filter}"]`).focus({preventScroll:true});});
globalThis.MediaInfoCatalogue={items,markup};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
