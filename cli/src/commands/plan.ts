import { executePrompt, isInitialized } from "cilantro";
import { buildArchitectureContext } from "../lib/architecture-parser.ts";
import { buildPrompt } from "../lib/prompt-builder.ts";
import { resolve, dirname, join, basename } from "path";

interface PlanOptions {
  output?: string;
}

export async function plan(args: string[]) {
  // Parse arguments
  const archPath = args.find((a) => !a.startsWith("-"));
  if (!archPath) {
    throw new Error("Usage: rampart plan <architecture.json>");
  }

  const outputIndex = args.findIndex((a) => a === "--output" || a === "-o");
  
  // Validate Cilantro is ready
  if (!(await isInitialized())) {
    throw new Error("Cilantro not initialized. Run 'cilantro init' first.");
  }

  // Parse architecture.json and build context
  const resolvedPath = resolve(archPath);
  const ctx = await buildArchitectureContext(resolvedPath);

  // Determine output path
  // Default: docs/plans/{bc_id}_plan.md (in project root)
  const outputPath =
    outputIndex !== -1
      ? args[outputIndex + 1]
      : join(ctx.projectRoot, "docs", "plans", `${ctx.bcId}_plan.md`);

  // Determine working directory based on mode
  const workingDir = ctx.engineExists ? ctx.enginePath : ctx.projectRoot;

  // Build the prompt with full context
  const prompt = buildPrompt(ctx);

  console.log(`Analyzing ${ctx.architecture.name}...`);
  console.log(`Mode: ${ctx.engineExists ? "Incremental" : "Greenfield"}`);
  console.log(`Engine path: ${ctx.enginePath}`);
  console.log(`Engine exists: ${ctx.engineExists}`);
  console.log(`Working directory: ${workingDir}`);

  // Execute via Cilantro
  const result = await executePrompt({
    prompt,
    workingDirectory: workingDir,
    timeout: 300000, // 5 minutes
  });

  if (!result.success) {
    throw new Error(`AI analysis failed: ${result.error}`);
  }

  // Ensure output directory exists
  const outputDir = dirname(outputPath);
  await Bun.write(join(outputDir, ".keep"), ""); // Touch file to create dir

  // Write output
  const resolvedOutput = resolve(outputPath);
  await Bun.write(resolvedOutput, result.output);

  console.log(`Plan written to: ${resolvedOutput}`);
}
