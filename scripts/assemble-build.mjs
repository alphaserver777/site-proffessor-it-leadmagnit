import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await cp(resolve(root, "apps/test-drive/dist"), output, { recursive: true });
await cp(resolve(root, "apps/lead-magnet/dist"), output, { recursive: true });
await cp(resolve(root, "apps/mentorship/dist"), resolve(output, "mentorship"), {
  recursive: true,
});

console.log("Собран единый выпуск: тест-драйв, лид-магнит и наставничество.");
