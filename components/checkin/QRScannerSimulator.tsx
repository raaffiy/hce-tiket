'use client';

import React, { useState } from 'react';
import { Camera, CameraOff, CheckCircle2, AlertCircle, Scan, Sparkles, RefreshCw } from 'lucide-react';
import { useHCEApp } from '@/context/HCEAppContext';
import { Participant } from '@/types/hce';

export const QRScannerSimulator: React.FC = () => {
  const { participants, performCheckIn } = useHCEApp();
  const [scannerState, setScannerState] = useState<'cameraOff' | 'cameraOn' | 'scanning' | 'success' | 'failed'>('cameraOff');
  const [scannedResult, setScannedResult] = useState<{
    participant?: Participant;
    message: string;
    timestamp?: string;
  } | null>(null);

  const startCamera = () => {
    setScannerState('cameraOn');
    setScannedResult(null);
  };

  const stopCamera = () => {
    setScannerState('cameraOff');
    setScannedResult(null);
  };

  const simulateScan = (sampleOrderId: string) => {
    setScannerState('scanning');
    setTimeout(() => {
      const res = performCheckIn(sampleOrderId, 'QR Scan');
      const now = new Date();
      const timeStr = `${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, ${now.toTimeString().slice(0, 5)}`;

      setScannedResult({
        participant: res.participant,
        message: res.message,
        timestamp: timeStr,
      });

      if (res.success) {
        setScannerState('success');
      } else {
        setScannerState('failed');
      }
    }, 900);
  };

  // Sample quick scan triggers from actual participants in database (1 peserta belum check-in & 1 duplikat)
  const sampleNotCheckedIn = participants.filter((p) => p.checkInStatus === 'Not Checked In').slice(0, 1);
  const sampleCheckedIn = participants.filter((p) => p.checkInStatus === 'Checked In').slice(0, 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <Scan className="w-5 h-5 text-[#1A5E61]" />
              Kamera Scanner QR
            </h3>
            <p className="text-xs text-slate-500">
              Arahkan kamera ke QR ticket peserta di gerbang masuk.
            </p>
          </div>
          <button
            onClick={scannerState === 'cameraOff' ? startCamera : stopCamera}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
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

        {/* Viewport Box */}
        <div className="relative aspect-video max-h-72 w-full rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-white border-2 border-slate-800">
          {scannerState === 'cameraOff' && (
            <div className="text-center p-6">
              <CameraOff className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">Kamera Scanner Nonaktif</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Klik tombol &quot;Nyalakan Kamera&quot; untuk memulai pemindaian QR Code tiket peserta.
              </p>
            </div>
          )}

          {(scannerState === 'cameraOn' || scannerState === 'scanning') && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Scan box reticle */}
              <div className="w-48 h-48 border-2 border-[#1A5E61] rounded-2xl relative flex items-center justify-center">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#E05A1F] -translate-x-1 -translate-y-1" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#E05A1F] translate-x-1 -translate-y-1" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#E05A1F] -translate-x-1 translate-y-1" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#E05A1F] translate-x-1 translate-y-1" />
                
                {/* Scanning laser line */}
                <div className="w-full h-0.5 bg-[#E05A1F] shadow-[0_0_8px_#E05A1F] animate-bounce" />
              </div>
              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                {scannerState === 'scanning' ? 'Memproses QR Code...' : 'Posisikan QR Code di dalam kotak'}
              </p>
            </div>
          )}

          {scannerState === 'success' && scannedResult?.participant && (
            <div className="w-full h-full bg-emerald-950 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-emerald-200">Check-In Berhasil!</h4>
              <p className="text-xs text-emerald-300 mb-2">{scannedResult.timestamp}</p>
              
              <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/60 max-w-sm w-full text-left text-xs space-y-1 mt-2">
                <p className="font-bold text-white text-sm">{scannedResult.participant.name}</p>
                <p className="text-emerald-200">NIM: {scannedResult.participant.nim}</p>
                <p className="text-emerald-200">Tiket: {scannedResult.participant.ticketName}</p>
                <p className="text-emerald-300 font-mono text-[10px]">Order: {scannedResult.participant.orderId}</p>
              </div>

              <button
                onClick={startCamera}
                className="mt-4 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Scan Peserta Berikutnya
              </button>
            </div>
          )}

          {scannerState === 'failed' && (
            <div className="w-full h-full bg-rose-950 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500 flex items-center justify-center mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-rose-200">Check-In Gagal / Peringatan</h4>
              <p className="text-xs text-rose-300 max-w-sm mt-1">{scannedResult?.message}</p>

              <button
                onClick={startCamera}
                className="mt-4 px-4 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Coba Scan Lagi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Quick Actions */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Simulasi Scan QR Tiket Peserta:
        </p>
        <div className="flex flex-wrap gap-2">
          {sampleNotCheckedIn.map((p) => (
            <button
              key={p.id}
              onClick={() => simulateScan(p.orderId)}
              className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium border border-slate-200"
            >
              Scan {p.name.split(' ')[0]} ({p.orderId})
            </button>
          ))}
          {sampleCheckedIn.map((p) => (
            <button
              key={p.id}
              onClick={() => simulateScan(p.orderId)}
              className="text-xs px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors font-medium border border-amber-200"
              title="Coba scan peserta yang sudah check-in"
            >
              Test Duplicate ({p.name.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
