import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "dist/index.html",
  "dist/payment/success/index.html",
  "dist/payment/failed/index.html",
  "dist/guide/kak-voiti-v-it/index.html",
  "dist/guide/kak-voiti-v-it/2/index.html",
  "dist/guide/kak-voiti-v-it/3/index.html",
  "dist/guide/kak-voiti-v-it/4/index.html",
  "dist/guide/kak-vybrat-it-professiyu/index.html",
  "dist/mentorship/index.html",
  "dist/mentorship/api/site.json",
  "dist/mentorship/assets/reference.css",
];

await Promise.all(requiredFiles.map((path) => access(resolve(root, path))));

const pages = [
  ["dist/index.html", "https://professorit.ru/"],
  [
    "dist/guide/kak-voiti-v-it/index.html",
    "https://professorit.ru/guide/kak-voiti-v-it/",
  ],
  ["dist/mentorship/index.html", "https://professorit.ru/mentorship/"],
];

for (const [path, canonical] of pages) {
  const html = await readFile(resolve(root, path), "utf8");
  if (!html.includes(canonical)) {
    throw new Error(`В ${path} отсутствует ожидаемый адрес ${canonical}`);
  }
}

console.log("Проверены обязательные файлы и адреса трёх сайтов.");
