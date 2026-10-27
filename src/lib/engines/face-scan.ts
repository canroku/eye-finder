"use client";

import type { FaceScanResult } from "@/lib/types";
import {
  PHOTO_DEPTH_PER_FACE,
  PHOTO_DEPTH_PER_UPLOAD,
  PHOTO_SCORE_BONUS_CAP,
  PHOTO_SCORE_BONUS_PER_FACE,
} from "@/lib/data/form-options";

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const faceapi = await import("@vladmandic/face-api");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.round(Math.min(max, Math.max(min, v)));
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function computeSymmetry(landmarks: { x: number; y: number }[]): number {
  const pairs: [number, number][] = [
    [0, 16],
    [1, 15],
    [2, 14],
    [3, 13],
    [4, 12],
    [5, 11],
    [6, 10],
    [7, 9],
    [17, 26],
    [18, 25],
    [19, 24],
    [20, 23],
    [21, 22],
    [36, 45],
    [37, 44],
    [38, 43],
    [39, 42],
    [40, 47],
    [41, 46],
    [48, 54],
    [49, 53],
    [50, 52],
  ];
  const nose = landmarks[30];
  if (!nose) return 50;

  let total = 0;
  let count = 0;
  for (const [l, r] of pairs) {
    const left = landmarks[l];
    const right = landmarks[r];
    if (!left || !right) continue;
    const leftDist = Math.abs(left.x - nose.x);
    const rightDist = Math.abs(right.x - nose.x);
    const yDiff = Math.abs(left.y - right.y);
    const xRatio = Math.min(leftDist, rightDist) / Math.max(leftDist, rightDist, 1);
    total += xRatio * 100 - yDiff * 0.35;
    count++;
  }
  return clamp(count ? total / count : 50);
}

function computeJawSymmetry(landmarks: { x: number; y: number }[]): number {
  const nose = landmarks[30];
  const chin = landmarks[8];
  if (!nose || !chin) return 50;

  let total = 0;
  let count = 0;
  for (let i = 1; i <= 7; i++) {
    const left = landmarks[i];
    const right = landmarks[16 - i];
    if (!left || !right) continue;
    const leftDist = dist(left, nose);
    const rightDist = dist(right, nose);
    total += (Math.min(leftDist, rightDist) / Math.max(leftDist, rightDist, 1)) * 100;
    count++;
  }
  const chinOffset = Math.abs(chin.x - nose.x);
  const faceWidth = dist(landmarks[0] ?? chin, landmarks[16] ?? chin) || 1;
  const chinScore = clamp(100 - (chinOffset / faceWidth) * 200);
  return clamp(count ? (total / count) * 0.7 + chinScore * 0.3 : 50);
}

function computeEyeOpenness(landmarks: { x: number; y: number }[]): number {
  const leftW = dist(landmarks[36] ?? landmarks[39], landmarks[39] ?? landmarks[36]) || 1;
  const leftH =
    (dist(landmarks[37] ?? landmarks[41], landmarks[41] ?? landmarks[37]) +
      dist(landmarks[38] ?? landmarks[40], landmarks[40] ?? landmarks[38])) /
    2;
  const rightW = dist(landmarks[42] ?? landmarks[45], landmarks[45] ?? landmarks[42]) || 1;
  const rightH =
    (dist(landmarks[43] ?? landmarks[47], landmarks[47] ?? landmarks[43]) +
      dist(landmarks[44] ?? landmarks[46], landmarks[46] ?? landmarks[44])) /
    2;
  const leftOpen = (leftH / leftW) * 100;
  const rightOpen = (rightH / rightW) * 100;
  return clamp((leftOpen + rightOpen) / 2 * 2.2);
}

function computeFacePose(landmarks: { x: number; y: number }[]): number {
  const leftEye = landmarks[36];
  const rightEye = landmarks[45];
  const nose = landmarks[30];
  if (!leftEye || !rightEye || !nose) return 50;

  const eyeAngle = Math.abs(Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x));
  const angleDeg = (eyeAngle * 180) / Math.PI;
  const tiltScore = clamp(100 - angleDeg * 8);

  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const noseOffset = Math.abs(nose.x - eyeMidX);
  const eyeSpan = dist(leftEye, rightEye) || 1;
  const centerScore = clamp(100 - (noseOffset / eyeSpan) * 120);

  return clamp(tiltScore * 0.55 + centerScore * 0.45);
}

