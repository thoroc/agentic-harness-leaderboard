const state = { kind: "all", query: "", rangeDays: 30, latest: null, history: null };

const colors = ["#24735a", "#159092", "#c7506a", "#aa7a16", "#406faf", "#7357a8", "#d46f2b", "#4e7f3b"];

const fmt = new Intl.NumberFormat("en-US");
const byStars = (a, b) => (b.stars ?? -1) - (a.stars ?? -1) || a.name.localeCompare(b.name);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function number(value) {
  return typeof value === "number" ? fmt.format(value) : "N/A";
}

function shortDate(value) {
  return value ? String(value).slice(0, 10) : "N/A";
}

function kindMatch(agent) {
  return state.kind === "all" || agent.kind === state.kind;
}

function queryMatch(agent) {
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  return [agent.name, agent.repo, agent.vendor, ...agent.sources]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

function snapshotValue(snapshot, id) {
  return snapshot?.agents?.find((a) => a.id === id)?.stars ?? null;
}

function deltaFor(agent, days) {
  const snapshots = state.history?.snapshots ?? [];
  if (!snapshots.length || typeof agent.stars !== "number") return 0;
  const latestTime = Date.parse(state.latest.generatedAt);
  const target = latestTime - days * 24 * 60 * 60 * 1000;
  const ordered = snapshots.slice().sort((a, b) => Date.parse(a.generatedAt) - Date.parse(b.generatedAt));
  const baseline = ordered.findLast((item) => Date.parse(item.generatedAt) <= target) ?? ordered[0];
  const previous = snapshotValue(baseline, agent.id);
  return typeof previous === "number" ? agent.stars - previous : 0;
}

function renderStats() {
  const agents = state.latest.agents;
  const openStars = agents.filter((a) => a.kind === "open").reduce((sum, a) => sum + (a.stars ?? 0), 0);
  const top = agents.filter((a) => a.repo).sort(byStars)[0];
  const thirtyDay = agents.reduce((sum, a) => sum + Math.max(0, deltaFor(a, 30)), 0);
  const stats = [
    ["Total Stars", number(state.latest.totals.stars), `${state.latest.totals.repos} repos tracked`],
    ["Open Source Stars", number(openStars), `${state.latest.totals.openAgents} open source agents`],
    ["30D Growth", `+${number(thirtyDay)}`, "based on daily snapshots"],
    ["Current Leader", top?.name ?? "N/A", top ? `${number(top.stars)} stars` : "N/A"],
  ];
  document.getElementById("stats").innerHTML = stats.map(([label, value, foot]) => {
    return `
    <article class="stat">
      <div class="stat-label">${escapeHtml(label)}</div>
      <div class="stat-value">${escapeHtml(value)}</div>
      <div class="stat-foot">${escapeHtml(foot)}</div>
    </article>`;
  }).join("");
}

function renderKindShare() {
  const totals = {};
  for (const agent of state.latest.agents) {
    const key = agent.kind === "open" ? "Open Source" : agent.kind === "closed" ? "Closed Source" : "Unknown";
    totals[key] = (totals[key] ?? 0) + (agent.stars ?? 0);
  }
  const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, stars]) => stars));
  document.getElementById("kind-share").innerHTML = rows.map(([name, stars], index) => `
    <div class="kind-row">
      <div class="kind-name">${escapeHtml(name)}</div>
      <div class="bar"><span style="width:${Math.max(2, (stars / max) * 100)}%;background:${colors[index % colors.length]}"></span></div>
      <div class="kind-value">${number(stars)}</div>
    </div>
  `).join("");
}

function renderGrowthList() {
  const rows = state.latest.agents
    .filter((a) => a.repo)
    .map((a) => ({ agent: a, delta: deltaFor(a, 30) }))
    .sort((a, b) => b.delta - a.delta || byStars(a.agent, b.agent))
    .slice(0, 8);
  const max = Math.max(1, ...rows.map((row) => Math.max(0, row.delta)));
  document.getElementById("growth-list").innerHTML = rows.map((row, index) => `
    <div class="growth-row">
      <a class="growth-name" href="${escapeHtml(row.agent.url ?? "#")}">${escapeHtml(row.agent.name)}</a>
      <div class="bar"><span style="width:${Math.max(2, (Math.max(0, row.delta) / max) * 100)}%;background:${colors[index % colors.length]}"></span></div>
      <div class="growth-delta">+${number(row.delta)}</div>
    </div>
  `).join("");
}

