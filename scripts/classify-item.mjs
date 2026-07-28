const CORE_DIGITAL_TERMS = [
  "cryptoasset", "crypto-asset", "crypto asset", "digital asset", "digital assets",
  "stablecoin", "stablecoins", "tokenisation", "tokenization", "tokenised", "tokenized",
  "tokenised asset", "tokenized asset", "tokenised assets", "tokenized assets",
  "tokenised securities", "tokenized securities", "digital securities", "digital security",
  "tokenised deposit", "tokenized deposit", "deposit token", "bank-issued token", "bank issued token",
  "distributed ledger", "dlt", "permissioned blockchain", "blockchain settlement",
  "crypto regulation", "crypto regulatory", "markets in crypto-assets", "markets in crypto assets",
  "mica", "casp", "asset-referenced token", "asset referenced token", "asset-referenced tokens",
  "e-money token", "e-money tokens", "emt", "digital pound", "digital euro", "cbdc",
  "central bank digital currency", "wholesale cbdc", "unified ledger", "digital settlement asset",
  "tokenised collateral", "tokenized collateral", "digital asset custody", "crypto custody",
  "private key", "wallet"
];

const BROAD_CONTEXT_TERMS = [
  "financial market infrastructure", "market infrastructure", "fmi", "post-trade", "post trade",
  "settlement", "delivery versus payment", "dvp", "payment system", "payments", "collateral",
  "margin", "haircut", "derivatives", "eligible collateral", "custody", "custodian", "safeguarding",
  "prudential", "macroprudential", "capital", "basel", "operational resilience", "authorisation",
  "authorization", "perimeter", "financial promotions", "market abuse", "securities services",
  "asset servicing", "central securities depository", "csd", "ccp", "clearing"
];

const OFFICIAL_NAME_TERMS = [
  "fca", "financial conduct authority", "bank of england", "boe", "pra", "sec", "esma", "eba",
  "cftc", "fsb", "bis", "iosco", "hm treasury"
];

const NEGATIVE_TERMS = [
  "exchange rate", "exchange-rate", "exchange rate pass-through", "exchange rate pass-throughs",
  "inflation", "phillips curve", "macroprudential capital buffer", "capital buffer",
  "state-contingent tail effects", "tail effects", "parsimonious agent-based framework",
  "agent-based framework", "business cycle", "monetary policy transmission", "labour market",
  "labor market", "productivity", "gdp", "gross domestic product", "house prices", "mortgage",
  "mortgages", "interest rate pass-through", "non-parametric method", "nonparametric method",
  "bank profitability", "credit supply", "sovereign debt", "yield curve",
  "outage", "unable to make payments", "customers unable", "retail banking", "mobile banking",
  "online banking", "internet banking", "bank app", "banking app", "debit card", "credit card",
  "current account", "savings account", "atm", "branch", "branches", "mortgage customers",
  "personal banking", "consumer banking", "contactless", "cash withdrawal", "payment outage",
  "service disruption", "systems outage", "app outage", "website outage",
  "appoint members", "appointed members", "new members", "membership of", "taskforce members",
  "task force members", "working group members", "advisory group members"
];

const TOPIC_KEYWORDS = [
  { topic: "MiCA", terms: ["mica", "markets in crypto-assets", "markets in crypto assets", "casp", "asset-referenced token", "asset referenced token", "e-money token", "emt", "art"] },
  { topic: "UK Cryptoasset Regime", terms: ["uk cryptoasset", "uk crypto asset", "qualifying cryptoasset", "qualifying crypto asset", "cryptoasset regime", "crypto asset regime", "cryptoasset regulation", "crypto asset regulation"] },
  { topic: "Cryptoasset Regulation", terms: ["cryptoasset", "crypto-asset", "crypto asset", "digital asset", "digital assets", "crypto regulation", "crypto regulatory"] },
  { topic: "Stablecoins", terms: ["stablecoin", "stablecoins", "payment stablecoin", "global stablecoin", "dollar token", "tokenised deposit", "tokenized deposit"] },
  { topic: "Tokenisation", terms: ["tokenisation", "tokenization", "tokenised", "tokenized", "distributed ledger", "dlt", "unified ledger", "digital securities", "digital security"] },
  { topic: "Custody", terms: ["digital asset custody", "crypto custody", "safeguarding of cryptoassets", "private key", "wallet"] },
  { topic: "Collateral", terms: ["tokenised collateral", "tokenized collateral", "digital collateral", "eligible cryptoasset collateral", "eligible digital asset collateral"] },
  { topic: "Settlement", terms: ["delivery versus payment", "dvp", "digital settlement", "tokenised settlement", "tokenized settlement", "settlement asset", "digital settlement asset", "wholesale settlement"] },
  { topic: "Prudential Treatment", terms: ["prudential treatment of crypto", "cryptoasset exposure", "crypto-asset exposure", "basel crypto", "bank cryptoasset", "bank crypto-asset"] },
  { topic: "Market Abuse", terms: ["cryptoasset market abuse", "crypto-asset market abuse", "digital asset market abuse", "admissions and disclosures", "inside information"] },
  { topic: "CBDC", terms: ["cbdc", "digital pound", "digital euro", "central bank digital currency", "wholesale cbdc"] }
];

