import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const source = "https://site.criminalit.ru";
const root = new URL("../", import.meta.url).pathname;
const assetsDir = join(root, "public", "assets");
const apiDir = join(root, "public", "api");
const offerMediaDir = join(root, "public", "media", "offers");
await mkdir(assetsDir, { recursive: true });
await mkdir(apiDir, { recursive: true });

const get = async (path) => {
  const response = await fetch(`${source}${path}`);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response;
};

const html = await (await get("/")).text();
const mainPath = html.match(/<script type="module" crossorigin src="([^"]+)"/)?.[1];
const cssPath = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)"/)?.[1];
if (!mainPath || !cssPath) throw new Error("Reference asset manifest was not found");

let main = await (await get(mainPath)).text();
const sourceFetch = 'fetch("/api/site")';
if (!main.includes(sourceFetch)) throw new Error("Reference data endpoint was not found in the app bundle");
main = main.replace(sourceFetch, 'fetch("/mentorship/api/site.json")');
main = main.replaceAll('"/logo.jpg"', '"/mentorship/logo.jpg"');
await writeFile(join(assetsDir, "reference-app.js"), main);

const importedChunks = [...main.matchAll(/from"\.\/([^"]+\.js)"/g)].map((match) => match[1]);
for (const file of new Set(importedChunks)) {
  const data = Buffer.from(await (await get(`/assets/${file}`)).arrayBuffer());
  await writeFile(join(assetsDir, file), data);
}

