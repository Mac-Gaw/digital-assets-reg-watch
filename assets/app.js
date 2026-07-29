const data = window.REGWATCH_DATA;

const THEME_KEY = "regwatch-theme";

function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch (error) {
    return null;
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const toggle = document.getElementById("themeToggle");
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute("content", theme === "dark" ? "#0b1220" : "#eef3f8");
  if (!toggle) return;
  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  const icon = toggle.querySelector(".theme-toggle-icon");
  const label = toggle.querySelector(".theme-toggle-text");
  if (icon) icon.textContent = isDark ? "☀" : "☾";
  if (label) label.textContent = isDark ? "Light" : "Dark";
}


function setMobileMenu(open) {
  const menu = document.getElementById("primaryNav");
  const toggle = document.getElementById("menuToggle");
  if (!menu || !toggle) return;
  menu.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
}

function initMobileMenu() {
  const menu = document.getElementById("primaryNav");
  const toggle = document.getElementById("menuToggle");
  if (!menu || !toggle) return;

  toggle.addEventListener("click", () => {
    setMobileMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMobileMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMobileMenu(false);
  });

  if (window.matchMedia) {
    const desktop = window.matchMedia("(min-width: 921px)");
    const handleDesktop = (event) => {
      if (event.matches) setMobileMenu(false);
    };
    if (desktop.addEventListener) desktop.addEventListener("change", handleDesktop);
    else if (desktop.addListener) desktop.addListener(handleDesktop);
  }
}

