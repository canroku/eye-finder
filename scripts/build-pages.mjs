#!/usr/bin/env node
/**
 * GitHub Pages statik build'i (https://canroku.github.io/eye-finder/).
 * Middleware ve API route'ları static export ile uyumsuz — build süresince geçici olarak devre dışı bırakılır.
 * Orijinal dosyalar kalıcı olarak silinmez: önce yedeklenir, build bitince (başarılı ya da hatalı) geri yüklenir.
 * Mobil build (build-android.mjs) ve normal `npm run build` bu betiğden etkilenmez.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const backupRoot = path.join(root, ".pages-build");
const targets = [
  { from: path.join(root, "src", "middleware.ts"), to: path.join(backupRoot, "middleware.ts.bak"), label: "middleware" },
  { from: path.join(root, "src", "app", "api"), to: path.join(backupRoot, "api"), label: "API route'ları" },
];

// Yedeklenip orijinali kaldırılmış öğeler. Geri yükleme yalnızca bunlar için yapılır.
const moved = [];

function run(cmd, env = {}) {
  execSync(cmd, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

function copyItem(from, to) {
  if (fs.statSync(from).isDirectory()) {
    fs.cpSync(from, to, { recursive: true });
  } else {
    fs.copyFileSync(from, to);
  }
}

function stash({ from, to, label }) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.rmSync(to, { recursive: true, force: true });
  // Kopya tamamlanmadan orijinale dokunulmaz; kopya hatası orijinali bozmaz.
  copyItem(from, to);
  moved.push({ from, to, label });
  fs.rmSync(from, { recursive: true, force: true });
  console.log(`→ ${label} geçici olarak devre dışı (GitHub Pages static export)`);
}

function restore({ from, to, label }) {
  // `from` (orijinal yol) kaldırılmış olmalı; yedekten geri kopyalanır, yedek silinir.
  fs.rmSync(from, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(from), { recursive: true });
  copyItem(to, from);
  fs.rmSync(to, { recursive: true, force: true });
  console.log(`→ ${label} geri yüklendi`);
}

function restoreAll() {
  // Ters sırada geri yükle; her öğe ayrı try ile korunur ki biri diğerini engellemesin.
  const errors = [];
  for (const item of moved.reverse()) {
    try {
      restore(item);
    } catch (err) {
      errors.push(`${item.label}: ${err.message} (yedek: ${item.to})`);
    }
  }
  moved.length = 0;
  if (errors.length > 0) {
    throw new Error(`Geri yükleme başarısız:\n${errors.join("\n")}`);
  }
  fs.rmSync(backupRoot, { recursive: true, force: true });
}

try {
  for (const target of targets) stash(target);

  const nextDir = path.join(root, ".next");
  if (fs.existsSync(nextDir)) fs.rmSync(nextDir, { recursive: true, force: true });
  const outDir = path.join(root, "out");
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });

  console.log("→ Next.js GitHub Pages build (static export, basePath /eye-finder)…");
  run("npm run build", { GITHUB_PAGES: "1" });

  if (!fs.existsSync(path.join(root, "out", "index.html"))) {
    throw new Error("out/index.html bulunamadı — static export başarısız.");
  }

  // GitHub Pages Jekyll çalıştırmasın; _next/ klasörü gizli sayılmasın.
  fs.writeFileSync(path.join(root, "out", ".nojekyll"), "");

  console.log("\n✓ GitHub Pages çıktısı hazır: out/");
} finally {
  restoreAll();
}
