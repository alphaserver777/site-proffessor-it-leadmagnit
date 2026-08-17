import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const source = "https://site.criminalit.ru";
const root = new URL("../", import.meta.url).pathname;
const apiDir = join(root, "public", "api");
const mediaDir = join(root, "public", "media");
await mkdir(apiDir, { recursive: true });
await mkdir(mediaDir, { recursive: true });

const get = async (path) => {
  const url = path.startsWith("http") ? path : `${source}${path}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
};

const nameForms = [
  [/Кириллом/g, "Вадимом"], [/Кириллу/g, "Вадиму"], [/Кирилла/g, "Вадима"],
  [/Кирилле/g, "Вадиме"], [/Кирилл/g, "Вадим"], [/кириллом/g, "вадимом"],
  [/кириллу/g, "вадиму"], [/кирилла/g, "вадима"], [/кирилле/g, "вадиме"], [/кирилл/g, "вадим"],
];

const media = new Map();
const adapt = (value) => {
  if (Array.isArray(value)) return value.map(adapt);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, adapt(item)]));
  }
  if (typeof value !== "string") return value;

  let result = value;
  nameForms.forEach(([pattern, replacement]) => (result = result.replace(pattern, replacement)));
  result = result.replaceAll("Criminal IT", "Профессор IT");

  const absolute = result.startsWith("/") ? `${source}${result}` : result;
  if (absolute.startsWith(`${source}/uploads/`)) {
    const file = basename(new URL(absolute).pathname);
    media.set(absolute, file);
    return `/mentorship/media/${file}`;
  }
  if (result.startsWith("/api/video/")) return `${source}${result}`;
  return result;
};

const raw = await (await get("/api/site")).json();
if (!raw || typeof raw !== "object" || !raw.settings || !Array.isArray(raw.sections) || !Array.isArray(raw.lessons)) {
  throw new Error("Reference API returned an unsupported schema");
}

const data = adapt(raw);
const requiredArrays = ["badges", "stats", "jobOffers", "roadmap", "skills", "guarantees", "plans", "reviews", "faq"];
for (const key of requiredArrays) {
  if (!Array.isArray(data.settings[key]) || data.settings[key].length === 0) {
    throw new Error(`Reference API field settings.${key} is missing or empty`);
  }
}

data.settings.brand = "Профессор IT";
data.settings.ctaLink = "https://t.me/proffessor_it";
data.settings.ctaText ||= "Хочу на обучение";
data.settings.plans = data.settings.plans.map((plan) => ({ ...plan, ctaLink: "https://t.me/proffessor_it" }));

const download = async ([url, file]) => {
  const target = join(mediaDir, file);
  try {
    const existing = await readFile(target);
    if (existing.length > 0) return;
  } catch {}

  const response = await get(url);
  const type = response.headers.get("content-type") || "";
  if (!type.startsWith("image/")) throw new Error(`${url}: expected image, received ${type || "unknown content"}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) throw new Error(`${url}: empty image`);
  await writeFile(target, bytes);
  await access(target);
};

const queue = [...media.entries()];
for (let index = 0; index < queue.length; index += 8) {
  await Promise.all(queue.slice(index, index + 8).map(download));
}

const serialized = JSON.stringify(data);
if (/Criminal IT|Кирилл|кирилл/.test(serialized)) throw new Error("Brand or mentor replacement is incomplete");
await writeFile(join(apiDir, "site.json"), serialized);

console.log(`Mirrored revision ${data.rev}: ${queue.length} images, ${data.lessons.length} lessons, ${data.settings.reviews.length} reviews`);
