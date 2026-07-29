const TOPIC_KEYWORDS = [
  { topic: "MiCA", terms: ["mica", "markets in crypto-assets", "markets in crypto assets", "casp", "asset-referenced", "e-money token", "emt", "art"] },
  { topic: "UK Cryptoasset Regime", terms: ["fca", "uk cryptoasset", "qualifying cryptoasset", "financial promotions", "fsma", "authorisation gateway"] },
  { topic: "Cryptoasset Regulation", terms: ["cryptoasset", "crypto-asset", "crypto asset", "digital asset", "crypto regulation", "crypto regulatory"] },
  { topic: "Stablecoins", terms: ["stablecoin", "stablecoins", "payment stablecoin", "global stablecoin", "dollar token", "tokenised deposit", "tokenized deposit"] },
  { topic: "Tokenisation", terms: ["tokenisation", "tokenization", "tokenised", "tokenized", "distributed ledger", "dlt", "unified ledger"] },
  { topic: "Custody", terms: ["custody", "custodian", "safeguarding", "private key", "wallet"] },
  { topic: "Collateral", terms: ["collateral", "margin", "haircut", "derivatives", "eligible collateral"] },
  { topic: "Settlement", terms: ["settlement", "delivery versus payment", "dvp", "payment system", "fmi", "market infrastructure"] },
  { topic: "Prudential Treatment", terms: ["prudential", "capital", "basel", "risk weight", "exposure", "disclosure"] },
  { topic: "Market Abuse", terms: ["market abuse", "market integrity", "inside information", "disclosure", "admissions"] },
  { topic: "CBDC", terms: ["cbdc", "digital pound", "central bank digital currency", "wholesale cbdc"] }
];

const HIGH_PRIORITY_TERMS = [
  "consultation", "policy statement", "final rule", "proposed rule", "guidance", "authorisation", "authorization",
  "regime", "regulation", "rulemaking", "deadline", "in force", "implementation", "supervision", "prudential",
  "stablecoin", "mica", "custody", "safeguarding", "market abuse", "collateral"
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

export function classifyItem(raw, source) {
  const text = [raw.title, raw.summary, source?.name, source?.region].filter(Boolean).join(" ").toLowerCase();
  const topics = TOPIC_KEYWORDS
    .filter(rule => rule.terms.some(term => text.includes(term)))
    .map(rule => rule.topic);

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
  const highScore = HIGH_PRIORITY_TERMS.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0);
  const mediumScore = MEDIUM_PRIORITY_TERMS.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0);
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
  const sourceKeywords = (source?.keywords || []).map(k => k.toLowerCase());
  const haystack = [raw.title, raw.summary, raw.description, source?.name].filter(Boolean).join(" ").toLowerCase();
  if (!haystack.trim()) return false;
  return sourceKeywords.some(keyword => haystack.includes(keyword.toLowerCase()))
    || TOPIC_KEYWORDS.some(rule => rule.terms.some(term => haystack.includes(term)));
}
