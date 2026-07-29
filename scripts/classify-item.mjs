const CORE_DIGITAL_TERMS = [
  "cryptoasset", "crypto-asset", "crypto asset", "cryptoassets", "crypto-assets",
  "digital asset", "digital assets",
  "tokenisation", "tokenization", "tokenised", "tokenized",
  "tokenised asset", "tokenized asset", "tokenised assets", "tokenized assets",
  "tokenised securities", "tokenized securities", "digital securities", "digital security",
  "stablecoin", "stablecoins", "payment stablecoin", "global stablecoin",
  "digital money", "digital cash",
  "tokenised deposit", "tokenized deposit", "tokenised deposits", "tokenized deposits",
  "deposit token", "deposit tokens",
  "bank-issued token", "bank issued token", "bank-issued tokens", "bank issued tokens",
  "commercial bank money token", "commercial bank money tokens",
  "tokenised commercial bank money", "tokenized commercial bank money",
  "digital settlement asset", "digital settlement assets", "regulated settlement asset", "regulated settlement assets",
  "wholesale cbdc", "cbdc", "central bank digital currency", "digital pound", "digital euro",
  "distributed ledger", "dlt", "permissioned blockchain", "blockchain settlement",
  "markets in crypto-assets", "markets in crypto assets", "mica", "casp",
  "asset-referenced token", "asset referenced token", "asset-referenced tokens",
  "e-money token", "e-money tokens", "emt",
  "unified ledger", "digital asset custody", "crypto custody",
  "tokenised collateral", "tokenized collateral", "digital collateral"
];

const ADJACENT_CONTEXT_TERMS = [
  "financial market infrastructure", "market infrastructure", "fmi", "post-trade", "post trade",
  "settlement", "delivery versus payment", "dvp", "payment system", "payments",
  "collateral", "margin", "haircut", "repo", "securities lending", "securities financing",
  "derivatives", "eligible collateral", "custody", "custodian", "safeguarding",
  "prudential", "macroprudential", "capital", "basel", "operational resilience",
  "authorisation", "authorization", "perimeter", "financial promotions", "market abuse",
  "securities services", "asset servicing", "central securities depository", "csd", "ccp", "clearing"
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
  { topic: "Cryptoasset Regulation", terms: ["cryptoasset", "crypto-asset", "crypto asset", "digital asset", "digital assets", "crypto regulation", "crypto regulatory"] },
  { topic: "Tokenisation", terms: ["tokenisation", "tokenization", "tokenised", "tokenized", "digital securities", "digital security", "distributed ledger", "dlt", "unified ledger"] },
  { topic: "Digital Money & Settlement Assets", terms: ["digital money", "digital cash", "digital settlement asset", "regulated settlement asset", "tokenised deposit", "tokenized deposit", "deposit token", "bank-issued token", "bank issued token", "commercial bank money token"] },
  { topic: "Stablecoins", terms: ["stablecoin", "stablecoins", "payment stablecoin", "global stablecoin"] },
  { topic: "CBDC", terms: ["cbdc", "digital pound", "digital euro", "central bank digital currency", "wholesale cbdc"] },
  { topic: "Custody", terms: ["digital asset custody", "crypto custody", "safeguarding of cryptoassets", "private key", "wallet"] },
  { topic: "Collateral", terms: ["tokenised collateral", "tokenized collateral", "digital collateral", "eligible cryptoasset collateral", "eligible digital asset collateral"] },
  { topic: "Settlement", terms: ["delivery versus payment", "dvp", "digital settlement", "tokenised settlement", "tokenized settlement", "settlement asset", "digital settlement asset", "wholesale settlement"] },
  { topic: "Prudential Treatment", terms: ["prudential treatment of crypto", "cryptoasset exposure", "crypto-asset exposure", "basel crypto", "bank cryptoasset", "bank crypto-asset"] },
  { topic: "Market Abuse", terms: ["cryptoasset market abuse", "crypto-asset market abuse", "digital asset market abuse", "admissions and disclosures", "inside information"] }
];

