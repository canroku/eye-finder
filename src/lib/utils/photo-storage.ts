"use client";

import type { PhotoUpload, UserProfile } from "@/lib/types";

const MAX_DIMENSION = 960;
const JPEG_QUALITY = 0.82;

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error("Fotoğraf zaman aşımı")), 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Fotoğraf yüklenemedi"));
    };
    img.src = dataUrl;
  });
}

export async function compressPhotoDataUrl(dataUrl: string): Promise<string> {
  if (typeof document === "undefined" || !dataUrl) return dataUrl;

  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height, 1));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return dataUrl;
  }
}

export async function compressPhotos(photos: PhotoUpload[]): Promise<PhotoUpload[]> {
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      dataUrl: photo.dataUrl ? await compressPhotoDataUrl(photo.dataUrl) : "",
    })),
  );
}

export async function prepareProfileForPipeline(profile: UserProfile): Promise<UserProfile> {
  if (!profile.photos?.length) return profile;
  return {
    ...profile,
    photos: await compressPhotos(profile.photos),
  };
}
