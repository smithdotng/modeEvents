'use client';
import { useEffect, useRef, useState } from 'react';

export default function QRScanner({ eventId, onCheckin }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const processingRef = useRef(false);
  const jsQRRef = useRef(null);

  const [active, setActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState('');

  // Load jsQR once
  useEffect(() => {
    import('jsqr').then(m => { jsQRRef.current = m.default; });
  }, []);

  async function startCamera() {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setActive(true);
    } catch {
      setCameraError('Camera access denied. Allow camera access in your browser and try again.');
    }
  }

  function stopCamera() {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(rafRef.current);
    setActive(false);
    setScanResult(null);
    processingRef.current = false;
  }

  // Scan loop — runs when active
  useEffect(() => {
    if (!active) return;

    function tick() {
      rafRef.current = requestAnimationFrame(tick);

      const v = videoRef.current;
      const c = canvasRef.current;
      const jsQR = jsQRRef.current;
      if (!v || !c || !jsQR || v.readyState < v.HAVE_ENOUGH_DATA) return;
      if (processingRef.current) return;

      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(v, 0, 0);
      const imageData = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code?.data) {
        processingRef.current = true;
        handleScan(code.data);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  async function handleScan(ticketCode) {
    setScanResult({ pending: true });
    try {
      const res = await fetch(`/api/events/${eventId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setScanResult({ ok: false, error: data.error || 'Unknown ticket' });
      } else {
        setScanResult({
          ok: true,
          name: data.attendee.name,
          ticketCode: data.attendee.ticketCode,
          alreadyIn: data.alreadyCheckedIn,
        });
        onCheckin?.(data.attendee);
      }
    } catch {
      setScanResult({ ok: false, error: 'Network error — try again' });
    }

    // Show result for 3s then resume scanning
    setTimeout(() => {
      setScanResult(null);
      processingRef.current = false;
    }, 3000);
  }

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), []);

  const corners = [
    { pos: 'top-0 left-0', border: 'border-t-2 border-l-2 rounded-tl-lg' },
    { pos: 'top-0 right-0', border: 'border-t-2 border-r-2 rounded-tr-lg' },
    { pos: 'bottom-0 left-0', border: 'border-b-2 border-l-2 rounded-bl-lg' },
    { pos: 'bottom-0 right-0', border: 'border-b-2 border-r-2 rounded-br-lg' },
  ];

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* Camera viewport */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#1c2410]">
        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          style={{ display: active ? 'block' : 'none' }}
        />

        {/* Aim overlay */}
        {active && !scanResult && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Dark vignette */}
            <div className="absolute inset-0 bg-black/30" />
            {/* Scanner box */}
            <div className="relative w-56 h-56 z-10">
              {corners.map(({ pos, border }, i) => (
                <div key={i} className={`absolute ${pos} w-8 h-8 border-[#7ab648] ${border}`} />
              ))}
              {/* Animated scan line */}
              <div
                className="absolute left-1 right-1 h-0.5 bg-[#7ab648] opacity-80"
                style={{ animation: 'scanLine 2s ease-in-out infinite', top: '50%' }}
              />
            </div>
          </div>
        )}

        {/* Scan result overlay */}
        {scanResult && !scanResult.pending && (
          <div className={`absolute inset-0 flex items-center justify-center ${scanResult.ok ? 'bg-green-900/90' : 'bg-red-900/90'}`}>
            <div className="text-center text-white px-6 space-y-2">
              <div className="text-6xl">
                {scanResult.ok ? (scanResult.alreadyIn ? '⚠️' : '✅') : '❌'}
              </div>
              {scanResult.ok ? (
                <>
                  <p className="text-xl font-extrabold">
                    {scanResult.alreadyIn ? 'Already checked in' : 'Checked in!'}
                  </p>
                  <p className="text-lg">{scanResult.name}</p>
                  <p className="text-sm opacity-60 font-mono">{scanResult.ticketCode}</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-extrabold">Invalid Ticket</p>
                  <p className="text-sm opacity-80">{scanResult.error}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Pending overlay */}
        {scanResult?.pending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-white text-center space-y-2">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm">Checking…</p>
            </div>
          </div>
        )}

        {/* Idle / start state */}
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            <div className="text-6xl">📷</div>
            <p className="text-[#7a9268] text-sm text-center px-8 leading-relaxed">
              Point your camera at an attendee&apos;s QR ticket to check them in
            </p>
            <button
              onClick={startCamera}
              className="px-8 py-3 rounded-xl font-bold text-white bg-[#2a3b19] border border-[#7ab648] hover:opacity-90 transition-opacity"
            >
              Start Scanner
            </button>
            {cameraError && (
              <p className="text-red-400 text-xs text-center px-6">{cameraError}</p>
            )}
          </div>
        )}
      </div>

      {/* Hidden canvas for frame processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Stop button */}
      {active && (
        <button
          onClick={stopCamera}
          className="w-full py-2.5 rounded-xl text-sm font-bold border border-[#c0bfb9] text-[#546048] hover:border-red-400 hover:text-red-400 transition-all"
        >
          Stop Scanner
        </button>
      )}

      {/* Scan line animation */}
      <style>{`
        @keyframes scanLine {
          0%   { top: 8px;  opacity: 1; }
          50%  { top: calc(100% - 8px); opacity: 1; }
          100% { top: 8px;  opacity: 1; }
        }
      `}</style>
    </div>
  );
}
