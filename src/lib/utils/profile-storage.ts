import type { PhotoUpload, UserProfile } from "@/lib/types";

/** IndexedDB'ye kayıt — fotoğraf binary'si hariç (yüz analizi metadatası kalır) */
export function stripPhotosForStorage(profile: UserProfile): UserProfile {
  if (!profile.photos?.length) return profile;
  return {
    ...profile,
    photos: profile.photos.map(({ dataUrl: _, ...photo }) => ({
      ...photo,
      dataUrl: "",
    })),
  };
}

export function stripDraftForStorage(profile: Partial<UserProfile>): Partial<UserProfile> {
  if (!profile.photos?.length) return profile;
  return {
    ...profile,
    photos: profile.photos.map(({ dataUrl: _, ...photo }) => ({
      ...photo,
      dataUrl: "",
    })),
  };
}

export function stripLegacyJsonPhotos(json: string): UserProfile | null {
  try {
    const parsed = JSON.parse(json) as UserProfile;
    return stripPhotosForStorage(parsed);
  } catch {
    return null;
  }
}
