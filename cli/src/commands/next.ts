import { join, dirname } from "path";
import { existsSync } from "fs";
import {
  getAllBoundedContexts,
  analyzeBCWorkflowState,
  generateSuggestions,
  WorkflowSuggestion,
} from "../lib/workflow-state.js";

// ─────────────────────────────────────────────────────────────────────────────
// Argument Parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(args: string[]) {
  const options: Record<string, string> = {};
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("-")) {
      const key = arg.replace(/^-+/, "");
      const value = args[i + 1];
      if (value && !value.startsWith("-")) {
        options[key] = value;
        i++;
      } else {
        options[key] = "true";
      }
    } else {
      positionals.push(arg);
    }
  }
  return { options, positionals };
}

// ─────────────────────────────────────────────────────────────────────────────
// System.json Discovery
// ─────────────────────────────────────────────────────────────────────────────

async function findSystemJson(startDir: string): Promise<string | null> {
  let currentDir = startDir;
  while (currentDir !== "/" && currentDir !== ".") {
    const systemPath = join(currentDir, "architecture", "system.json");
    if (existsSync(systemPath)) {
      return systemPath;
    }
    const parent = dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Output Formatting
// ─────────────────────────────────────────────────────────────────────────────

function formatSuggestion(suggestion: WorkflowSuggestion, index: number): string {
  const lines: string[] = [];
  lines.push(`${index + 1}. ${suggestion.message}`);
  if (suggestion.command) {
    lines.push(`   Run: ${suggestion.command}`);
  } else {
    // For manual implementation
    if (suggestion.action === "implement_capability") {
      if (suggestion.specPath) {
        lines.push(`   Spec: ${suggestion.specPath}`);
      } else {
        lines.push(`   (Manual implementation - refer to spec file)`);
      }
    }
  }
  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Command
// ─────────────────────────────────────────────────────────────────────────────

export async function next(args: string[]): Promise<void> {
  const { options } = parseArgs(args);
  const bcScope = options["bc"]; // Optional --bc <id> flag

  // Find project root via system.json
  const systemPath = await findSystemJson(process.cwd());
  if (!systemPath) {
    console.error(
      "Could not find architecture/system.json. If this is a new project, run 'rampart init' to get started."
    );
    process.exit(1);
  }

  const projectRoot = dirname(dirname(systemPath));

  // Get BCs to analyze
  let bcsToAnalyze = await getAllBoundedContexts(projectRoot);
  if (bcScope) {
    bcsToAnalyze = bcsToAnalyze.filter((bc) => bc.id === bcScope);
    if (bcsToAnalyze.length === 0) {
      console.error(`Bounded Context '${bcScope}' not found in system.json`);
      process.exit(1);
    }
  }

  if (bcsToAnalyze.length === 0) {
    console.log("No bounded contexts found in system.json.");
    console.log(
      "Add bounded contexts to architecture/system.json or create architecture files using /rampart.architect."
    );
    return;
  }

  // Analyze each BC
  const bcStates = await Promise.all(
    bcsToAnalyze.map((bc) => analyzeBCWorkflowState(bc.id, bc.architectureFile, projectRoot))
  );

  // Generate suggestions (no limit)
  const suggestions = await generateSuggestions(bcStates, Infinity);

  // Output
  if (suggestions.length === 0) {
    if (bcScope) {
      console.log(`Bounded context '${bcScope}' is up to date!`);
    } else {
      console.log("All bounded contexts are up to date!");
    }
    console.log("Consider running 'packwerk check' and RSpec to verify architecture fitness.");
    return;
  }

  if (bcScope) {
    console.log(`Suggested next steps for ${bcScope}:\n`);
  } else {
    console.log("Suggested next steps:\n");
  }

  suggestions.forEach((s, i) => {
    console.log(formatSuggestion(s, i));
    console.log("");
  });
}
