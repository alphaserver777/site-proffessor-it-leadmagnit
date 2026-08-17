const finalRoute = [
  ["01", "Старт"],
  ["02", "Практика"],
  ["03", "Собеседования"],
  ["04", "Оффер"],
];

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
  section.classList.add("final-cta-section");
  panel.classList.add("final-cta-panel");
  copy.classList.add("final-cta-copy");
  title.classList.add("final-cta-title");
  subtitle.classList.add("final-cta-subtitle");

  const eyebrow = document.createElement("div");
  eyebrow.className = "final-cta-eyebrow";
  eyebrow.innerHTML = '<span>Финальный шаг</span><small>08 / OFFER</small>';
  title.before(eyebrow);

  const action = link.parentElement;
  action?.classList.add("final-cta-action");
  const note = document.createElement("p");
  note.className = "final-cta-note";
  note.innerHTML = '<span aria-hidden="true"></span>Откроется Telegram. Без оплаты — сначала поймём, подходим ли мы друг другу.';
  action?.after(note);

  const dossier = document.createElement("aside");
  dossier.className = "final-cta-dossier";
  dossier.setAttribute("aria-label", "Параметры индивидуального сопровождения");
  dossier.innerHTML = `
    <div class="final-dossier-head">
      <div><span class="final-status-light" aria-hidden="true"></span><strong>Personal track</strong></div>
      <small>01 / ACTIVE</small>
    </div>
    <dl class="final-dossier-data">
      <div><dt>Формат</dt><dd>Индивидуально</dd></div>
      <div><dt>Цель</dt><dd>Оффер в DevOps</dd></div>
      <div><dt>Срок</dt><dd>До 2 месяцев</dd></div>
      <div><dt>Доступно</dt><dd class="final-places">3 места</dd></div>
    </dl>
    <div class="final-route" aria-label="Маршрут: старт, практика, собеседования, оффер">
      <div class="final-route-line" aria-hidden="true"><span></span></div>
      ${finalRoute.map(([index, label]) => `
        <div class="final-route-step${index === "04" ? " is-result" : ""}">
          <span>${index}</span><strong>${label}</strong>
        </div>`).join("")}
    </div>
    <div class="final-dossier-status"><span>Набор открыт</span><small>Сопровождение до испытательного срока</small></div>`;

  const layout = document.createElement("div");
  layout.className = "final-cta-layout";
  copy.before(layout);
  layout.append(copy, dossier);
  return true;
};

if (!enhanceFinalCta()) {
  const observer = new MutationObserver(() => {
    if (enhanceFinalCta()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
