const normalizeFaqText = (value) => value
  .trim()
  .toLocaleLowerCase("ru-RU")
  .replace(/ё/g, "е")
  .replace(/\s+/g, " ");

const faqGroups = [
  {
    id: "education",
    index: "01",
    title: "Обучение",
    questions: [
      "А если у меня совсем нет опыта?",
      "Хватит ли мне знаний после обучения, чтобы работать?",
      "А если мне нету 18 лет?",
      "Как происходит обучение?",
      "Возможно ли совмещать это с другой работой/учебой?",
      "У вас только одно напрваление?",
      "Я могу поставить обучение на паузу?",
      "Могу ли я купить обучение, но приступить к обучению чуть позже?",
      "На какой максимум срок рассчитано обучение?",
    ],
  },
  {
    id: "employment",
    index: "02",
    title: "Трудоустройство",
    questions: [
      "Сколько времени до первого оффера?",
      "Помогаете после трудоустройства?",
      "Легально ли записывать собесы на видео?",
      "Я не из РФ, это проблема?",
      "Хочу устроиться на валютную удаленку, поможете?",
      "У меня пустая трудовая, это проблема?",
      "В трудовой опыт из другой професии?",
      "Перекат из другого напраления, будут сложности?",
      "Проходят ли ваши ученики испыталку?",
      "Сколько выпускников вы устроили за последний год?",
      "Закрепляются ли на работе после испыталки?",
      "Если я получил оффер, но не согласился на него, то мне помогут получить еще один?",
      "Я получил оффер, выплатил вам за него, поможете еще один получить?",
    ],
  },
  {
    id: "payment",
    index: "03",
    title: "Оплата",
    questions: [
      "Как оплатить? Есть рассрочка?",
      "Буду ли я должен выплачивать оставшуюся часть постоплаты, если меня уволят до полной выплаты?",
      "Постоплату можно поделить?",
      "Постоплату можно сдвинуть?",
      "Постопоплата считается от гросс или нет?",
    ],
  },
  {
    id: "guarantees",
    index: "04",
    title: "Гарантии и договор",
    questions: [
      "Что с гарантией возврата денег?",
      "Я не устроился, ты вернешь мне все деньги?",
      "Можно ли поменять договор?",
      "Есть ли возврат?",
    ],
  },
];

const questionGroups = new Map(
  faqGroups.flatMap((group) => group.questions.map((question) => [normalizeFaqText(question), group.id])),
);

