'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Scan,
  Sparkles,
  RefreshCw,
  SwitchCamera,
  Volume2,
  VolumeX,
} from 'lucide-react';
import jsQR from 'jsqr';
import { useHCEApp } from '@/context/HCEAppContext';
import { Participant } from '@/types/hce';

export const QRScannerSimulator: React.FC = () => {
  const { participants, performCheckIn } = useHCEApp();

  const [scannerState, setScannerState] = useState<
    'cameraOff' | 'cameraOn' | 'scanning' | 'success' | 'failed'
  >('cameraOff');

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [scannedResult, setScannedResult] = useState<{
    participant?: Participant;
    message: string;
    timestamp?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  // Play audio beep feedback
  const playBeep = useCallback(
    (isSuccess: boolean) => {
      if (!soundEnabled) return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = isSuccess ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(isSuccess ? 880 : 260, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (isSuccess ? 0.2 : 0.35));

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + (isSuccess ? 0.2 : 0.35));
      } catch {
        // Ignore audio playback error
      }
    },
    [soundEnabled]
  );

  // Trigger haptic vibration on mobile Chrome
  const triggerHaptic = (isSuccess: boolean) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(isSuccess ? 150 : [100, 50, 100]);
    }
  };

  // Enumerate video devices
  const getCameraDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableCameras(videoInputs);
    } catch {
      // Ignore enumeration error
    }
  };

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    isScanningRef.current = false;
    setScannerState('cameraOff');
  }, []);

  // Handle scanned QR payload
  const handleScannedData = useCallback(
    async (rawData: string) => {
      const now = Date.now();
      // Anti-duplicate debounce within 2.5s for same code
      if (
        lastScannedCodeRef.current === rawData &&
        now - lastScannedTimeRef.current < 2500
      ) {
        return;
      }

      lastScannedCodeRef.current = rawData;
      lastScannedTimeRef.current = now;

      // Extract code if URL or JSON is scanned
      let cleanQuery = rawData.trim();
      if (cleanQuery.includes('/t/')) {
        cleanQuery = cleanQuery.split('/t/')[1].split('?')[0];
      } else if (cleanQuery.includes('code=')) {
        cleanQuery = cleanQuery.split('code=')[1].split('&')[0];
      } else if (cleanQuery.startsWith('{') && cleanQuery.endsWith('}')) {
        try {
          const parsed = JSON.parse(cleanQuery);
          cleanQuery = parsed.orderId || parsed.id || parsed.nim || cleanQuery;
        } catch {
          // use raw
        }
      }

      isScanningRef.current = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Perform check-in
      const res = await performCheckIn(cleanQuery, 'QR Scan');
      const dateNow = new Date();
      const timeStr = `${dateNow.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}, ${dateNow.toTimeString().slice(0, 5)}`;

      setScannedResult({
        participant: res.participant,
        message: res.message,
        timestamp: timeStr,
      });

      playBeep(res.success);
      triggerHaptic(res.success);

      if (res.success) {
        setScannerState('success');
      } else {
        setScannerState('failed');
      }
    },
    [performCheckIn, playBeep]
  );

  // Scan frame loop using requestAnimationFrame + jsQR
  const scanFrame = useCallback(() => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleScannedData(code.data);
            return;
          }
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
    }
  }, [handleScannedData]);

  // Start Camera Stream (Compatible with HP Chrome & Laptop Chrome)
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setScannedResult(null);
    setScannerState('cameraOn');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Browser Anda tidak mendukung akses kamera langsung. Pastikan menggunakan HTTPS atau localhost di Chrome.'
        );
      }

      // Define video constraints
      let videoConstraints: MediaTrackConstraints = {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };

      if (selectedDeviceId) {
        videoConstraints = {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        };
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });
      } catch (err: unknown) {
        // Fallback constraint if environment camera is not available
        console.warn('Fallback to default video constraint', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS/Chrome mobile
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      await getCameraDevices();
      isScanningRef.current = true;
      animationFrameId.current = requestAnimationFrame(scanFrame);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const errorObj = err as Error;
      let errorMsg = 'Gagal mengakses kamera.';

      if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
        errorMsg =
          'Izin kamera ditolak. Silakan izinkan (Allow) akses kamera pada pengaturan perizinan Chrome Anda.';
      } else if (
        errorObj.name === 'NotFoundError' ||
        errorObj.name === 'DevicesNotFoundError'
      ) {
        errorMsg = 'Perangkat kamera tidak ditemukan di laptop/HP Anda.';
      } else if (
        errorObj.name === 'NotReadableError' ||
        errorObj.name === 'TrackStartError'
      ) {
        errorMsg =
          'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain yang memakai kamera lalu coba lagi.';
      } else if (errorObj.message) {
        errorMsg = errorObj.message;
      }

      setCameraError(errorMsg);
      setScannerState('cameraOff');
    }
  }, [facingMode, selectedDeviceId, scanFrame, stopCamera]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Quick manual simulator scan
  const simulateScan = (sampleOrderId: string) => {
    handleScannedData(sampleOrderId);
  };

  const sampleNotCheckedIn = participants
    .filter((p) => p.checkInStatus === 'Not Checked In')
    .slice(0, 2);
  const sampleCheckedIn = participants
    .filter((p) => p.checkInStatus === 'Checked In')
    .slice(0, 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <Scan className="w-5 h-5 text-[#1A5E61]" />
              Kamera Scanner QR Live
            </h3>
            <p className="text-xs text-slate-500">
              Arahkan kamera ke QR ticket peserta di pintu masuk (HP / Laptop).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle sound */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Suara scanner aktif' : 'Suara scanner nonaktif'}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                soundEnabled
                  ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Switch Camera (Front/Back) */}
            {scannerState !== 'cameraOff' && (
              <button
                onClick={() => {
                  setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                  setSelectedDeviceId('');
                  setTimeout(() => {
                    startCamera();
                  }, 100);
                }}
                title="Ganti Kamera Depan / Belakang"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}

            {/* Start / Stop Camera Button */}
            <button
              onClick={scannerState === 'cameraOff' ? startCamera : stopCamera}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                scannerState === 'cameraOff'
                  ? 'bg-[#1A5E61] hover:bg-[#134648] text-white'
                  : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
              }`}
            >
              {scannerState === 'cameraOff' ? (
                <>
                  <Camera className="w-4 h-4" /> Nyalakan Kamera
                </>
              ) : (
                <>
                  <CameraOff className="w-4 h-4" /> Matikan Kamera
                </>
              )}
            </button>
          </div>
        </div>

        {/* Viewport Box */}
        <div className="relative aspect-video max-h-80 w-full rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-white border-2 border-slate-800 shadow-inner">
          {/* Hidden Canvas for QR Analysis */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Live Video Element */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${
              scannerState === 'cameraOff' || scannerState === 'success' || scannerState === 'failed'
                ? 'hidden'
                : 'block'
            }`}
          />

          {/* State: Camera Off */}
          {scannerState === 'cameraOff' && (
            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3">
                <CameraOff className="w-7 h-7 text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-200">Kamera Scanner Nonaktif</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Klik tombol <span className="text-[#1A5E61] font-semibold">&quot;Nyalakan Kamera&quot;</span>{' '}
                untuk memindai QR Code tiket peserta secara live.
              </p>

              {cameraError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs text-left max-w-sm mx-auto">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    Pemberitahuan Kamera:
                  </p>
                  <p className="text-[11px] leading-relaxed">{cameraError}</p>
                </div>
              )}
            </div>
          )}

          {/* State: Camera Active / Scanning Overlay */}
          {scannerState === 'cameraOn' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Scan Reticle Box */}
              <div className="w-52 h-52 sm:w-60 sm:h-60 border-2 border-emerald-400/80 rounded-2xl relative flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                {/* Corner Highlights */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-[#E05A1F] -translate-x-1 -translate-y-1 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-[#E05A1F] translate-x-1 -translate-y-1 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-[#E05A1F] -translate-x-1 translate-y-1 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-[#E05A1F] translate-x-1 translate-y-1 rounded-br-lg" />

                {/* Animated Laser Bar */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#E05A1F] to-transparent shadow-[0_0_12px_#E05A1F] animate-bounce" />
              </div>

              <div className="mt-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xs border border-white/10 text-xs text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E05A1F] animate-spin" />
                <span>Posisikan QR Code di dalam kotak</span>
              </div>
            </div>
          )}

          {/* State: Check-In Success */}
          {scannerState === 'success' && scannedResult?.participant && (
            <div className="w-full h-full bg-emerald-950 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-emerald-200">CHECK-IN BERHASIL!</h4>
              <p className="text-xs text-emerald-300 font-mono mb-2">{scannedResult.timestamp}</p>

              <div className="bg-emerald-900/80 p-3.5 rounded-xl border border-emerald-700/60 max-w-sm w-full text-left text-xs space-y-1 mt-1 shadow-md">
                <p className="font-extrabold text-white text-base">
                  {scannedResult.participant.name}
                </p>
                <p className="text-emerald-200 font-mono">NIM: {scannedResult.participant.nim}</p>
                <p className="text-emerald-200">
                  Tiket: <span className="font-bold">{scannedResult.participant.ticketName}</span>
                </p>
                <p className="text-emerald-300 font-mono text-[11px]">
                  Order ID: {scannedResult.participant.orderId}
                </p>
              </div>

              <button
                onClick={startCamera}
                className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Scan Peserta Berikutnya
              </button>
            </div>
          )}

          {/* State: Check-In Failed / Duplicate */}
          {scannerState === 'failed' && (
            <div className="w-full h-full bg-rose-950 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500 flex items-center justify-center mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-rose-200">PERINGATAN CHECK-IN</h4>
              <p className="text-xs text-rose-300 max-w-sm mt-1 px-4 leading-relaxed font-medium">
                {scannedResult?.message}
              </p>

              <button
                onClick={startCamera}
                className="mt-4 px-5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Coba Scan Lagi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Quick Action Buttons for Testing without Camera */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Uji Coba Cepat (Simulator Trigger):
        </p>
        <div className="flex flex-wrap gap-2">
          {sampleNotCheckedIn.map((p) => (
            <button
              key={p.id}
              onClick={() => simulateScan(p.orderId)}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-semibold border border-slate-200 cursor-pointer"
            >
              Scan {p.name.split(' ')[0]} ({p.orderId})
            </button>
          ))}
          {sampleCheckedIn.map((p) => (
            <button
              key={p.id}
              onClick={() => simulateScan(p.orderId)}
              className="text-xs px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors font-semibold border border-amber-200 cursor-pointer"
              title="Uji coba scan tiket yang sudah masuk gate sebelumnya"
            >
              Test Duplikat ({p.name.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
