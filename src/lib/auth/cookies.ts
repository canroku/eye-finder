export function sessionCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    // APK (https://localhost) API sunucusuna site dışı istek atar; çerez için None gerekir.
    sameSite: (secure ? "none" : "lax") as "none" | "lax",
    path: "/",
    maxAge,
    secure,
  };
}
