#!/usr/bin/env node
/**
 * Statik Next.js export + Capacitor Android senkronizasyonu.
 * Middleware ve API route'ları static export ile uyumsuz — geçici olarak devre dışı bırakılır.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const middlewarePath = path.join(root, "src", "middleware.ts");
const middlewareBackup = path.join(root, ".mobile-build", "middleware.ts.bak");
const apiPath = path.join(root, "src", "app", "api");
const apiBackup = path.join(root, ".mobile-build", "api");

function run(cmd, env = {}) {
  execSync(cmd, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

function stash(from, to, label) {
  if (!fs.existsSync(from)) return false;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true });
  if (fs.statSync(from).isDirectory()) {
    fs.cpSync(from, to, { recursive: true });
    fs.rmSync(from, { recursive: true, force: true });
  } else {
    fs.copyFileSync(from, to);
    fs.rmSync(from, { force: true });
  }
  console.log(`→ ${label} geçici olarak devre dışı (static export)`);
  return true;
}

function unstash(from, to, label) {
  if (!fs.existsSync(from)) return;
  if (fs.existsSync(to)) {
    if (fs.statSync(to).isDirectory()) fs.rmSync(to, { recursive: true, force: true });
    else fs.rmSync(to, { force: true });
  }
  if (fs.statSync(from).isDirectory()) {
    fs.cpSync(from, to, { recursive: true });
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
  fs.rmSync(from, { recursive: true, force: true });
  console.log(`→ ${label} geri yüklendi`);
}

stash(middlewarePath, middlewareBackup, "middleware");
stash(apiPath, apiBackup, "API route'ları");

try {
  const nextDir = path.join(root, ".next");
  if (fs.existsSync(nextDir)) fs.rmSync(nextDir, { recursive: true, force: true });

  console.log("→ Next.js mobil build (static export)…");
  run("npm run build", { MOBILE_BUILD: "1" });

  if (!fs.existsSync(path.join(root, "out", "index.html"))) {
    throw new Error("out/index.html bulunamadı — static export başarısız.");
  }

  console.log("→ Capacitor sync android…");
  run("npx cap sync android");

  console.log("\n✓ Mobil web asset'leri hazır. APK için:");
  console.log("  npm run android:apk");
  console.log("  veya Android Studio ile android/ klasörünü açın.\n");
} finally {
  unstash(middlewareBackup, middlewarePath, "middleware");
  unstash(apiBackup, apiPath, "API route'ları");
}
