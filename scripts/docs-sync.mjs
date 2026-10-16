import { readFileSync, writeFileSync } from "node:fs";

// Bloques de documentación viva: contenido generado entre marcadores.
// Formato: <!-- BEGIN:docs-sync:<bloque> --> … <!-- END:docs-sync:<bloque> -->

export const beginMarker = (name) => `<!-- BEGIN:docs-sync:${name} -->`;
export const endMarker = (name) => `<!-- END:docs-sync:${name} -->`;

const countOccurrences = (text, needle) => text.split(needle).length - 1;

export function replaceBlock(text, name, content) {
  const begin = beginMarker(name);
  const end = endMarker(name);
  const begins = countOccurrences(text, begin);
  const ends = countOccurrences(text, end);
  if (begins === 0 || ends === 0) {
    throw new Error(`falta el bloque "${name}" (BEGIN=${begins}, END=${ends})`);
  }
  if (begins > 1 || ends > 1) {
    throw new Error(`bloque "${name}" duplicado (BEGIN=${begins}, END=${ends})`);
  }
  const from = text.indexOf(begin);
  const to = text.indexOf(end) + end.length;
  const body = content.length > 0 ? `\n${content}\n` : "\n";
  return text.slice(0, from) + begin + body + end + text.slice(to);
}

export function syncFile({ filePath, blocks, write }) {
  const problems = [];
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (error) {
    return { changed: false, problems: [`${filePath}: no se pudo leer (${error.message})`] };
  }
  let next = text;
  for (const { name, content } of blocks) {
    try {
      next = replaceBlock(next, name, content);
    } catch (error) {
      problems.push(`${filePath} [${name}]: ${error.message}`);
    }
  }
  const changed = next !== text;
  if (changed && write) writeFileSync(filePath, next, "utf8");
  return { changed, problems };
}
