const enhanceRoadmap = () => {
  const section = document.querySelector("#roadmap");
  if (!section || section.dataset.interactive === "true") return Boolean(section);

  const track = section.querySelector(":scope > .mx-auto.mt-12");
  const steps = track ? [...track.children] : [];
  if (!track || steps.length < 2) return false;

  section.dataset.interactive = "true";
  section.classList.add("roadmap-interactive");
  track.classList.add("roadmap-track");

  const hint = document.createElement("div");
  hint.id = "roadmap-interaction-hint";
  hint.className = "roadmap-interaction-hint";
  hint.setAttribute("role", "status");
  hint.innerHTML = `
    <span class="roadmap-hint-cursor" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m5 3 6.7 16 2.1-6.2L20 10.7 5 3Z"></path>
        <path d="m13.7 13.2 4.3 4.3"></path>
      </svg>
    </span>
    <span class="roadmap-hint-copy">
      <strong>Нажми на первый этап</strong>
      <small>Он раскроется и покажет детали</small>
    </span>
    <svg class="roadmap-hint-arrow" viewBox="0 0 200 80" aria-hidden="true">
      <path d="M176 6C145 9 137 42 42 55"></path>
      <path d="m42 55 15-10M42 55l17 5"></path>
    </svg>
  `;
  track.before(hint);

  let hintAcknowledged = false;
  const acknowledgeHint = () => {
    if (hintAcknowledged) return;
    hintAcknowledged = true;
    hint.classList.add("is-confirmed");
    hint.querySelector("strong").textContent = "Вот так — этап раскрыт";
    hint.querySelector("small").textContent = "Теперь можно выбрать следующий";
    window.setTimeout(() => {
      hint.classList.add("is-hidden");
      hint.setAttribute("aria-hidden", "true");
    }, 1400);
  };

  const selectStep = (selectedIndex, burst = false) => {
    const progress = steps.length > 1 ? selectedIndex / (steps.length - 1) : 0;
    track.style.setProperty("--roadmap-progress", progress);

    steps.forEach((step, index) => {
      const card = step.firstElementChild;
      const active = index === selectedIndex;
      step.classList.toggle("is-active", active);
      card?.setAttribute("aria-pressed", String(active));
      card?.setAttribute("aria-expanded", String(active));
    });

    const selected = steps[selectedIndex];
    if (burst && selected?.classList.contains("roadmap-money-step")) {
      selected.classList.remove("money-burst");
      requestAnimationFrame(() => selected.classList.add("money-burst"));
    }
  };

  steps.forEach((step, index) => {
    const card = step.firstElementChild;
    if (!card) return;

    step.classList.add("roadmap-step");
    step.style.setProperty("--step-index", index);
    step.style.gridRow = String(index + 1);
    card.classList.add("roadmap-card");
    const number = card.querySelector("span.shrink-0");
    if (number) number.textContent = String(index + 1);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-pressed", "false");
    card.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-label", `Этап ${index + 1}: ${card.querySelector("h3")?.textContent || ""}`);
    card.setAttribute("aria-describedby", hint.id);

    if (index >= steps.length - 2) {
      step.classList.add("roadmap-money-step");
      const layer = document.createElement("span");
      layer.className = "roadmap-money-layer";
      layer.setAttribute("aria-hidden", "true");
      for (let particle = 0; particle < 14; particle += 1) {
        const coin = document.createElement("i");
        coin.textContent = "₽";
        coin.style.setProperty("--coin", particle);
        coin.style.setProperty("--coin-x", `${8 + ((particle * 37) % 84)}%`);
        layer.append(coin);
      }
      card.prepend(layer);
    }

    card.addEventListener("click", () => {
      selectStep(index, true);
      acknowledgeHint();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectStep(index, true);
        acknowledgeHint();
      }
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        const next = Math.min(index + 1, steps.length - 1);
        steps[next].firstElementChild?.focus();
        selectStep(next, true);
        acknowledgeHint();
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        const previous = Math.max(index - 1, 0);
        steps[previous].firstElementChild?.focus();
        selectStep(previous, true);
        acknowledgeHint();
      }
    });
  });

  return true;
};

if (!enhanceRoadmap()) {
  const observer = new MutationObserver(() => {
    if (enhanceRoadmap()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
