'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const EC_LEVELS = ['L', 'M', 'Q', 'H'];

const QR_INPUT_TYPES = {
  url:   { label: 'URL',    fields: ['url'] },
  text:  { label: 'Text',   fields: ['text'] },
  email: { label: 'Email',  fields: ['email', 'subject', 'body'] },
  phone: { label: 'Phone',  fields: ['phone'] },
  wifi:  { label: 'Wi-Fi',  fields: ['ssid', 'wifipass', 'security'] },
  vcard: { label: 'vCard',  fields: ['vname', 'vphone', 'vemail', 'vorg'] },
};

const BARCODE_FORMATS = [
  'CODE128','CODE39','EAN13','EAN8','UPC','ITF14','MSI','pharmacode'
];

export default function Generator() {
  const [mode, setMode] = useState('qr');
  const [qrType, setQrType] = useState('url');
  const [qrFields, setQrFields] = useState({ url: 'https://example.com' });
  const [qrOpts, setQrOpts] = useState({ fg: '#000000', bg: '#ffffff', size: 256, ec: 1 });

  const [bcContent, setBcContent] = useState('1234567890');
  const [bcFormat, setBcFormat] = useState('CODE128');
  const [bcOpts, setBcOpts] = useState({ fg: '#000000', bg: '#ffffff', width: 2, height: 80, showText: true });

  const [previewURL, setPreviewURL] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const qrCanvasRef = useRef(null);
  const svgRef = useRef(null);

  // ── Helpers ──
  const setQF = (k) => (e) => setQrFields((f) => ({ ...f, [k]: e.target.value }));
  const setQO = (k) => (e) => setQrOpts((o) => ({ ...o, [k]: e.target.value }));
  const setBO = (k) => (e) => setBcOpts((o) => ({ ...o, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function buildQRContent() {
    switch (qrType) {
      case 'url':   return qrFields.url || '';
      case 'text':  return qrFields.text || '';
      case 'phone': return `tel:${qrFields.phone || ''}`;
      case 'email': {
        let s = `mailto:${qrFields.email || ''}`;
        const p = [];
        if (qrFields.subject) p.push(`subject=${encodeURIComponent(qrFields.subject)}`);
        if (qrFields.body)    p.push(`body=${encodeURIComponent(qrFields.body)}`);
        if (p.length) s += '?' + p.join('&');
        return s;
      }
      case 'wifi':
        return `WIFI:T:${qrFields.security || 'WPA'};S:${qrFields.ssid || ''};P:${qrFields.wifipass || ''};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${qrFields.vname || ''}\nTEL:${qrFields.vphone || ''}\nEMAIL:${qrFields.vemail || ''}\nORG:${qrFields.vorg || ''}\nEND:VCARD`;
      default: return '';
    }
  }

  // ── QR Generation (uses qrcode npm package) ──
  async function generateQR() {
    setError(''); setSaved(false);
    const content = buildQRContent();
    if (!content || content === 'tel:' || content === 'mailto:') {
      return setError('Please fill in the required field.');
    }
    try {
      const QRCode = (await import('qrcode')).default;
      const dataURL = await QRCode.toDataURL(content, {
        color: { dark: qrOpts.fg, light: qrOpts.bg },
        width: Number(qrOpts.size),
        errorCorrectionLevel: EC_LEVELS[Number(qrOpts.ec)],
        margin: 2,
      });
      setPreviewURL(dataURL);
    } catch (e) {
      setError('Failed to generate QR code: ' + e.message);
    }
  }

  // ── Barcode Generation (uses JsBarcode via SVG ref) ──
  async function generateBarcode() {
    setError(''); setSaved(false);
    if (!bcContent.trim()) return setError('Please enter barcode content.');
    try {
      const JsBarcode = (await import('jsbarcode')).default;
      const svg = svgRef.current;
      JsBarcode(svg, bcContent, {
        format: bcFormat,
        lineColor: bcOpts.fg,
        background: bcOpts.bg,
        width: Number(bcOpts.width),
        height: Number(bcOpts.height),
        displayValue: bcOpts.showText,
        font: 'monospace',
        fontSize: 14,
        margin: 14,
      });
      // Rasterise SVG → PNG data URL for storage
      const svgData = new XMLSerializer().serializeToString(svg);
      const url = await svgToDataURL(svgData, svg);
      setPreviewURL(url);
    } catch (e) {
      setError('Could not generate barcode. Check the value matches the selected format.');
    }
  }

  function svgToDataURL(svgData, svgEl) {
    return new Promise((resolve) => {
      const vb = svgEl.viewBox.baseVal;
      const w = vb.width || svgEl.getBoundingClientRect().width || 400;
      const h = vb.height || svgEl.getBoundingClientRect().height || 150;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = bcOpts.bg;
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    });
  }

  // ── Save to account ──
  async function saveCode() {
    if (!previewURL) return;
    setSaving(true);
    const content = mode === 'qr' ? buildQRContent() : bcContent;
    const format  = mode === 'qr' ? qrType : bcFormat;
    const options = mode === 'qr'
      ? { fg: qrOpts.fg, bg: qrOpts.bg, size: qrOpts.size }
      : { fg: bcOpts.fg, bg: bcOpts.bg };

    const res = await fetch('/api/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: mode, format, content, dataURL: previewURL, options }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError('Failed to save — please try again.');
  }

  function download() {
    if (!previewURL) return;
    const a = document.createElement('a');
    a.href = previewURL;
    a.download = `${mode}-${Date.now()}.png`;
    a.click();
  }

  // Shared field input
  const Field = ({ label: lbl, id, type = 'text', placeholder, value, onChange, as: As = 'input', children }) => (
    <div>
      <label>{lbl}</label>
      {As === 'textarea'
        ? <textarea id={id} placeholder={placeholder} value={value} onChange={onChange} rows={3} />
        : As === 'select'
          ? <select id={id} value={value} onChange={onChange}>{children}</select>
          : <input type={type} id={id} placeholder={placeholder} value={value} onChange={onChange} />
      }
    </div>
  );

  const SliderRow = ({ label: lbl, min, max, step, value, onChange, suffix = '' }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label style={{ marginBottom: 0 }}>{lbl}</label>
        <span className="text-[#6c63ff] text-sm font-bold">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full" />
    </div>
  );

  const ColorRow = ({ label: lbl, value, onChange }) => (
    <div className="mb-4">
      <label>{lbl}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={onChange} className="!w-10 !h-10 !p-1" />
        <span className="text-sm text-[#9090b0] font-mono">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-1">Generate a Code</h1>
        <p className="text-[#9090b0]">Customise, preview, then save or download.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-[#1a1a2e] border border-[#2e2e4a] rounded-full p-1 gap-1">
          {['qr', 'barcode'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setPreviewURL(null); setError(''); setSaved(false); }}
              className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all ${
                mode === m
                  ? 'bg-gradient-to-r from-[#6c63ff] to-[#574fd6] text-white'
                  : 'text-[#9090b0] hover:text-white'
              }`}
            >
              {m === 'qr' ? '⬛ QR Code' : '▌▌▌ Barcode'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Controls ── */}
        <div className="bg-[#1a1a2e] border border-[#2e2e4a] rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-[#9090b0] uppercase tracking-widest">Settings</p>

          {/* QR Controls */}
          {mode === 'qr' && (
            <>
              {/* Type tabs */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(QR_INPUT_TYPES).map(([key, { label: lbl }]) => (
                  <button
                    key={key}
                    onClick={() => { setQrType(key); setQrFields({}); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      qrType === key
                        ? 'bg-[#6c63ff] border-[#6c63ff] text-white'
                        : 'border-[#2e2e4a] text-[#9090b0] hover:text-white'
                    }`}
                  >{lbl}</button>
                ))}
              </div>

              {/* Dynamic fields */}
              {qrType === 'url'   && <Field label="URL" id="url" placeholder="https://example.com" value={qrFields.url || ''} onChange={setQF('url')} />}
              {qrType === 'text'  && <Field label="Text" id="text" placeholder="Enter any text…" value={qrFields.text || ''} onChange={setQF('text')} as="textarea" />}
              {qrType === 'phone' && <Field label="Phone number" id="phone" placeholder="+2348012345678" value={qrFields.phone || ''} onChange={setQF('phone')} />}
              {qrType === 'email' && <>
                <Field label="Email address" id="email" placeholder="user@example.com" value={qrFields.email || ''} onChange={setQF('email')} />
                <Field label="Subject" id="subject" placeholder="Subject" value={qrFields.subject || ''} onChange={setQF('subject')} />
                <Field label="Body" id="body" placeholder="Message…" value={qrFields.body || ''} onChange={setQF('body')} as="textarea" />
              </>}
              {qrType === 'wifi' && <>
                <Field label="Network name (SSID)" id="ssid" placeholder="MyNetwork" value={qrFields.ssid || ''} onChange={setQF('ssid')} />
                <Field label="Password" id="wifipass" placeholder="Wi-Fi password" value={qrFields.wifipass || ''} onChange={setQF('wifipass')} />
                <Field label="Security" id="security" as="select" value={qrFields.security || 'WPA'} onChange={setQF('security')}>
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </Field>
              </>}
              {qrType === 'vcard' && <>
                <Field label="Full name" id="vname" placeholder="Jane Doe" value={qrFields.vname || ''} onChange={setQF('vname')} />
                <Field label="Phone" id="vphone" placeholder="+2348012345678" value={qrFields.vphone || ''} onChange={setQF('vphone')} />
                <Field label="Email" id="vemail" placeholder="jane@example.com" value={qrFields.vemail || ''} onChange={setQF('vemail')} />
                <Field label="Organisation" id="vorg" placeholder="Acme Ltd" value={qrFields.vorg || ''} onChange={setQF('vorg')} />
              </>}

              <hr className="border-[#2e2e4a]" />

              <div className="grid grid-cols-2 gap-4">
                <ColorRow label="Foreground" value={qrOpts.fg} onChange={setQO('fg')} />
                <ColorRow label="Background" value={qrOpts.bg} onChange={setQO('bg')} />
              </div>
              <SliderRow label="Size" min={128} max={512} step={16} value={qrOpts.size} onChange={setQO('size')} suffix=" px" />
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <label style={{ marginBottom: 0 }}>Error correction</label>
                  <span className="text-[#6c63ff] text-sm font-bold">{EC_LEVELS[qrOpts.ec]}</span>
                </div>
                <input type="range" min={0} max={3} step={1} value={qrOpts.ec} onChange={setQO('ec')} className="w-full" />
              </div>
            </>
          )}

          {/* Barcode Controls */}
          {mode === 'barcode' && (
            <>
              <div>
                <label>Format</label>
                <select value={bcFormat} onChange={(e) => setBcFormat(e.target.value)}>
                  {BARCODE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <Field label="Content" id="bc-content" placeholder="Enter value…" value={bcContent} onChange={(e) => setBcContent(e.target.value)} />

              <hr className="border-[#2e2e4a]" />

              <div className="grid grid-cols-2 gap-4">
                <ColorRow label="Bar colour" value={bcOpts.fg} onChange={setBO('fg')} />
                <ColorRow label="Background" value={bcOpts.bg} onChange={setBO('bg')} />
              </div>
              <SliderRow label="Bar width" min={1} max={4} step={0.5} value={bcOpts.width} onChange={setBO('width')} />
              <SliderRow label="Height" min={40} max={200} step={10} value={bcOpts.height} onChange={setBO('height')} suffix=" px" />
              <label className="flex items-center gap-2 cursor-pointer" style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={bcOpts.showText} onChange={setBO('showText')} />
                Show value text
              </label>
            </>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={mode === 'qr' ? generateQR : generateBarcode}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#6c63ff] to-[#574fd6] hover:opacity-90 transition-opacity mt-2"
          >
            ⚡ Generate {mode === 'qr' ? 'QR Code' : 'Barcode'}
          </button>
        </div>

        {/* ── Preview ── */}
        <div className="bg-[#1a1a2e] border border-[#2e2e4a] rounded-2xl p-6 flex flex-col">
          <p className="text-xs font-bold text-[#9090b0] uppercase tracking-widest mb-4">Preview</p>

          {/* Hidden SVG for barcode rendering */}
          <svg ref={svgRef} className="hidden" />

          <div className={`flex-1 flex items-center justify-center rounded-xl min-h-[260px] transition-colors ${previewURL ? 'bg-white' : 'bg-[#242438] border-2 border-dashed border-[#2e2e4a]'}`}>
            {previewURL ? (
              <img src={previewURL} alt="Generated code" className="max-w-full max-h-72 object-contain p-4" />
            ) : (
              <div className="text-center text-[#9090b0]">
                <p className="text-5xl mb-3 opacity-30">⬛</p>
                <p className="text-sm">Press Generate to preview</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={download}
              disabled={!previewURL}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#242438] text-[#9090b0] hover:text-white hover:bg-[#2e2e4a] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ⬇ Download PNG
            </button>
            <button
              onClick={saveCode}
              disabled={!previewURL || saving || saved}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed ${
                saved
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-[#6c63ff]/20 text-[#6c63ff] border border-[#6c63ff]/30 hover:bg-[#6c63ff] hover:text-white disabled:opacity-30'
              }`}
            >
              {saved ? '✓ Saved to dashboard' : saving ? 'Saving…' : '💾 Save to account'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
