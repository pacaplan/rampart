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
  plan <architecture.json>  Generate implementation plan
  version                   Print version
  help                      Show this help

Options:
  --output, -o <path>       Output file (default: plan.md in same directory)
`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
