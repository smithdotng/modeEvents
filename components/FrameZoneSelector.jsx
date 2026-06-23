'use client';
import { useRef, useState, useEffect, useCallback } from 'react';

const HANDLE_R = 7; // handle radius in canvas px

/**
 * Drag on the image to draw the avatar zone.
 * Drag INSIDE the zone to move it.
 * Drag a corner handle to resize.
 * Calls onChange({ x, y, w, h, shape }) with values as % of image dimensions.
 */
export default function FrameZoneSelector({ imageDataURL, zone, onChange }) {
  const canvasRef   = useRef(null);
  const imgRef      = useRef(null);
  const interactRef = useRef({ mode: null }); // 'draw' | 'move' | 'nw'|'ne'|'sw'|'se'
  const [shape, setShape] = useState(zone?.shape || 'rect');

  // ── Draw image + zone overlay ─────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const maxW = canvas.parentElement?.clientWidth || 640;
    const scale = Math.min(1, maxW / img.naturalWidth);
    canvas.width  = Math.floor(img.naturalWidth  * scale);
    canvas.height = Math.floor(img.naturalHeight * scale);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (!zone || zone.w <= 0) return;

    const zx = (zone.x / 100) * canvas.width;
    const zy = (zone.y / 100) * canvas.height;
    const zw = (zone.w / 100) * canvas.width;
    const zh = (zone.h / 100) * canvas.height;

    ctx.save();

    // Dim the area outside the zone
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cut-out: reveal zone
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.ellipse(zx + zw / 2, zy + zh / 2, zw / 2, zh / 2, 0, 0, Math.PI * 2);
    } else {
      ctx.rect(zx, zy, zw, zh);
    }
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Border
    ctx.strokeStyle = '#2a3b19';
    ctx.lineWidth   = 2.5;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.ellipse(zx + zw / 2, zy + zh / 2, zw / 2, zh / 2, 0, 0, Math.PI * 2);
    } else {
      ctx.strokeRect(zx, zy, zw, zh);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Corner handles
    const corners = [
      { x: zx,      y: zy,      name: 'nw' },
      { x: zx + zw, y: zy,      name: 'ne' },
      { x: zx,      y: zy + zh, name: 'sw' },
      { x: zx + zw, y: zy + zh, name: 'se' },
    ];
    for (const c of corners) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, HANDLE_R, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#2a3b19';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Center move handle
    ctx.beginPath();
    ctx.arc(zx + zw / 2, zy + zh / 2, HANDLE_R + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(42,59,25,0.8)';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Cross inside move handle
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    const cx = zx + zw / 2, cy = zy + zh / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 4, cy);
    ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 4);
    ctx.stroke();

    ctx.restore();
  }, [zone, shape]);

  // Load image once, redraw on zone/shape changes
  useEffect(() => {
    if (!imageDataURL) return;
    const img = new Image();
    img.onload = () => { imgRef.current = img; redraw(); };
    img.src = imageDataURL;
  }, [imageDataURL]); // eslint-disable-line

  useEffect(() => { redraw(); }, [redraw]);

  // ── Pointer helpers ───────────────────────────────────────────────────────
  function toPct(e) {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(100, ((cx - rect.left) / rect.width)  * 100)),
      y: Math.max(0, Math.min(100, ((cy - rect.top)  / rect.height) * 100)),
    };
  }

  function hitTest(pos) {
    if (!zone || zone.w <= 0) return 'draw';
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();

    // Tolerance in % space (maps HANDLE_R px to %)
    const tolX = (HANDLE_R * 2.5 / rect.width)  * 100;
    const tolY = (HANDLE_R * 2.5 / rect.height) * 100;

    const corners = {
      nw: { x: zone.x,            y: zone.y            },
      ne: { x: zone.x + zone.w,   y: zone.y            },
      sw: { x: zone.x,            y: zone.y + zone.h   },
      se: { x: zone.x + zone.w,   y: zone.y + zone.h   },
    };
    for (const [name, c] of Object.entries(corners)) {
      if (Math.abs(pos.x - c.x) < tolX && Math.abs(pos.y - c.y) < tolY) return name;
    }
    // Inside zone → move
    if (pos.x >= zone.x && pos.x <= zone.x + zone.w &&
        pos.y >= zone.y && pos.y <= zone.y + zone.h) return 'move';

    return 'draw';
  }

  // ── Pointer handlers ──────────────────────────────────────────────────────
  function onDown(e) {
    e.preventDefault();
    const pos  = toPct(e);
    const mode = hitTest(pos);
    interactRef.current = { mode, start: pos, zoneAtStart: zone ? { ...zone } : null };
  }

  function onMove(e) {
    e.preventDefault();
    const { mode, start, zoneAtStart } = interactRef.current;
    if (!mode) return;

    const pos = toPct(e);
    const dx  = pos.x - start.x;
    const dy  = pos.y - start.y;
    let nz;

    if (mode === 'draw') {
      nz = {
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        w: Math.abs(pos.x - start.x),
        h: Math.abs(pos.y - start.y),
        shape,
      };
    } else if (mode === 'move') {
      const z = zoneAtStart;
      nz = {
        ...z,
        x: Math.max(0, Math.min(100 - z.w, z.x + dx)),
        y: Math.max(0, Math.min(100 - z.h, z.y + dy)),
      };
    } else {
      // Resize via corner handle
      const z = { ...zoneAtStart };
      let { x, y, w, h } = z;
      const MIN = 5;

      if (mode.includes('e')) w = Math.max(MIN, z.w + dx);
      if (mode.includes('s')) h = Math.max(MIN, z.h + dy);
      if (mode.includes('w')) {
        const nx = Math.min(z.x + dx, z.x + z.w - MIN);
        w = z.w - (nx - z.x);
        x = nx;
      }
      if (mode.includes('n')) {
        const ny = Math.min(z.y + dy, z.y + z.h - MIN);
        h = z.h - (ny - z.y);
        y = ny;
      }
      nz = { x: Math.max(0, x), y: Math.max(0, y), w: Math.min(100 - x, w), h: Math.min(100 - y, h), shape };
    }

    onChange(nz);
  }

  function onUp(e) {
    onMove(e);
    interactRef.current = { mode: null };
  }

  // ── Cursor style ──────────────────────────────────────────────────────────
  function onMouseMoveForCursor(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos  = toPct(e);
    const hit  = hitTest(pos);
    const cursors = { nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize', move: 'move', draw: 'crosshair' };
    canvas.style.cursor = cursors[hit] || 'crosshair';
    if (interactRef.current.mode) onMove(e);
  }

  // ── Clear ─────────────────────────────────────────────────────────────────
  function clearZone() {
    onChange({ x: 0, y: 0, w: 0, h: 0, shape });
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm text-[#546048] font-semibold">Shape:</span>
          {['rect', 'circle'].map(s => (
            <button key={s} type="button"
              onClick={() => { setShape(s); if (zone?.w > 0) onChange({ ...zone, shape: s }); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                shape === s
                  ? 'bg-[#2a3b19] border-[#2a3b19] text-white'
                  : 'border-[#c0bfb9] text-[#546048] hover:border-[#2a3b19] hover:text-[#2a3b19]'
              }`}
            >
              {s === 'rect' ? '⬜ Rectangle' : '⭕ Oval / Circle'}
            </button>
          ))}
        </div>
        {zone?.w > 0 && (
          <button type="button" onClick={clearZone}
            className="text-xs text-red-500 hover:underline font-semibold"
          >
            ✕ Clear zone
          </button>
        )}
      </div>

      {/* Instruction */}
      <div className="bg-[#e8e7e1] rounded-lg px-3 py-2 text-xs text-[#546048] leading-relaxed">
        <strong className="text-[#2a3b19]">Tip:</strong> Drag anywhere on the image to draw the avatar zone.
        Once drawn, drag <em>inside</em> the zone to move it, or drag a <em>corner handle</em> to resize.
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-[#2a3b19] select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={onDown}
          onMouseMove={onMouseMoveForCursor}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
          className="w-full block"
          style={{ touchAction: 'none' }}
        />
        {/* Overlay hint when no zone yet */}
        {(!zone || zone.w <= 0) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 rounded-xl px-4 py-3 text-center shadow">
              <p className="text-2xl mb-1">👆</p>
              <p className="text-xs font-bold text-[#2a3b19]">Drag to select the avatar zone</p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      {zone?.w > 0 ? (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#2a3b19]">
          <span className="w-2 h-2 rounded-full bg-[#2a3b19] inline-block" />
          Zone: {zone.w.toFixed(0)}% × {zone.h.toFixed(0)}% at ({zone.x.toFixed(0)}%, {zone.y.toFixed(0)}%)
        </div>
      ) : (
        <p className="text-xs text-[#546048]">No zone selected — drag on the image above.</p>
      )}
    </div>
  );
}