let css = await (await get(cssPath)).text();
const cssAssets = [...css.matchAll(/url\(\/assets\/([^)'"?]+)/g)].map((match) => match[1]);
css = css.replaceAll("url(/assets/", "url(/mentorship/assets/");
await writeFile(join(assetsDir, "reference.css"), css);
for (const file of new Set(cssAssets)) {
  const data = Buffer.from(await (await get(`/assets/${file}`)).arrayBuffer());
  await writeFile(join(assetsDir, file), data);
}

for (const file of ["favicon.png", "apple-touch-icon.png", "logo.jpg"]) {
  const data = Buffer.from(await (await get(`/${file}`)).arrayBuffer());
  await writeFile(join(root, "public", file), data);
}

const nameForms = [
  [/Кириллом/g, "Вадимом"], [/Кириллу/g, "Вадиму"], [/Кирилла/g, "Вадима"],
  [/Кирилле/g, "Вадиме"], [/Кирилл/g, "Вадим"], [/кириллом/g, "вадимом"],
  [/кириллу/g, "вадиму"], [/кирилла/g, "вадима"], [/кирилле/g, "вадиме"], [/кирилл/g, "вадим"],
];
const adapt = (value) => {
  if (Array.isArray(value)) return value.map(adapt);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, adapt(item)]));
  if (typeof value !== "string") return value;
  let result = value;
  nameForms.forEach(([pattern, replacement]) => (result = result.replace(pattern, replacement)));
  result = result.replaceAll("Criminal IT", "Профессор IT");
  if (result.startsWith("/uploads/") || result.startsWith("/api/video/")) result = `${source}${result}`;
  return result;
};

const data = adapt(await (await get("/api/site")).json());
data.settings.brand = "Профессор IT";
data.settings.ctaLink = "https://t.me/proffessor_it";
data.settings.ctaText = "Хочу оффер";
data.settings.heroTitle = "С нуля до оффера за 2 месяца в DevOps";
data.settings.heroSubtitle = "Меня зовут Вадим — я кандидат технических наук, Senior DevOps-инженер и профессиональный хакер. У меня более 10 лет опыта в IT. Я лично помогу тебе освоить профессию, подготовиться к реальной работе и выйти на сильный оффер — даже если у тебя нет опыта.\n\nНикаких курсов и других кураторов. Стратегия обучения, практика, резюме, собеседования и испытательный срок — под моим сопровождением.";
data.settings.badges = (data.settings.badges || []).map((badge) => {
  if (badge.text === "164 ученика в сообществе") {
    return { ...badge, text: "Индивидуальное сопровождение" };
  }
  if (/^Осталось 20 мест на август$/i.test(badge.text)) {
    return { ...badge, text: "Всего 3 места" };
  }
  return badge;
});
data.settings.ui.ctaTitle = "Один шаг. Два маршрута.";
data.settings.ui.ctaSubtitle = "Самостоятельный путь у тебя останется всегда. Если выбираешь короткий — зафиксируй место и начни двигаться по готовому маршруту.\n\nПосле оплаты я лично собираю твой план, открываю доступ к платформе и веду тебя через практику, собеседования и испытательный срок.";

const offerImageDownloads = new Map();
for (const offer of data.settings.jobOffers || []) {
  if (!offer.image || !/^https?:\/\//i.test(offer.image)) continue;
  const remoteUrl = new URL(offer.image);
  const filename = remoteUrl.pathname.split("/").filter(Boolean).at(-1);
  if (!filename || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw new Error(`Unsupported offer image path: ${offer.image}`);
  }
  if (!offerImageDownloads.has(offer.image)) {
    offerImageDownloads.set(offer.image, { filename, remoteUrl });
  }
  offer.image = `/mentorship/media/offers/${filename}`;
}

const downloadedOfferImages = await Promise.all(
  [...offerImageDownloads.values()].map(async ({ filename, remoteUrl }) => {
    const response = await fetch(remoteUrl);
    if (!response.ok) throw new Error(`${remoteUrl}: HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error(`${remoteUrl}: expected image, received ${contentType || "unknown content type"}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0) throw new Error(`${remoteUrl}: empty image`);
    return { filename, bytes };
  }),
);

await mkdir(offerMediaDir, { recursive: true });
for (const { filename, bytes } of downloadedOfferImages) {
  await writeFile(join(offerMediaDir, filename), bytes);
}

const sourcePlan = (data.settings.plans || []).find((plan) => plan.highlighted) || data.settings.plans?.[0];
if (!sourcePlan) throw new Error("Reference pricing plan was not found");
data.settings.plans = [
  {
    ...sourcePlan,
    price: "70 000 + 50%",
    period: "",
    highlighted: true,
    ctaLink: "https://t.me/proffessor_it",
  },
  {
    ...sourcePlan,
    name: "Оффер под ключ — без процентов",
    price: "180 000",
    period: "",
    highlighted: false,
    ctaLink: "https://t.me/proffessor_it",
  },
];

// The published documents still contain the previous tariffs. Keep them off the
// landing page until a contract for the current terms is available.
data.settings.documents = [];

const faqAnswers = new Map([
  [
    "Буду ли я должен выплачивать оставшуюся часть  постоплаты, если меня уволят до полной выплаты?",
    "Если ты выбрал тариф 70 000 + 50% и тебя уволят до полной выплаты 50% от оффера, то выплаты ставятся на паузу и возобновляются после нахождения новой работы. На тарифе 180 000 без % постоплаты нет.",
  ],
  [
    "Постоплату можно поделить?",
    "На тарифе 70 000 + 50% постоплата составляет 50% от оффера. Условия и дата выплаты фиксируются в договоре. На тарифе 180 000 без % постоплаты нет.",
  ],
  [
    "Постоплату можно сдвинуть?",
    "На тарифе 70 000 + 50% постоплату нужно начинать платить с первого прихода заработной платы. Если первая заработная плата меньше полного оклада, выплата рассчитывается от фактически полученной суммы. На тарифе 180 000 без % постоплаты нет.",
  ],
  [
    "Постопоплата считается от гросс или нет?",
    "На тарифе 70 000 + 50% постоплата считается не от гросс-зарплаты, а от зарплаты на руки — после вычета налогов. Размер постоплаты составляет 50% от этой суммы. На тарифе 180 000 без % постоплаты нет.",
  ],
]);
data.settings.faq = (data.settings.faq || []).map((item) => (
  faqAnswers.has(item.q)
    ? { ...item, a: faqAnswers.get(item.q) }
    : item
));

data.settings.paymentMethods = [
  ...(data.settings.paymentMethods || []).filter((method) => !/рассроч|т[‑-]?банк/i.test(method.label)),
  {
    label: "Рассрочка от 5к в месяц",
    image: "",
  },
];

data.settings.reviews = (data.settings.reviews || []).map((review) => ({
  ...review,
  link: "",
}));
data.settings.ui.reviewsWriteStudent = "";
data.settings.ui.reviewsFootnote = "";
await writeFile(join(apiDir, "site.json"), JSON.stringify(data));

console.log(`Mirrored ${importedChunks.length + cssAssets.length + 5} assets, ${downloadedOfferImages.length} offer images and source revision ${data.rev}`);