function initTheme() {
  applyTheme(getStoredTheme() || document.documentElement.dataset.theme || getSystemTheme());
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem(THEME_KEY, next); } catch (error) {}
      applyTheme(next);
    });
  }
  if (window.matchMedia) {
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const handlePreferenceChange = (event) => {
      if (!getStoredTheme()) applyTheme(event.matches ? "dark" : "light");
    };
    if (preference.addEventListener) preference.addEventListener("change", handlePreferenceChange);
    else if (preference.addListener) preference.addListener(handlePreferenceChange);
  }
}

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  const date = new Date(String(value).includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const fmtDate = (value) => {
  const date = parseDateValue(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const fmtDateTime = (value) => {
  const date = parseDateValue(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
    timeZoneName: "short"
  }).format(date);
};

const daysBetween = (newer, older) => {
  const end = parseDateValue(newer);
  const start = parseDateValue(older);
  if (!end || !start) return null;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
};

const itemsWithinDays = (items, days, now = new Date()) => {
  const cutoff = now.getTime() - (days * 86400000);
  return items.filter(item => {
    const date = parseDateValue(item.publishedAt);
    return date && date.getTime() >= cutoff && date.getTime() <= now.getTime();
  });
};

const uniq = (items) => [...new Set(items)].sort((a, b) => a.localeCompare(b));

const setText = (selector, value) => {
  const node = $(selector);
  if (node) node.textContent = value;
};

function priorityBadge(priority) {
  const klass = priority.toLowerCase();
  return `<span class="badge ${klass}">${escapeHtml(priority)}</span>`;
}

function sourceTypeBadge(type) {
  const official = /official|central bank|standard setter/i.test(type);
  return `<span class="badge ${official ? "official" : ""}">${escapeHtml(type)}</span>`;
}

function renderUpdateCard(item) {
  return `
    <article class="card">
      <div class="meta-row">
        ${priorityBadge(item.priority)}
        <span class="badge">${escapeHtml(item.jurisdiction)}</span>
      </div>
      <div class="card-date-row">
        <strong>${fmtDate(item.publishedAt)}</strong>
        <span>${escapeHtml(item.source)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <div class="tag-row">${item.topics.slice(0, 4).map(topic => `<span class="badge">${escapeHtml(topic)}</span>`).join("")}</div>
      <a class="external" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer noopener">Open source →</a>
    </article>
  `;
}

function renderFeedItem(item) {
  return `
    <article class="feed-item">
      <div>
        <div class="feed-date">${fmtDate(item.publishedAt)}</div>
        <div class="feed-source">${escapeHtml(item.source)}</div>
        <div class="meta-row" style="margin-top:.6rem">
          ${priorityBadge(item.priority)}
          <span class="badge">${escapeHtml(item.status)}</span>
        </div>
      </div>
      <div>
        <div class="meta-row">
          <span class="badge">${escapeHtml(item.jurisdiction)}</span>
          ${sourceTypeBadge(item.sourceType)}
          <span class="badge">${escapeHtml(item.category)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <div class="why"><strong>Why it matters:</strong> ${escapeHtml(item.whyItMatters)}</div>
        <div class="tag-row" style="margin-top:.75rem">
          ${item.topics.map(topic => `<span class="badge">${escapeHtml(topic)}</span>`).join("")}
        </div>
        <a class="external" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer noopener">Open original publication →</a>
      </div>
    </article>
  `;
}

function fillSelect(select, values, label = "All") {
  select.innerHTML = `<option value="">${label}</option>` + values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
}

function initMetrics() {
  setText("#metricSources", data.sources.length);
  setText("#metricUpdates", data.updates.length);
  setText("#metricConsultations", data.consultations.length);
  setText("#metricAccessScenarios", (data.accessMatrix || []).length);
  setText("#lastUpdated", fmtDate(data.lastUpdated));
}

function renderMonitoring() {
  const monitoring = data.monitoring || {};
  const now = new Date();
  const scanDate = parseDateValue(monitoring.lastScan);
  const scanAge = scanDate ? daysBetween(now, scanDate) : null;
  const monitoringCard = document.querySelector(".monitoring-card");
  const freshness = $("#monitoringFreshness");

  let state = "fresh";
  let freshnessText = "Scan date unavailable";
  let statusText = monitoring.status || "Active";

  if (scanAge !== null && scanAge <= 0) freshnessText = "Checked today";
  else if (scanAge === 1) freshnessText = "Checked 1 day ago";
  else if (scanAge !== null && scanAge <= 7) {
    state = "due";
    freshnessText = `Checked ${scanAge} days ago`;
    statusText = "Monitoring due";
  } else if (scanAge !== null) {
    state = "stale";
    freshnessText = `Review overdue · ${scanAge} days`;
    statusText = "Review overdue";
  }

  if (monitoringCard) monitoringCard.dataset.freshness = state;
  if (freshness) {
    freshness.textContent = freshnessText;
    freshness.dataset.state = state;
  }
  setText("#monitoringStatus", statusText);
  setText("#lastSourceScan", monitoring.lastScan ? fmtDateTime(monitoring.lastScan) : "Not recorded");

  const sevenDayItems = itemsWithinDays(data.updates, 7, now);
  const thirtyDayItems = itemsWithinDays(data.updates, 30, now);
  setText("#sourcesChecked", data.sources.length);
  setText("#newItemsSevenDays", sevenDayItems.length);
  setText("#openWorkstreams", data.consultations.length);

  const coverageStrip = $("#coverageStrip");
  if (coverageStrip) {
    const coverage = (monitoring.regions || []).map(region => {
      const age = daysBetween(now, region.lastChecked);
      const checked = age === 0 ? "Today" : age === 1 ? "Yesterday" : `${age} days ago`;
      return `<span class="coverage-chip" title="${escapeHtml(region.name)} last checked ${escapeHtml(fmtDate(region.lastChecked))}"><i aria-hidden="true"></i>${escapeHtml(region.shortName || region.name)} <small>${escapeHtml(checked)}</small></span>`;
    }).join("");
    coverageStrip.innerHTML = coverage;
  }

  const count = thirtyDayItems.length;
  let level = "Low activity";
  let pulseClass = "low";
  let summary = "Regulatory publication activity has been limited. Monitoring remains active across the covered jurisdictions and standard-setting bodies.";
  if (count >= 8) {
    level = "High activity";
    pulseClass = "high";
    summary = "A high level of relevant regulatory and institutional publication activity has been identified during the past 30 days.";
  } else if (count >= 4) {
    level = "Moderate activity";
    pulseClass = "medium";
    summary = "A moderate flow of relevant publications has been identified, with activity spread across regulatory, policy and market-infrastructure topics.";
  }
  const pulseCard = document.querySelector(".pulse-card");
  if (pulseCard) pulseCard.dataset.level = pulseClass;
  setText("#pulseLevel", level);
  setText("#pulseCount", count);
  setText("#pulseSummary", summary);

  const latestDate = data.updates
    .map(item => parseDateValue(item.publishedAt))
    .filter(Boolean)
    .sort((a, b) => b - a)[0];
  const quietDays = latestDate ? daysBetween(now, latestDate) : null;
  const quietThreshold = monitoring.quietPeriodDays || 14;
  const notice = $("#quietPeriodNotice");
  const noteTitle = $("#monitoringNoteTitle");
  const noteText = $("#quietPeriodText");
  const noteIcon = notice ? notice.querySelector(".quiet-period-icon") : null;
  const result = monitoring.lastScanResult || null;
  const hasScanResult = result && Number.isFinite(Number(result.newPublishedItems));
  const recentlyScanned = scanAge !== null && scanAge <= 3;

  const newPublished = hasScanResult ? Number(result.newPublishedItems) : 0;
  const highNew = hasScanResult ? Number(result.newHighPriorityItems || result.materialItems || 0) : 0;
  const mediumNew = hasScanResult ? Number(result.newMediumPriorityItems || 0) : 0;
  const lowNew = hasScanResult ? Number(result.newLowPriorityItems || 0) : 0;
  const pendingNew = hasScanResult ? Number(result.newPendingItems || 0) : 0;

  let noteType = "quiet";
  let icon = "✓";
  let title = "Latest scan status";
  let text = "Latest scan result is not available yet.";
  let scanNote = "Latest scan result is not available yet.";

  if (scanAge !== null && scanAge > 7) {
    noteType = "overdue";
    icon = "!";
    title = "Monitoring review overdue";
    text = `The last source scan was ${scanAge} days ago. Review the workflow status before relying on the dashboard.`;
    scanNote = `Latest scan: overdue by ${scanAge} days. Review the workflow status before relying on the dashboard.`;
  } else if (recentlyScanned && hasScanResult) {
    if (highNew > 0) {
      noteType = "material";
      icon = "!";
      title = "Material regulatory update identified";
      text = `Latest scan added ${highNew} high-priority item${highNew === 1 ? "" : "s"} requiring review. ${newPublished} published item${newPublished === 1 ? "" : "s"} added in total.`;
      scanNote = `Latest scan: ${newPublished} published item${newPublished === 1 ? "" : "s"} added, including ${highNew} high-priority item${highNew === 1 ? "" : "s"} requiring review.`;
    } else if (newPublished > 0) {
      noteType = "updates";
      icon = "+";
      title = "New relevant updates identified";
      text = `Latest scan added ${newPublished} published item${newPublished === 1 ? "" : "s"}: ${mediumNew} medium and ${lowNew} low priority. No high-priority items were identified.`;
      scanNote = `Latest scan: ${newPublished} published item${newPublished === 1 ? "" : "s"} added (${mediumNew} medium, ${lowNew} low). No high-priority items were identified.`;
    } else if (pendingNew > 0) {
      noteType = "updates";
      icon = "+";
      title = "New draft items awaiting review";
      text = `Latest scan collected ${pendingNew} draft item${pendingNew === 1 ? "" : "s"} from non-auto-published sources. No high-priority published items were identified.`;
      scanNote = `Latest scan: no new published items, but ${pendingNew} draft item${pendingNew === 1 ? "" : "s"} collected for review.`;
    } else {
      noteType = "quiet";
      icon = "✓";
      title = "No new relevant updates since latest scan";
      text = `All monitored sources have been reviewed. No new published items were added in the latest scan. Last source scan: ${fmtDateTime(monitoring.lastScan)}.`;
      scanNote = "Latest scan: no new published items were added.";
    }
  } else if (recentlyScanned && quietDays !== null && quietDays >= quietThreshold) {
    noteType = "quiet";
    icon = "✓";
    title = "No material regulatory developments identified recently";
    text = `All monitored sources have been reviewed. No significant new items have been identified during the past ${quietDays} days. Last source scan: ${fmtDateTime(monitoring.lastScan)}.`;
    scanNote = `Latest scan: no significant new items identified; latest retained update is ${quietDays} days old.`;
  }

  if (notice) {
    notice.classList.add("hidden");
    notice.dataset.note = noteType;
  }
  if (noteIcon) noteIcon.textContent = icon;
  if (noteTitle) noteTitle.textContent = title;
  if (noteText) noteText.textContent = text;

  const pulseSummaryEl = $("#pulseSummary");
  if (pulseSummaryEl) {
    pulseSummaryEl.textContent = `${summary} ${scanNote}`;
  }
}

function renderMonthlyReview() {
  const container = $("#monthlyReviewCard");
  if (!container) return;
  const review = (data.monthlyReviews || [])
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];

  if (!review) {
    container.innerHTML = `<article class="monthly-review-card empty-review"><p>No monthly review has been published yet. This optional format can be introduced when a periodic editorial summary is useful.</p></article>`;
    return;
  }

  container.innerHTML = `
    <article class="monthly-review-card">
      <div class="monthly-review-date">
        <span>${escapeHtml(review.period)}</span>
        <small>${fmtDate(review.publishedAt)}</small>
      </div>
      <div class="monthly-review-content">
        <div class="meta-row">
          <span class="badge official">Monthly Review</span>
          <span class="badge">${escapeHtml(review.status)}</span>
        </div>
        <h3>${escapeHtml(review.title)}</h3>
        <p>${escapeHtml(review.summary)}</p>
        <div class="tag-row">${review.topics.map(topic => `<span class="badge">${escapeHtml(topic)}</span>`).join("")}</div>
        <p class="review-note">${escapeHtml(review.note)}</p>
        <a class="text-link" href="#feed" data-route="feed">Explore related updates →</a>
      </div>
    </article>
  `;
}


function renderMarketIntelligenceItem(item) {
  return `
    <article class="market-intelligence-item">
      <div class="market-intelligence-main">
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(item.title)}</a>
        <div class="market-intelligence-meta">
          <span>${escapeHtml(item.source)}</span>
          <span>${fmtDate(item.publishedAt)}</span>
          <span>${escapeHtml(item.category || "Institutional digital assets")}</span>
        </div>
      </div>
    </article>
  `;
}

function renderMarketIntelligence() {
  const container = $("#marketIntelligenceList");
  const archiveContainer = $("#marketArchiveList");
  if (!container && !archiveContainer) return;
  const items = (data.marketIntelligence || [])
    .slice()
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  const latest = items.slice(0, 5);
  const statusText = items.length ? `${items.length} links retained · 30 days` : "Latest 30 days";
  const status = $("#marketIntelligenceStatus");
  const archiveStatus = $("#marketArchiveStatus");
  if (status) {
    status.textContent = "Last 30 days →";
    status.setAttribute("title", statusText);
  }
  if (archiveStatus) archiveStatus.textContent = statusText;

  const emptyMarkup = `
      <article class="market-intelligence-empty">
        <strong>No market intelligence links retained yet.</strong>
        <p>Hourly RSS monitoring will add matching institutional digital assets links when titles pass the filters. Manual curated links can be added to <code>data/market-intelligence.json</code>.</p>
      </article>
    `;

  if (!items.length) {
    if (container) container.innerHTML = emptyMarkup;
    if (archiveContainer) archiveContainer.innerHTML = emptyMarkup;
    return;
  }

  if (container) container.innerHTML = latest.map(renderMarketIntelligenceItem).join("");
  if (archiveContainer) archiveContainer.innerHTML = items.map(renderMarketIntelligenceItem).join("");
}

function renderEventItem(item) {
  const format = item.format || "Event";
  const location = item.location || "Location not stated";
  const access = item.access || "Access not stated";
  const category = item.category || "Institutional digital assets";
  return `
    <article class="event-item">
      <div class="event-date-pill">
        <span>${escapeHtml(fmtDate(item.eventDate).split(" ")[0] || "")}</span>
        <small>${escapeHtml(fmtDate(item.eventDate).replace(/^\d{2}\s/, ""))}</small>
      </div>
      <div class="event-main">
        <div class="meta-row">
          <span class="badge">${escapeHtml(format)}</span>
          <span class="badge official">${escapeHtml(category)}</span>
        </div>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(item.title)}</a>
        <div class="market-intelligence-meta">
          <span>${escapeHtml(item.source)}</span>
          <span>${escapeHtml(location)}</span>
          <span>${escapeHtml(access)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderEvents() {
  const container = $("#eventsList");
  const archiveContainer = $("#eventsArchiveList");
  if (!container && !archiveContainer) return;
  const now = new Date();
  const lower = new Date(now.getTime() - 7 * 86400000);
  const items = (data.events || [])
    .slice()
    .filter(item => {
      const date = parseDateValue(item.eventDate);
      return date && date >= lower;
    })
    .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)));
  const upcoming = items.filter(item => {
    const date = parseDateValue(item.eventDate);
    return date && date >= new Date(now.toDateString());
  });
  const latest = items.slice(0, 4);
  const statusText = upcoming.length ? `${upcoming.length} upcoming event${upcoming.length === 1 ? "" : "s"} · 180 days` : "No upcoming events retained";
  const status = $("#eventsStatus");
  const archiveStatus = $("#eventsArchiveStatus");
  if (status) {
    status.textContent = "Upcoming events →";
    status.setAttribute("title", statusText);
  }
  if (archiveStatus) archiveStatus.textContent = statusText;

  const configuredSources = (data.eventSources || []).length;
  const emptyMarkup = `
    <article class="market-intelligence-empty">
      <strong>No upcoming events retained yet.</strong>
      <p>The event source watchlist is configured${configuredSources ? ` with ${configuredSources} sources` : ""}, but no dated future events are currently stored in <code>data/events.json</code>. This is expected until a matching source publishes a dated event or a curated event is added manually.</p>
    </article>
  `;

  if (!items.length) {
    if (container) container.innerHTML = emptyMarkup;
    if (archiveContainer) archiveContainer.innerHTML = emptyMarkup;
    return;
  }

  if (container) container.innerHTML = latest.map(renderEventItem).join("");
  if (archiveContainer) archiveContainer.innerHTML = items.map(renderEventItem).join("");
}

function renderDashboard() {
  const container = $("#latestCards");
  if (!container) return;
  const latest = (data.updates || [])
    .slice()
    .sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")))
    .slice(0, 3);

  if (!latest.length) {
    container.innerHTML = `
      <article class="card">
        <p class="eyebrow">No regulatory items</p>
        <h3>No retained regulatory updates yet</h3>
        <p>The regulatory monitor has not retained any items after the current filters. Run the monitor or review <code>data/updates.json</code>.</p>
      </article>
    `;
    return;
  }

  container.innerHTML = latest.map(renderUpdateCard).join("");
}

function setFeedFilterPanel(open) {
  const shell = document.querySelector(".feed-filters");
  const toggle = document.getElementById("filterToggle");
  if (!shell || !toggle) return;
  shell.classList.toggle("filters-open", open);
  toggle.setAttribute("aria-expanded", String(open));
}

function updateActiveFilterCount() {
  const controls = ["#jurisdictionFilter", "#topicFilter", "#priorityFilter", "#categoryFilter", "#sourceTypeFilter"];
  const count = controls.reduce((total, selector) => total + ($(selector).value ? 1 : 0), 0);
  const counter = $("#activeFilterCount");
  if (!counter) return;
  counter.textContent = String(count);
  counter.dataset.empty = String(count === 0);
  counter.setAttribute("aria-label", `${count} active filter${count === 1 ? "" : "s"}`);
}

function initFeedFilters() {
  fillSelect($("#jurisdictionFilter"), uniq(data.updates.map(item => item.jurisdiction)));
  fillSelect($("#topicFilter"), uniq(data.updates.flatMap(item => item.topics)));
  fillSelect($("#priorityFilter"), ["High", "Medium", "Low"]);
  fillSelect($("#categoryFilter"), uniq(data.updates.map(item => item.category)));
  fillSelect($("#sourceTypeFilter"), uniq(data.updates.map(item => item.sourceType)));

  ["#searchInput", "#jurisdictionFilter", "#topicFilter", "#priorityFilter", "#categoryFilter", "#sourceTypeFilter"].forEach(selector => {
    $(selector).addEventListener("input", renderFeed);
  });

  const filterToggle = $("#filterToggle");
  if (filterToggle) {
    filterToggle.addEventListener("click", () => {
      setFeedFilterPanel(filterToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  $("#resetFilters").addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#jurisdictionFilter").value = "";
    $("#topicFilter").value = "";
    $("#priorityFilter").value = "";
    $("#categoryFilter").value = "";
    $("#sourceTypeFilter").value = "";
    if (window.matchMedia && window.matchMedia("(max-width: 700px)").matches) {
      setFeedFilterPanel(false);
      const toggle = $("#filterToggle");
      if (toggle) toggle.focus();
    }
    renderFeed();
  });
}

function renderFeed() {
  const search = $("#searchInput").value.trim().toLowerCase();
  const jurisdiction = $("#jurisdictionFilter").value;
  const topic = $("#topicFilter").value;
  const priority = $("#priorityFilter").value;
  const category = $("#categoryFilter").value;
  const sourceType = $("#sourceTypeFilter").value;

  const filtered = data.updates.filter(item => {
    const haystack = [item.title, item.source, item.sourceType, item.category, item.jurisdiction, item.summary, item.whyItMatters, ...item.topics].join(" ").toLowerCase();
    return (!search || haystack.includes(search))
      && (!jurisdiction || item.jurisdiction === jurisdiction)
      && (!topic || item.topics.includes(topic))
      && (!priority || item.priority === priority)
      && (!category || item.category === category)
      && (!sourceType || item.sourceType === sourceType);
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  updateActiveFilterCount();
  $("#resultCount").textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"} shown`;
  $("#feedList").innerHTML = filtered.length ? filtered.map(renderFeedItem).join("") : `<p class="section-note">No items match these filters.</p>`;
}

function renderConsultations() {
  const rows = data.consultations.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.deadline)}</strong></td>
      <td>${escapeHtml(item.regulator)}<br><span class="badge">${escapeHtml(item.jurisdiction)}</span></td>
      <td>${escapeHtml(item.topic)}</td>
      <td><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.expectedNextStep)}<br><a class="external" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer noopener">Open source →</a></td>
      <td>${escapeHtml(item.status)}</td>
    </tr>
  `).join("");

  const cards = data.consultations.map(item => `
    <article class="consultation-card">
      <div class="meta-row">
        <span class="badge official">${escapeHtml(item.regulator)}</span>
        <span class="badge">${escapeHtml(item.jurisdiction)}</span>
        <span class="badge">${escapeHtml(item.status)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <dl>
        <div>
          <dt>Deadline / milestone</dt>
          <dd><strong>${escapeHtml(item.deadline)}</strong></dd>
        </div>
        <div>
          <dt>Topic</dt>
          <dd>${escapeHtml(item.topic)}</dd>
        </div>
        <div>
          <dt>Expected next step</dt>
          <dd>${escapeHtml(item.expectedNextStep)}</dd>
        </div>
      </dl>
      <a class="external" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer noopener">Open original source →</a>
    </article>
  `).join("");

  $("#consultationList").innerHTML = `
    <div class="consultation-table table-wrap">
      <table>
        <thead>
          <tr>
            <th>Deadline / milestone</th>
            <th>Regulator</th>
            <th>Topic</th>
            <th>Consultation / workstream</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="consultation-cards" aria-label="Consultations">${cards}</div>
  `;
}


function accessOutcomeBadge(item) {
  const labels = {
    notification: "Notification route",
    permission: "Permission required",
    "case-specific": "Case-specific",
    "existing-framework": "Existing framework"
  };
  return `<span class="access-outcome-badge ${escapeHtml(item.outcomeType)}">${escapeHtml(labels[item.outcomeType] || item.outcomeType)}</span>`;
}

function renderAccessMatrixCard(item) {
  const conditions = (item.conditions || []).map(condition => `<li>${escapeHtml(condition)}</li>`).join("");
  const sources = (item.sources || []).map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(source.label)} ↗</a>`).join("");
  return `
    <article class="access-card" data-outcome="${escapeHtml(item.outcomeType)}">
      <div class="access-card-top">
        <div class="meta-row">
          <span class="badge official">${escapeHtml(item.jurisdiction)}</span>
          <span class="badge">${escapeHtml(item.status)}</span>
          <span class="badge">Confidence: ${escapeHtml(item.confidence)}</span>
        </div>
        ${accessOutcomeBadge(item)}
      </div>

      <div class="access-case-heading">
        <p>${escapeHtml(item.entityType)}</p>
        <h3>${escapeHtml(item.activity)}</h3>
        <span>${escapeHtml(item.assetType)}</span>
      </div>

      <div class="access-outcome-panel">
        <span>Indicative outcome</span>
        <strong>${escapeHtml(item.outcome)}</strong>
      </div>

      <dl class="access-details">
        <div>
          <dt>Standalone licence</dt>
          <dd>${escapeHtml(item.standaloneLicence)}</dd>
        </div>
        <div>
          <dt>Regulatory route</dt>
          <dd>${escapeHtml(item.regulatoryRoute)}</dd>
        </div>
        <div>
          <dt>Effective / relevant from</dt>
          <dd>${escapeHtml(item.effectiveFrom)}</dd>
        </div>
      </dl>

      <div class="access-conditions">
        <h4>Key conditions & checks</h4>
        <ul>${conditions}</ul>
      </div>

      <div class="classification-note">
        <strong>Classification note</strong>
        <p>${escapeHtml(item.classificationNote)}</p>
      </div>

      <div class="access-card-footer">
        <span>Last reviewed: ${fmtDate(item.lastReviewed)}</span>
        <div class="access-source-links">${sources}</div>
      </div>
    </article>
  `;
}

