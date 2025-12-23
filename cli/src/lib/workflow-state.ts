import { join, dirname, basename } from "path";
import { existsSync } from "fs";
import { parseArchitecture, engineExists, deriveBcId } from "./architecture-parser.js";
import { slugify } from "./mermaid-generator.js";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SpecStatus = "template" | "planned" | "implemented";

export type SuggestionAction =
  | "create_engine"       // Step 2: rails plugin new + rampart init
  | "generate_specs"      // Step 3: rampart spec
  | "plan_capability"     // Step 4: /rampart.plan to complete spec
  | "implement_capability";// Step 5: implement code

export interface CapabilityState {
  name: string;
  slug: string;
  hasSpec: boolean;
  specPath: string | null;
  status: SpecStatus | null;
}

export interface BCWorkflowState {
  bcId: string;
  archPath: string;
  hasArchitecture: boolean;
  hasEngine: boolean;
  capabilities: CapabilityState[];
}

export interface WorkflowSuggestion {
  bcId: string;
  priority: number;
  action: SuggestionAction;
  message: string;
  command?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// System.json Discovery
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds all BCs defined in system.json
 */
export async function getAllBoundedContexts(
  projectRoot: string
): Promise<Array<{ id: string; architectureFile: string }>> {
  const systemPath = join(projectRoot, "architecture", "system.json");

  if (!existsSync(systemPath)) {
    return [];
  }

  const systemFile = Bun.file(systemPath);
  const system = await systemFile.json();

  const engines = system.engines?.items || [];

  return engines.map((engine: any) => ({
    id: engine.id,
    architectureFile: engine.architecture_file,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Spec Status Parsing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses the Status field from a spec file.
 * Looks for: **Status:** template | planned | implemented
 */
export async function parseSpecStatus(specPath: string): Promise<SpecStatus | null> {
  const file = Bun.file(specPath);

  if (!(await file.exists())) {
    return null;
  }

  const content = await file.text();

  // Look for **Status:** line - supports both formats:
  // **Status:** template
  // **Status**: template
  const statusMatch = content.match(/\*\*Status:?\*\*\s*(template|planned|implemented)/i);

  if (statusMatch) {
    return statusMatch[1].toLowerCase() as SpecStatus;
  }

  // Fallback: if no status field found, treat as template
  // (for backwards compatibility with specs generated before this feature)
  return "template";
}

// ─────────────────────────────────────────────────────────────────────────────
// BC Workflow State Analysis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyzes the workflow state for a single BC.
 */
export async function analyzeBCWorkflowState(
  bcId: string,
  archPath: string,
  projectRoot: string
): Promise<BCWorkflowState> {
  const resolvedArchPath = join(projectRoot, archPath);

  // Check if architecture file exists
  const hasArchitecture = existsSync(resolvedArchPath);

  if (!hasArchitecture) {
    return {
      bcId,
      archPath: resolvedArchPath,
      hasArchitecture: false,
      hasEngine: false,
      capabilities: [],
    };
  }

  // Parse architecture to get capabilities
  const architecture = await parseArchitecture(resolvedArchPath);
  const capabilities = architecture.layers.application.capabilities || [];

  // Check if engine exists
  const enginePath = join(projectRoot, "engines", bcId);
  const hasEngine = await engineExists(enginePath);

  // Default spec directory (matches spec.ts default)
  const specsDir = join(projectRoot, "docs", "specs", bcId);

  // Check each capability for spec file and status
  const capabilityStates: CapabilityState[] = await Promise.all(
    capabilities.map(async (cap) => {
      const slug = slugify(cap.name);
      const specPath = join(specsDir, `${slug}.spec.md`);
      const hasSpec = existsSync(specPath);
      const status = hasSpec ? await parseSpecStatus(specPath) : null;

      return {
        name: cap.name,
        slug,
        hasSpec,
        specPath: hasSpec ? specPath : null,
        status,
      };
    })
  );

  return {
    bcId,
    archPath: resolvedArchPath,
    hasArchitecture: true,
    hasEngine,
    capabilities: capabilityStates,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines suggestions for a single BC based on its workflow state.
 */
function determineBCSuggestions(state: BCWorkflowState): WorkflowSuggestion[] {
  const suggestions: WorkflowSuggestion[] = [];

  // If no architecture, skip (nothing to suggest)
  if (!state.hasArchitecture) {
    return suggestions;
  }

  // Priority 1: If architecture exists but engine doesn't -> create_engine
  if (!state.hasEngine) {
    suggestions.push({
      bcId: state.bcId,
      priority: 1,
      action: "create_engine",
      message: `Create Rails engine for ${state.bcId}`,
      command: `rails plugin new engines/${state.bcId} --mountable && rampart init ${state.bcId}`,
    });
    // Block on this step - don't suggest further work until engine exists
    return suggestions;
  }

  // Priority 2: Check for capabilities missing specs -> generate_specs
  const missingSpecs = state.capabilities.filter((c) => !c.hasSpec);
  if (missingSpecs.length > 0) {
    const capText = missingSpecs.length === 1 ? 'capability' : 'capabilities';
    suggestions.push({
      bcId: state.bcId,
      priority: 2,
      action: "generate_specs",
      message: `Generate spec templates for ${state.bcId} (${missingSpecs.length} ${capText})`,
      command: `rampart spec ${state.bcId}`,
    });
  }

  // Priority 3: Template specs -> plan_capability
  const templateSpecs = state.capabilities.filter((c) => c.status === "template");
  for (const cap of templateSpecs) {
    suggestions.push({
      bcId: state.bcId,
      priority: 3,
      action: "plan_capability",
      message: `Complete planning for ${cap.name}`,
      command: `/rampart.plan with ${cap.specPath}`,
    });
  }

  // Priority 4: Planned specs -> implement_capability
  const plannedSpecs = state.capabilities.filter((c) => c.status === "planned");
  for (const cap of plannedSpecs) {
    suggestions.push({
      bcId: state.bcId,
      priority: 4,
      action: "implement_capability",
      message: `Implement ${cap.name}`,
      command: undefined, // Manual implementation
    });
  }

  return suggestions;
}

/**
 * Generates prioritized suggestions across all BCs.
 *
 * Depth-first strategy:
 * - Prioritize BCs with in-progress work (template/planned specs)
 * - Within a BC, lower priority number = higher priority
 * - Complete one BC before suggesting another
 */
export async function generateSuggestions(
  bcStates: BCWorkflowState[],
  maxSuggestions: number = 3
): Promise<WorkflowSuggestion[]> {
  // Generate suggestions for each BC
  const allSuggestions: WorkflowSuggestion[] = [];

  for (const bcState of bcStates) {
    const bcSuggestions = determineBCSuggestions(bcState);
    allSuggestions.push(...bcSuggestions);
  }

  // Sort suggestions:
  // 1. By priority (lower = higher priority)
  // 2. By BC ID (for stability)
  allSuggestions.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.bcId.localeCompare(b.bcId);
  });

  // Apply depth-first logic:
  // Group by BC, prioritize BCs with more advanced work
  const bcProgress = new Map<string, number>();
  for (const bcState of bcStates) {
    // Calculate progress score (higher = more advanced)
    const hasPlanned = bcState.capabilities.some((c) => c.status === "planned");
    const hasTemplate = bcState.capabilities.some((c) => c.status === "template");
    const hasEngine = bcState.hasEngine;

    let score = 0;
    if (hasPlanned) score += 100; // Highest priority - has planned specs
    if (hasTemplate) score += 50;  // Medium priority - has template specs
    if (hasEngine) score += 10;    // Low priority - has engine

    bcProgress.set(bcState.bcId, score);
  }

  // Re-sort with BC progress score
  allSuggestions.sort((a, b) => {
    const scoreA = bcProgress.get(a.bcId) || 0;
    const scoreB = bcProgress.get(b.bcId) || 0;

    // Higher score = more advanced BC = higher priority
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // Within same BC progress, sort by action priority
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    return a.bcId.localeCompare(b.bcId);
  });

  // Limit to maxSuggestions
  return allSuggestions.slice(0, maxSuggestions);
}
