export interface Architecture {
  name: string;
  profile: string;
  description?: string;
  scope?: { in: string[]; out: string[] };

  actors?: Array<{
    name: string;
    description?: string;
  }>;

  relationships?: {
    publishes_to?: Array<{
      bc: string;
      via: string;
      events: string[];
    }>;
    consumed_by?: Array<{
      bc: string;
      purpose: string;
    }>;
  };

  layers: {
    domain: {
      aggregates: Array<{
        name: string;
        description?: string;
        entity?: string;
        key_attributes?: string[];
        invariants?: string[];
        lifecycle?: string[];
      }>;
      events: Array<{
        name: string;
        description?: string;
        payload_intent?: string[];
      }>;
      ports: {
        repositories: string[];
        external: Array<{ name: string; description?: string }>;
      };
    };
    application: {
      services: Array<{
        name: string;
        orchestrates: string;
        uses_ports?: string[];
        publishes?: string[];
        operations?: { consumer?: string[]; admin?: string[] };
      }>;
      capabilities?: Array<{
        name: string;
        actors: string[];
        entrypoints: string[];
        orchestrates: string[];
        uses_ports: string[];
        emits: string[];
        outputs: string[];
      }>;
    };
    infrastructure: {
      constraint?: string;
      adapters: {
        persistence: Array<{ name: string; implements: string; technology?: string }>;
        external: Array<{ name: string; implements: string; technology?: string; pending?: boolean }>;
      };
      entrypoints: {
        http: Array<{ name: string; routes: string; invokes?: string }>;
      };
      wiring: string;
    };
  };
  external_systems?: Array<{
    name: string;
    description?: string;
    type?: string;
    purpose?: string;
    providers?: string[];
  }>;
}

export interface ArchitectureContext {
  architecture: Architecture;
  bcId: string;
  enginePath: string;
  engineExists: boolean;
  projectRoot: string;
}

import { dirname, basename, join } from "path";

export async function parseArchitecture(path: string): Promise<Architecture> {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    throw new Error(`Architecture file not found: ${path}`);
  }

  const content = await file.text();
  let json: Architecture;

  try {
    json = JSON.parse(content);
  } catch (e) {
    throw new Error(`Invalid JSON in architecture file: ${(e as Error).message}`);
  }

  // Validate required fields
  if (!json.name) throw new Error("Architecture missing 'name' field");
  if (!json.profile) throw new Error("Architecture missing 'profile' field");
  if (!json.layers) throw new Error("Architecture missing 'layers' field");

  return json;
}

/**
 * Derives the bounded context ID from the architecture file name.
 * e.g., "cat_content.json" -> "cat_content"
 */
export function deriveBcId(archPath: string): string {
  const fileName = basename(archPath, ".json");
  return fileName;
}

/**
 * Converts a snake_case BC ID to PascalCase module name.
 * e.g., "cat_content" -> "CatContent"
 */
export function bcIdToModuleName(bcId: string): string {
  return bcId
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Finds the project root by looking for architecture/ directory.
 * Walks up from the architecture file location.
 */
export async function findProjectRoot(archPath: string): Promise<string> {
  const archDir = dirname(archPath);
  const dirName = basename(archDir);

  // If we're in architecture/, go up one level
  if (dirName === "architecture") {
    return dirname(archDir);
  }

  // Otherwise, assume archPath's parent is the project root
  return archDir;
}

/**
 * Checks if an engine exists at the expected path.
 */
export async function engineExists(enginePath: string): Promise<boolean> {
  const gemspecPath = join(enginePath, `${basename(enginePath)}.gemspec`);
  const file = Bun.file(gemspecPath);
  return await file.exists();
}

/**
 * Builds the full context for architecture planning.
 */
export async function buildArchitectureContext(
  archPath: string
): Promise<ArchitectureContext> {
  const architecture = await parseArchitecture(archPath);
  const bcId = deriveBcId(archPath);
  const projectRoot = await findProjectRoot(archPath);
  const enginePath = join(projectRoot, "engines", bcId);
  const exists = await engineExists(enginePath);

  return {
    architecture,
    bcId,
    enginePath,
    engineExists: exists,
    projectRoot,
  };
}
