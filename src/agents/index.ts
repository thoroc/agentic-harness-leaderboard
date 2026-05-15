import { z } from "zod";
import { AgentEntrySchema, AgentSourceSchema } from "../types/index";
import type { AgentEntry, AgentSource } from "../types/index";

import _AGENTS from "./agents.json" with { type: "json" };
export const AGENTS: Record<string, AgentEntry> = z.record(z.string(), AgentEntrySchema).parse(_AGENTS);

export type { AgentEntry, AgentEntrySchema, AgentSource, AgentSourceSchema };
