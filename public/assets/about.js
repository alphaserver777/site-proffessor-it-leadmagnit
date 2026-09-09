const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");

const groupDefinitions = [
  {
    id: "stack",
    index: "01",
    title: "Стек",
    icon: '<path d="m8 9 3 3-3 3"></path><path d="M13 15h3"></path><rect width="18" height="14" x="3" y="5" rx="2"></rect>',
    items: ["ansible", "linux", "kubernetes", "мониторинг", "бд", "ci/cd", "elk", "сети", "terraform", "docker", "курс по вайбкодингу"],
  },
  {
    id: "market",
    index: "02",
    title: "Выход на рынок",
    icon: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"></path>',
    items: ["составление легенды", "составление резюме", "300+ слитых собеседований", "подготовка к собеседованиям", "карьерная стратегия под твой кейс", "развитие софт скиллов"],
  },
  {
    id: "support",
    index: "03",
    title: "Сопровождение",
    icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>',
    items: ["свой ментор на протяжении всего обучения", "доступ в общий чат с единомышленниками", "собственная платформа для обучения", "еженедельные эфиры", "мини чат с твоим ментором и создателем этого проекта", "стримы от выпускников, получивших оффер", "собственная практика, которая поднимается под тебя"],
  },
  {
    id: "guarantees",
    index: "04",
    title: "Гарантии",
    icon: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"></path><path d="m9 12 2 2 4-4"></path>',
    items: ["помощь в прохождении испытательного срока", "гарантия трудоустройства", "возврат денег, если не устроился"],
  },
];

const manifestoTitles = [
  "Оффер — отдельный навык",
  "Навык проходить собеседования ≠ умение работать",
  "Оффер — только начало",
];

const anchorItems = new Set([
  "300+ слитых собеседований",
  "свой ментор на протяжении всего обучения",
  "возврат денег, если не устроился",
]);

const icon = (paths) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = paths;
  return svg;
};

const highlightPhrase = (element, phrase) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const start = node.data.indexOf(phrase);
    if (start === -1) continue;
    const mark = document.createElement("mark");
    mark.className = "about-keyline";
    mark.textContent = phrase;
    const before = node.data.slice(0, start);
    const after = node.data.slice(start + phrase.length);
    node.replaceWith(before, mark, after);
    return;
  }
};

