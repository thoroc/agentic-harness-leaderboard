#!/usr/bin/env bun
import { main } from "./src/index.ts";

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
