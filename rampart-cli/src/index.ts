#!/usr/bin/env bun

import { plan } from "./commands/plan.ts";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case "plan":
      await plan(args.slice(1));
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
  version                   Print version
  help                      Show this help

Options:
  --output, -o <path>       Output file (default: docs/plans/{bc_id}_plan.md)

Examples:
  rampart plan architecture/cat_content.json
  rampart plan architecture/commerce.json -o my_plan.md

Modes:
  Greenfield  - Engine doesn't exist; plan includes Rails generator, Gemfile,
                routes mounting, and rampart init steps before implementation
  Incremental - Engine exists; plan shows only missing/modified components
`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
