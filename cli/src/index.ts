#!/usr/bin/env bun

import { plan } from "./commands/plan.ts";
import { init } from "./commands/init.ts";
import { diagram } from "./commands/diagram.ts";
import { spec } from "./commands/spec.ts";

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
    case "diagram":
      await diagram(args.slice(1));
      break;
    case "spec":
      await spec(args.slice(1));
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
  plan <architecture.json>    Generate implementation plan from architecture blueprint
  diagram <architecture.json> Generate architecture diagrams (L1, L3)
  spec <bc_id>                Generate capability spec templates
  init [engine_name]          Initialize Rampart in project or engine
  version                     Print version
  help                        Show this help

Options:
  --output, -o <path>       Output file
  --format, -f <format>     Image format: png | svg (default: svg)
  --backend <name>          Cilantro backend override (cursor | claude | codex). Also supports CILANTRO_BACKEND env var.

Examples:
  rampart plan architecture/cat_content.json
  rampart diagram architecture/cat_content.json
  rampart diagram architecture/cat_content.json -o docs/arch/cat_content.md -f png
  rampart spec cat_content
  rampart init
  rampart init cat_content
`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