const HIGH_PRIORITY_TERMS = [
  "consultation", "policy statement", "final rule", "proposed rule", "guidance", "authorisation", "authorization",
  "regime", "regulation", "rulemaking", "deadline", "in force", "implementation", "supervision", "prudential",
  "stablecoin", "mica", "custody", "safeguarding", "market abuse", "tokenisation", "tokenization",
  "digital money", "tokenised deposit", "tokenized deposit", "digital settlement asset"
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

function scoreAgainstTerms(text, terms, weight) {
  return terms.reduce((score, term) => score + (hasTerm(text, term) ? weight : 0), 0);
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

function relevanceScore(raw, source = {}) {
  const parts = textParts(raw);
  const combined = [parts.metadata, parts.title, parts.summary].join(" ");

  const metadataPositive = scoreAgainstTerms(parts.metadata, CORE_DIGITAL_TERMS, 4);
  const titlePositive = scoreAgainstTerms(parts.title, CORE_DIGITAL_TERMS, 3);
  const summaryPositive = scoreAgainstTerms(parts.summary, CORE_DIGITAL_TERMS, 1.5);

  const sourceKeywords = (source?.keywords || []).map(k => String(k).toLowerCase());
  const coreSourceKeywords = sourceKeywords.filter(keyword =>
    CORE_DIGITAL_TERMS.some(term => keyword === term || keyword.includes(term) || term.includes(keyword))
  );
  const sourceKeywordScore = Math.min(scoreAgainstTerms(combined, coreSourceKeywords, 2), 4);

  const contextScore = Math.min(scoreAgainstTerms(combined, ADJACENT_CONTEXT_TERMS, 0.5), 2);

  const metadataNegative = scoreAgainstTerms(parts.metadata, NEGATIVE_TERMS, 5);
  const titleNegative = scoreAgainstTerms(parts.title, NEGATIVE_TERMS, 4);
  const summaryNegative = scoreAgainstTerms(parts.summary, NEGATIVE_TERMS, 2);

  const officialOnlyPenalty = OFFICIAL_NAME_TERMS.some(term => hasTerm(combined, term))
    && metadataPositive + titlePositive + summaryPositive + sourceKeywordScore === 0
    ? 4
    : 0;

  const positive = metadataPositive + titlePositive + summaryPositive + sourceKeywordScore;
  const negative = metadataNegative + titleNegative + summaryNegative + officialOnlyPenalty;

  return {
    positive,
    negative,
    context: positive > 0 ? contextScore : 0,
    score: positive + (positive > 0 ? contextScore : 0) - negative,
    hasCoreDigital: positive > 0,
    metadataPositive,
    titlePositive,
    summaryPositive,
    sourceKeywordScore,
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
  const score = relevanceScore(raw, source);
  const scope = determineScope(score, topics);

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
    scope,
    radarEligible: determineRadarEligibility({ source, category, priority, score }),
    summary: buildSummary(raw, source),
    whyItMatters: buildWhyItMatters(topics, source)
  };
}

function determineScope(score, topics) {
  const t = new Set(topics);
  if (t.has("Tokenisation") || t.has("Digital Money & Settlement Assets") || t.has("Stablecoins") || t.has("MiCA") || t.has("CBDC")) return "core-digital";
  if (score.hasCoreDigital && score.context > 0) return "digital-market-infrastructure";
  return score.hasCoreDigital ? "core-digital" : "rejected";
}

function determineRadarEligibility({ source, category, priority, score }) {
  const sourceType = String(source?.sourceType || source?.type || "").toLowerCase();
  const categoryText = String(category || "").toLowerCase();
  if (!score.hasCoreDigital || score.score < 4) return false;
  if (sourceType.includes("institutional news") || sourceType.includes("analysis")) return false;
  if (categoryText.includes("source watchlist") || categoryText.includes("market infrastructure analysis")) return false;
  return ["High", "Medium"].includes(priority);
}

function determineCategory(text, title = "") {
  if (/consultation|discussion paper|call for evidence|request for comment|comment period/.test(text)) return "Consultation";
  if (/policy statement|final rule|final guidance|staff accounting bulletin|interpretive letter/.test(text)) return "Policy Statement";
  if (/report|paper|annual economic report|recommendations|framework/.test(text)) return "Institutional Report";
  if (/speech|remarks|keynote/.test(text)) return "Speech / Remarks";
  if (/pilot|sandbox|implementation/.test(text)) return "Implementation Workstream";
  if (/regulation|rules|guidance|authorisation|authorization|perimeter/.test(text + " " + String(title).toLowerCase())) return "Regulatory Update";
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
  return `${source?.name || "The monitored source"} published a new item relevant to digital assets, tokenisation, digital money, stablecoins or financial market infrastructure monitoring.`;
}

function buildWhyItMatters(topics, source) {
  const t = new Set(topics);
  if (t.has("MiCA")) return "Relevant for EU regulatory perimeter, CASP authorisation, stablecoin issuance or crypto-asset service implementation analysis.";
  if (t.has("Digital Money & Settlement Assets")) return "Relevant for digital cash, tokenised deposits, deposit tokens, bank-issued tokens and digital settlement asset analysis.";
  if (t.has("Stablecoins")) return "Relevant for settlement assets, reserve models, payment stablecoin issuance, redemption rights and prudential or supervisory treatment.";
  if (t.has("Tokenisation") || t.has("Settlement")) return "Relevant for institutional tokenisation, settlement, custody, DvP, collateral and financial market infrastructure use cases.";
  if (t.has("Prudential Treatment")) return "Relevant for bank capital treatment, exposure management, risk classification and internal governance of cryptoasset-related activities.";
  return `Relevant as a public-source update from ${source?.name || "a monitored source"} within the covered digital assets regulatory intelligence scope.`;
}

export function isRelevant(raw, source) {
  const text = allText(raw);
  if (!text.trim()) return false;
  const score = relevanceScore(raw, source);
  return score.hasCoreDigital && score.score >= 3;
}

export function explainRelevance(raw, source) {
  return relevanceScore(raw, source);
}
