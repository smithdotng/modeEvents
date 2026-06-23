import Link from 'next/link';

const features = [
  { icon: '⬛', title: 'QR Codes', desc: 'Generate QR codes for URLs, text, emails, Wi-Fi, phone numbers, and vCards.' },
  { icon: '▌▌▌', title: 'Barcodes', desc: 'Support for CODE128, EAN-13, UPC-A, CODE39, ITF-14 and more.' },
  { icon: '🎨', title: 'Custom Styling', desc: 'Choose colours, size, error correction, and label options.' },
  { icon: '💾', title: 'Save History', desc: 'Every code you generate is saved to your personal dashboard.' },
  { icon: '⬇️', title: 'Export', desc: 'Download as PNG or SVG, or copy directly to clipboard.' },
  { icon: '🔒', title: 'Private', desc: 'Your codes are private and only visible to you.' },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">

      {/* Hero */}
      <div className="text-center mb-24">
        <div className="inline-block px-4 py-1.5 rounded-full border border-[#2e2e4a] text-sm text-[#9090b0] mb-6">
          Free · No ads · Your codes, your data
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          <span className="grad-text">QR & Barcode</span>
          <br />
          <span className="text-white">Generator</span>
        </h1>
        <p className="text-xl text-[#9090b0] max-w-xl mx-auto mb-10">
          Create, customise, and save QR codes and barcodes instantly. Sign up free to keep a personal history of all your codes.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#6c63ff] to-[#574fd6] hover:opacity-90 transition-opacity text-lg"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl font-bold border border-[#2e2e4a] text-[#9090b0] hover:text-white hover:border-[#6c63ff] transition-all text-lg"
          >
            Log in
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-[#1a1a2e] border border-[#2e2e4a] rounded-2xl p-6 hover:border-[#6c63ff] transition-colors"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-bold text-lg text-white mb-2">{f.title}</h3>
            <p className="text-[#9090b0] text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA strip */}
      <div className="mt-24 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#03d6c0] p-px">
        <div className="bg-[#0f0f1a] rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to create your first code?</h2>
          <p className="text-[#9090b0] mb-6">Takes 30 seconds to sign up. No credit card required.</p>
          <Link
            href="/register"
            className="inline-block px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#6c63ff] to-[#574fd6] hover:opacity-90 transition-opacity"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  );
}
