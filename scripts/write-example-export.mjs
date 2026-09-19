import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildStandaloneHtml } from "../src/export/exportSite.js";
import { AXM_FRONT_DOOR_PROJECT } from "../src/projects/axmFrontDoor.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const preview = path.join(root, "preview");
await mkdir(preview, { recursive: true });
await writeFile(path.join(preview, "published.html"), buildStandaloneHtml(AXM_FRONT_DOOR_PROJECT));
console.log("Prepared preview/published.html from AXM_FRONT_DOOR_PROJECT");
