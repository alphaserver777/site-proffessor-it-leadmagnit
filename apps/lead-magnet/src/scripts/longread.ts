export {};

const readingProgress = document.querySelector<HTMLElement>('[data-reading-progress]');
const updateProgress = () => {
  if (!readingProgress) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  readingProgress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};
addEventListener('scroll', updateProgress, {passive: true});
updateProgress();

const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')];
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-chapter]')];
const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  const id = (visible.target as HTMLElement).id;
  if (!id) return;
  links.forEach(link => link.classList.toggle('active', link.dataset.chapter === id));
}, {rootMargin: '-25% 0px -55%', threshold: [0,.15,.4]});
sections.forEach(section => sectionObserver.observe(section));

document.querySelectorAll<HTMLButtonElement>('[data-proof-tab]').forEach(button => button.addEventListener('click', () => {
  const tab = button.dataset.proofTab;
  document.querySelectorAll<HTMLElement>('[data-proof-tab]').forEach(item => item.classList.toggle('active', item === button));
  document.querySelectorAll<HTMLElement>('[data-proof-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.proofPanel === tab));
}));

const queryParams = new URLSearchParams(location.search);
document.querySelectorAll<HTMLAnchorElement>('[data-product-link]').forEach(link => {
  const url = new URL(link.href, location.origin);
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(key => {
    const incoming = queryParams.get(key);
    if (incoming && key !== 'utm_content') url.searchParams.set(`origin_${key}`, incoming);
  });
  link.href = `${url.pathname}${url.search}${url.hash}`;
});

const reveal = [...document.querySelectorAll<HTMLElement>('.lr-chapter, .final-offer, .decision-map')];
if (matchMedia('(prefers-reduced-motion: reduce)').matches) reveal.forEach(item => item.classList.add('shown'));
else {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('shown');
    revealObserver.unobserve(entry.target);
  }), {threshold:.06, rootMargin:'0px 0px -8%'});
  reveal.forEach(item => {item.classList.add('will-reveal'); revealObserver.observe(item);});
}
