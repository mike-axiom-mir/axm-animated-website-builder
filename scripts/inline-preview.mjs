import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = path.join(root, "dist", "client");
const assets = path.join(client, "assets");
const names = await readdir(assets);
const cssName = names.find((name) => name.endsWith(".css"));
const jsName = names.find((name) => name.endsWith(".js"));

if (!cssName || !jsName) throw new Error("Built CSS or JavaScript asset is missing");

const [source, css, jsSource] = await Promise.all([
  readFile(path.join(client, "index.html"), "utf8"),
  readFile(path.join(assets, cssName), "utf8"),
  readFile(path.join(assets, jsName), "utf8"),
]);
const js = jsSource.replaceAll("</script", "<\\/script");
const html = source
  .replace(/<link[^>]+href="[^"]+\.css"[^>]*>/, () => `<style>${css}</style>`)
  .replace(/<script[^>]+src="[^"]+\.js"[^>]*><\/script>/, () => `<script type="module">${js}</script>`);

await writeFile(path.join(root, "dist", "inline-preview.html"), html);
console.log(`Prepared dist/inline-preview.html (${Buffer.byteLength(html)} bytes)`);
