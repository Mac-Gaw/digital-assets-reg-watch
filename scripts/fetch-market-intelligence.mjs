import fs from "node:fs/promises";
import path from "node:path";
import { stripHtml, normalizeString, slugify } from "./classify-item.mjs";

const root = process.cwd();
const dataDir = path.join(root, "data");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const RETENTION_DAYS = Number(process.env.MARKET_RETENTION_DAYS || 30);
const MAX_ITEMS = Number(process.env.MARKET_MAX_ITEMS || 100);
const FUTURE_DATE_GRACE_HOURS = Number(process.env.MARKET_FUTURE_DATE_GRACE_HOURS || 12);
const FUTURE_DATE_GRACE_MS = FUTURE_DATE_GRACE_HOURS * 60 * 60 * 1000;

const POSITIVE_RULES = [
  { category: "Tokenisation", terms: ["tokenisation", "tokenization", "tokenised", "tokenized", "digital securities", "digital security", "tokenised securities", "tokenized securities", "fund tokenisation", "fund tokenization", "tokenised fund", "tokenized fund"] },
  { category: "Custody", terms: ["digital asset custody", "crypto custody", "custodian", "custody", "safekeeping", "safeguarding", "zodia", "copper", "fireblocks"] },
  { category: "Stablecoins & settlement", terms: ["stablecoin", "stablecoins", "digital settlement asset", "tokenised deposit", "tokenized deposit", "bank-issued token", "bank issued token", "deposit token", "wholesale payment", "settlement asset"] },
  { category: "Market infrastructure", terms: ["financial market infrastructure", "market infrastructure", "fmi", "post-trade", "post trade", "settlement", "clearing", "dvp", "delivery versus payment", "csd", "ccp", "central securities depository", "digital securities depository"] },
  { category: "Collateral", terms: ["collateral", "margin", "securities finance", "securities financing", "repo", "tokenized collateral", "tokenised collateral"] },
  { category: "Institutional adoption", terms: ["institutional digital assets", "digital asset servicing", "asset servicing", "securities services", "wholesale cbdc", "cbdc", "sandbox", "dlt", "distributed ledger", "canton network", "swift shared ledger"] }
];

const CONTEXT_TERMS = [
  "bank", "banks", "institutional", "regulated", "regulation", "regulatory", "authorisation", "authorization",
  "custodian", "custody", "settlement", "payments", "clearing", "securities", "asset servicing", "market infrastructure",
  "fmi", "csd", "ccp", "collateral", "post-trade", "post trade", "wholesale", "fund", "funds", "exchange", "fca", "sec", "esma", "eba", "boe", "central bank"
];

const NEGATIVE_RULES = [
  "price prediction", "technical analysis", "rally", "plunge", "soars", "tumbles", "all-time high", "all time high",
  "bitcoin price", "btc price", "ether price", "eth price", "memecoin", "meme coin", "airdrop", "nft collection",
  "whale", "trader says", "traders say", "bullish", "bearish", "altcoin", "gaming token", "exchange token",
  "hack", "exploit", "rug pull", "scam token"
];

const EVENT_RULES = [
  "webinar", "web seminar", "event registration", "register now", "register for", "online event",
  "conference", "summit", "awards", "roundtable", "masterclass"
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
    const publishedRaw = getTag(block, ["pubDate", "published", "updated", "dc:date"]);
    const description = getTag(block, ["description", "summary", "content", "content:encoded"]);
    const date = publishedRaw ? new Date(publishedRaw) : new Date();
    return {
      title,
      url,
      description,
      publishedAt: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
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
  return normaliseUrl(item.url) || `${slugify(item.title)}-${String(item.publishedAt || "").slice(0, 10)}`;
}

function isFutureDated(raw) {
  const date = new Date(raw.publishedAt);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now() + FUTURE_DATE_GRACE_MS;
}

function looksLikeEventOrWebinar(raw) {
  const haystack = [raw.title, raw.description, raw.url].filter(Boolean).join(" ").toLowerCase();
  return EVENT_RULES.some(term => haystack.includes(term));
}

function classifyMarketItem(raw, source) {
  const haystack = [raw.title, raw.description].filter(Boolean).join(" ").toLowerCase();
  const matchedCategories = POSITIVE_RULES
    .filter(rule => rule.terms.some(term => haystack.includes(term)))
    .map(rule => rule.category);
  const contextHits = CONTEXT_TERMS.filter(term => haystack.includes(term)).length;
  const hasNegative = NEGATIVE_RULES.some(term => haystack.includes(term));
  const isFutureEvent = isFutureDated(raw) && (looksLikeEventOrWebinar(raw) || source.excludeFutureDatedItems !== false);
  const isRelevant = matchedCategories.length > 0 && contextHits > 0 && !hasNegative && !isFutureEvent;
  return {
    isRelevant,
    category: matchedCategories[0] || source.category || "Institutional digital assets",
    topics: [...new Set(matchedCategories)].slice(0, 3)
  };
}

function toMarketItem(raw, source, classification) {
  return {
    id: `${source.id}-${slugify(raw.title)}-${String(raw.publishedAt || "").slice(0, 10)}`,
    title: normalizeString(raw.title),
    source: source.name,
    url: normaliseUrl(raw.url),
    publishedAt: raw.publishedAt || new Date().toISOString(),
    category: classification.category,
    topics: classification.topics.length ? classification.topics : [classification.category],
    collectionMode: "auto"
  };
}

function applyRetention(items) {
  const now = Date.now();
  const cutoff = now - RETENTION_DAYS * 86400000;
  const futureCutoff = now + FUTURE_DATE_GRACE_MS;
  return items
    .filter(item => {
      const date = new Date(item.publishedAt);
      return !Number.isNaN(date.getTime()) && date.getTime() >= cutoff && date.getTime() <= futureCutoff;
    })
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .slice(0, MAX_ITEMS);
}

const registry = await readJson("market-sources.registry.json", []);
const existing = await readJson("market-intelligence.json", []);
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
        "user-agent": "DigitalAssetsRegulatoryWatch/1.0 (+titles-and-links market intelligence monitoring; no article text reproduction; contact: replace@example.com)",
        "accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.7"
      }
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const rawItems = parseFeed(xml, source);
    let relevant = 0;
    for (const raw of rawItems) {
      const classification = classifyMarketItem(raw, source);
      if (!classification.isRelevant) continue;
      relevant += 1;
      const item = toMarketItem(raw, source, classification);
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
  const merged = applyRetention([...newItems, ...existing]);
  await writeJson("market-intelligence.json", merged);
  const metadata = await readJson("metadata.json", {});
  metadata.marketIntelligence = metadata.marketIntelligence || {};
  metadata.marketIntelligence.lastScan = new Date().toISOString();
  metadata.marketIntelligence.retentionDays = RETENTION_DAYS;
  metadata.marketIntelligence.maxItems = MAX_ITEMS;
  metadata.marketIntelligence.lastScanResult = {
    newItems: newItems.length,
    storedItems: merged.length,
    checkedSources: registry.filter(s => s.enabled !== false && s.feedUrl).length
  };
  await writeJson("metadata.json", metadata);
  await fs.mkdir(path.join(root, "logs"), { recursive: true });
  await fs.writeFile(path.join(root, "logs", "last-market-scan.json"), `${JSON.stringify({ scannedAt: new Date().toISOString(), newItems: newItems.length, sources: scanLog }, null, 2)}\n`, "utf8");
  await import("./build-data.mjs");
}

console.log(JSON.stringify({ dryRun, newItems: newItems.length, sources: scanLog }, null, 2));
