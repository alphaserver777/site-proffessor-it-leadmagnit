const guidedSteps = ["Знания", "Практика", "Резюме", "Собеседования"];

const moneyBurst = `
  <span class="final-choice-money" aria-hidden="true">
    <i style="--money-x:-2.6rem;--money-y:-2.6rem;--money-r:-18deg">₽</i>
    <i style="--money-x:-1rem;--money-y:-3.4rem;--money-r:12deg">₽</i>
    <i style="--money-x:1rem;--money-y:-3.2rem;--money-r:-9deg">₽</i>
    <i style="--money-x:2.65rem;--money-y:-2.4rem;--money-r:20deg">₽</i>
    <i style="--money-x:-3rem;--money-y:-.8rem;--money-r:15deg">₽</i>
    <i style="--money-x:3rem;--money-y:-.6rem;--money-r:-14deg">₽</i>
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
  section.classList.add("final-cta-section", "final-journey-section", "final-choice-section");
  panel.classList.add("final-cta-panel", "final-journey-panel", "final-choice-panel");
  copy.classList.add("final-cta-copy", "final-journey-copy", "final-choice-copy");
  title.classList.add("final-cta-title", "final-journey-title", "final-choice-title");
  title.textContent = title.textContent.trim().replace(/\s+([.!?,])/g, "$1");

  const paragraphs = subtitle.textContent.split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean);
  subtitle.hidden = true;

  const eyebrow = document.createElement("div");
  eyebrow.className = "final-cta-eyebrow final-journey-eyebrow final-choice-eyebrow";
  eyebrow.innerHTML = '<span>Финальный выбор</span><small>ROUTE / 02</small>';
  title.before(eyebrow);

  const action = link.parentElement;
  action?.classList.add("final-cta-action", "final-choice-action");

  const composition = document.createElement("div");
  composition.className = "final-choice-composition";
  composition.innerHTML = `
    <section class="final-choice-self" aria-label="Самостоятельный маршрут">
      <div class="final-choice-copyline">
        <div class="final-choice-label"><span>01</span><strong>Самостоятельно</strong><small>срок неизвестен</small></div>
        <p>${paragraphs[0] || ""}</p>
      </div>
      <div class="final-choice-maze" aria-label="Запутанный маршрут из курсов, материалов, пауз и тупиков">
        <svg viewBox="0 0 1120 170" preserveAspectRatio="none" aria-hidden="true">
          <path class="choice-maze-main" d="M0 82H105V28H238V126H360V55H495V138H625V35H760V102H880V48H1010V86H1110" />
          <path d="M105 82v70h92" /><path d="M238 28V7h96" /><path d="M360 126v31h95" />
          <path d="M495 55V13h94" /><path d="M625 138v20h96" /><path d="M760 102v56h91" />
          <path d="M880 48V10h84" /><path d="M1010 86v58h72" />
          <path class="choice-maze-dead" d="m191 146 13 13m0-13-13 13M328 1l13 13m0-13-13 13M449 151l13 13m0-13-13 13M583 7l13 13m0-13-13 13M715 151l13 13m0-13-13 13M845 151l13 13m0-13-13 13M958 4l13 13m0-13-13 13M1076 138l13 13m0-13-13 13" />
        </svg>
        <span class="choice-maze-tag tag-free">Бесплатный курс</span>
        <span class="choice-maze-tag tag-tools">Ещё инструмент</span>
        <span class="choice-maze-tag tag-what">Что учить дальше?</span>
        <span class="choice-maze-tag tag-pause">Пауза</span>
        <span class="choice-maze-tag tag-again">Новый курс</span>
        <span class="choice-maze-tag tag-offer">Оффер?</span>
      </div>
    </section>

    <div class="final-choice-pivot">
      <span></span><strong>Твой выбор</strong><small>${paragraphs[1] || "Есть другой путь."}</small><span></span>
    </div>

    <section class="final-choice-guided" aria-label="Маршрут со мной до оффера">
      <div class="final-choice-copyline">
        <div class="final-choice-label"><span>02</span><strong>Со мной</strong><small>до 2 месяцев</small></div>
        <p>${paragraphs[2] || ""}</p>
      </div>
      <div class="final-choice-track">
        <span class="final-choice-track-line" aria-hidden="true"></span>
        <i class="final-choice-signal" aria-hidden="true"></i>
        ${guidedSteps.map((step, index) => `<div class="final-choice-step"><span>0${index + 1}</span><strong>${step}</strong></div>`).join("")}
        <div class="final-choice-destination">
          <small>05 / OFFER / ₽</small>
          ${moneyBurst}
        </div>
      </div>
      <p class="final-choice-close">${paragraphs[3] || ""}</p>
    </section>`;

  title.after(composition);
  const destination = composition.querySelector(".final-choice-destination");
  destination?.append(action);
  return true;
};

if (!enhanceFinalCta()) {
  const observer = new MutationObserver(() => {
    if (enhanceFinalCta()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
