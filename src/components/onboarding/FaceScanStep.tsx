"use client";

import { useEffect, useRef, useState } from "react";
import type { PhotoUpload, UserProfile } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { MIN_PHOTOS } from "@/lib/data/form-options";
import { useSubscription } from "@/hooks/useSubscription";
import { MIN_FACE_PHOTOS } from "@/lib/engines/profile-validation";
import { loadFaceModels, scanFaceFromDataUrl } from "@/lib/engines/face-scan";

interface Props {
  profile: Partial<UserProfile>;
  onChange: (patch: Partial<UserProfile>) => void;
  onFinish: () => void;
  onBack: () => void;
}

export function FaceScanStep({ profile, onChange, onFinish, onBack }: Props) {
  const { limits } = useSubscription();
  const maxPhotos = limits.maxPhotos;
  const photos = profile.photos ?? [];
  const [modelsReady, setModelsReady] = useState(false);
  const [scanning, setScanning] = useState<number | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadFaceModels()
      .then(() => setModelsReady(true))
      .catch(() => setModelsReady(false));
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const faceCount = photos.filter((p) => p.faceScan?.faceDetected).length;
  const canFinish =
    photos.length >= MIN_PHOTOS && faceCount >= MIN_FACE_PHOTOS && modelsReady;

  const analysisDepth = Math.min(
    100,
    35 + faceCount * 12 + photos.length * 3,
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    let currentPhotos = [...photos];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await readFile(file);
      const idx = currentPhotos.length;
      currentPhotos = [
        ...currentPhotos,
        { dataUrl, styleTag: "casual" as const, contextTag: "solo" as const },
      ].slice(0, maxPhotos);
      onChange({ photos: currentPhotos });
      setScanning(idx);
      try {
        const faceScan = await scanFaceFromDataUrl(dataUrl);
        currentPhotos = currentPhotos.map((p, i) =>
          i === idx ? { ...p, faceScan } : p,
        );
        onChange({ photos: currentPhotos });
      } finally {
        setScanning(null);
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      alert("Kamera erişimi reddedildi. Dosya yükleyerek devam edebilirsin.");
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    let currentPhotos = [
      ...photos,
      { dataUrl, styleTag: "casual" as const, contextTag: "solo" as const },
    ].slice(0, maxPhotos);
    const idx = currentPhotos.length - 1;
    onChange({ photos: currentPhotos });
    setScanning(idx);
    try {
      const faceScan = await scanFaceFromDataUrl(dataUrl);
      currentPhotos = currentPhotos.map((p, i) =>
        i === idx ? { ...p, faceScan } : p,
      );
      onChange({ photos: currentPhotos });
    } finally {
      setScanning(null);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const removePhoto = (index: number) => {
    onChange({ photos: photos.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <Card title="Yüz Tarama Sistemi">
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <span className={`h-2 w-2 rounded-full ${modelsReady ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
          {modelsReady
            ? "TensorFlow yüz modeli hazır — gerçek landmark & ifade analizi"
            : "Modeller yükleniyor..."}
        </div>

        <p className="mb-4 text-sm text-zinc-400">
          En az {MIN_PHOTOS} fotoğraf yeterli — ne kadar çok fotoğraf, o kadar detaylı analiz.
          Simetri, çene dengesi, göz açıklığı, poz, altın oran, ışık ve 7 ifade ölçülür.
        </p>

        <div className="mb-4 rounded-xl border border-accent-dim bg-accent/5 px-4 py-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-zinc-400">Analiz derinliği</span>
            <span className="font-mono text-accent">{analysisDepth}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${analysisDepth}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-zinc-500">
            +{photos.length} fotoğraf · {faceCount} yüz tespiti
            {faceCount > 1 ? ` · +${(faceCount - 1) * 4} bonus skor` : ""}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <label className="btn-primary cursor-pointer">
            Fotoğraf Yükle
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          {!cameraOn ? (
            <button type="button" onClick={startCamera} className="btn-secondary">
              📷 Kamera Aç
            </button>
          ) : (
            <>
              <button type="button" onClick={captureFromCamera} className="btn-primary">
                Fotoğraf Çek
              </button>
              <button type="button" onClick={stopCamera} className="btn-secondary">
                Kapat
              </button>
            </>
          )}
        </div>

        {cameraOn && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-accent-dim bg-black">
            <video ref={videoRef} className="mx-auto max-h-72 w-full object-contain" muted playsInline />
            <p className="py-2 text-center text-xs text-zinc-500">
              Yüzünü ortala — çekim sonrası otomatik tarama başlar
            </p>
          </div>
        )}

        <div className="mb-2 flex justify-between text-sm">
          <span className="text-zinc-400">{photos.length} fotoğraf</span>
          <span className={faceCount >= MIN_FACE_PHOTOS ? "text-emerald-400" : "text-accent"}>
            {faceCount} / {MIN_FACE_PHOTOS} yüz tespiti
          </span>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600"
          >
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.dataUrl} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              {scanning === i && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                </div>
              )}
              {photo.faceScan?.faceDetected && (
                <div className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-bold text-black">
                  Yüz ✓ {photo.faceScan.faceScanScore}
                </div>
              )}
              {photo.faceScan && !photo.faceScan.faceDetected && (
                <div className="absolute left-2 top-2 rounded-full bg-red-500/90 px-2 py-0.5 text-xs font-bold text-white">
                  Yüz yok
                </div>
              )}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white hover:bg-red-600"
              >
                Sil
              </button>
            </div>
            {photo.faceScan?.faceDetected && (
              <div className="space-y-1 p-2 text-[10px] text-zinc-400">
                <div className="grid grid-cols-3 gap-1 text-center">
                  <span>Simetri {photo.faceScan.symmetryScore}</span>
                  <span>Çene {photo.faceScan.jawSymmetry}</span>
                  <span>Göz {photo.faceScan.eyeOpenness}</span>
                  <span>Poz {photo.faceScan.facePoseScore}</span>
                  <span>Işık {photo.faceScan.faceLighting}</span>
                  <span>Kalite {photo.faceScan.scanQuality}</span>
                </div>
                <p className="text-center text-zinc-500">
                  Baskın ifade: {expressionLabel(photo.faceScan.dominantExpression)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">
          Geri
        </button>
        <button
          type="button"
          onClick={onFinish}
          disabled={!canFinish}
          className="btn-primary disabled:opacity-40"
        >
          Analizi Başlat
        </button>
      </div>
    </div>
  );
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EXPRESSION_LABELS: Record<string, string> = {
  happy: "Mutlu",
  neutral: "Nötr",
  sad: "Üzgün",
  angry: "Kızgın",
  surprised: "Şaşkın",
  fearful: "Endişeli",
  disgusted: "İğrenmiş",
};

function expressionLabel(key: string): string {
  return EXPRESSION_LABELS[key] ?? key;
}
