'use client';
import { useEffect, useRef, useState } from 'react';

const W = 600;
const PADDING = 50;

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function QRTicket({ ticketCode, guestName, eventTitle, eventDate, eventVenue }) {
  const canvasRef = useRef(null);
  const [dataURL, setDataURL] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function draw() {
      if (!canvasRef.current) return;
      const QRCode = (await import('qrcode')).default;
      if (cancelled) return;

      // ── Generate QR to offscreen canvas first ──
      const qrSize = 220;
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, ticketCode, {
        width: qrSize,
        margin: 1,
        color: { dark: '#1c2410', light: '#f2f1eb' },
      });

      // ── Measure text to determine total height ──
      const canvas = canvasRef.current;
      canvas.width = W;
      canvas.height = 10; // temp
      const ctx = canvas.getContext('2d');

      ctx.font = 'bold 32px sans-serif';
      const titleLines = wrapText(ctx, eventTitle, W - PADDING * 2);

      const lineH = 40;
      const titleBlockH = titleLines.length * lineH;
      const qrBlockH = qrSize + 20 + 24 + 10; // qr + padding + ticketCode text + gap
      const nameBlockH = 60;
      const dateH = eventDate || eventVenue ? 30 : 0;
      const separatorH = 20;
      const H = PADDING + 28 + 12 + titleBlockH + (dateH > 0 ? dateH + 12 : 0) + separatorH + qrBlockH + separatorH + nameBlockH + PADDING;

      canvas.height = H;

      // ── Background ──
      ctx.fillStyle = '#1e2d12';
      ctx.fillRect(0, 0, W, H);

      // Top accent stripe
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, '#7ab648');
      grad.addColorStop(1, '#2a3b19');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, 5);

      // ── "MODE EVENTS" label ──
      ctx.fillStyle = '#7ab648';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '5px';
      ctx.fillText('MODE EVENTS', W / 2, PADDING + 13);
      ctx.letterSpacing = '0px';

      // ── Event title ──
      ctx.fillStyle = '#f2f1eb';
      ctx.font = 'bold 32px sans-serif';
      let y = PADDING + 13 + 20;
      for (const line of titleLines) {
        y += lineH;
        ctx.fillText(line, W / 2, y);
      }

      // ── Date & venue ──
      if (eventDate || eventVenue) {
        y += 14;
        ctx.fillStyle = '#7a9268';
        ctx.font = '16px sans-serif';
        const parts = [];
        if (eventDate) parts.push('📅 ' + new Date(eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
        if (eventVenue) parts.push('📍 ' + eventVenue);
        ctx.fillText(parts.join('  ·  '), W / 2, y + 16);
        y += 16;
      }

      // ── Divider ──
      y += separatorH;
      ctx.strokeStyle = '#2a3b19';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(W - PADDING, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Scissors icon
      ctx.fillStyle = '#2a3b19';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✂', W / 2, y + 1);

      y += separatorH;

      // ── QR code on cream background ──
      const qrX = (W - qrSize) / 2;
      const qrBg = 14;
      ctx.fillStyle = '#f2f1eb';
      ctx.beginPath();
      ctx.roundRect(qrX - qrBg, y - qrBg / 2, qrSize + qrBg * 2, qrSize + qrBg * 2, 14);
      ctx.fill();
      ctx.drawImage(qrCanvas, qrX, y, qrSize, qrSize);

      y += qrSize + qrBg + 10;

      // ── Ticket code ──
      ctx.fillStyle = '#546048';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ticketCode, W / 2, y + 14);

      y += 14 + separatorH;

      // ── Divider ──
      ctx.strokeStyle = '#2a3b19';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(W - PADDING, y);
      ctx.stroke();

      y += 18;

      // ── Guest name ──
      ctx.fillStyle = '#546048';
      ctx.font = '11px sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('GUEST', W / 2, y);
      ctx.letterSpacing = '0px';

      y += 8;
      ctx.fillStyle = '#f2f1eb';
      let nameFontSize = 34;
      ctx.font = `bold ${nameFontSize}px sans-serif`;
      while (ctx.measureText(guestName).width > W - PADDING * 2 && nameFontSize > 18) {
        nameFontSize -= 1;
        ctx.font = `bold ${nameFontSize}px sans-serif`;
      }
      ctx.fillText(guestName, W / 2, y + nameFontSize);

      if (!cancelled) setDataURL(canvas.toDataURL('image/png'));
    }

    draw();
    return () => { cancelled = true; };
  }, [ticketCode, guestName, eventTitle, eventDate, eventVenue]);

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        className="w-full rounded-2xl shadow-lg"
        style={{ display: 'block' }}
      />
      {dataURL && (
        <a
          href={dataURL}
          download={`${guestName.replace(/\s+/g, '-')}-ticket.png`}
          className="block w-full text-center py-3 rounded-xl font-bold text-sm text-white bg-[#2a3b19] hover:opacity-90 transition-opacity"
        >
          ⬇ Download Ticket
        </a>
      )}
    </div>
  );
}