function computeGoldenRatio(box: { width: number; height: number }): number {
  const ratio = box.height / Math.max(box.width, 1);
  const ideal = 1.35;
  const diff = Math.abs(ratio - ideal);
  return clamp(100 - diff * 80);
}

function analyzeSkinToneBalance(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[],
): number {
  const sample = (idx: number) => {
    const p = landmarks[idx];
    if (!p) return null;
    const x = clamp(Math.floor(p.x), 0, ctx.canvas.width - 1);
    const y = clamp(Math.floor(p.y), 0, ctx.canvas.height - 1);
    const d = ctx.getImageData(x, y, 1, 1).data;
    return 0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2];
  };
  const left = sample(1);
  const right = sample(15);
  if (left === null || right === null) return 50;
  const diff = Math.abs(left - right);
  return clamp(100 - diff * 1.2);
}

function analyzeFaceRegionLighting(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; width: number; height: number },
): number {
  const x = Math.max(0, Math.floor(box.x));
  const y = Math.max(0, Math.floor(box.y));
  const w = Math.min(Math.floor(box.width), ctx.canvas.width - x);
  const h = Math.min(Math.floor(box.height), ctx.canvas.height - y);
  if (w <= 0 || h <= 0) return 50;

  const data = ctx.getImageData(x, y, w, h).data;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    count++;
  }
  const avg = sum / count;
  if (avg >= 90 && avg <= 180) return 95;
  if (avg >= 70 && avg <= 200) return 80;
  if (avg >= 50 && avg <= 220) return 60;
  return 35;
}

function dominantExpression(expressions: FaceScanResult["expressions"]): string {
  const entries = Object.entries(expressions) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? "neutral";
}

function emptyResult(): FaceScanResult {
  return {
    faceDetected: false,
    confidence: 0,
    symmetryScore: 0,
    faceLighting: 0,
    smileScore: 0,
    faceSizeRatio: 0,
    expressionPositivity: 0,
    faceScanScore: 0,
    landmarksDetected: 0,
    eyeOpenness: 0,
    facePoseScore: 0,
    jawSymmetry: 0,
    goldenRatioScore: 0,
    skinToneBalance: 0,
    scanQuality: 0,
    dominantExpression: "neutral",
    expressions: {
      happy: 0,
      neutral: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      fearful: 0,
      disgusted: 0,
    },
  };
}

export async function scanFaceFromDataUrl(dataUrl: string): Promise<FaceScanResult> {
  await loadFaceModels();
  const faceapi = await import("@vladmandic/face-api");

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return emptyResult();
  ctx.drawImage(img, 0, 0);

  const detections = await faceapi
    .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.35 }))
    .withFaceLandmarks()
    .withFaceExpressions();

  if (detections.length === 0) return emptyResult();

  const primary = detections.reduce((best, d) => {
    const area = d.detection.box.width * d.detection.box.height;
    const bestArea = best.detection.box.width * best.detection.box.height;
    return area > bestArea ? d : best;
  });

  const box = primary.detection.box;
  const confidence = primary.detection.score;
  const landmarks = primary.landmarks.positions.map((p) => ({ x: p.x, y: p.y }));

  const symmetryScore = computeSymmetry(landmarks);
  const jawSymmetry = computeJawSymmetry(landmarks);
  const eyeOpenness = computeEyeOpenness(landmarks);
  const facePoseScore = computeFacePose(landmarks);
  const goldenRatioScore = computeGoldenRatio(box);
  const faceLighting = analyzeFaceRegionLighting(ctx, box);
  const skinToneBalance = analyzeSkinToneBalance(ctx, landmarks);

  const expr = primary.expressions;
  const expressions = {
    happy: clamp(expr.happy * 100),
    neutral: clamp(expr.neutral * 100),
    sad: clamp(expr.sad * 100),
    angry: clamp(expr.angry * 100),
    surprised: clamp(expr.surprised * 100),
    fearful: clamp(expr.fearful * 100),
    disgusted: clamp(expr.disgusted * 100),
  };

  const smileScore = expressions.happy;
  const expressionPositivity = clamp(
    expressions.happy * 0.45 +
      expressions.neutral * 0.25 +
      expressions.surprised * 0.1 -
      expressions.sad * 0.35 -
      expressions.angry * 0.35 -
      expressions.fearful * 0.2,
  );

  const imageArea = canvas.width * canvas.height;
  const faceArea = box.width * box.height;
  const faceSizeRatio = clamp((faceArea / imageArea) * 800, 0, 100);

  const scanQuality = clamp(
    confidence * 25 +
      symmetryScore * 0.15 +
      facePoseScore * 0.2 +
      faceLighting * 0.2 +
      (landmarks.length / 68) * 20,
  );

  const faceScanScore = clamp(
    scanQuality * 0.35 +
      symmetryScore * 0.15 +
      jawSymmetry * 0.1 +
      eyeOpenness * 0.08 +
      facePoseScore * 0.12 +
      goldenRatioScore * 0.05 +
      skinToneBalance * 0.05 +
      expressionPositivity * 0.1,
  );

  return {
    faceDetected: true,
    confidence: clamp(confidence * 100),
    symmetryScore,
    faceLighting,
    smileScore,
    faceSizeRatio,
    expressionPositivity,
    faceScanScore,
    landmarksDetected: landmarks.length,
    eyeOpenness,
    facePoseScore,
    jawSymmetry,
    goldenRatioScore,
    skinToneBalance,
    scanQuality,
    dominantExpression: dominantExpression(expressions),
    expressions,
  };
}

