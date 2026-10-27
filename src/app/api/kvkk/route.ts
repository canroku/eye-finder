import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "1.4.0",
    dataRetention: "local_only",
    rights: ["access", "delete", "export", "rectify"],
    contact: "privacy@eye-finder.local",
    policies: {
      photos: "Yalnızca cihazda işlenir; sunucuya yüklenmez",
      personality: "Anonim skorlama için kullanılır",
      reset: "Ayarlar → Sistemi Tamamen Sıfırla ile tüm veri silinir",
    },
  });
}

export async function DELETE() {
  return NextResponse.json({
    ok: true,
    message: "KVKK silme talebi — istemci tarafında fullSystemReset() çalıştırın",
  });
}
