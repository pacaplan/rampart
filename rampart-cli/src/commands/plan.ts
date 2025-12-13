import { executePrompt, isInitialized } from "cilantro";
import { parseArchitecture } from "../lib/architecture-parser.ts";
import { buildPrompt } from "../lib/prompt-builder.ts";
import { resolve, dirname, join } from "path";

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
  const outputPath =
    outputIndex !== -1
      ? args[outputIndex + 1]
      : join(dirname(archPath), "plan.md");

  // Validate Cilantro is ready
  if (!(await isInitialized())) {
    throw new Error("Cilantro not initialized. Run 'cilantro init' first.");
  }

  // Parse architecture.json
  const resolvedPath = resolve(archPath);
  const architecture = await parseArchitecture(resolvedPath);

  // Determine working directory (engine root)
  const workingDir = dirname(resolvedPath);

  // Build the prompt
  const prompt = buildPrompt(architecture);

  console.log(`Analyzing ${architecture.name}...`);
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

  // Write output
  const resolvedOutput = resolve(outputPath);
  await Bun.write(resolvedOutput, result.output);

  console.log(`Plan written to: ${resolvedOutput}`);
}
