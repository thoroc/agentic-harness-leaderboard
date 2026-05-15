# agentic-harness-leaderboard

Tracks and ranks coding AI agents by GitHub stars. Updates daily via GitHub Actions.

## Usage

```bash
bun install
```

Fetch GitHub stats for all registered agents and generate Markdown tables:

```bash
bun run agent-stars.ts
```

Output files (all optional via flags):

| Flag | Default | Description |
|---|---|---|
| `--output` | `agent-stars.md` | English Markdown output |
| `--zh-output` | `agent-stars.zh-CN.md` | Chinese Markdown output |
| `--json-output` | `site/data/latest.json` | Website payload JSON |
| `--history-output` | `site/data/history.json` | Historical snapshot JSON |
| `--snapshot-dir` | `site/data/snapshots` | Per-run snapshot directory |

Set `GITHUB_TOKEN` to avoid API rate limits.

## Testing

```bash
bun test
```

## Website

The `site/` directory contains an Astro site that visualises the leaderboard data. It's deployed to GitHub Pages automatically via GitHub Actions.

To build locally:

```bash
cd site
bun install
bunx astro build
```

Output is in `site/dist/`.

## Adding an Agent

Edit `src/agents/agents.json` and add an entry. Use `kind: "open"` with a GitHub `repo`, `kind: "closed"` with a `vendor`, or `kind: "unknown"`.

## Architecture

The CLI fetches GitHub repo stats for each open-source agent, groups them by category (open/closed/unknown), and outputs Markdown files and JSON site data. The Astro site reads the JSON to render the dashboard at `https://pantheon-org.github.io/agentic-harness-leaderboard/`.
