import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const rawUrl = process.argv[2] || process.env.SITE_URL;
if (!rawUrl) {
  console.error("Usage: npm run configure:url -- https://your-domain.example");
  process.exit(1);
}
const siteUrl = rawUrl.replace(/\/$/, "");

async function replaceInFile(file, replacements) {
  const filePath = path.join(root, file);
  let text = await fs.readFile(filePath, "utf8");
  for (const [from, to] of replacements) text = text.split(from).join(to);
  await fs.writeFile(filePath, text, "utf8");
}

await replaceInFile("index.html", [
  ["https://example.com/", `${siteUrl}/`],
  ["https://example.com/assets/social-preview.png", `${siteUrl}/assets/social-preview.png`]
]);
await replaceInFile("robots.txt", [["https://example.com/sitemap.xml", `${siteUrl}/sitemap.xml`]]);
await replaceInFile("sitemap.xml", [["https://example.com/", `${siteUrl}/`]]);
await replaceInFile("site.webmanifest", [["https://example.com/", `${siteUrl}/`]]);
console.log(`Configured site URL: ${siteUrl}`);