function initAccessMatrixFilters() {
  const records = data.accessMatrix || [];
  fillSelect($("#accessJurisdictionFilter"), uniq(records.map(item => item.jurisdiction)));
  fillSelect($("#accessEntityFilter"), uniq(records.map(item => item.entityType)));
  fillSelect($("#accessActivityFilter"), uniq(records.map(item => item.activity)));
  fillSelect($("#accessAssetFilter"), uniq(records.map(item => item.assetType)));

  ["#accessJurisdictionFilter", "#accessEntityFilter", "#accessActivityFilter", "#accessAssetFilter"].forEach(selector => {
    $(selector).addEventListener("input", renderAccessMatrix);
  });

  $("#resetAccessFilters").addEventListener("click", () => {
    $("#accessJurisdictionFilter").value = "";
    $("#accessEntityFilter").value = "";
    $("#accessActivityFilter").value = "";
    $("#accessAssetFilter").value = "";
    renderAccessMatrix();
  });
}

function renderAccessMatrix() {
  const records = data.accessMatrix || [];
  const jurisdiction = $("#accessJurisdictionFilter").value;
  const entity = $("#accessEntityFilter").value;
  const activity = $("#accessActivityFilter").value;
  const asset = $("#accessAssetFilter").value;

  const filtered = records.filter(item =>
    (!jurisdiction || item.jurisdiction === jurisdiction)
    && (!entity || item.entityType === entity)
    && (!activity || item.activity === activity)
    && (!asset || item.assetType === asset)
  );

  $("#accessResultCount").textContent = `${filtered.length} scenario${filtered.length === 1 ? "" : "s"} shown`;
  $("#accessMatrixList").innerHTML = filtered.length
    ? filtered.map(renderAccessMatrixCard).join("")
    : `<div class="matrix-empty"><strong>No exact scenario found.</strong><p>Reset one or more filters. A missing result does not mean the activity is permitted or prohibited; it only means this limited MVP matrix does not yet contain that combination.</p></div>`;
}

