const enhanceRoadmap = () => {
  const section = document.querySelector("#roadmap");
  if (!section || section.dataset.interactive === "true") return Boolean(section);

  const track = section.querySelector(":scope > .mx-auto.mt-12");
  const steps = track ? [...track.children] : [];
  if (!track || steps.length < 2) return false;

  section.dataset.interactive = "true";
  section.classList.add("roadmap-interactive");
  track.classList.add("roadmap-track");

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
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Этап ${index + 1}: ${card.querySelector("h3")?.textContent || ""}`);

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

    card.addEventListener("click", () => selectStep(index, true));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectStep(index, true);
      }
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        const next = Math.min(index + 1, steps.length - 1);
        steps[next].firstElementChild?.focus();
        selectStep(next, true);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        const previous = Math.max(index - 1, 0);
        steps[previous].firstElementChild?.focus();
        selectStep(previous, true);
      }
    });
  });

  selectStep(0);
  return true;
};

if (!enhanceRoadmap()) {
  const observer = new MutationObserver(() => {
    if (enhanceRoadmap()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
