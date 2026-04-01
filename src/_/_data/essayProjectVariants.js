import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadProjectTagVariantsFromFile } from "../lib/projectTagVariants.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Multi-project essays (map-style `tags` + `<!-- slug start/end -->` regions).
 *
 * - `pages`: flat list for pagination; filtered per file in the
 *   `multiproject-essay-pagination` preprocessor (`eleventy.config.js`).
 *   Each row has `sourceStem` (e.g. `essays/church-rock`) matching
 *   `page.filePathStem` (leading `/` stripped).
 * - `byInputStem`: map keyed by that stem (optional tooling).
 *
 * Enable with `multiproject: true` in front matter on `src/essays/<name>.md` (flat).
 */
function walkEssayMarkdownFiles(essaysDir, relFromInput, out) {
  if (!fs.existsSync(essaysDir)) return;
  for (const ent of fs.readdirSync(essaysDir, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const full = path.join(essaysDir, ent.name);
    if (ent.isDirectory()) {
      walkEssayMarkdownFiles(full, path.join(relFromInput, ent.name), out);
    } else if (ent.name.endsWith(".md")) {
      const stem = ent.name.slice(0, -".md".length);
      const sourceStem = path.join(relFromInput, stem).replace(/\\/g, "/");
      out.push({ full, sourceStem });
    }
  }
}

function buildEssayVariantData() {
  const inputDir = path.join(__dirname, "../..");
  const essaysDir = path.join(inputDir, "essays");
  const files = [];
  walkEssayMarkdownFiles(essaysDir, "essays", files);

  const byStem = Object.create(null);
  const essayVariantPages = [];

  for (const { full, sourceStem } of files) {
    const variants = loadProjectTagVariantsFromFile(full);
    if (variants.length === 0) continue;
    byStem[sourceStem] = variants;
    for (const v of variants) {
      essayVariantPages.push({ sourceStem, ...v });
    }
  }

  return {
    /** keyed by path like `essays/multi/foo` (for debugging / tooling) */
    byInputStem: byStem,
    /** flat list; pagination `data: essayProjectVariants.pages` + `before` filter */
    pages: essayVariantPages,
  };
}

export default buildEssayVariantData();
