import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const source = "https://site.criminalit.ru";
const root = new URL("../", import.meta.url).pathname;
const assetsDir = join(root, "public", "assets");
const apiDir = join(root, "public", "api");
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
data.settings.ctaText = data.settings.ctaText || "Хочу на обучение";
data.settings.plans = (data.settings.plans || []).map((plan) => ({ ...plan, ctaLink: "https://t.me/proffessor_it" }));
await writeFile(join(apiDir, "site.json"), JSON.stringify(data));

console.log(`Mirrored ${importedChunks.length + cssAssets.length + 5} assets and source revision ${data.rev}`);
