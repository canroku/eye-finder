import type { PhotoUpload, PhotoAnalysis } from "@/lib/types";
import { aggregateFaceScores, computePhotoAnalysisDepth } from "@/lib/engines/face-scan";

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  if (!dataUrl) throw new Error("Boş fotoğraf");
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error("Fotoğraf zaman aşımı")), 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Fotoğraf okunamadı"));
    };
    img.src = dataUrl;
  });
}

function analyzeCanvas(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const size = 200;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { light: 50, sharpness: 50, composition: 50, contrast: 50 };

  const scale = Math.min(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

  const { data } = ctx.getImageData(0, 0, size, size);
  let totalLum = 0;
  let lumSq = 0;
  const lumMap: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    totalLum += lum;
    lumSq += lum * lum;
    lumMap.push(lum);
  }

  const count = lumMap.length;
  const meanLum = totalLum / count;
  const contrast = Math.sqrt(Math.max(0, lumSq / count - meanLum * meanLum));

  let edgeSum = 0;
  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      const idx = row * size + col;
      edgeSum +=
        Math.abs(lumMap[idx + 1] - lumMap[idx - 1]) +
        Math.abs(lumMap[idx + size] - lumMap[idx - size]);
    }
  }
  const sharpness = edgeSum / ((size - 2) * (size - 2) * 2);

  return { light: meanLum, sharpness, composition: meanLum, contrast };
}

function normalize(value: number, min: number, max: number): number {
  return Math.round(Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)));
}

function metricsFromFaceScan(scan: NonNullable<PhotoUpload["faceScan"]>) {
  return {
    lightScore: scan.faceLighting,
    sharpnessScore: scan.scanQuality,
    compositionScore: scan.facePoseScore,
    contrastScore: scan.skinToneBalance,
  };
}

export async function analyzeAllPhotos(photos: PhotoUpload[]): Promise<PhotoAnalysis> {
  const perPhotoFace = photos
    .map((p) => p.faceScan)
    .filter((s): s is NonNullable<PhotoUpload["faceScan"]> => !!s && s.faceDetected);

  const faceAgg =
    perPhotoFace.length > 0
      ? aggregateFaceScores(perPhotoFace, photos.length)
      : {
          faceScanScore: 0,
          photosWithFace: 0,
          averageSymmetry: 0,
          averageSmile: 0,
          averageEyeOpenness: 0,
          averagePoseScore: 0,
          consistencyScore: 0,
          analysisDepth: computePhotoAnalysisDepth(photos.length, 0),
          photoCountBonus: 0,
        };

  const techResults = await Promise.all(
    photos.map(async (photo) => {
      if (photo.faceScan?.faceDetected) {
        return metricsFromFaceScan(photo.faceScan);
      }
      if (!photo.dataUrl) {
        return { lightScore: 0, sharpnessScore: 0, compositionScore: 0, contrastScore: 0 };
      }
      try {
        const img = await loadImage(photo.dataUrl);
        const m = analyzeCanvas(img);
        return {
          lightScore: normalize(m.light, 40, 200),
          sharpnessScore: normalize(m.sharpness, 2, 30),
          compositionScore: normalize(m.composition, 80, 180),
          contrastScore: normalize(m.contrast, 15, 70),
        };
      } catch {
        return { lightScore: 0, sharpnessScore: 0, compositionScore: 0, contrastScore: 0 };
      }
    }),
  );

  const avg = (key: keyof (typeof techResults)[0]) =>
    Math.round(techResults.reduce((s, r) => s + r[key], 0) / Math.max(techResults.length, 1));

  const lightScore = avg("lightScore");
  const sharpnessScore = avg("sharpnessScore");
  const compositionScore = avg("compositionScore");
  const contrastScore = avg("contrastScore");

  const technicalScore = Math.round(
    lightScore * 0.25 + sharpnessScore * 0.25 + compositionScore * 0.3 + contrastScore * 0.2,
  );

  const depthWeight = faceAgg.analysisDepth / 100;
  const photoProfileScore =
    faceAgg.photosWithFace > 0
      ? Math.round(
          technicalScore * (0.2 + 0.1 * (1 - depthWeight)) +
            faceAgg.faceScanScore * (0.55 + 0.15 * depthWeight) +
            faceAgg.consistencyScore * 0.1 * depthWeight,
        )
      : Math.round(technicalScore * 0.5);

  return {
    lightScore,
    sharpnessScore,
    compositionScore,
    contrastScore,
    styleTags: [...new Set(photos.map((p) => p.styleTag))],
    contextTags: [...new Set(photos.map((p) => p.contextTag))],
    photoProfileScore: Math.min(100, photoProfileScore),
    faceScanScore: faceAgg.faceScanScore,
    photosWithFace: faceAgg.photosWithFace,
    averageSymmetry: faceAgg.averageSymmetry,
    averageSmile: faceAgg.averageSmile,
    averageEyeOpenness: faceAgg.averageEyeOpenness,
    averagePoseScore: faceAgg.averagePoseScore,
    consistencyScore: faceAgg.consistencyScore,
    totalPhotos: photos.length,
    analysisDepth: faceAgg.analysisDepth,
    photoCountBonus: faceAgg.photoCountBonus,
    perPhotoFace: perPhotoFace,
  };
}

export function computePhotoScore(analysis: PhotoAnalysis | null): number | null {
  if (!analysis) return null;
  if (analysis.photosWithFace === 0) return null;
  return analysis.photoProfileScore;
}
