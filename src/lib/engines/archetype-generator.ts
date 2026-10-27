import type {
  CountryMatrixEntry,
  Gender,
  InterestedIn,
  ProfileArchetype,
  UserProfile,
} from "@/lib/types";

const MALE_NAMES = ["Alex", "Marco", "Lucas", "Diego", "Nikolai", "Emre", "Jan", "Ken"];
const FEMALE_NAMES = ["Sofia", "Maria", "Elena", "Camila", "Anna", "Ayşe", "Lena", "Yuki"];
const NB_NAMES = ["River", "Alex", "Sam", "Noa"];

function targetGenders(interestedIn: InterestedIn): Gender[] {
  switch (interestedIn) {
    case "men":
      return ["male"];
    case "women":
      return ["female"];
    case "both":
      return ["male", "female"];
    case "all":
      return ["male", "female", "non_binary"];
  }
}

function pickNames(gender: Gender, seed: number): string {
  const pool =
    gender === "female" ? FEMALE_NAMES : gender === "male" ? MALE_NAMES : NB_NAMES;
  return pool[seed % pool.length];
}

function externalTraits(country: CountryMatrixEntry, gender: Gender): string[] {
  const traits: string[] = [];
  if (country.weights.tall >= 7) traits.push("Uzun boy tercih edilir");
  if (country.weights.fitness >= 7) traits.push("Fit / sportif görünüm");
  if (country.weights.beard >= 5 && gender === "male") traits.push("Bakımlı sakal veya temiz tıraş");
  if (country.weights.sport_style >= 5) traits.push("Aktif yaşam tarzını yansıtan stil");
  if (country.clusterId === "mediterranean") traits.push("Doğal bronzluk / sıcak tonlar");
  if (country.clusterId === "nordic") traits.push("Minimal ve şık giyim");
  if (country.clusterId === "latin") traits.push("Özgüvenli duruş ve gülümseme");
  if (country.clusterId === "slav") traits.push("Zarif ve sade dış görünüm");
  if (traits.length < 3) traits.push("Temiz ve bakımlı görünüm", "Samimi gülümseme");
  return traits.slice(0, 4);
}

function internalTraits(country: CountryMatrixEntry): string[] {
  const traits: string[] = [];
  if (country.weights.long_relationship >= 8) traits.push("Sadakat ve ciddiyet");
  if (country.weights.education >= 7) traits.push("Entelektüel merak");
  if (country.weights.calm_character >= 7) traits.push("Duygusal denge");
  if (country.weights.travel >= 7) traits.push("Meraklı ve maceracı ruh");
  if (country.weights.social_men >= 7) traits.push("Sosyal zeka ve iletişim");
  if (country.clusterId === "latin") traits.push("Sıcakkanlılık", "Aile değerleri");
  if (country.clusterId === "slav") traits.push("Derin sohbet yeteneği");
  if (traits.length < 3) traits.push("Empati", "Güvenilirlik", "Humor");
  return traits.slice(0, 5);
}

export function generateArchetypes(
  profile: UserProfile,
  country: CountryMatrixEntry,
  affinity: number,
): ProfileArchetype[] {
  const identity = profile.identity ?? {
    gender: "other" as Gender,
    interestedIn: "both" as InterestedIn,
    agePreferenceMin: 22,
    agePreferenceMax: 35,
    bio: "",
  };
  const genders = targetGenders(identity.interestedIn);
  const { agePreferenceMin, agePreferenceMax } = identity;

  return genders.slice(0, 3).map((gender, i) => {
    const name = pickNames(gender, country.code.charCodeAt(0) + i);
    const ext = externalTraits(country, gender);
    const int = internalTraits(country);
    const matchScore = clamp(affinity - i * 4 + (i === 0 ? 5 : 0));

    return {
      id: `${country.code}-${gender}-${i}`,
      label: name,
      gender,
      ageRange: `${agePreferenceMin}–${agePreferenceMax}`,
      matchScore,
      externalBeauty: {
        summary:
          gender === "female"
            ? "Bu profilde dış güzellik: doğal çekicilik ve özgüvenli duruş ön planda."
            : gender === "male"
              ? "Bu profilde dış güzellik: bakımlılık ve sportif duruş ön planda."
              : "Bu profilde dış güzellik: özgün stil ve samimi ifade ön planda.",
        traits: ext,
      },
      internalBeauty: {
        summary: `${country.name} kültüründe değer gören kişilik özellikleri:`,
        traits: int,
      },
    };
  });
}

function clamp(v: number): number {
  return Math.min(99, Math.max(55, Math.round(v)));
}

export function genderLabel(g: Gender): string {
  const map: Record<Gender, string> = {
    male: "Erkek",
    female: "Kadın",
    non_binary: "Non-binary",
    other: "Diğer",
  };
  return map[g];
}

export function interestedInLabel(i: InterestedIn): string {
  const map: Record<InterestedIn, string> = {
    men: "Erkekler",
    women: "Kadınlar",
    both: "Kadın & Erkek",
    all: "Herkes",
  };
  return map[i];
}
