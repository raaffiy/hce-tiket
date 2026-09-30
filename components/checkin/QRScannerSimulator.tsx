'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
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
    'cameraOff' | 'cameraOn' | 'scanning' | 'success' | 'pending' | 'failed'
  >('cameraOff');

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [scannedResult, setScannedResult] = useState<{
    statusType: 'PAID' | 'PENDING' | 'FAILED' | 'ALREADY_CHECKED_IN' | 'NOT_FOUND';
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
    (statusType: string) => {
      if (!soundEnabled) return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        const isSuccess = statusType === 'PAID';
        const isPending = statusType === 'PENDING';

        osc.type = isSuccess ? 'sine' : isPending ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(isSuccess ? 880 : isPending ? 550 : 260, audioCtx.currentTime);

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
  const triggerHaptic = (statusType: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (statusType === 'PAID') {
        navigator.vibrate(150);
      } else if (statusType === 'PENDING') {
        navigator.vibrate([80, 50, 80]);
      } else {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
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
      // Anti-duplicate debounce within 2s for same code
      if (
        lastScannedCodeRef.current === rawData &&
        now - lastScannedTimeRef.current < 2000
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

      // Perform check-in with database validation
      const res = await performCheckIn(cleanQuery, 'QR Scan');
      const dateNow = new Date();
      const timeStr = `${dateNow.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}, ${dateNow.toTimeString().slice(0, 5)}`;

      setScannedResult({
        statusType: res.statusType,
        participant: res.participant,
        message: res.message,
        timestamp: timeStr,
      });

      playBeep(res.statusType);
      triggerHaptic(res.statusType);

      if (res.statusType === 'PAID') {
        setScannerState('success');
      } else if (res.statusType === 'PENDING') {
        setScannerState('pending');
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

  // Start Camera Stream
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
        console.warn('Fallback to default video constraint', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
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
  const simulateScan = (sampleQuery: string) => {
    handleScannedData(sampleQuery);
  };

  const samplePaidNotCheckedIn = participants
    .filter((p) => p.paymentStatus === 'Paid' && p.checkInStatus === 'Not Checked In')
    .slice(0, 1);

  const samplePending = participants
    .filter((p) => p.paymentStatus === 'Pending')
    .slice(0, 1);

  const sampleFailed = participants
    .filter((p) => p.paymentStatus === 'Failed' || p.paymentStatus === 'Refunded')
    .slice(0, 1);

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
              scannerState === 'cameraOff' || scannerState === 'success' || scannerState === 'pending' || scannerState === 'failed'
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

          {/* ========================================================== */}
          {/* 1. POPUP HIJAU: PEMBAYARAN BERHASIL (CHECK-IN SUCCESS) */}
          {/* ========================================================== */}
          {scannerState === 'success' && (
            <div className="w-full h-full bg-emerald-950/95 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200 border-2 border-emerald-500">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">STATUS: PEMBAYARAN BERHASIL</span>
              <h4 className="text-xl font-black text-white mt-0.5">&ldquo;QR berhasil di-scan.&rdquo;</h4>

              {scannedResult?.participant && (
                <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-700/60 max-w-sm w-full text-left text-xs space-y-1 mt-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-white text-sm">
                      {scannedResult.participant.name}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                      Terverifikasi
                    </span>
                  </div>
                  <p className="text-emerald-200 font-mono">NIM: {scannedResult.participant.nim || '-'}</p>
                  <p className="text-emerald-200">
                    Tiket: <span className="font-bold">{scannedResult.participant.ticketName}</span>
                  </p>
                  <p className="text-emerald-300 font-mono text-[11px]">
                    Order ID: {scannedResult.participant.orderId}
                  </p>
                  <p className="text-emerald-300 text-[10px] pt-1 border-t border-emerald-800">
                    Waktu Scan: {scannedResult.timestamp}
                  </p>
                </div>
              )}

              <button
                onClick={startCamera}
                className="mt-3.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" /> Scan Peserta Berikutnya
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. POPUP KUNING: MENUNGGU KONFIRMASI */}
          {/* ========================================================== */}
          {scannerState === 'pending' && (
            <div className="w-full h-full bg-amber-950/95 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200 border-2 border-amber-500">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">STATUS: MENUNGGU KONFIRMASI</span>
              <h4 className="text-base sm:text-lg font-black text-amber-100 mt-0.5 leading-snug px-3">
                &ldquo;QR tidak bisa di-scan karena belum dikonfirmasi oleh admin.&rdquo;
              </h4>

              {scannedResult?.participant && (
                <div className="bg-amber-900/80 p-3 rounded-xl border border-amber-700/60 max-w-sm w-full text-left text-xs space-y-1 mt-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-white text-sm">
                      {scannedResult.participant.name}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/40">
                      Pending
                    </span>
                  </div>
                  <p className="text-amber-200 font-mono">NIM: {scannedResult.participant.nim || '-'}</p>
                  <p className="text-amber-200">
                    Tiket: <span className="font-bold">{scannedResult.participant.ticketName}</span>
                  </p>
                  <p className="text-amber-300 font-mono text-[11px]">
                    Order ID: {scannedResult.participant.orderId}
                  </p>
                  <p className="text-amber-300 text-[10px] pt-1 border-t border-amber-800">
                    Harap verifikasi bukti transfer di menu Transactions terlebih dahulu.
                  </p>
                </div>
              )}

              <button
                onClick={startCamera}
                className="mt-3.5 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" /> Scan Peserta Berikutnya
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* 3. POPUP MERAH: PEMBAYARAN TIDAK BERHASIL / DITOLAK */}
          {/* ========================================================== */}
          {scannerState === 'failed' && (
            <div className="w-full h-full bg-rose-950/95 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200 border-2 border-rose-500">
              <span className="text-[11px] font-black uppercase tracking-widest text-rose-400">
                {scannedResult?.statusType === 'ALREADY_CHECKED_IN' ? 'CHECK-IN SEBELUMNYA' : 'STATUS: PEMBAYARAN DITOLAK'}
              </span>
              <h4 className="text-base sm:text-lg font-black text-rose-100 mt-0.5 leading-snug px-3">
                {scannedResult?.statusType === 'FAILED'
                  ? '“QR tersebut ditolak oleh admin.”'
                  : scannedResult?.message || '“QR tersebut ditolak oleh admin.”'}
              </h4>

              {scannedResult?.participant && (
                <div className="bg-rose-900/80 p-3 rounded-xl border border-rose-700/60 max-w-sm w-full text-left text-xs space-y-1 mt-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-white text-sm">
                      {scannedResult.participant.name}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/40">
                      {scannedResult.participant.paymentStatus}
                    </span>
                  </div>
                  <p className="text-rose-200 font-mono">NIM: {scannedResult.participant.nim || '-'}</p>
                  <p className="text-rose-200">
                    Tiket: <span className="font-bold">{scannedResult.participant.ticketName}</span>
                  </p>
                  <p className="text-rose-300 font-mono text-[11px]">
                    Order ID: {scannedResult.participant.orderId}
                  </p>
                </div>
              )}

              <button
                onClick={startCamera}
                className="mt-3.5 px-5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" /> Coba Scan Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