const HIGH_PRIORITY_TERMS = [
  "consultation", "policy statement", "final rule", "proposed rule", "guidance", "authorisation", "authorization",
  "regime", "regulation", "rulemaking", "deadline", "in force", "implementation", "supervision", "prudential",
  "stablecoin", "mica", "custody", "safeguarding", "market abuse", "tokenisation", "tokenization"
];

const MEDIUM_PRIORITY_TERMS = [
  "speech", "report", "paper", "review", "analysis", "framework", "recommendations", "pilot", "sandbox"
];

export function normalizeString(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export function stripHtml(value) {
  return normalizeString(String(value || "").replace(/<[^>]*>/g, " "));
}

export function slugify(value) {
  return normalizeString(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "item";
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termPattern(term) {
  const escaped = escapeRegex(term.trim()).replace(/\s+/g, "\\s+");
  if (/^[a-z0-9]+$/i.test(term)) return new RegExp(`\\b${escaped}\\b`, "i");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
}

function hasTerm(text, term) {
  return termPattern(term).test(String(text || ""));
}

function hasAny(text, terms) {
  return terms.some(term => hasTerm(text, term));
}

function textParts(raw) {
  return {
    metadata: [raw.keywords, raw.categories].filter(Boolean).join(" ").toLowerCase(),
    title: String(raw.title || "").toLowerCase(),
    summary: [raw.summary, raw.description].filter(Boolean).join(" ").toLowerCase()
  };
}

function allText(raw) {
  const parts = textParts(raw);
  return [parts.metadata, parts.title, parts.summary].filter(Boolean).join(" ");
}

function scoreAgainstTerms(text, terms, weight) {
  return terms.reduce((score, term) => score + (hasTerm(text, term) ? weight : 0), 0);
}

function relevanceScore(raw, source = {}) {
  const parts = textParts(raw);

  const metadataPositive = scoreAgainstTerms(parts.metadata, CORE_DIGITAL_TERMS, 4);
  const titlePositive = scoreAgainstTerms(parts.title, CORE_DIGITAL_TERMS, 3);
  const summaryPositive = scoreAgainstTerms(parts.summary, CORE_DIGITAL_TERMS, 1.5);

  const broadContext = Math.min(
    scoreAgainstTerms([parts.metadata, parts.title, parts.summary].join(" "), BROAD_CONTEXT_TERMS, 0.5),
    2
  );

  const sourceKeywords = (source?.keywords || []).map(k => String(k).toLowerCase());
  const coreSourceKeywords = sourceKeywords.filter(keyword =>
    CORE_DIGITAL_TERMS.some(term => keyword === term || keyword.includes(term) || term.includes(keyword))
  );
  const sourceKeywordScore = Math.min(scoreAgainstTerms([parts.metadata, parts.title, parts.summary].join(" "), coreSourceKeywords, 2), 4);

  const metadataNegative = scoreAgainstTerms(parts.metadata, NEGATIVE_TERMS, 5);
  const titleNegative = scoreAgainstTerms(parts.title, NEGATIVE_TERMS, 4);
  const summaryNegative = scoreAgainstTerms(parts.summary, NEGATIVE_TERMS, 2);

  const officialOnlyPenalty = hasAny([parts.metadata, parts.title, parts.summary].join(" "), OFFICIAL_NAME_TERMS)
    && metadataPositive + titlePositive + summaryPositive === 0
    ? 4
    : 0;

  const positive = metadataPositive + titlePositive + summaryPositive + sourceKeywordScore;
  const negative = metadataNegative + titleNegative + summaryNegative + officialOnlyPenalty;

  return {
    positive,
    negative,
    context: broadContext,
    score: positive + (positive > 0 ? broadContext : 0) - negative,
    hasCoreDigital: positive > 0,
    metadataPositive,
    titlePositive,
    summaryPositive,
    negativeMatched: negative > 0
  };
}

function matchedTopics(text) {
  return TOPIC_KEYWORDS
    .filter(rule => rule.terms.some(term => hasTerm(text, term)))
    .map(rule => rule.topic);
}

export function classifyItem(raw, source) {
  const text = allText(raw);
  const topics = matchedTopics(text);
  const category = determineCategory(text, raw.title);
  const priority = determinePriority(text, source, category);

  return {
    id: raw.id || `${source?.id || "source"}-${slugify(raw.title)}-${(raw.publishedAt || "").slice(0, 10)}`,
    title: normalizeString(raw.title),
    source: source?.name || raw.source || "Unknown source",
    sourceType: source?.sourceType || source?.type || "Source",
    url: raw.url,
    publishedAt: raw.publishedAt || new Date().toISOString(),
    jurisdiction: source?.region || raw.jurisdiction || "Global",
    category,
    topics: topics.length ? [...new Set(topics)] : ["Digital Assets"],
    priority,
    status: category === "Consultation" ? "Consultation" : "Published",
    summary: buildSummary(raw, source),
    whyItMatters: buildWhyItMatters(topics, source)
  };
}

function determineCategory(text, title = "") {
  if (/consultation|discussion paper|call for evidence|request for comment|comment period/.test(text)) return "Consultation";
  if (/policy statement|final rule|final guidance|staff accounting bulletin|interpretive letter/.test(text)) return "Policy Statement";
  if (/report|paper|annual economic report|recommendations|framework/.test(text)) return "Institutional Report";
  if (/speech|remarks|keynote/.test(text)) return "Speech / Remarks";
  if (/pilot|sandbox|implementation/.test(text)) return "Implementation Workstream";
  if (/regulation|rules|guidance|authorisation|authorization|perimeter/.test(text + " " + title.toLowerCase())) return "Regulatory Update";
  return "Source Update";
}

function determinePriority(text, source, category) {
  const isPrimary = String(source?.tier || "").toLowerCase() === "tier 1";
  const highScore = HIGH_PRIORITY_TERMS.reduce((score, term) => score + (hasTerm(text, term) ? 1 : 0), 0);
  const mediumScore = MEDIUM_PRIORITY_TERMS.reduce((score, term) => score + (hasTerm(text, term) ? 1 : 0), 0);
  if (isPrimary && highScore >= 1) return "High";
  if (category === "Consultation" || category === "Policy Statement") return "High";
  if (highScore >= 2) return "High";
  if (mediumScore >= 1 || isPrimary) return "Medium";
  return "Low";
}

function buildSummary(raw, source) {
  const cleaned = stripHtml(raw.summary || raw.description || "");
  if (cleaned && cleaned.length > 40) return cleaned.slice(0, 420);
  return `${source?.name || "The monitored source"} published a new item relevant to digital assets, tokenisation, stablecoins or financial market infrastructure monitoring.`;
}

function buildWhyItMatters(topics, source) {
  const t = new Set(topics);
  if (t.has("MiCA")) return "Relevant for EU regulatory perimeter, CASP authorisation, stablecoin issuance or crypto-asset service implementation analysis.";
  if (t.has("UK Cryptoasset Regime")) return "Relevant for firms assessing the UK cryptoasset perimeter, authorisation preparation, safeguarding, trading platform or conduct obligations.";
  if (t.has("Stablecoins")) return "Relevant for settlement assets, reserve models, payment stablecoin issuance, redemption rights and prudential or supervisory treatment.";
  if (t.has("Tokenisation") || t.has("Settlement")) return "Relevant for institutional tokenisation, settlement, custody, DvP, collateral and financial market infrastructure use cases.";
  if (t.has("Prudential Treatment")) return "Relevant for bank capital treatment, exposure management, risk classification and internal governance of cryptoasset-related activities.";
  return `Relevant as a public-source update from ${source?.name || "a monitored source"} within the covered regulatory intelligence scope.`;
}

export function isRelevant(raw, source) {
  const text = allText(raw);
  if (!text.trim()) return false;

  const relevance = relevanceScore(raw, source);

  // Keyword/category metadata and title matches carry the most weight. Summary
  // matches are accepted only when a genuine digital-assets anchor exists and
  // negative metadata/title signals do not overwhelm the item.
  return relevance.hasCoreDigital && relevance.score >= 3;
}

export function explainRelevance(raw, source) {
  return relevanceScore(raw, source);
}