const enhanceAbout = () => {
  const section = document.querySelector("#about");
  if (!section || section.dataset.dossier === "true") return Boolean(section);

  const layout = section.querySelector(":scope > .grid");
  const columns = layout ? [...layout.children] : [];
  const manifesto = columns[0]?.querySelector(".mt-6.space-y-4");
  const benefitCard = columns[1]?.querySelector(".glass-card");
  const chipHost = benefitCard?.querySelector(".flex.flex-wrap.gap-2");
  const paragraphs = manifesto ? [...manifesto.querySelectorAll(":scope > p")] : [];
  const chips = chipHost ? [...chipHost.querySelectorAll(":scope > .chip")] : [];
  if (!layout || paragraphs.length !== 3 || chips.length === 0) return false;

  section.dataset.dossier = "true";
  section.classList.add("about-dossier");
  layout.classList.add("about-dossier-layout");
  columns[0].classList.add("about-story-column");
  columns[1].classList.add("about-benefits-column");
  manifesto.classList.add("about-manifesto");
  benefitCard.classList.add("about-benefits-card");
  chipHost.classList.add("about-benefits-content");

  paragraphs.forEach((paragraph, index) => {
    const article = document.createElement("article");
    article.className = "about-manifesto-item";
    const heading = document.createElement("div");
    heading.className = "about-manifesto-heading";
    heading.innerHTML = `<span>0${index + 1}</span><h3>${manifestoTitles[index]}</h3>`;
    paragraph.before(article);
    article.append(heading, paragraph);
  });

  highlightPhrase(paragraphs[0], "заветный оффер");
  highlightPhrase(paragraphs[1], "умение устраиваться");
  highlightPhrase(paragraphs[1], "умение работать");
  highlightPhrase(paragraphs[2], "300к");
  highlightPhrase(paragraphs[2], "600к");
  highlightPhrase(paragraphs[2], "А я верю в тебя.");

  const groups = groupDefinitions.map((definition) => ({ ...definition, chips: [] }));
  const extra = {
    id: "extra",
    index: "05",
    title: "Дополнительно",
    icon: '<path d="M12 5v14M5 12h14"></path>',
    chips: [],
  };

  chips.forEach((chip) => {
    const value = normalize(chip.textContent);
    const group = groups.find((candidate) => candidate.items.includes(value)) || extra;
    if (anchorItems.has(value)) chip.classList.add("about-benefit-anchor");
    chip.classList.add("about-benefit-chip");
    group.chips.push(chip);
  });

  const visibleGroups = [...groups, ...(extra.chips.length ? [extra] : [])];
  const filters = document.createElement("div");
  filters.className = "about-benefit-filters";
  filters.setAttribute("role", "group");
  filters.setAttribute("aria-label", "Фильтр возможностей обучения");

  const matrix = document.createElement("div");
  matrix.className = "about-benefit-matrix";
  const filterButtons = new Map();
  const panels = new Map();

  const makeFilter = (id, label, count) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "about-filter";
    button.dataset.filter = id;
    button.setAttribute("aria-pressed", String(id === "all"));
    button.innerHTML = `<span>${label}</span><small>${count}</small>`;
    filters.append(button);
    filterButtons.set(id, button);
    return button;
  };

  makeFilter("all", "Все", chips.length);
  visibleGroups.forEach((group) => makeFilter(group.id, group.title, group.chips.length));

  visibleGroups.forEach((group) => {
    const panel = document.createElement("section");
    panel.className = "about-benefit-group";
    panel.dataset.category = group.id;
    panel.id = `about-benefit-${group.id}`;

    const heading = document.createElement("button");
    heading.type = "button";
    heading.className = "about-benefit-group-heading";
    heading.setAttribute("aria-label", `Выделить категорию ${group.title}`);
    heading.setAttribute("aria-pressed", "false");
    const index = document.createElement("span");
    index.className = "about-benefit-index";
    index.textContent = group.index;
    const glyph = document.createElement("span");
    glyph.className = "about-benefit-icon";
    glyph.append(icon(group.icon));
    const title = document.createElement("h3");
    title.textContent = group.title;
    const count = document.createElement("span");
    count.className = "about-benefit-count";
    count.textContent = `${group.chips.length}`;
    heading.append(index, glyph, title, count);

    const body = document.createElement("div");
    body.className = "about-benefit-group-body";
    body.append(...group.chips);
    panel.append(heading, body);
    matrix.append(panel);
    panels.set(group.id, panel);
  });

  chipHost.replaceChildren(filters, matrix);

  let activeFilter = "all";
  const setFilter = (requested) => {
    activeFilter = requested === activeFilter && requested !== "all" ? "all" : requested;
    section.dataset.benefitFilter = activeFilter;
    filterButtons.forEach((button, id) => button.setAttribute("aria-pressed", String(id === activeFilter)));
    panels.forEach((panel, id) => {
      const visible = activeFilter === "all" || activeFilter === id;
      const heading = panel.querySelector(".about-benefit-group-heading");
      panel.classList.toggle("is-hidden", !visible);
      panel.classList.toggle("is-focused", activeFilter === id);
      panel.setAttribute("aria-hidden", String(!visible));
      heading?.setAttribute("aria-pressed", String(activeFilter === id));
      if (heading) heading.tabIndex = visible ? 0 : -1;
    });
  };

  filterButtons.forEach((button, id) => button.addEventListener("click", () => setFilter(id)));
  panels.forEach((panel, id) => panel.querySelector("button")?.addEventListener("click", () => setFilter(id)));

  filters.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const buttons = [...filterButtons.values()];
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    buttons[(current + direction + buttons.length) % buttons.length].focus();
  });

  setFilter("all");
  return true;
};

if (!enhanceAbout()) {
  const observer = new MutationObserver(() => {
    if (enhanceAbout()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