function initSourceFilters() {
  fillSelect($("#sourceCategoryFilter"), uniq(data.sources.map(item => item.category)));
  fillSelect($("#sourceRegionFilter"), uniq(data.sources.map(item => item.region)));

  ["#sourceCategoryFilter", "#sourceRegionFilter"].forEach(selector => {
    $(selector).addEventListener("input", renderSources);
  });
  $("#resetSourceFilters").addEventListener("click", () => {
    $("#sourceCategoryFilter").value = "";
    $("#sourceRegionFilter").value = "";
    renderSources();
  });
}

function renderSourceCard(item) {
  return `
    <article class="source-card">
      <div class="source-meta">
        <span class="badge official">${escapeHtml(item.tier)}</span>
        <span class="badge">${escapeHtml(item.region)}</span>
        <span class="badge">${escapeHtml(item.type)}</span>
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p class="coverage">${escapeHtml(item.coverage)}</p>
      <p>${escapeHtml(item.notes)}</p>
      <a class="external" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer noopener">Open source →</a>
    </article>
  `;
}

function renderSources() {
  const category = $("#sourceCategoryFilter").value;
  const region = $("#sourceRegionFilter").value;
  const filtered = data.sources.filter(item => (!category || item.category === category) && (!region || item.region === region));
  const categories = uniq(filtered.map(item => item.category));

  $("#sourceGroups").innerHTML = categories.map(group => {
    const items = filtered.filter(item => item.category === group);
    return `
      <section class="source-group">
        <h3>${escapeHtml(group)}</h3>
        <div class="source-grid">${items.map(renderSourceCard).join("")}</div>
      </section>
    `;
  }).join("") || `<p class="section-note">No sources match these filters.</p>`;
}

