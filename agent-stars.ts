#!/usr/bin/env bun
import { main } from "./src/index";

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
