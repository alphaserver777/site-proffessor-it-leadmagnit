const streamPayloads = [
  "01\n/dev\nREADY\nssh\n1101\nk8s\nSYNC\n00\nnode\nUP",
  "terraform\nPLAN\n0010\napply\nOK\neth0\nUP\n1011\nroute",
  "kubectl\nget pods\nRUN\n0110\nlogs\nstream\n200\nREADY",
  "ansible\nPLAY\nchanged=0\n1001\nlinux\n/dev/null\nOK",
  "CI/CD\nbuild\nPASS\n0101\nimage\npush\nsha256\nDONE",
  "SRE\n99.99\nlatency\n12ms\n0011\nhealthy\nREADY",
];

const streamLayout = [
  [3, 25, 24, -7, .48], [8, 61, 29, -18, .34], [14, 43, 27, -12, .42],
  [21, 74, 31, -4, .26], [28, 34, 26, -21, .2], [34, 82, 33, -14, .13],
  [66, 47, 32, -8, .13], [72, 78, 27, -19, .2], [79, 29, 30, -3, .28],
  [86, 66, 25, -16, .42], [92, 39, 29, -10, .34], [97, 84, 31, -23, .46],
];

const contours = `
  <svg class="infra-contours" viewBox="0 0 1440 1680" preserveAspectRatio="none" aria-hidden="true">
    <g class="infra-contour infra-contour-left">
      <path d="M-130 270C90 120 310 150 420 330S520 690 285 790-35 1010 120 1220 315 1450 80 1690" />
      <path d="M-170 330C70 180 275 210 360 370S440 650 235 760-90 1025 60 1260 230 1480 5 1710" />
      <path d="M-205 395C15 260 220 265 300 415S360 635 175 735-145 1050 5 1305 160 1510-55 1735" />
    </g>
    <g class="infra-contour infra-contour-right">
      <path d="M1570 135C1350 35 1180 190 1090 390S1015 730 1225 840 1500 1020 1355 1265 1170 1495 1405 1690" />
      <path d="M1615 205C1390 100 1235 240 1150 420S1080 710 1280 820 1550 1055 1410 1300 1245 1510 1465 1715" />
      <path d="M1655 275C1440 170 1290 285 1220 450S1155 685 1335 800 1605 1090 1475 1335 1320 1535 1530 1740" />
    </g>
    <path class="infra-signal-path" d="M-30 1040C250 940 420 1110 690 1000S1160 840 1475 985" />
  </svg>`;

const enhanceAmbient = () => {

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const lowPowerDevice =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    connection?.saveData ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  if (lowPowerDevice) return true;

  const main = document.querySelector("main");
  const hero = document.querySelector("#top");
  const offers = document.querySelector("#joboffers");
  if (!main || !hero || !offers || main.querySelector(":scope > .infra-atmosphere")) {
    return Boolean(main?.querySelector(":scope > .infra-atmosphere"));
  }

  const atmosphere = document.createElement("div");
  atmosphere.className = "infra-atmosphere";
  atmosphere.setAttribute("aria-hidden", "true");
  atmosphere.innerHTML = `
    <div class="infra-streams">
      ${streamLayout.map(([x, rest, duration, delay, alpha], index) => `
        <span style="--stream-x:${x}%;--stream-rest:${rest}%;--stream-duration:${duration}s;--stream-delay:${delay}s;--stream-alpha:${alpha}">${streamPayloads[index % streamPayloads.length]}</span>`).join("")}
    </div>
    ${contours}
    <span class="infra-horizon" aria-hidden="true"></span>`;
  main.prepend(atmosphere);

  const syncHeight = () => {
    atmosphere.style.height = `${offers.offsetTop + offers.offsetHeight}px`;
  };
  syncHeight();
  const resizeObserver = new ResizeObserver(syncHeight);
  resizeObserver.observe(hero);
  resizeObserver.observe(offers);
  window.addEventListener("load", syncHeight, { once: true });
  return true;
};

if (!enhanceAmbient()) {
  const observer = new MutationObserver(() => {
    if (enhanceAmbient()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
