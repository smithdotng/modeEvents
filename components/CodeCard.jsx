'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function CodeCard({ code, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this code?')) return;
    setDeleting(true);
    await fetch(`/api/codes/${code._id}`, { method: 'DELETE' });
    onDelete(code._id);
  }

  function download() {
    const a = document.createElement('a');
    a.href = code.dataURL;
    a.download = `${code.type}-${code.format}-${Date.now()}.png`;
    a.click();
  }

  const badge = code.type === 'qr'
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

  return (
    <div className="bg-[#1a1a2e] border border-[#2e2e4a] rounded-2xl p-4 flex flex-col gap-3 hover:border-[#6c63ff] transition-colors group">
      {/* Preview */}
      <div className="bg-white rounded-xl flex items-center justify-center p-3 aspect-square overflow-hidden">
        <img
          src={code.dataURL}
          alt={code.label}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Info */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badge}`}>
            {code.type === 'qr' ? 'QR' : code.format}
          </span>
        </div>
        <p className="text-sm text-white font-semibold truncate" title={code.label}>
          {code.label || code.content}
        </p>
        <p className="text-xs text-[#9090b0] mt-0.5 truncate" title={code.content}>
          {code.content}
        </p>
        <p className="text-xs text-[#9090b0] mt-1">
          {new Date(code.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={download}
          className="flex-1 py-2 rounded-lg text-xs font-bold bg-[#242438] text-[#9090b0] hover:text-white hover:bg-[#6c63ff] transition-all"
        >
          Download
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="py-2 px-3 rounded-lg text-xs font-bold bg-[#242438] text-[#9090b0] hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
        >
          {deleting ? '…' : '🗑'}
        </button>
      </div>
    </div>
  );
}
