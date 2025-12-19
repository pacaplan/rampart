import { run } from "@mermaid-js/mermaid-cli";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function renderMermaid(
  mermaidCode: string,
  outputPath: string,
  format: "svg" | "png" = "svg"
): Promise<void> {
  const tempFile = join(tmpdir(), `rampart-diagram-${Date.now()}-${Math.random()}.mmd`);
  
  try {
    // Write mermaid code to temp file
    await writeFile(tempFile, mermaidCode);

    // Run mermaid CLI
    // Note: Puppeteer config is passed to ensure it runs in headless mode suitable for CLI
    await run(tempFile, outputPath, {
      outputFormat: format,
      puppeteerConfig: {
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"] // often needed in containers/CI
      },
    });
  } finally {
    // Cleanup temp file
    try {
      await unlink(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

