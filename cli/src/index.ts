#!/usr/bin/env bun

import { plan } from "./commands/plan.ts";
import { init } from "./commands/init.ts";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case "plan":
      await plan(args.slice(1));
      break;
    case "init":
      await init(args.slice(1));
      break;
    case "version":
      console.log("rampart-cli v0.1.0");
      break;
    case "help":
    default:
      printHelp();
  }
}

function printHelp() {
  console.log(`
rampart-cli - Architecture tooling for Rampart framework

Commands:
  plan <architecture.json>  Generate implementation plan from architecture blueprint
  init [engine_name]        Initialize Rampart in project or engine
  version                   Print version
  help                      Show this help

Options:
  --output, -o <path>       Output file (default: docs/plans/{bc_id}_plan.md)
  --backend <name>          Cilantro backend override (cursor | claude | codex). Also supports CILANTRO_BACKEND env var.

Examples:
  rampart plan architecture/cat_content.json
  rampart plan architecture/commerce.json -o my_plan.md
  rampart plan architecture/cat_content.json --backend cursor
  rampart init
  rampart init cat_content
`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
