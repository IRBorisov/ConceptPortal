import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const workspaceRoot = path.resolve(import.meta.dirname, "../..");
const testFile = process.argv[2];

const vitestPackages = [
  "rsconcept/frontend",
  "rsconcept/domain",
  "rsconcept/rstool",
  "rsconcept/rstool-mcp",
].map((relativePath) => {
  const root = path.join(workspaceRoot, relativePath);

  return {
    root,
    vitestBin: path.join(root, "node_modules/vitest/vitest.mjs"),
  };
});

function normalizePath(filePath) {
  return path.resolve(filePath).toLowerCase();
}

function findPackageForFile(filePath) {
  const normalizedFile = normalizePath(filePath);

  return vitestPackages.find(({ root }) => {
    const normalizedRoot = normalizePath(root);
    return (
      normalizedFile === normalizedRoot ||
      normalizedFile.startsWith(`${normalizedRoot}${path.sep}`)
    );
  });
}

if (!testFile) {
  console.error("Usage: node scripts/dev/DebugVitestFile.mjs <test-file>");
  process.exit(1);
}

const selectedPackage = findPackageForFile(testFile);

if (!selectedPackage) {
  console.error(`No Vitest package found for file: ${testFile}`);
  process.exit(1);
}

if (!existsSync(selectedPackage.vitestBin)) {
  console.error(`Vitest is not installed at: ${selectedPackage.vitestBin}`);
  process.exit(1);
}

process.chdir(selectedPackage.root);
process.argv = [process.execPath, selectedPackage.vitestBin, "run", testFile];

await import(pathToFileURL(selectedPackage.vitestBin).href);
