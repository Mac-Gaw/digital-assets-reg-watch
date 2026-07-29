import fs from "node:fs/promises";
import path from "node:path";
import { stripHtml, normalizeString, slugify } from "./classify-item.mjs";

const root = process.cwd();
const dataDir = path.join(root, "data");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");

const LOOKAHEAD_DAYS = Number(process.env.EVENT_LOOKAHEAD_DAYS || 365);
const KEEP_PAST_DAYS = Number(process.env.EVENT_KEEP_PAST_DAYS || 7);
const MAX_EVENTS = Number(process.env.EVENT_MAX_ITEMS || 80);

const POSITIVE_RULES = [
  { category: "Tokenisation", terms: ["tokenisation", "tokenization", "tokenised", "tokenized", "tokenised assets", "tokenized assets", "digital securities", "digital security", "fund tokenisation", "fund tokenization", "rwa", "real-world assets", "real world assets"] },
  { category: "Digital money & settlement assets", terms: ["stablecoin", "stablecoins", "digital money", "digital cash", "digital settlement asset", "digital settlement assets", "regulated settlement asset", "tokenised deposit", "tokenized deposit", "tokenised deposits", "tokenized deposits", "deposit token", "deposit tokens", "bank-issued token", "bank issued token", "commercial bank money token", "commercial bank money tokens", "wholesale cbdc", "cbdc"] },
  { category: "Custody", terms: ["digital asset custody", "crypto custody", "custodian", "custody", "safekeeping", "safeguarding"] },
  { category: "Market infrastructure", terms: ["financial market infrastructure", "market infrastructure", "fmi", "post-trade", "post trade", "settlement", "clearing", "csd", "ccp", "digital securities depository", "dlt", "distributed ledger"] },
  { category: "Collateral", terms: ["collateral", "margin", "securities finance", "securities financing", "repo", "tokenized collateral", "tokenised collateral"] },
  { category: "Regulation", terms: ["regulation", "regulatory", "cryptoasset regulation", "crypto asset regulation", "mica", "fca", "sec", "esma", "eba", "boe", "hm treasury"] }
];

const EVENT_TERMS = [
  "webinar", "conference", "summit", "roundtable", "briefing", "forum", "event", "panel",
  "fireside chat", "workshop", "masterclass", "symposium", "live", "registration", "register"
];

const NEGATIVE_TERMS = [
  "price prediction", "technical analysis", "bitcoin price", "btc price", "ether price", "eth price",
  "memecoin", "meme coin", "airdrop", "nft collection", "trader says", "whale", "gaming token",
  "exchange listing", "token launch"
];

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
  return getTag(block, "link");
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
    const rawDate = getTag(block, ["pubDate", "published", "updated", "dc:date"]);
    const description = getTag(block, ["description", "summary", "content", "content:encoded"]);
    const parsedDate = rawDate ? new Date(rawDate) : null;
    return {
      title,
      url,
      description,
      rawDate,
      eventDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : "",
      source: source.name
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
  return `${normaliseUrl(item.url)}-${String(item.eventDate || "").slice(0, 10)}`;
}

function classifyEvent(raw, source) {
  const haystack = [raw.title, raw.description, raw.url].filter(Boolean).join(" ").toLowerCase();
  const matchedCategories = POSITIVE_RULES
    .filter(rule => rule.terms.some(term => haystack.includes(term)))
    .map(rule => rule.category);
  const hasEventTerm = EVENT_TERMS.some(term => haystack.includes(term)) || source.defaultFormat;
  const hasNegative = NEGATIVE_TERMS.some(term => haystack.includes(term));
  const date = new Date(raw.eventDate);
  const now = Date.now();
  const lower = now - KEEP_PAST_DAYS * 86400000;
  const upper = now + LOOKAHEAD_DAYS * 86400000;
  const dateOk = !Number.isNaN(date.getTime()) && date.getTime() >= lower && date.getTime() <= upper;
  return {
    isRelevant: Boolean(hasEventTerm && matchedCategories.length && !hasNegative && dateOk),
    category: matchedCategories[0] || source.category || "Institutional digital assets",
    topics: [...new Set(matchedCategories)].slice(0, 3)
  };
}

function inferFormat(raw, source) {
  const haystack = [raw.title, raw.description, raw.url].filter(Boolean).join(" ").toLowerCase();
  if (haystack.includes("webinar")) return "Webinar";
  if (haystack.includes("roundtable")) return "Roundtable";
  if (haystack.includes("summit")) return "Summit";
  if (haystack.includes("conference")) return "Conference";
  if (haystack.includes("briefing")) return "Briefing";
  if (haystack.includes("workshop")) return "Workshop";
  if (haystack.includes("forum")) return "Forum";
  if (haystack.includes("replay") || haystack.includes("on-demand") || haystack.includes("on demand")) return "Replay";
  return source.defaultFormat || "Event";
}

