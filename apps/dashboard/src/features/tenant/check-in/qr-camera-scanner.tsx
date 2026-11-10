"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@repo/ui/button";

/** Mismo código seguido: se ignora este tiempo para no registrar dos veces. */
const REPEAT_COOLDOWN_MS = 4000;
/** Frecuencia de lectura; más no hace falta y gasta batería. */
const SCAN_INTERVAL_MS = 150;

interface QrCameraScannerProps {
  /** Se llama una vez por cada QR leído (con enfriamiento entre repeticiones). */
  onScan: (code: string) => void;
  /** Pausa la lectura (p. ej. mientras se verifica el anterior). */
  paused?: boolean;
  disabled?: boolean;
}

/**
 * Lector de QR con la cámara del celular. Solo arranca al tocar el botón
 * (el navegador exige un gesto del usuario) y suelta la cámara al detenerlo
 * o al salir de la pantalla.
 */
export function QrCameraScanner({ onScan, paused = false, disabled = false }: QrCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastRef = useRef<{ code: string; at: number } | null>(null);
  const onScanRef = useRef(onScan);
  const pausedRef = useRef(paused);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
    pausedRef.current = paused;
  });

  function stop() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no permite usar la cámara (se necesita una conexión segura https).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setActive(true);
    } catch (err) {
      const denied = err instanceof DOMException && err.name === "NotAllowedError";
      setError(
        denied
          ? "Permiso de cámara denegado. Actívalo en los ajustes del navegador y vuelve a intentar."
          : "No se pudo abrir la cámara.",
      );
    }
  }

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || pausedRef.current || video.readyState < 2 || !video.videoWidth) {
        return;
      }
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(image.data, image.width, image.height, {
        inversionAttempts: "dontInvert",
      });
      const code = result?.data.trim();
      if (!code) return;

      const now = Date.now();
      const last = lastRef.current;
      if (last && last.code === code && now - last.at < REPEAT_COOLDOWN_MS) return;
      lastRef.current = { code, at: now };
      navigator.vibrate?.(60);
      onScanRef.current(code);
    }, SCAN_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [active]);

  // Suelta la cámara al salir de la pantalla.
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        <video
          ref={videoRef}
          playsInline
          muted
          className={active ? "size-full object-cover" : "hidden"}
        />
        <canvas ref={canvasRef} className="hidden" />

        {active ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="size-3/5 rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Camera className="size-10" />
              <p>Activa la cámara y apunta al QR del socio.</p>
            </div>
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {active ? (
        <Button type="button" variant="outline" className="h-12" onClick={stop}>
          <CameraOff className="size-5" />
          Detener cámara
        </Button>
      ) : (
        <Button type="button" className="h-12" onClick={start} disabled={disabled}>
          <Camera className="size-5" />
          Activar cámara
        </Button>
      )}
    </div>
  );
}
