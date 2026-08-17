const guidedSteps = ["Знания", "Практика", "Резюме", "Собеседования"];

const moneyBurst = `
  <span class="final-split-money" aria-hidden="true">
    <i style="--money-x:-2.3rem;--money-y:-2.5rem;--money-r:-18deg">₽</i>
    <i style="--money-x:-.8rem;--money-y:-3.1rem;--money-r:12deg">₽</i>
    <i style="--money-x:1rem;--money-y:-2.9rem;--money-r:-9deg">₽</i>
    <i style="--money-x:2.35rem;--money-y:-2.2rem;--money-r:20deg">₽</i>
    <i style="--money-x:-2.7rem;--money-y:-.7rem;--money-r:15deg">₽</i>
    <i style="--money-x:2.7rem;--money-y:-.55rem;--money-r:-14deg">₽</i>
  </span>`;

const enhanceFinalCta = () => {
  const link = document.querySelector('a[data-track="cta_click:band"]');
  const section = link?.closest("section");
  const panel = link?.closest(".glass-panel");
  const copy = panel?.querySelector(":scope > div.relative");
  const title = copy?.querySelector("h2");
  const subtitle = copy?.querySelector("p");
  if (!link || !section || !panel || !copy || !title || !subtitle || section.dataset.finalCta === "true") {
    return Boolean(section?.dataset.finalCta === "true");
  }

  section.dataset.finalCta = "true";
  section.classList.add("final-cta-section", "final-journey-section", "final-choice-section", "final-split-section");
  panel.classList.add("final-cta-panel", "final-journey-panel", "final-choice-panel", "final-split-panel");
  copy.classList.add("final-cta-copy", "final-journey-copy", "final-choice-copy", "final-split-copy");
  title.classList.add("final-cta-title", "final-journey-title", "final-choice-title", "final-split-title");
  title.textContent = title.textContent.trim().replace(/\s+([.!?,])/g, "$1");

  const paragraphs = subtitle.textContent.split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean);
  subtitle.hidden = true;

  // The route choice closes the sales argument; FAQ follows it as the final
  // objection-handling section before the footer.
  const faqSection = document.querySelector("#faq");
  if (faqSection) faqSection.before(section);

  const eyebrow = document.createElement("div");
  eyebrow.className = "final-cta-eyebrow final-journey-eyebrow final-choice-eyebrow final-split-eyebrow";
  eyebrow.innerHTML = '<span>Финальный выбор</span>';
  title.before(eyebrow);

  const textNode = [...link.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = "Оффер";
  const action = link.parentElement;
  action?.classList.add("final-cta-action", "final-split-action");

  const map = document.createElement("div");
  map.className = "final-split-map";
  map.innerHTML = `
    <div class="final-split-choice">
      <span>00 / CHOICE</span>
      <strong>Твой выбор</strong>
      <small>Два маршрута</small>
    </div>

    <svg class="final-split-fork" viewBox="0 0 90 360" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="final-split-fork-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8f9bad" stop-opacity=".3" />
          <stop offset=".5" stop-color="#55d9ff" stop-opacity=".55" />
          <stop offset="1" stop-color="#62efbb" stop-opacity=".8" />
        </linearGradient>
      </defs>
      <path d="M0 180H27M27 180C48 180 48 90 69 90H90M27 180C48 180 48 270 69 270H90" />
      <path class="final-split-arrow" d="m82 83 8 7-8 7M82 263l8 7-8 7" />
    </svg>

    <section class="final-split-self" aria-label="Самостоятельный маршрут">
      <div class="final-split-route-head">
        <div><span>01</span><strong>Самостоятельно</strong></div>
        <small>срок неизвестен</small>
      </div>
      <p>${paragraphs[0] || ""}</p>
      <div class="final-split-maze" aria-label="Курсы, инструменты, паузы и тупики">
        <svg viewBox="0 0 980 145" preserveAspectRatio="none" aria-hidden="true">
          <path class="split-maze-main" d="M0 69H95V22H215V111H330V44H455V124H575V29H700V88H810V39H920V72H975" />
          <path d="M95 69v59h82" /><path d="M215 22V5h86" /><path d="M330 111v27h85" />
          <path d="M455 44V9h84" /><path d="M575 124v15h86" /><path d="M700 88v50h82" /><path d="M810 39V7h76" />
          <path class="split-maze-dead" d="m171 122 12 12m0-12-12 12M295 0l12 12m0-12-12 12M409 132l12 12m0-12-12 12M533 3l12 12m0-12-12 12M655 132l12 12m0-12-12 12M776 132l12 12m0-12-12 12M880 1l12 12m0-12-12 12" />
        </svg>
        <span class="split-maze-tag tag-free">Бесплатный курс</span>
        <span class="split-maze-tag tag-tools">Ещё инструмент</span>
        <span class="split-maze-tag tag-what">Что дальше?</span>
        <span class="split-maze-tag tag-pause">Пауза</span>
        <span class="split-maze-tag tag-again">Новый курс</span>
        <span class="split-maze-tag tag-offer">Оффер?</span>
      </div>
    </section>

    <section class="final-split-guided" aria-label="Маршрут со мной">
      <div class="final-split-route-head">
        <div><span>02</span><strong>Со мной</strong></div>
        <small>до 2 месяцев</small>
      </div>
      <p>${paragraphs[2] || ""}</p>
      <div class="final-split-track">
        <span class="final-split-track-line" aria-hidden="true"></span>
        <i class="final-split-signal" aria-hidden="true"></i>
        ${guidedSteps.map((step, index) => `<div class="final-split-step"><span>0${index + 1}</span><strong>${step}</strong></div>`).join("")}
        <div class="final-split-destination">
          <small>05 / OFFER / ₽</small>
          ${moneyBurst}
        </div>
      </div>
      <p class="final-split-close">${paragraphs[3] || ""}</p>
    </section>`;

  title.after(map);
  map.querySelector(".final-split-destination")?.append(action);

  const connectors = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  connectors.classList.add("final-split-connectors");
  connectors.setAttribute("aria-hidden", "true");
  connectors.innerHTML = `
    <path class="final-split-connector final-split-connector-top" />
    <path class="final-split-connector-head final-split-connector-head-top" />
    <path class="final-split-connector final-split-connector-bottom" />
    <path class="final-split-connector-head final-split-connector-head-bottom" />`;
  map.append(connectors);

  const syncConnectors = () => {
    if (matchMedia("(max-width: 640px)").matches) return;
    const choice = map.querySelector(".final-split-choice");
    const maze = map.querySelector(".final-split-maze");
    const trackLine = map.querySelector(".final-split-track-line");
    if (!choice || !maze || !trackLine) return;

    const mapRect = map.getBoundingClientRect();
    const choiceRect = choice.getBoundingClientRect();
    const mazeRect = maze.getBoundingClientRect();
    const trackRect = trackLine.getBoundingClientRect();
    connectors.setAttribute("viewBox", `0 0 ${mapRect.width} ${mapRect.height}`);

    const start = {
      x: choiceRect.right - mapRect.left,
      y: choiceRect.top - mapRect.top + choiceRect.height / 2,
    };
    const topTarget = {
      x: mazeRect.left - mapRect.left + 1,
      y: mazeRect.top - mapRect.top + mazeRect.height * (69 / 145),
    };
    const bottomTarget = {
      x: trackRect.left - mapRect.left + 1,
      y: trackRect.top - mapRect.top + trackRect.height / 2,
    };
    const bendX = start.x + Math.min(48, Math.max(24, (topTarget.x - start.x) * .42));
    const route = (target) => `M ${start.x} ${start.y} H ${bendX - 10} C ${bendX} ${start.y} ${bendX} ${target.y} ${bendX + 12} ${target.y} H ${target.x - 5}`;
    const head = (target) => `M ${target.x - 12} ${target.y - 5} L ${target.x - 5} ${target.y} L ${target.x - 12} ${target.y + 5}`;

    connectors.querySelector(".final-split-connector-top")?.setAttribute("d", route(topTarget));
    connectors.querySelector(".final-split-connector-head-top")?.setAttribute("d", head(topTarget));
    connectors.querySelector(".final-split-connector-bottom")?.setAttribute("d", route(bottomTarget));
    connectors.querySelector(".final-split-connector-head-bottom")?.setAttribute("d", head(bottomTarget));
  };

  requestAnimationFrame(syncConnectors);
  const connectorObserver = new ResizeObserver(syncConnectors);
  connectorObserver.observe(map);
  connectorObserver.observe(map.querySelector(".final-split-maze"));
  connectorObserver.observe(map.querySelector(".final-split-track"));
  return true;
};

if (!enhanceFinalCta()) {
  const observer = new MutationObserver(() => {
    if (enhanceFinalCta()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
