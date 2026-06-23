import Link from 'next/link';

const features = [
  { icon: '🎟', title: 'Free RSVP Ticketing', desc: 'Create events and collect RSVPs instantly. Every guest gets a unique ticket code.' },
  { icon: '🖼', title: 'Avatar Cards', desc: 'Guests upload their photo and get a personalised event card to share on social media.' },
  { icon: '🔗', title: 'Shareable Event Link', desc: 'Each event gets a unique code and link. Share it anywhere — no app required for guests.' },
  { icon: '⬛', title: 'QR & Barcodes', desc: 'Generate QR codes for URLs, Wi-Fi, vCards, emails and barcodes in a dozen formats.' },
  { icon: '✅', title: 'Check-in Management', desc: 'Mark attendees as checked in from your dashboard. Export the guest list as CSV.' },
  { icon: '🔒', title: 'Private Dashboard', desc: 'Your events, codes and attendees are private — only you can see them.' },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">

      {/* Hero */}
      <div className="text-center mb-24">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Mode Events" className="h-40 w-auto" />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-5 text-[#1c2410]">
          Events, made <span className="grad-text">beautifully</span> simple.
        </h1>
        <p className="text-xl text-[#546048] max-w-2xl mx-auto mb-10 leading-relaxed">
          Create events, collect free RSVPs, generate personalised avatar cards for your guests, and manage check-ins — all in one place.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity text-lg"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl font-bold border border-[#c0bfb9] text-[#546048] hover:text-[#2a3b19] hover:border-[#2a3b19] transition-all text-lg"
          >
            Log in
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-6 hover:border-[#2a3b19] transition-colors"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-bold text-lg text-[#1c2410] mb-2">{f.title}</h3>
            <p className="text-[#546048] text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-3xl overflow-hidden bg-[#2a3b19]">
        <div className="px-10 py-14 text-center flex flex-col items-center gap-6">
          <img src="/logo.png" alt="Mode Events" className="h-16 w-auto" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#dddcd7] mb-2">Ready to host your next event?</h2>
            <p className="text-[#7a9268] mb-6">Free to use. No credit card required.</p>
            <Link
              href="/register"
              className="inline-block px-8 py-3.5 rounded-xl font-bold text-[#2a3b19] bg-[#dddcd7] hover:opacity-90 transition-opacity"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
