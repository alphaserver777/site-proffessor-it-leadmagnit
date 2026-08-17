const progress = document.querySelector<HTMLElement>("[data-progress]");
const updateProgress = () => {
  const height = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${height > 0 ? scrollY / height : 0})`;
};
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reducedMotion) {
  document.querySelectorAll(".reveal,.reveal-item,.reveal-group").forEach((element) => element.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.04, rootMargin: "0px 0px -5%" });
  document.querySelectorAll(".reveal,.reveal-item,.reveal-group").forEach((element) => observer.observe(element));
}

document.querySelectorAll<HTMLButtonElement>("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const carousel = document.querySelector<HTMLElement>(`[data-carousel="${button.dataset.scroll}"]`);
    const direction = Number(button.dataset.direction || 1);
    carousel?.scrollBy({ left: carousel.clientWidth * 0.88 * direction, behavior: reducedMotion ? "auto" : "smooth" });
  });
});

const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-button]");
const mobileMenu = document.querySelector<HTMLElement>("[data-mobile-menu]");
const closeMenu = () => {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute("aria-expanded", "false");
  mobileMenu.hidden = true;
};
menuButton?.addEventListener("click", () => {
  if (!mobileMenu) return;
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  mobileMenu.hidden = open;
});
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.querySelectorAll<HTMLButtonElement>("[data-section-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const extra = document.querySelector<HTMLElement>(`[data-section="${button.dataset.sectionOpen}"]`);
    if (!extra) return;
    extra.hidden = !extra.hidden;
    button.textContent = extra.hidden ? `+${extra.children.length} ещё →` : "Свернуть ↑";
  });
});

const dialog = document.querySelector<HTMLDialogElement>("[data-video-dialog]");
const player = dialog?.querySelector<HTMLVideoElement>("[data-video-player]");
const heading = dialog?.querySelector<HTMLElement>("[data-video-heading]");
const closeVideo = () => {
  player?.pause();
  if (player) player.removeAttribute("src");
  dialog?.close();
};
document.querySelectorAll<HTMLButtonElement>("[data-video-src]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!dialog || !player || !button.dataset.videoSrc) return;
    player.src = button.dataset.videoSrc;
    if (heading) heading.textContent = button.dataset.videoTitle || "Материал";
    dialog.showModal();
  });
});
dialog?.querySelector<HTMLButtonElement>("[data-video-close]")?.addEventListener("click", closeVideo);
dialog?.addEventListener("click", (event) => { if (event.target === dialog) closeVideo(); });
dialog?.addEventListener("cancel", (event) => { event.preventDefault(); closeVideo(); });
