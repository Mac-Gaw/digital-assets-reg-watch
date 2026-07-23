import fs from "node:fs/promises";
import path from "node:path";
import { classifyItem, isRelevant, stripHtml, normalizeString, slugify } from "./classify-item.mjs";

const root = process.cwd();
const dataDir = path.join(root, "data");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const skipPageWatch = args.has("--rss-only");
const scheduled = args.has("--scheduled");

function londonTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
  return parts;
}

if (scheduled) {
  const parts = londonTimeParts();
  const hour = Number(parts.hour);
  if (hour !== 7) {
    console.log(`Scheduled run skipped: Europe/London local time is ${parts.hour}:${parts.minute}, target hour is 07:xx.`);
    process.exit(0);
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(path.join(dataDir, file), "utf8"));
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

async function writeJson(file, value) {
  await fs.writeFile(path.join(dataDir, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function decodeEntities(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function getTag(block, tagNames) {
  for (const tag of Array.isArray(tagNames) ? tagNames : [tagNames]) {
    const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
    if (match) return normalizeString(stripHtml(decodeEntities(match[1])));
  }
  return "";
}

function getLink(block) {
  const atom = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  if (atom) return decodeEntities(atom[1]);
  const rss = getTag(block, "link");
  return rss;
}

function parseFeed(xml, source) {
  const blocks = [];
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  const entryRegex = /<entry\b[\s\S]*?<\/entry>/gi;
  let match;
  while ((match = itemRegex.exec(xml))) blocks.push(match[0]);
  if (!blocks.length) while ((match = entryRegex.exec(xml))) blocks.push(match[0]);

  return blocks.map(block => {
    const title = getTag(block, "title");
    const url = getLink(block);
    const summary = getTag(block, ["description", "summary", "content", "content:encoded"]);
    const publishedRaw = getTag(block, ["pubDate", "published", "updated", "dc:date"]);
    const date = publishedRaw ? new Date(publishedRaw) : new Date();
    return {
      id: `${source.id}-${slugify(title)}-${Number.isNaN(date.getTime()) ? "undated" : date.toISOString().slice(0, 10)}`,
      title,
      url,
      summary,
      publishedAt: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
    };
  }).filter(item => item.title && item.url);
}

function normaliseUrl(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const key of [...u.searchParams.keys()]) {
      if (/^utm_|^fbclid$|^gclid$/i.test(key)) u.searchParams.delete(key);
    }
    return u.toString().replace(/\/$/, "");
  } catch (error) {
    return String(url || "").trim();
  }
}

function itemKey(item) {
  return normaliseUrl(item.url) || `${slugify(item.title)}-${String(item.publishedAt || "").slice(0, 10)}`;
}

function regionShort(region) {
  if (/united kingdom/i.test(region)) return "UK";
  if (/european union/i.test(region)) return "EU";
  if (/united states/i.test(region)) return "US";
  if (/global/i.test(region)) return "Global";
  return region;
}

function updateMonitoring(metadata, registry, newPublishedCount) {
  const now = new Date();
  const london = londonTimeParts(now);
  const isoDate = `${london.year}-${london.month}-${london.day}`;
  metadata.lastUpdated = isoDate;
  metadata.monitoring = metadata.monitoring || {};
  metadata.monitoring.status = "Active";
  metadata.monitoring.lastScan = now.toISOString();
  metadata.monitoring.quietPeriodDays = metadata.monitoring.quietPeriodDays || 14;
  const enabledRegions = [...new Set(registry.filter(s => s.enabled !== false).map(s => s.region || "Global"))];
  metadata.monitoring.regions = enabledRegions.map(region => ({
    name: region,
    shortName: regionShort(region),
    lastChecked: isoDate,
    status: "Active"
  }));
  metadata.monitoring.lastScanResult = {
    newPublishedItems: newPublishedCount,
    checkedSources: registry.filter(s => s.enabled !== false).length
  };
}

const registry = await readJson("sources.registry.json", []);
const metadata = await readJson("metadata.json", {});
const updates = await readJson("updates.json", []);
const pending = await readJson("pending-items.json", []);

const known = new Set([...updates, ...pending].map(itemKey));
const newAuto = [];
const newPending = [];
const scanLog = [];

for (const source of registry.filter(s => s.enabled !== false)) {
  if (!source.feedUrl) {
    scanLog.push({ source: source.id, status: skipPageWatch ? "skipped" : "manual-or-page-watch", reason: "No RSS/Atom feed configured in MVP v1.0" });
    continue;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.FEED_TIMEOUT_MS || 15000));
    const response = await fetch(source.feedUrl, {
      signal: controller.signal,
      headers: {
        "user-agent": "DigitalAssetsRegulatoryWatch/1.0 (+informational regulatory monitoring; contact: replace@example.com)",
        "accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.7"
      }
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const rawItems = parseFeed(xml, source);
    let relevant = 0;

    for (const raw of rawItems) {
      if (!isRelevant(raw, source)) continue;
      relevant += 1;
      const item = classifyItem(raw, source);
      const key = itemKey(item);
      if (known.has(key)) continue;
      known.add(key);
      if (source.publishMode === "auto") newAuto.push(item);
      else newPending.push({ ...item, reviewStatus: "draft", collectedAt: new Date().toISOString() });
    }
    scanLog.push({ source: source.id, status: "ok", feedItems: rawItems.length, relevantItems: relevant });
  } catch (error) {
    scanLog.push({ source: source.id, status: "error", message: error.message });
  }
}

if (!dryRun) {
  if (newAuto.length) {
    updates.unshift(...newAuto.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt))));
    await writeJson("updates.json", updates);
  }
  if (newPending.length) {
    pending.unshift(...newPending.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt))));
    await writeJson("pending-items.json", pending);
  }
  updateMonitoring(metadata, registry, newAuto.length);
  await writeJson("metadata.json", metadata);
  await fs.mkdir(path.join(root, "logs"), { recursive: true });
  await fs.writeFile(path.join(root, "logs", "last-scan.json"), `${JSON.stringify({ scannedAt: new Date().toISOString(), newAuto: newAuto.length, newPending: newPending.length, sources: scanLog }, null, 2)}\n`, "utf8");
  const build = await import("./build-data.mjs");
}

console.log(JSON.stringify({ dryRun, newAuto: newAuto.length, newPending: newPending.length, sources: scanLog }, null, 2));
