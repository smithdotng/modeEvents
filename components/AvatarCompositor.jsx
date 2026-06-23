'use client';
import { useRef, useEffect, useState } from 'react';

/**
 * Composites attendee photo onto event frame, adds a caption,
 * and surfaces Download + Share buttons.
 *
 * Props:
 *  frameImage    – base64 frame/template
 *  frameZone     – { x, y, w, h (% of image), shape: 'rect'|'circle' }
 *  attendeePhoto – base64 attendee photo
 *  onComposite   – called with final PNG data URL
 *  eventDetails  – { title, date, venue } for the caption
 */
export default function AvatarCompositor({
  frameImage, frameZone, attendeePhoto, onComposite, eventDetails,
}) {
  const canvasRef = useRef(null);
  const [done, setDone]       = useState(false);
  const [dataURL, setDataURL] = useState('');
  const [shared, setShared]   = useState(false);

  useEffect(() => {
    if (!frameImage || !attendeePhoto || !frameZone) return;
    setDone(false);
    setDataURL('');

    const frame  = new Image();
    const avatar = new Image();
    let loaded = 0;

    function composite() {
      if (++loaded < 2) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width  = frame.naturalWidth  || 800;
      canvas.height = frame.naturalHeight || 600;
      const ctx = canvas.getContext('2d');

      // ── 1. Frame ─────────────────────────────────────────────────────────
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

      // ── 2. Zone coords ───────────────────────────────────────────────────
      const zx = (frameZone.x / 100) * canvas.width;
      const zy = (frameZone.y / 100) * canvas.height;
      const zw = (frameZone.w / 100) * canvas.width;
      const zh = (frameZone.h / 100) * canvas.height;

      // ── 3. Clip + draw attendee photo (cover-fit) ─────────────────────
      ctx.save();
      ctx.beginPath();
      if (frameZone.shape === 'circle') {
        ctx.ellipse(zx + zw / 2, zy + zh / 2, zw / 2, zh / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(zx, zy, zw, zh);
      }
      ctx.clip();

      const scale = Math.max(zw / avatar.naturalWidth, zh / avatar.naturalHeight);
      const sw = avatar.naturalWidth  * scale;
      const sh = avatar.naturalHeight * scale;
      ctx.drawImage(avatar, zx + (zw - sw) / 2, zy + (zh - sh) / 2, sw, sh);
      ctx.restore();

      // ── 4. Caption from event details ────────────────────────────────────
      if (eventDetails?.title) {
        const { title, date, venue } = eventDetails;
        const capH  = canvas.height * 0.16;
        const capY  = canvas.height - capH;
        const scrimH = capH * 1.4;

        // Gradient scrim
        const grad = ctx.createLinearGradient(0, capY - capH * 0.6, 0, canvas.height);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.80)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, capY - capH * 0.6, canvas.width, scrimH);

        const pad       = canvas.width * 0.045;
        const titleSize = Math.max(14, Math.min(canvas.width * 0.048, 42));
        const subSize   = Math.max(11, Math.min(canvas.width * 0.030, 28));

        // Title
        ctx.fillStyle    = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'left';
        ctx.font         = `700 ${titleSize}px 'Segoe UI', system-ui, sans-serif`;

        // Truncate if too wide
        let displayTitle = title;
        while (ctx.measureText(displayTitle).width > canvas.width - pad * 2 && displayTitle.length > 4) {
          displayTitle = displayTitle.slice(0, -4) + '…';
        }
        ctx.fillText(displayTitle, pad, capY + capH * 0.30);

        // Sub-line: date + venue
        const dateStr = date
          ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          : '';
        const sub = [dateStr, venue].filter(Boolean).join('  ·  ');
        if (sub) {
          ctx.font      = `${subSize}px 'Segoe UI', system-ui, sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.82)';
          ctx.fillText(sub, pad, capY + capH * 0.72);
        }
      }

      const url = canvas.toDataURL('image/png');
      setDataURL(url);
      setDone(true);
      onComposite(url);
    }

    frame.onload  = composite;
    avatar.onload = composite;
    frame.src  = frameImage;
    avatar.src = attendeePhoto;
  }, [frameImage, attendeePhoto, frameZone, onComposite, eventDetails]);

  // ── Share via Web Share API ───────────────────────────────────────────────
  async function handleShare() {
    if (!dataURL) return;
    try {
      const blob = await (await fetch(dataURL)).blob();
      const file = new File([blob], 'my-event-card.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files:  [file],
          title:  eventDetails?.title || 'My Event Card',
          text:   `I'm going to ${eventDetails?.title || 'this event'}! 🎟`,
        });
        setShared(true);
        setTimeout(() => setShared(false), 3000);
        return;
      }
    } catch { /* share cancelled */ }
    // Fallback: copy the image URL to clipboard
    try { await navigator.clipboard.writeText(window.location.href); } catch { }
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  }

  if (!frameImage || !attendeePhoto) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#546048]">Your event card preview</p>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-[#c0bfb9]">
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ display: done ? 'block' : 'none' }}
        />
        {!done && (
          <div className="h-48 bg-[#e8e7e1] flex items-center justify-center text-[#546048] text-sm animate-pulse">
            Compositing your card…
          </div>
        )}
      </div>

      {/* Download + Share */}
      {done && (
        <div className="flex gap-2">
          <a
            href={dataURL}
            download={`${(eventDetails?.title || 'event-card').replace(/\s+/g, '-')}.png`}
            className="flex-1 text-center py-2.5 rounded-xl font-bold text-sm text-white bg-[#2a3b19] hover:opacity-90 transition-opacity"
          >
            ⬇ Download card
          </a>
          <button
            type="button"
            onClick={handleShare}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all ${
              shared
                ? 'bg-green-500/10 border-green-500 text-green-600'
                : 'border-[#2a3b19] text-[#2a3b19] hover:bg-[#2a3b19] hover:text-white'
            }`}
          >
            {shared ? '✓ Shared!' : '↗ Share'}
          </button>
        </div>
      )}
    </div>
  );
}
