import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");
const assetsDir = path.join(root, "assets");

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(path.join(dataDir, file), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

const metadata = await readJson("metadata.json", {});
const bundle = {
  ...metadata,
  monitoring: metadata.monitoring || {},
  monthlyReviews: await readJson("monthly-reviews.json", []),
  updates: await readJson("updates.json", []),
  accessMatrix: await readJson("access-matrix.json", []),
  consultations: await readJson("consultations.json", []),
  sources: await readJson("sources.json", [])
};

await fs.mkdir(assetsDir, { recursive: true });
await fs.writeFile(
  path.join(assetsDir, "data.js"),
  `window.REGWATCH_DATA = ${JSON.stringify(bundle, null, 2)};\n`,
  "utf8"
);

console.log(`Built assets/data.js with ${bundle.updates.length} feed items, ${bundle.consultations.length} consultations, ${bundle.sources.length} sources.`);
