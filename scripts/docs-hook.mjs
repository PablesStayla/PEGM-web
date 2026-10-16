import { execFileSync } from "node:child_process";
import { runCheck, runSync } from "./docs-sync.mjs";

// Hook pre-commit: regenera bloques docs-sync, stagea los documentos que el
// motor reescribió (a nivel de archivo) y valida referencias. No toca otros archivos.
const root = process.cwd();
const { changed, problems } = runSync({ root, write: true });
if (problems.length > 0) {
  console.error("docs-sync: problemas detectados:");
  for (const problem of problems) console.error(`- ${problem}`);
}
if (changed.length > 0) {
  console.log(`docs-sync: regenerado y añadido al commit: ${changed.join(", ")}`);
  execFileSync("git", ["add", ...changed], { cwd: root, stdio: "inherit" });
}
const checkProblems = runCheck({ root });
for (const problem of checkProblems) console.error(`- ${problem}`);
process.exit(problems.length + checkProblems.length > 0 ? 1 : 0);
