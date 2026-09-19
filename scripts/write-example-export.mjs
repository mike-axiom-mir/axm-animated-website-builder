import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildStandaloneHtml } from "../src/export/exportSite.js";
import { DEFAULT_PROJECT } from "../src/model/project.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const preview = path.join(root, "preview");
await mkdir(preview, { recursive: true });
await writeFile(path.join(preview, "published.html"), buildStandaloneHtml(DEFAULT_PROJECT));
console.log("Prepared preview/published.html from DEFAULT_PROJECT");
