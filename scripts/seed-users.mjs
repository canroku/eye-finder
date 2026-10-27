import { promises as fs } from "fs";
import path from "path";
import { randomBytes, scryptSync } from "crypto";

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");
const PASSWORD = process.env.SEED_PASSWORD;

if (!PASSWORD || PASSWORD.length < 8) {
  console.error("SEED_PASSWORD ortam değişkeni (en az 8 karakter) ayarlanmadan çalıştırılamaz.");
  process.exit(1);
}

const SEED_ACCOUNTS = [
  {
    email: "admin@eyefinder.local",
    tier: "pro",
    role: "admin",
    tierExpiresAt: null,
  },
  {
    email: "uye.free@eyefinder.local",
    tier: "free",
    role: "user",
    tierExpiresAt: null,
  },
  {
    email: "uye.plus@eyefinder.local",
    tier: "plus",
    role: "user",
    tierExpiresAt: "2099-12-31T00:00:00.000Z",
  },
  {
    email: "uye.pro@eyefinder.local",
    tier: "pro",
    role: "user",
    tierExpiresAt: "2099-12-31T00:00:00.000Z",
  },
];

function hashPassword(password, salt) {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return { hash, salt: s };
}

function newUserId() {
  return `usr_${randomBytes(12).toString("hex")}`;
}

await fs.mkdir(dataDir, { recursive: true });

let users = [];
try {
  users = JSON.parse(await fs.readFile(usersFile, "utf8"));
} catch {
  users = [];
}

for (const account of SEED_ACCOUNTS) {
  const email = account.email.toLowerCase();
  const { hash, salt } = hashPassword(PASSWORD);
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === email);

  const record = {
    id: existingIdx >= 0 ? users[existingIdx].id : newUserId(),
    email,
    passwordHash: hash,
    salt,
    tier: account.tier,
    tierExpiresAt: account.tierExpiresAt,
    role: account.role,
    createdAt: existingIdx >= 0 ? users[existingIdx].createdAt : new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    users[existingIdx] = record;
    console.log(`↻ güncellendi: ${email} (${account.role}, ${account.tier})`);
  } else {
    users.push(record);
    console.log(`✓ oluşturuldu: ${email} (${account.role}, ${account.tier})`);
  }
}

await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");

console.log("");
console.log("Demo hesaplar (şifre hepsi için aynı):");
console.log("  Şifre: SEED_PASSWORD ortam değişkeninde tanımlı değer");
console.log("");
for (const account of SEED_ACCOUNTS) {
  const label =
    account.role === "admin"
      ? "Admin — tüm özellikler"
      : account.tier === "free"
        ? "Free üye"
        : account.tier === "plus"
          ? "Plus üye"
          : "Pro üye";
  console.log(`  ${account.email}  →  ${label}`);
}
