import fs from "fs";
import yaml from "js-yaml";

/**
 * Project image front matter uses either:
 * - Legacy: tags string or array of strings (unchanged behavior)
 * - Map: object { "project-slug": "Display Title", ... } or YAML list of one-key objects
 *   → one output page per entry; body between <!-- {slug} start --> and <!-- {slug} end -->.
 */
export function parseProjectTagEntries(tags) {
  if (tags == null) return null;
  if (typeof tags === "string") return null;
  if (Array.isArray(tags)) {
    if (tags.length === 0) return null;
    if (tags.every((t) => typeof t === "string")) return null;
    const out = [];
    for (const item of tags) {
      if (item != null && typeof item === "object" && !Array.isArray(item)) {
        for (const [k, v] of Object.entries(item)) {
          out.push({ projectSlug: k, pageTitle: String(v).trim() });
        }
      }
    }
    return out.length ? out : null;
  }
  if (typeof tags === "object") {
    const entries = Object.entries(tags).map(([k, v]) => ({
      projectSlug: k,
      pageTitle: String(v).trim(),
    }));
    return entries.length ? entries : null;
  }
  return null;
}

export function readMarkdownBody(inputPath) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return m ? m[2] : raw;
}

export function sliceProjectRegion(body, projectSlug) {
  const start = `<!-- ${projectSlug} start -->`;
  const end = `<!-- ${projectSlug} end -->`;
  const i = body.indexOf(start);
  const j = body.indexOf(end);
  if (i === -1 || j === -1 || j <= i) return null;
  return body.slice(i + start.length, j).trim();
}

export function buildProjectTagVariants(tags, body) {
  const entries = parseProjectTagEntries(tags);
  if (!entries) return [];
  return entries.map(({ projectSlug, pageTitle }) => {
    let markdown = sliceProjectRegion(body, projectSlug);
    if (markdown == null || markdown === "") {
      markdown = body.trim();
    }
    return { projectSlug, pageTitle, markdown };
  });
}

/** For *.11tydata.js: load tags + body from sibling .md (pagination runs before computed data). */
export function loadProjectTagVariantsFromFile(mdPath) {
  const raw = fs.readFileSync(mdPath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return [];
  const fm = yaml.load(m[1]) || {};
  const body = m[2];
  return buildProjectTagVariants(fm.tags, body);
}
