import { HistoryPayloadSchema } from "../types";
import type { HistoryPayload } from "../types";

export const readHistory = async (path: string): Promise<HistoryPayload> => {
  try {
    const file = Bun.file(path);
    if (!(await file.exists())) return { updatedAt: new Date(0).toISOString(), snapshots: [] };
    const result = await HistoryPayloadSchema.safeParseAsync(await file.json());
    if (result.success) return result.data;
    return { updatedAt: new Date(0).toISOString(), snapshots: [] };
  } catch {
    return { updatedAt: new Date(0).toISOString(), snapshots: [] };
  }
};