function inferLocation(raw, source) {
  const haystack = [raw.title, raw.description, raw.url].filter(Boolean).join(" ").toLowerCase();
  if (haystack.includes("online") || haystack.includes("virtual") || haystack.includes("webinar")) return "Online";
  if (haystack.includes("london")) return "London";
  if (haystack.includes("new york")) return "New York";
  if (haystack.includes("singapore")) return "Singapore";
  if (haystack.includes("hong kong")) return "Hong Kong";
  if (haystack.includes("brussels")) return "Brussels";
  if (haystack.includes("frankfurt")) return "Frankfurt";
  if (haystack.includes("zurich")) return "Zurich";
  return source.defaultLocation || "Location not stated";
}

function toEvent(raw, source, classification) {
  return {
    id: `${source.id}-${slugify(raw.title)}-${String(raw.eventDate || "").slice(0, 10)}`,
    title: normalizeString(raw.title),
    source: source.name,
    url: normaliseUrl(raw.url),
    eventDate: raw.eventDate,
    format: inferFormat(raw, source),
    location: inferLocation(raw, source),
    access: source.defaultAccess || "Registration required",
    category: classification.category,
    topics: classification.topics.length ? classification.topics : [classification.category],
    collectionMode: source.collectionMode || "auto"
  };
}

function applyEventRetention(items) {
  const now = Date.now();
  const lower = now - KEEP_PAST_DAYS * 86400000;
  const upper = now + LOOKAHEAD_DAYS * 86400000;
  return items
    .filter(item => {
      const date = new Date(item.eventDate);
      return !Number.isNaN(date.getTime()) && date.getTime() >= lower && date.getTime() <= upper;
    })
    .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)))
    .slice(0, MAX_EVENTS);
}


async function writeScanLog(file, payload) {
  try {
    await fs.mkdir(path.join(root, "logs"), { recursive: true });
    await fs.writeFile(path.join(root, "logs", file), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  } catch (error) {
    console.warn(`Warning: could not write logs/${file}: ${error.message}`);
  }
}

const registry = await readJson("events-sources.registry.json", []);
const existing = await readJson("events.json", []);
const known = new Set(existing.map(itemKey));
const newItems = [];
const scanLog = [];

for (const source of registry.filter(s => s.enabled !== false && s.feedUrl)) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.FEED_TIMEOUT_MS || 15000));
    const response = await fetch(source.feedUrl, {
      signal: controller.signal,
      headers: {
        "user-agent": "DigitalAssetsRegulatoryWatch/1.0 (+events-and-briefings monitoring; no article text reproduction; contact: replace@example.com)",
        "accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.7"
      }
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const rawItems = parseFeed(xml, source);
    let relevant = 0;
    for (const raw of rawItems) {
      const classification = classifyEvent(raw, source);
      if (!classification.isRelevant) continue;
      relevant += 1;
      const item = toEvent(raw, source, classification);
      const key = itemKey(item);
      if (known.has(key)) continue;
      known.add(key);
      newItems.push(item);
    }
    scanLog.push({ source: source.id, status: "ok", feedItems: rawItems.length, relevantItems: relevant });
  } catch (error) {
    scanLog.push({ source: source.id, status: "error", message: error.message });
  }
}

if (!dryRun) {
  const merged = applyEventRetention([...existing, ...newItems]);
  await writeJson("events.json", merged);
  const metadata = await readJson("metadata.json", {});
  metadata.events = metadata.events || {};
  metadata.events.lastScan = new Date().toISOString();
  metadata.events.lookaheadDays = LOOKAHEAD_DAYS;
  metadata.events.keepPastDays = KEEP_PAST_DAYS;
  metadata.events.lastScanResult = {
    newItems: newItems.length,
    storedItems: merged.length,
    checkedSources: registry.filter(s => s.enabled !== false && s.feedUrl).length
  };
  await writeJson("metadata.json", metadata);
  await writeScanLog("last-events-scan.json", {
    scannedAt: new Date().toISOString(),
    newItems: newItems.length,
    sources: scanLog
  });
  await import("./build-data.mjs");
}

console.log(JSON.stringify({ dryRun, newItems: newItems.length, sources: scanLog }, null, 2));
