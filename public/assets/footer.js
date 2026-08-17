const MAX_URL = "https://max.ru/u/f9LHodD0cOKSwTkPJdylbGaluZM4miWZqbpMcBD7uTVI8UGfJLvPabOTi08";

function enhanceFooter() {
  const link = [...document.querySelectorAll("footer a")].find((item) => {
    try {
      return new URL(item.href).href === MAX_URL;
    } catch {
      return false;
    }
  });

  if (!link || link.dataset.maxEnhanced === "true") return Boolean(link);

  link.dataset.maxEnhanced = "true";
  link.setAttribute("aria-label", "Написать в MAX");
  const icon = link.querySelector("svg");
  if (icon) {
    const mark = document.createElement("span");
    mark.className = "footer-max-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "MAX";
    icon.replaceWith(mark);
  }

  const label = [...link.childNodes].find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
  );
  if (label) label.textContent = "MAX";
  else link.append("MAX");
  return true;
}

if (!enhanceFooter()) {
  const observer = new MutationObserver(() => {
    if (enhanceFooter()) observer.disconnect();
  });
  observer.observe(document.getElementById("root"), { childList: true, subtree: true });
}
