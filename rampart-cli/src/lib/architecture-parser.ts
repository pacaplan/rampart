export interface Architecture {
  name: string;
  profile: string;
  description?: string;
  scope?: { in: string[]; out: string[] };
  layers: {
    domain: {
      aggregates: Array<{ name: string; description?: string; entity?: string }>;
      events: Array<{ name: string; description?: string }>;
      ports: {
        repositories: string[];
        external: Array<{ name: string; description?: string }>;
      };
    };
    application: {
      services: Array<{
        name: string;
        orchestrates: string;
        uses_ports: string[];
        publishes: string[];
        operations?: { consumer?: string[]; admin?: string[] };
      }>;
    };
    infrastructure: {
      constraint?: string;
      adapters: {
        persistence: Array<{ name: string; implements: string; technology?: string }>;
        external: Array<{ name: string; implements: string; technology?: string; optional?: boolean }>;
      };
      entrypoints: {
        http: Array<{ name: string; routes: string; invokes: string }>;
      };
      wiring: string;
    };
  };
  external_systems?: Array<{ name: string; type: string; purpose: string }>;
}

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
