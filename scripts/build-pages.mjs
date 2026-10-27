
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const backupRoot = path.join(root, ".pages-build");
const items = [
  {
    source: path.join(root, "src", "middleware.ts"),
    backup: path.join(backupRoot, "middleware.ts"),
  },
  {
    source: path.join(root, "src", "app", "api"),
    backup: path.join(backupRoot, "api"),
  },
];

const moved = [];

function runBuild() {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(command, ["run", "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "1" },
    shell: process.platform === "win32",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Next.js build failed (exit code ${result.status}).`);
  }
}

function restoreAll() {
  const errors = [];

  for (const item of [...moved].reverse()) {
    try {
      if (fs.existsSync(item.source)) {
        fs.rmSync(item.source, { recursive: true, force: true });
      }

      if (fs.existsSync(item.backup)) {
        fs.mkdirSync(path.dirname(item.source), { recursive: true });
        fs.renameSync(item.backup, item.source);
      }
    } catch (error) {
      errors.push(`${item.source}: ${error.message}`);
    }
  }

  try {
    if (fs.existsSync(backupRoot)) {
      fs.rmSync(backupRoot, { recursive: true, force: true });
    }
  } catch (error) {
    errors.push(`${backupRoot}: ${error.message}`);
  }

  if (errors.length) {
    throw new Error(`Restoration failed:\n${errors.join("\n")}`);
  }
}

try {
  fs.mkdirSync(backupRoot, { recursive: true });

  for (const item of items) {
    if (!fs.existsSync(item.source)) continue;

    fs.mkdirSync(path.dirname(item.backup), { recursive: true });
    fs.cpSync(item.source, item.backup, {
      recursive: true,
      errorOnExist: true,
    });

    moved.push(item);
    fs.rmSync(item.source, { recursive: true, force: true });
  }

  runBuild();

  const outputDir = path.join(root, "out");
  const indexFile = path.join(outputDir, "index.html");

  if (!fs.existsSync(indexFile)) {
    throw new Error("Static build did not generate out/index.html.");
  }

  fs.writeFileSync(path.join(outputDir, ".nojekyll"), "");
  console.log("GitHub Pages static build completed: out/");
} finally {
  restoreAll();
}