function navigate(route) {
  setMobileMenu(false);
  const page = route || location.hash.replace("#", "") || "dashboard";
  const valid = ["dashboard", "market", "events", "feed", "consultations", "access", "coverage", "about"].includes(page) ? page : "dashboard";
  $$(".route").forEach(section => section.classList.toggle("hidden", section.dataset.page !== valid));
  $$(".topnav a").forEach(link => {
    const active = link.dataset.route === valid;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (location.hash.replace("#", "") !== valid) history.replaceState(null, "", `#${valid}`);
  window.scrollTo(0, 0);
}

function initRouting() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-route]");
    if (!link) return;
    event.preventDefault();
    const route = link.dataset.route;
    history.pushState(null, "", `#${route}`);
    navigate(route);
  });
  window.addEventListener("popstate", () => navigate());
  navigate();
}

function safeRun(label, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[RegWatch] ${label} failed`, error);
  }
}

initTheme();
initMobileMenu();
safeRun("metrics", initMetrics);
safeRun("monitoring overview", renderMonitoring);
safeRun("regulatory radar", renderDashboard);
safeRun("monthly review", renderMonthlyReview);
safeRun("market intelligence", renderMarketIntelligence);
safeRun("events and briefings", renderEvents);
safeRun("feed filters", initFeedFilters);
safeRun("regulatory feed", renderFeed);
safeRun("consultations", renderConsultations);
safeRun("access matrix filters", initAccessMatrixFilters);
safeRun("access matrix", renderAccessMatrix);
safeRun("source filters", initSourceFilters);
safeRun("sources", renderSources);
safeRun("routing", initRouting);
