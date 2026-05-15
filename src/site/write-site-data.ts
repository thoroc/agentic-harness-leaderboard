import { join } from "node:path";
import type { SitePayload, HistoryPayload } from "../types";
import { buildSnapshot } from "./build-snapshot";
import { readHistory } from "./read-history";
import { writeJson } from "./write-json";
import { HISTORY_LIMIT } from "../constants";

export const writeSiteData = async (payload: SitePayload, latestPath: string, historyPath: string, snapshotDir: string): Promise<void> => {
  const snapshot = buildSnapshot(payload);
  const history = await readHistory(historyPath);
  const snapshotsByDate = new Map(history.snapshots.map((item) => [item.date, item]));
  snapshotsByDate.set(snapshot.date, snapshot);
  const snapshots = [...snapshotsByDate.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-HISTORY_LIMIT);
  const nextHistory: HistoryPayload = { updatedAt: payload.generatedAt, snapshots };

  await writeJson(latestPath, payload);
  await writeJson(historyPath, nextHistory);
  await writeJson(join(snapshotDir, `${payload.generatedDate}.json`), snapshot);
};
