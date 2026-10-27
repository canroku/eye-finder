import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const FILES = [
  "signals.json",
  "analytics.json",
  "feedback.json",
  "waitlist.json",
  "country-feedback.json",
];

await fs.mkdir(dataDir, { recursive: true });
for (const file of FILES) {
  await fs.writeFile(path.join(dataDir, file), "[]\n");
  console.log(`✓ data/${file} sıfırlandı`);
}
console.log("Sunucu verileri temiz — tarayıcı için Ayarlar → Sistemi Tamamen Sıfırla");
