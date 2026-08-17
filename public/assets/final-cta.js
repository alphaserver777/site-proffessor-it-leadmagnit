const directSteps = ["План", "Практика", "Собеседования"];

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
  section.classList.add("final-cta-section", "final-journey-section");
  panel.classList.add("final-cta-panel", "final-journey-panel");
  copy.classList.add("final-cta-copy", "final-journey-copy");
  title.classList.add("final-cta-title", "final-journey-title");
  subtitle.classList.add("final-cta-subtitle", "final-journey-subtitle");

  const eyebrow = document.createElement("div");
  eyebrow.className = "final-cta-eyebrow final-journey-eyebrow";
  eyebrow.innerHTML = '<span>Финальный шаг</span><small>ROUTE / 02</small>';
  title.before(eyebrow);

  const journey = document.createElement("div");
  journey.className = "final-journey";
  journey.innerHTML = `
    <div class="final-journey-head" aria-hidden="true">
      <span>Точка выбора</span><span>Маршрут</span><span>Результат</span>
    </div>
    <div class="final-journey-map">
      <div class="final-journey-start">
        <span>Ты здесь</span>
        <strong>Первый шаг</strong>
        <small>00 / START</small>
      </div>
      <section class="final-direct-path" aria-label="Личный маршрут с Вадимом до оффера">
        <header><span>С Вадимом</span><small>до 2 месяцев</small></header>
        <div class="final-direct-track">
          <i class="final-direct-signal" aria-hidden="true"></i>
          ${directSteps.map((step, index) => `<div class="final-direct-step"><span>0${index + 1}</span><strong>${step}</strong></div>`).join("")}
          <div class="final-direct-step is-offer"><span>04</span><strong>Оффер</strong><b>₽</b></div>
        </div>
      </section>
      <section class="final-maze-path" aria-label="Самостоятельный маршрут с неопределённым сроком и тупиками">
        <header><span>Самостоятельно</span><small>срок неизвестен</small></header>
        <div class="final-maze-canvas">
          <svg viewBox="0 0 820 150" preserveAspectRatio="none" aria-hidden="true">
            <path class="maze-main" d="M0 74H95V30H205V108H315V52H438V116H550V38H655V76H810" />
            <path d="M95 74v58h92" /><path d="M205 30V8h88" /><path d="M315 108v30h88" />
            <path d="M438 52V16h84" /><path d="M550 116v22h83" /><path d="M655 76v48h78" />
            <path class="maze-dead" d="m181 126 12 12m0-12-12 12M287 2l12 12m0-12-12 12M397 132l12 12m0-12-12 12M516 10l12 12m0-12-12 12M627 132l12 12m0-12-12 12M727 118l12 12m0-12-12 12" />
          </svg>
          <span class="maze-label label-course">Курсы</span>
          <span class="maze-label label-youtube">YouTube</span>
          <span class="maze-label label-what">Что учить?</span>
          <span class="maze-label label-pause">Пауза</span>
          <span class="maze-label label-again">Ещё курс</span>
          <span class="maze-label label-offer">Оффер?</span>
        </div>
      </section>
    </div>`;
  subtitle.after(journey);

  const action = link.parentElement;
  action?.classList.add("final-cta-action", "final-journey-action");
  const note = document.createElement("p");
  note.className = "final-cta-note final-journey-note";
  note.innerHTML = '<span aria-hidden="true"></span>Первый шаг — короткий разговор в Telegram. Без оплаты.';
  action?.after(note);
  return true;
};

if (!enhanceFinalCta()) {
  const observer = new MutationObserver(() => {
    if (enhanceFinalCta()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
