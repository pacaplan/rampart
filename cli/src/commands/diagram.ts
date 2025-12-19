import { join, dirname, basename, resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import { parseArchitecture, deriveBcId } from "../lib/architecture-parser.js";
import { generateAllDiagrams } from "../lib/mermaid-generator.js";
import { renderMermaid } from "../lib/mermaid-renderer.js";

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

export async function diagram(args: string[]): Promise<void> {
  const { options, positionals } = parseArgs(args);
  const bcIdOrPath = positionals[0];
  
  if (!bcIdOrPath) {
    console.error("Usage: rampart diagram <bc_id|path> [options]");
    process.exit(1);
  }

  const outputArg = options["output"] || options["o"];
  const formatArg = options["format"] || options["f"] || "svg";
  
  if (formatArg !== "svg" && formatArg !== "png") {
    console.error("Format must be 'svg' or 'png'");
    process.exit(1);
  }

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
  
  console.log(`Generating diagrams for ${bcId}...`);
  const diagrams = generateAllDiagrams(arch, bcId);

  // Determine output paths
  // Default: docs/diagrams/{bc_id}_architecture.md
  // Images: docs/diagrams/images/
  
  let mdOutputPath: string;
  if (outputArg) {
    mdOutputPath = resolve(outputArg);
  } else {
    // Try to find docs dir relative to project root
    // Assume arch path is project/architecture/file.json -> project/docs/diagrams/...
    const archDir = dirname(resolve(archPath));
    const projectRoot = basename(archDir) === "architecture" ? dirname(archDir) : archDir;
    mdOutputPath = join(projectRoot, "docs", "diagrams", `${bcId}_architecture.md`);
  }

  const outputDir = dirname(mdOutputPath);
  const imagesDir = join(outputDir, "images");

  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
  }

  console.log(`Output directory: ${outputDir}`);
  console.log(`Images directory: ${imagesDir}`);

  // Render images
  for (const diag of diagrams) {
    const imagePath = join(imagesDir, `${diag.filename}.${formatArg}`);
    console.log(`Rendering ${diag.filename}...`);
    await renderMermaid(diag.mermaidCode, imagePath, formatArg as "svg" | "png");
  }

  // Generate Markdown
  const templatePath = join(import.meta.dir, "../../templates/architecture_diagrams.md");
  const templateFile = Bun.file(templatePath);
  let template = await templateFile.text();

  // Basic replacements
  template = template
    .replace(/{{BC_NAME}}/g, arch.name)
    .replace(/{{BC_ID}}/g, bcId)
    .replace(/{{JSON_PATH}}/g, archPath)
    .replace(/{{TIMESTAMP}}/g, new Date().toISOString())
    .replace(/{{FORMAT}}/g, formatArg);

  // Handle #each capabilities
  const capRegex = /{{#each capabilities}}([\s\S]*?){{\/each}}/g;
  const match = capRegex.exec(template);
  
  if (match) {
    const block = match[1];
    let replacement = "";
    
    if (arch.layers.application.capabilities) {
      for (const cap of arch.layers.application.capabilities) {
        let content = block;
        content = content
          .replace(/{{name}}/g, cap.name)
          .replace(/{{slug}}/g, cap.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""))
          .replace(/{{BC_ID}}/g, bcId)
          .replace(/{{FORMAT}}/g, formatArg);
        replacement += content;
      }
    }
    
    template = template.replace(match[0], replacement);
  } else {
    // Clean up block if regex failed or not found (though it should be there)
  }

  await Bun.write(mdOutputPath, template);
  console.log(`Generated documentation at: ${mdOutputPath}`);
}
