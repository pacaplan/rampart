import { join, dirname, basename, resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import { parseArchitecture, deriveBcId, Architecture } from "../lib/architecture-parser.js";
import { generateL3, slugify } from "../lib/mermaid-generator.js";

// Minimal args parsing
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

async function resolveArchitecturePath(arg: string): Promise<string> {
  // If it looks like a file path, return it resolved
  if (arg.endsWith(".json")) {
    return resolve(arg);
  }

  // Otherwise, treat as BC ID and look up in system.json
  const systemPath = await findSystemJson(process.cwd());
  if (!systemPath) {
    throw new Error(`Could not find architecture/system.json to resolve BC ID '${arg}'. Please run from project root or provide full path.`);
  }

  const systemFile = Bun.file(systemPath);
  const system = await systemFile.json();
  
  const engine = system.engines?.items?.find((e: any) => e.id === arg);
  if (!engine) {
    throw new Error(`Bounded Context '${arg}' not found in system.json`);
  }

  if (!engine.architecture_file) {
    throw new Error(`Engine '${arg}' in system.json is missing 'architecture_file' property`);
  }

  // Resolve architecture file relative to system.json's project root (parent of architecture dir)
  const projectRoot = dirname(dirname(systemPath));
  return join(projectRoot, engine.architecture_file);
}

type Capability = NonNullable<Architecture["layers"]["application"]["capabilities"]>[0];

function generateSpecMarkdown(
  arch: Architecture,
  capability: Capability,
  bcId: string,
  archPath: string,
  mermaidCode: string
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${capability.name} — Capability Spec`);
  lines.push("");
  lines.push(`**Bounded Context:** ${arch.name}`);
  lines.push(`**Status:** template`);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Source:** \`${archPath}\``);
  lines.push("");
  lines.push("<!-- ");
  lines.push("Status values:");
  lines.push("  - template: Initial generated template, not yet planned");
  lines.push("  - planned: Specs completed via /rampart.plan, ready for implementation");
  lines.push("  - implemented: Code implementation complete");
  lines.push("Update this status as you progress through the workflow.");
  lines.push("-->");
  lines.push("");
  lines.push("---");
  lines.push("");

  // Overview
  lines.push("## Overview");
  lines.push("");
  lines.push(`**Actors:** ${capability.actors.join(", ")}`);
  lines.push(`**Entrypoints:** ${capability.entrypoints.join(", ")}`);
  lines.push(`**Outputs:** ${capability.outputs.length > 0 ? capability.outputs.join(", ") : "N/A"}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Acceptance Criteria (EARS notation placeholders)
  lines.push("## Acceptance Criteria");
  lines.push("");
  lines.push("<!-- Use EARS notation for testable requirements -->");
  lines.push("<!-- WHEN <trigger> THE SYSTEM SHALL <response> -->");
  lines.push("<!-- WHILE <state> THE SYSTEM SHALL <response> -->");
  lines.push("<!-- IF <condition> THEN THE SYSTEM SHALL <response> -->");
  lines.push("");
  lines.push("- [ ] WHEN ... THE SYSTEM SHALL ...");
  lines.push("- [ ] WHEN ... THE SYSTEM SHALL ...");
  lines.push("- [ ] WHEN ... THE SYSTEM SHALL ...");
  lines.push("");
  lines.push("---");
  lines.push("");

  // Error Handling
  lines.push("## Error Handling");
  lines.push("");
  lines.push("<!-- Define error scenarios using EARS IF/THEN notation -->");
  lines.push("");
  lines.push("- [ ] IF ... THEN THE SYSTEM SHALL ...");
  lines.push("- [ ] IF ... THEN THE SYSTEM SHALL ...");
  lines.push("");
  lines.push("---");
  lines.push("");

  // Domain State & Data (New Section)
  lines.push("## Domain State & Data");
  lines.push("");
  lines.push("### Aggregates involved");
  lines.push("");

  const involvedAggregates = capability.orchestrates || [];
  const aggregateDefs = arch.layers.domain.aggregates.filter(a => 
    involvedAggregates.includes(a.name) || 
    // Fallback: if 'orchestrates' refers to a Service, check if that service orchestrates the Aggregate
    arch.layers.application.services.some(s => s.name === a.name && involvedAggregates.includes(s.name)) ||
    // Simple name matching just in case
    involvedAggregates.some(inv => inv.includes(a.name))
  );

  if (aggregateDefs.length > 0) {
    aggregateDefs.forEach(agg => {
      lines.push(`#### ${agg.name}`);
      lines.push(`> ${agg.description || "No description"}`);
      lines.push("");
      
      if (agg.key_attributes && agg.key_attributes.length > 0) {
        lines.push("**Key Attributes:**");
        agg.key_attributes.forEach(attr => lines.push(`- \`${attr}\``));
        lines.push("");
      }

      if (agg.invariants && agg.invariants.length > 0) {
        lines.push("**Invariants:**");
        agg.invariants.forEach(inv => lines.push(`- ${inv}`));
        lines.push("");
      }

      if (agg.lifecycle && agg.lifecycle.length > 0) {
        lines.push(`**Lifecycle:** ${agg.lifecycle.join(" -> ")}`);
        lines.push("");
      }
    });
  } else {
    lines.push("_No specific aggregates identified in architecture._");
  }

  lines.push("");
  
  // Domain Events (New Section)
  if (capability.emits && capability.emits.length > 0) {
    lines.push("### Domain Events Emitted");
    lines.push("");
    
    const eventDefs = arch.layers.domain.events.filter(e => capability.emits.includes(e.name));
    
    if (eventDefs.length > 0) {
      eventDefs.forEach(evt => {
        lines.push(`#### ${evt.name}`);
        lines.push(`> ${evt.description || "No description"}`);
        lines.push("");
        
        if (evt.payload_intent && evt.payload_intent.length > 0) {
          lines.push("**Payload Intent:**");
          evt.payload_intent.forEach(field => lines.push(`- \`${field}\``));
          lines.push("");
        }
      });
    } else {
      capability.emits.forEach(evtName => lines.push(`- ${evtName} (Definition not found in domain layer)`));
    }
    lines.push("");
  }
  
  lines.push("---");
  lines.push("");

  // Data Model (to be completed during planning)
  lines.push("## Data Model");
  lines.push("");
  lines.push("<!-- Map the Aggregate attributes above to a persistence schema -->");
  lines.push("<!-- Note: Only model tables owned by this Bounded Context -->");
  lines.push("");
  lines.push("### Schema");
  lines.push("");
  lines.push("| Table | Column | Type | Constraints |");
  lines.push("|-------|--------|------|-------------|");
  lines.push("| ...   | ...    | ...  | ...         |");
  lines.push("");
  lines.push("### Relationships");
  lines.push("");
  lines.push("<!-- Define foreign keys, join tables, and cross-aggregate references -->");
  lines.push("");
  lines.push("### Indexes");
  lines.push("");
  lines.push("<!-- Define indexes for query optimization -->");
  lines.push("");
  lines.push("---");
  lines.push("");

  // Request/Response Contracts (to be completed during planning)
  lines.push("## Request/Response Contracts");
  lines.push("");
  lines.push("<!-- Define API payloads and Event DTOs -->");
  lines.push("<!-- Tip: Use Task-Based naming (e.g. GenerateCustomCatRequest) -->");
  lines.push("");
  lines.push("### Request");
  lines.push("");
  lines.push("```json");
  lines.push("{");
  lines.push("  ...");
  lines.push("}");
  lines.push("```");
  lines.push("");
  lines.push("### Response");
  lines.push("");
  lines.push("```json");
  lines.push("{");
  lines.push("  ...");
  lines.push("}");
  lines.push("```");
  lines.push("");
  lines.push("---");
  lines.push("");

  // Architecture section
  lines.push("## Architecture");
  lines.push("");
  lines.push("### Capability Flow Diagram");
  lines.push("");
  lines.push("```mermaid");
  lines.push(mermaidCode);
  lines.push("```");
  lines.push("");

  // Application Layer
  lines.push("### Application Layer");
  lines.push("");
  lines.push("**Services:**");
  for (const svc of capability.orchestrates) {
    lines.push(`- ${svc}`);
  }
  lines.push("");

  // Domain Layer - find aggregates from services
  lines.push("### Domain Layer");
  lines.push("");
  const aggregateNames = new Set<string>();
  for (const svcName of capability.orchestrates) {
    const svc = arch.layers.application.services.find(s => s.name === svcName);
    if (svc) aggregateNames.add(svc.orchestrates);
  }

  for (const aggName of aggregateNames) {
    const agg = arch.layers.domain.aggregates.find(a => a.name === aggName);
    if (agg) {
      lines.push(`**Aggregate:** ${agg.name}`);
      if (agg.invariants && agg.invariants.length > 0) {
        lines.push("");
        lines.push("**Invariants:**");
        for (const inv of agg.invariants) {
          lines.push(`- ${inv}`);
        }
      }
      if (agg.lifecycle && agg.lifecycle.length > 0) {
        lines.push("");
        lines.push(`**Lifecycle:** ${agg.lifecycle.join(" → ")}`);
      }
      lines.push("");
    }
  }

  if (capability.emits.length > 0) {
    lines.push("**Events Emitted:**");
    for (const evt of capability.emits) {
      lines.push(`- ${evt}`);
    }
    lines.push("");
  }

  // Infrastructure Layer
  lines.push("### Infrastructure Layer");
  lines.push("");
  lines.push("**Ports Used:**");
  for (const port of capability.uses_ports) {
    lines.push(`- ${port}`);
  }
  lines.push("");

  // Find adapters for these ports
  const adapters: string[] = [];
  for (const portName of capability.uses_ports) {
    const persAdapter = arch.layers.infrastructure.adapters.persistence.find(a => a.implements === portName);
    const extAdapter = arch.layers.infrastructure.adapters.external.find(a => a.implements === portName);
    if (persAdapter) adapters.push(`${persAdapter.name} → ${portName}`);
    if (extAdapter) adapters.push(`${extAdapter.name} → ${portName}`);
  }
  if (adapters.length > 0) {
    lines.push("**Adapters:**");
    for (const adapter of adapters) {
      lines.push(`- ${adapter}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  lines.push("## Implementation Notes (Optional)");
  lines.push("");
  lines.push("<!-- Add any implementation-specific notes, constraints, or considerations -->");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## ✅ Post-Implementation Checklist");
  lines.push("");
  lines.push("Once implementation is complete:");
  lines.push("");
  lines.push("- [ ] All acceptance criteria pass");
  lines.push("- [ ] Error handling scenarios covered by tests");
  lines.push("- [ ] Update **Status** field at top of this file from `planned` to `implemented`");
  lines.push("");

  return lines.join("\n");
}

export async function spec(args: string[]): Promise<void> {
  const { options, positionals } = parseArgs(args);
  const bcIdOrPath = positionals[0];
  
  if (!bcIdOrPath) {
    console.error("Usage: rampart spec <bc_id|path> [options]");
    process.exit(1);
  }

  const outputArg = options["output"] || options["o"];
  
  let archPath: string;
  try {
    archPath = await resolveArchitecturePath(bcIdOrPath);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }

  console.log(`Resolved architecture: ${archPath}`);
  const arch = await parseArchitecture(archPath);
  const bcId = deriveBcId(archPath);
  
  if (!arch.layers.application.capabilities || arch.layers.application.capabilities.length === 0) {
    console.log("No capabilities found in architecture file.");
    return;
  }

  console.log(`Generating spec templates for ${bcId}...`);

  // Determine output directory
  // Default: docs/specs/{bcId}/
  let specsDir: string;
  if (outputArg) {
    specsDir = resolve(outputArg);
  } else {
    const archDir = dirname(resolve(archPath));
    const projectRoot = basename(archDir) === "architecture" ? dirname(archDir) : archDir;
    specsDir = join(projectRoot, "docs", "specs", bcId);
  }

  if (!existsSync(specsDir)) {
    mkdirSync(specsDir, { recursive: true });
  }

  console.log(`Output directory: ${specsDir}`);

  // Generate spec for each capability
  for (const capability of arch.layers.application.capabilities) {
    const capSlug = slugify(capability.name);
    const specPath = join(specsDir, `${capSlug}.spec.md`);

    // Generate L3 Mermaid code (just the source, no rendering)
    const diagram = generateL3(arch, capability, bcId);
    
    // Generate spec markdown
    const specContent = generateSpecMarkdown(arch, capability, bcId, archPath, diagram.mermaidCode);
    
    await Bun.write(specPath, specContent);
    console.log(`Generated: ${specPath}`);
  }

  console.log(`\nGenerated ${arch.layers.application.capabilities.length} spec template(s).`);
}