function renderTrendChart() {
  const snapshots = (state.history?.snapshots ?? []).slice().sort((a, b) => Date.parse(a.generatedAt) - Date.parse(b.generatedAt));
  const topAgents = state.latest.agents.filter((a) => a.repo).sort(byStars).slice(0, 6);
  const latestTime = Date.parse(state.latest.generatedAt);
  const minTime = latestTime - state.rangeDays * 24 * 60 * 60 * 1000;
  let visible = snapshots.filter((item) => Date.parse(item.generatedAt) >= minTime);
  if (visible.length < 2 && snapshots.length) visible = snapshots.slice(-Math.min(2, snapshots.length));
  if (!visible.some((item) => item.generatedAt === state.latest.generatedAt)) visible.push({ generatedAt: state.latest.generatedAt, date: state.latest.generatedDate, agents: state.latest.agents });

  const values = [];
  for (const agent of topAgents) {
    for (const snap of visible) {
      const val = snapshotValue(snap, agent.id) ?? agent.stars ?? 0;
      values.push(val);
    }
  }
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const pad = 38;
  const width = 980;
  const height = 330;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;
  const x = (i) => pad + (visible.length <= 1 ? plotW : (i / (visible.length - 1)) * plotW);
  const y = (v) => pad + (1 - ((v - min) / Math.max(1, max - min))) * plotH;

  const lines = topAgents.map((agent, pIndex) => {
    const points = visible.map((snap, i) => `${x(i)},${y(snapshotValue(snap, agent.id) ?? agent.stars ?? 0)}`).join(" ");
    return `<polyline fill="none" stroke="${colors[pIndex % colors.length]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}" />`;
  }).join("");

  const dots = topAgents.map((agent, pIndex) => visible.map((snap, i) => {
    const v = snapshotValue(snap, agent.id) ?? agent.stars ?? 0;
    return `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="${colors[pIndex % colors.length]}" />`;
  }).join("")).join("");

  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const yy = pad + t * plotH;
    const value = Math.round(max - t * (max - min));
    return `<line class="grid" x1="${pad}" y1="${yy}" x2="${width - pad}" y2="${yy}" /><text class="chart-label" x="8" y="${yy + 4}">${number(value)}</text>`;
  }).join("");

  const labels = visible.map((snap, i) => `<text class="chart-label" x="${x(i) - 18}" y="${height - 10}">${escapeHtml(snap.date.slice(5))}</text>`).join("");

  document.getElementById("trend-chart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img">
      ${grid}
      <line class="axis" x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" />
      ${lines}
      ${dots}
      ${labels}
    </svg>
    <div class="legend">${topAgents.map((agent, index) => `<span><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(agent.name)}</span>`).join("")}</div>
  `;
}

function renderTable() {
  const rows = state.latest.agents.filter(kindMatch).filter(queryMatch).sort(byStars);
  document.getElementById("leaderboard").innerHTML = rows.map((agent, index) => `
    <tr>
      <td>${index + 1}</td>
      <td class="agent-cell">
        <a href="${escapeHtml(agent.url ?? "#")}"><strong>${escapeHtml(agent.name)}</strong></a>
        <span>${escapeHtml(agent.repo ?? agent.vendor ?? "N/A")}</span>
      </td>
      <td><span class="badge">${escapeHtml(agent.kind === "open" ? "Open Source" : agent.kind === "closed" ? "Closed Source" : "Unknown")}</span></td>
      <td>${number(agent.stars)}</td>
      <td>+${number(deltaFor(agent, 30))}</td>
      <td>${number(agent.forks)}</td>
      <td>${shortDate(agent.pushedAt)}</td>
      <td>${escapeHtml(agent.sources?.join(", ") ?? "")}</td>
    </tr>
  `).join("");
}

function renderAll() {
  renderStats();
  renderKindShare();
  renderGrowthList();
  renderTrendChart();
  renderTable();
  document.getElementById("updated-at").textContent = `Updated ${state.latest.generatedDateTime} ${state.latest.timezone}`;
}

async function boot() {
  const [latest, history] = await Promise.all([
    fetch("data/latest.json").then((r) => r.json()),
    fetch("data/history.json").then((r) => r.json()).catch(() => ({ snapshots: [] })),
  ]);
  state.latest = latest;
  state.history = history;

  document.getElementById("kind-tabs").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-kind]");
    if (!button) return;
    state.kind = button.dataset.kind;
    document.querySelectorAll("#kind-tabs button").forEach((item) => { item.classList.toggle("active", item === button); });
    renderTable();
  });

  document.getElementById("trend-range").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-days]");
    if (!button) return;
    state.rangeDays = Number(button.dataset.days);
    document.querySelectorAll("#trend-range button").forEach((item) => { item.classList.toggle("active", item === button); });
    renderTrendChart();
  });

  document.getElementById("search").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderTable();
  });

  renderAll();
}

boot().catch((error) => {
  document.body.innerHTML = `<main><section class="panel"><h1>Failed to load data</h1><p>${escapeHtml(error.message)}</p></section></main>`;
});
