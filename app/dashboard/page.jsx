'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CodeCard from '@/components/CodeCard';

function StatCard({ label, value, color }) {
  return (
    <div className="bg-[#1a1a2e] border border-[#2e2e4a] rounded-2xl p-6">
      <p className="text-sm text-[#9090b0] font-semibold mb-1">{label}</p>
      <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | qr | barcode

  useEffect(() => {
    fetch('/api/codes')
      .then((r) => r.json())
      .then(({ codes }) => { setCodes(codes || []); setLoading(false); });
  }, []);

  function handleDelete(id) {
    setCodes((prev) => prev.filter((c) => c._id !== id));
  }

  const qrCount = codes.filter((c) => c.type === 'qr').length;
  const bcCount = codes.filter((c) => c.type === 'barcode').length;
  const filtered = filter === 'all' ? codes : codes.filter((c) => c.type === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, <span className="grad-text">{session?.user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-[#9090b0] mt-1">Here are all your generated codes.</p>
        </div>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#6c63ff] to-[#574fd6] hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Generate new
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Total codes" value={codes.length} color="text-white" />
        <StatCard label="QR codes" value={qrCount} color="text-purple-400" />
        <StatCard label="Barcodes" value={bcCount} color="text-cyan-400" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'qr', 'barcode'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === f
                ? 'bg-[#6c63ff] text-white'
                : 'bg-[#1a1a2e] border border-[#2e2e4a] text-[#9090b0] hover:text-white'
            }`}
          >
            {f === 'all' ? 'All' : f === 'qr' ? 'QR Codes' : 'Barcodes'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#1a1a2e] border border-[#2e2e4a] rounded-2xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-[#1a1a2e] border border-[#2e2e4a] rounded-2xl">
          <p className="text-5xl mb-4">⬛</p>
          <p className="text-white font-bold text-lg mb-2">No codes yet</p>
          <p className="text-[#9090b0] text-sm mb-6">Generate your first QR code or barcode.</p>
          <Link
            href="/generate"
            className="inline-block px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#6c63ff] to-[#574fd6] hover:opacity-90 transition-opacity"
          >
            Generate now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((code) => (
            <CodeCard key={code._id} code={code} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
