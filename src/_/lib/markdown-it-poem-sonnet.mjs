/**
 * markdown-it plugin: poem / sonnet blocks delimited by double double-quotes.
 *
 * Syntax (opening "" must start a line; closing "" ends the block, often after text on the same line):
 *
 *   ""First line of octave,
 *   Second line same stanza;
 *
 *   Blank line above starts a new stanza (double break in HTML).
 *
 *   Last line closes with two quotes.""
 *
 * Rules:
 * - Single newlines → <br> within a stanza
 * - One or more blank lines between lines → new stanza → <br><br> between stanzas
 * - Output: <blockquote class="poem-sonnet"><p><em>…</em></p></blockquote>
 * - Body text is HTML-escaped; internal "quotes" like "Much Wool" are fine (only "" closes).
 */

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function poemSonnetsBodyToHtml(body) {
  const normalized = body
    .replace(/\r\n/g, "\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
  const stanzas = normalized.split(/\n(?:[ \t]*\n)+/).filter((s) => s.length > 0);

  const htmlStanzas = stanzas.map((stanza) => {
    const lines = stanza.split("\n").map((line) => escapeHtml(line.trimEnd()));
    return lines.join("<br>\n");
  });

  const inner = htmlStanzas.join("<br><br>\n");
  return `<blockquote class="poem-sonnet"><p><em>${inner}</em></p></blockquote>\n\n`;
}

/** Skip fenced ``` blocks so examples don't get rewritten. */
function transformOutsideCodeFences(src) {
  const chunks = src.split(/(```[\s\S]*?```)/g);
  return chunks
    .map((chunk) => {
      if (chunk.startsWith("```")) {
        return chunk;
      }
      return chunk.replace(/(^|\n)[ \t]*""([\s\S]*?)""/g, (match, lead, body) => {
        return `${lead}${poemSonnetsBodyToHtml(body)}`;
      });
    })
    .join("");
}

export default function markdownItPoemSonnets(md) {
  md.core.ruler.after("normalize", "poem_sonnets", (state) => {
    state.src = transformOutsideCodeFences(state.src);
  });
}
