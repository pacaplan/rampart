import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function init(args: string[]) {
  const contextName = args[0];

  if (contextName) {
    await initEngine(contextName);
  } else {
    await initProject();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Template Loading
// ─────────────────────────────────────────────────────────────────────────────

function loadTemplate(filename: string): string {
  const templatePath = join(__dirname, "..", "..", "templates", filename);
  return readFileSync(templatePath, "utf-8");
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemfile Management
// ─────────────────────────────────────────────────────────────────────────────

function addGemToGemfile(gemName: string, group?: string): void {
  const projectRoot = process.cwd();
  const gemfilePath = join(projectRoot, "Gemfile");

  if (!existsSync(gemfilePath)) {
    console.log(`Warning: Gemfile not found. Skipping gem '${gemName}'.`);
    return;
  }

  const gemfileContent = readFileSync(gemfilePath, "utf-8");

  // Check if gem already exists
  const gemPattern = new RegExp(`gem\\s+['"]${gemName}['"]`, "m");
  if (gemPattern.test(gemfileContent)) {
    return; // Gem already present
  }

  try {
    // Build bundle add command
    const groupFlag = group ? `--group ${group}` : "";
    const command = `bundle add ${gemName} ${groupFlag}`.trim();

    console.log(`Adding gem '${gemName}' to Gemfile${group ? ` (${group} group)` : ''}...`);
    execSync(command, { cwd: projectRoot, stdio: 'inherit' });
  } catch (error: any) {
    console.log(`Warning: Failed to add gem '${gemName}'. You may need to add it manually.`);
    console.log(`Error: ${error.message}`);
  }
}

async function initProject() {
  const projectRoot = process.cwd();
  const architectureDir = join(projectRoot, "architecture");
  const systemJsonPath = join(architectureDir, "system.json");
  const agentsMdPath = join(projectRoot, "AGENTS.md");
  const enginesDir = join(projectRoot, "engines");
  const enginesAgentsMdPath = join(enginesDir, "AGENTS.md");
  const packwerkYmlPath = join(projectRoot, "packwerk.yml");

  let createdAny = false;

  if (!existsSync(architectureDir)) {
    console.log("Creating architecture directory...");
    mkdirSync(architectureDir);
    createdAny = true;
  }

  if (!existsSync(systemJsonPath)) {
    console.log("Creating architecture/system.json...");
    const initialSystemJson = {
      "$schema": "rampart/schema/system_v1.json",
      "schema_version": "1.0",
      "system": {
        "id": "my_system",
        "name": "My System",
        "description": "Rampart Application"
      },
      "engines": {
        "base_dir": "engines",
        "items": []
      }
    };
    writeFileSync(systemJsonPath, JSON.stringify(initialSystemJson, null, 2));
    createdAny = true;
  }
  
  if (!existsSync(agentsMdPath)) {
    console.log("Creating AGENTS.md...");
    const agentsContent = `# Agent Guidelines

## Project Overview

This project uses the Rampart framework for Domain-Driven Design.

### Architecture

The project structure follows Hexagonal Architecture (Ports & Adapters) with the following key directories:

- \`architecture/\`: System blueprints and domain definitions
- \`engines/\`: Bounded Contexts implemented as Rails Engines

### Framework

Rampart provides the building blocks for DDD:
- Domain: Aggregates, Entities, Value Objects
- Application: Commands, Queries, Services
- Ports: Secondary Ports for infrastructure abstraction
`;
    writeFileSync(agentsMdPath, agentsContent);
    createdAny = true;
  }

  // Create engines directory and AGENTS.md if engines dir exists or we create it
  if (!existsSync(enginesDir)) {
    console.log("Creating engines directory...");
    mkdirSync(enginesDir);
    createdAny = true;
  }

  if (!existsSync(enginesAgentsMdPath)) {
    console.log("Creating engines/AGENTS.md...");
    writeFileSync(enginesAgentsMdPath, loadTemplate("engines_agents.md"));
    createdAny = true;
  }

  if (!existsSync(packwerkYmlPath)) {
    console.log("Creating packwerk.yml...");
    writeFileSync(packwerkYmlPath, loadTemplate("packwerk.yml"));
    createdAny = true;
  }

  if (!createdAny) {
    console.log("Rampart already initialized in this project.");
  } else {
    console.log("Rampart initialized successfully.");
  }
}

async function initEngine(contextName: string) {
    const projectRoot = process.cwd();
    const systemJsonPath = join(projectRoot, "architecture", "system.json");
    
    if (!existsSync(systemJsonPath)) {
        console.error("Error: Project not initialized. Run 'rampart init' first.");
        process.exit(1);
    }
    
    const enginePath = join(projectRoot, "engines", contextName);
    if (!existsSync(enginePath)) {
         console.error(`Error: Engine '${contextName}' not found at ${enginePath}. Please create it first.`);
         process.exit(1);
    }

    // Check system.json
    try {
        const systemJson = JSON.parse(readFileSync(systemJsonPath, "utf-8"));
        const engines = systemJson.engines?.items || [];
        const engineConfig = engines.find((e: any) => e.engine_name === contextName || e.id === contextName);
        
        if (!engineConfig) {
             console.error(`Error: Engine '${contextName}' not defined in architecture/system.json.`);
             process.exit(1);
        }
    } catch (e: any) {
        console.error("Error reading system.json:", e.message);
        process.exit(1);
    }

    const appDir = join(enginePath, "app");
    const specDir = join(enginePath, "spec");
    const domainDir = join(appDir, "domain", contextName);
    
    let createdAny = false;
    const structureExists = existsSync(domainDir);

    if (!structureExists) {
        console.log(`Initializing Rampart structure for engine '${contextName}'...`);

        const dirsToCreate = [
            `domain/${contextName}/aggregates`,
            `domain/${contextName}/entities`,
            `domain/${contextName}/value_objects`,
            `domain/${contextName}/events`,
            `domain/${contextName}/services`,
            `domain/${contextName}/ports`,
            `application/${contextName}/services`,
            `application/${contextName}/commands`,
            `application/${contextName}/queries`,
            `infrastructure/${contextName}/persistence/mappers`,
            `infrastructure/${contextName}/persistence/repositories`,
            `infrastructure/${contextName}/adapters`,
            `infrastructure/${contextName}/wiring`,
        ];

        for (const dir of dirsToCreate) {
            const fullPath = join(appDir, dir);
            if (!existsSync(fullPath)) {
                mkdirSync(fullPath, { recursive: true });
            }
        }
        createdAny = true;
    }

    // Create AGENTS.md files for each layer (even if structure already exists)
    const domainAgentsPath = join(appDir, "domain", "AGENTS.md");
    if (existsSync(join(appDir, "domain")) && !existsSync(domainAgentsPath)) {
        console.log("Creating app/domain/AGENTS.md...");
        writeFileSync(domainAgentsPath, loadTemplate("domain_agents.md"));
        createdAny = true;
    }

    const applicationAgentsPath = join(appDir, "application", "AGENTS.md");
    if (existsSync(join(appDir, "application")) && !existsSync(applicationAgentsPath)) {
        console.log("Creating app/application/AGENTS.md...");
        writeFileSync(applicationAgentsPath, loadTemplate("application_agents.md"));
        createdAny = true;
    }

    const infrastructureAgentsPath = join(appDir, "infrastructure", "AGENTS.md");
    if (existsSync(join(appDir, "infrastructure")) && !existsSync(infrastructureAgentsPath)) {
        console.log("Creating app/infrastructure/AGENTS.md...");
        writeFileSync(infrastructureAgentsPath, loadTemplate("infrastructure_agents.md"));
        createdAny = true;
    }

    const controllersAgentsPath = join(appDir, "controllers", "AGENTS.md");
    if (existsSync(join(appDir, "controllers")) && !existsSync(controllersAgentsPath)) {
        console.log("Creating app/controllers/AGENTS.md...");
        writeFileSync(controllersAgentsPath, loadTemplate("controllers_agents.md"));
        createdAny = true;
    }

    // Create spec directory and AGENTS.md if it doesn't exist
    if (!existsSync(specDir)) {
        mkdirSync(specDir, { recursive: true });
        createdAny = true;
    }
    const specAgentsPath = join(specDir, "AGENTS.md");
    if (!existsSync(specAgentsPath)) {
        console.log("Creating spec/AGENTS.md...");
        writeFileSync(specAgentsPath, loadTemplate("spec_agents.md"));
        createdAny = true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Packwerk Configuration
    // ─────────────────────────────────────────────────────────────────────────

    // Create app/public directory for cross-engine API
    const publicDir = join(appDir, "public");
    if (!existsSync(publicDir)) {
        console.log("Creating app/public/ for cross-engine API...");
        mkdirSync(publicDir, { recursive: true });
        createdAny = true;
    }

    // Generate package.yml files
    const packageFiles = [
        { path: join(enginePath, "package.yml"), template: "package_engine.yml", name: "Engine boundary" },
        { path: join(publicDir, "package.yml"), template: "package_public.yml", name: "Public API" },
        { path: join(appDir, "domain", contextName, "package.yml"), template: "package_domain.yml", name: "Domain layer" },
        { path: join(appDir, "application", contextName, "package.yml"), template: "package_application.yml", name: "Application layer" },
        { path: join(appDir, "infrastructure", contextName, "package.yml"), template: "package_infrastructure.yml", name: "Infrastructure layer" },
        { path: join(appDir, "controllers", "package.yml"), template: "package_controllers.yml", name: "Controllers layer" },
    ];

    for (const { path, template, name } of packageFiles) {
        const parentDir = dirname(path);
        // Only create package.yml if parent directory exists and file doesn't exist
        if (existsSync(parentDir) && !existsSync(path)) {
            console.log(`Creating ${name} package.yml...`);
            let content = loadTemplate(template);
            // Replace {{CONTEXT_NAME}} placeholder with actual context name
            content = content.replace(/\{\{CONTEXT_NAME\}\}/g, contextName);
            writeFileSync(path, content);
            createdAny = true;
        }
    }

    // Add gems to Gemfile
    console.log("Checking Gemfile for required gems...");
    addGemToGemfile("packwerk", "development");
    addGemToGemfile("rampart");

    if (!createdAny) {
        console.log(`Engine '${contextName}' already initialized with Rampart structure.`);
    } else {
        console.log(`Rampart initialization complete for '${contextName}'.`);
        console.log("\nNext steps:");
        console.log("  1. Run 'bundle install' to install packwerk");
        console.log("  2. Run 'bundle exec packwerk validate' to check configuration");
        console.log("  3. Run 'bundle exec packwerk check' to verify layer boundaries");
    }
}

