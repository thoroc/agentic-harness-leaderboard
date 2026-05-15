import type { HistoryPayload, HistorySnapshot } from "../types/index.ts";

export const readHistory = async (path: string): Promise<HistoryPayload> => {
  try {
    const file = Bun.file(path);
    if (!(await file.exists())) return { updatedAt: new Date(0).toISOString(), snapshots: [] };
    const parsed = (await file.json()) as Partial<HistoryPayload>;
    return {
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
      snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots as HistorySnapshot[] : [],
    };
  } catch {
    return { updatedAt: new Date(0).toISOString(), snapshots: [] };
  }
};
