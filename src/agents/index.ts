import { z } from "zod";
import type { AgentEntry, AgentSource } from "../types";
import { AgentEntrySchema, type AgentSourceSchema } from "../types";

import _AGENTS from "./agents.json" with { type: "json" };
export const AGENTS: Record<string, AgentEntry> = z.record(z.string(), AgentEntrySchema).parse(_AGENTS);

export type { AgentEntry, AgentEntrySchema, AgentSource, AgentSourceSchema };