export async function scanAllFaces(
  dataUrls: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<FaceScanResult[]> {
  const results: FaceScanResult[] = [];
  for (let i = 0; i < dataUrls.length; i++) {
    results.push(await scanFaceFromDataUrl(dataUrls[i]));
    onProgress?.(i + 1, dataUrls.length);
  }
  return results;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function computePhotoAnalysisDepth(totalPhotos: number, photosWithFace: number): number {
  return Math.min(
    100,
    35 +
      photosWithFace * PHOTO_DEPTH_PER_FACE +
      totalPhotos * PHOTO_DEPTH_PER_UPLOAD,
  );
}

export function computePhotoCountBonus(photosWithFace: number): number {
  if (photosWithFace <= 1) return 0;
  return Math.min(PHOTO_SCORE_BONUS_CAP, (photosWithFace - 1) * PHOTO_SCORE_BONUS_PER_FACE);
}

export function aggregateFaceScores(
  scans: FaceScanResult[],
  totalPhotos = scans.length,
): {
  faceScanScore: number;
  photosWithFace: number;
  averageSymmetry: number;
  averageSmile: number;
  averageEyeOpenness: number;
  averagePoseScore: number;
  consistencyScore: number;
  analysisDepth: number;
  photoCountBonus: number;
} {
  const withFace = scans.filter((s) => s.faceDetected);
  if (withFace.length === 0) {
    return {
      faceScanScore: 0,
      photosWithFace: 0,
      averageSymmetry: 0,
      averageSmile: 0,
      averageEyeOpenness: 0,
      averagePoseScore: 0,
      consistencyScore: 0,
      analysisDepth: computePhotoAnalysisDepth(totalPhotos, 0),
      photoCountBonus: 0,
    };
  }

  const avg = (fn: (s: FaceScanResult) => number) =>
    Math.round(withFace.reduce((sum, s) => sum + fn(s), 0) / withFace.length);

  const scoreSpread = stdDev(withFace.map((s) => s.faceScanScore));
  const consistencyScore = clamp(100 - scoreSpread * 1.5);

  const photosWithFace = withFace.length;
  const photoCountBonus = computePhotoCountBonus(photosWithFace);
  const baseScore = avg((s) => s.faceScanScore);
  const faceScanScore = Math.min(100, baseScore + photoCountBonus);

  return {
    faceScanScore,
    photosWithFace,
    averageSymmetry: avg((s) => s.symmetryScore),
    averageSmile: avg((s) => s.smileScore),
    averageEyeOpenness: avg((s) => s.eyeOpenness),
    averagePoseScore: avg((s) => s.facePoseScore),
    consistencyScore,
    analysisDepth: computePhotoAnalysisDepth(totalPhotos, photosWithFace),
    photoCountBonus,
  };
}
