import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export const writeJson = async (path: string, value: unknown): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, `${JSON.stringify(value, null, 2)}\n`);
};