const searchIcon = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>
  </svg>`;

const enhanceFaq = () => {
  const section = document.querySelector("#faq");
  if (!section || section.dataset.knowledgeBase === "true") return Boolean(section);

  const cards = [...section.querySelectorAll(".glass-card")].filter((card) => card.querySelector(":scope > button"));
  if (!cards.length) return false;
  const directParent = cards[0].parentElement;
  const wrappedHost = directParent?.parentElement;
  const cardsShareDirectParent = cards.every((card) => card.parentElement === directParent);
  const cardsShareWrappedParent = cards.every((card) => card.parentElement?.parentElement === wrappedHost);
  const host = cardsShareDirectParent ? directParent : cardsShareWrappedParent ? wrappedHost : null;
  if (!host || cards.length < 2) return false;
  const entries = cards.map((card) => ({
    card,
    root: cardsShareDirectParent ? card : card.parentElement,
  }));

  section.dataset.knowledgeBase = "true";
  section.classList.add("faq-knowledge-section");
  host.classList.add("faq-knowledge-host");

  const records = entries.map(({ card, root }, position) => {
    const button = card.querySelector(":scope > button");
    const question = normalizeFaqText(button.textContent);
    const group = questionGroups.get(question) || "extra";
    const corpus = normalizeFaqText(card.textContent);
    const questionCopy = [...button.children].find((child) => child.tagName !== "SVG" && !child.querySelector("svg"));

    card.classList.add("faq-card");
    card.dataset.faqCategory = group;
    button.classList.add("faq-question-button");

    const index = document.createElement("span");
    index.className = "faq-card-index";
    index.textContent = String(position + 1).padStart(2, "0");
    index.setAttribute("aria-hidden", "true");
    button.prepend(index);

    if (questionCopy) {
      questionCopy.classList.add("faq-question-copy");
      const category = document.createElement("small");
      category.className = "faq-question-category";
      category.textContent = faqGroups.find((candidate) => candidate.id === group)?.title || "Дополнительно";
      questionCopy.append(category);
    }

    const answer = button.nextElementSibling;
    answer?.classList.add("faq-answer");
    if (answer) {
      answer.id = `faq-answer-${position + 1}`;
      button.setAttribute("aria-controls", answer.id);
    }

    const syncOpenState = () => {
      const isOpen = button.querySelector("svg")?.classList.contains("rotate-180") || answer?.style.height === "auto";
      button.setAttribute("aria-expanded", String(Boolean(isOpen)));
      card.classList.toggle("is-open", Boolean(isOpen));
    };
    syncOpenState();
    button.addEventListener("click", () => requestAnimationFrame(syncOpenState));
    const stateObserver = new MutationObserver(syncOpenState);
    stateObserver.observe(button.querySelector("svg") || button, { attributes: true, attributeFilter: ["class"] });
    if (answer) stateObserver.observe(answer, { attributes: true, attributeFilter: ["style"] });

    return { card, root, group, corpus };
  });

  const presentGroups = [...faqGroups];
  if (records.some((record) => record.group === "extra")) {
    presentGroups.push({ id: "extra", index: "05", title: "Дополнительно", questions: [] });
  }

  const layout = document.createElement("div");
  layout.className = "faq-knowledge-layout";

  const navigation = document.createElement("aside");
  navigation.className = "faq-navigation glass-card";
  navigation.innerHTML = `
    <div class="faq-navigation-heading">
      <span class="faq-system-light" aria-hidden="true"></span>
      <span>Навигация</span>
      <small>FAQ / ${records.length}</small>
    </div>
    <div class="faq-filter-list" role="group" aria-label="Категории частых вопросов"></div>`;
  const filterList = navigation.querySelector(".faq-filter-list");

  const main = document.createElement("div");
  main.className = "faq-main";
  const toolbar = document.createElement("div");
  toolbar.className = "faq-toolbar";
  toolbar.innerHTML = `
    <label class="faq-search-label" for="faq-search">Поиск по вопросам и ответам</label>
    <div class="faq-search-row">
      <div class="faq-search-field">
        ${searchIcon}
        <input id="faq-search" type="search" autocomplete="off" placeholder="Например: рассрочка, оффер, договор…" />
        <kbd aria-hidden="true">/</kbd>
      </div>
      <output class="faq-result-count" aria-live="polite"></output>
    </div>`;

  const list = document.createElement("div");
  list.className = "faq-card-list";
  list.append(...entries.map((entry) => entry.root));

  const empty = document.createElement("div");
  empty.className = "faq-empty glass-card";
  empty.hidden = true;
  empty.innerHTML = `
    <span>SEARCH / 00</span>
    <strong>Ничего не найдено</strong>
    <p>Попробуй изменить запрос или посмотреть все категории.</p>
    <button type="button">Сбросить фильтры</button>`;

  const closingAction = document.createElement("div");
  closingAction.className = "faq-closing-action";
  closingAction.innerHTML = `
    <span><i aria-hidden="true"></i>FAQ / COMPLETE</span>
    <a href="#plans" data-track="cta_click:faq">
      Хочу на обучение
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M7 17 17 7"></path><path d="M7 7h10v10"></path>
      </svg>
    </a>`;

  main.append(toolbar, list, empty);
  layout.append(navigation, main);
  host.replaceChildren(layout, closingAction);

  const filterButtons = new Map();
  const makeFilter = (id, index, title, count) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "faq-filter-button";
    button.dataset.faqFilter = id;
    button.setAttribute("aria-pressed", String(id === "all"));
    button.innerHTML = `<span class="faq-filter-index">${index}</span><span>${title}</span><small>${count}</small>`;
    filterList.append(button);
    filterButtons.set(id, button);
  };

  makeFilter("all", "00", "Все вопросы", records.length);
  presentGroups.forEach((group) => {
    makeFilter(group.id, group.index, group.title, records.filter((record) => record.group === group.id).length);
  });

  const input = toolbar.querySelector("input");
  const resultCount = toolbar.querySelector(".faq-result-count");
  let activeFilter = "all";

  const applyFilters = () => {
    const query = normalizeFaqText(input.value);
    let visibleCount = 0;
    records.forEach((record) => {
      const visible = (activeFilter === "all" || record.group === activeFilter) && (!query || record.corpus.includes(query));
      record.root.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    filterButtons.forEach((button, id) => button.setAttribute("aria-pressed", String(id === activeFilter)));
    resultCount.value = `${visibleCount} ${visibleCount === 1 ? "вопрос" : visibleCount > 1 && visibleCount < 5 ? "вопроса" : "вопросов"}`;
    empty.hidden = visibleCount !== 0;
    list.hidden = visibleCount === 0;
    section.dataset.faqFilter = activeFilter;
  };

  filterButtons.forEach((button, id) => {
    button.addEventListener("click", () => {
      activeFilter = id === activeFilter && id !== "all" ? "all" : id;
      applyFilters();
    });
  });
  input.addEventListener("input", applyFilters);
  empty.querySelector("button").addEventListener("click", () => {
    activeFilter = "all";
    input.value = "";
    applyFilters();
    input.focus();
  });

  filterList.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const buttons = [...filterButtons.values()];
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;
    event.preventDefault();
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    buttons[(current + (forward ? 1 : -1) + buttons.length) % buttons.length].focus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
      event.preventDefault();
      input.focus();
    }
  });

  applyFilters();
  return true;
};

if (!enhanceFaq()) {
  const observer = new MutationObserver(() => {
    if (enhanceFaq()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
