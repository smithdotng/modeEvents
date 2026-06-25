import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

export const metadata = {
  title: 'Mode Events — Events, made beautifully simple.',
  description: 'Create events, collect free RSVPs, generate personalised avatar cards for your guests, and manage check-ins — all in one place.',
  openGraph: {
    title: 'Mode Events',
    description: 'Create events, collect free RSVPs, generate personalised avatar cards for your guests, and manage check-ins — all in one place.',
    images: [{ url: 'https://www.mode-events.space/logo.png', width: 512, height: 512, alt: 'Mode Events' }],
    type: 'website',
  },
};

async function getFeaturedEvents() {
  try {
    await connectDB();
    const events = await Event.find({ featured: true, status: 'published' })
      .sort({ date: 1 })
      .limit(6)
      .lean();
    const enriched = await Promise.all(
      events.map(async (ev) => {
        const count = await Attendee.countDocuments({ eventId: ev._id });
        return { ...ev, attendeeCount: count };
      })
    );
    return JSON.parse(JSON.stringify(enriched));
  } catch {
    return [];
  }
}

const features = [
  {
    icon: '🎟',
    title: 'Free RSVP Ticketing',
    desc: 'Create events in minutes. Every guest gets a unique ticket code instantly — no payments, no friction.',
    benefit: 'Zero cost to start',
  },
  {
    icon: '📱',
    title: 'QR Check-in Scanner',
    desc: 'Scan QR codes at the door with any phone camera. Guest list updates in real-time as people arrive.',
    benefit: 'Paperless entry',
  },
  {
    icon: '🖼',
    title: 'Personalised Avatar Cards',
    desc: 'Guests upload their photo and receive a custom event card to share. Built-in social buzz for every event.',
    benefit: 'Organic reach',
  },
  {
    icon: '✉️',
    title: 'Email & WhatsApp Broadcast',
    desc: 'Send updates, reminders, or announcements to all your attendees in one click — via email or WhatsApp.',
    benefit: 'Stay connected',
  },
  {
    icon: '🔗',
    title: 'Instant Shareable Link',
    desc: 'Each event gets a unique link and QR code. Share anywhere — guests RSVP without creating an account.',
    benefit: 'No sign-up for guests',
  },
  {
    icon: '📊',
    title: 'Live Attendee Dashboard',
    desc: "See who's coming, who's checked in, search the guest list, and export to CSV — all from one screen.",
    benefit: 'Total visibility',
  },
];

const steps = [
  { n: '01', title: 'Create your event', desc: 'Fill in the details, add a cover image, and optionally set up a personalised avatar frame for guests.' },
  { n: '02', title: 'Share the link', desc: 'Copy your unique event link or QR code. Share on WhatsApp, Instagram, email — wherever your guests are.' },
  { n: '03', title: 'Manage with ease', desc: 'Track RSVPs live, scan guests in at the door, broadcast updates, and export your full attendee list.' },
];

export default async function Home() {
  const featuredEvents = await getFeaturedEvents();

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#1c2410] overflow-hidden">
        {/* Decorative blobs — parallax driven by GSAP via .hero-blob */}
        <div className="hero-blob absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#2a3b19] opacity-40 translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
        <div className="hero-blob absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#3d5a23] opacity-30 -translate-x-1/4 translate-y-1/4 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-36">
          <p className="mil-up text-xs font-bold uppercase tracking-[0.25em] text-[#7a9268] mb-8">
            Event Management Platform
          </p>

          <h1 className="mil-up text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#f2f1eb] leading-[1.05] mb-8 max-w-3xl">
            Your events,{' '}
            <span className="font-light italic text-[#7a9268]">beautifully</span>
            <br />simple.
          </h1>

          <p className="mil-up text-lg text-[#7a9268] max-w-xl leading-relaxed mb-10">
            Create events, collect free RSVPs, generate personalised avatar cards for your guests, and manage check-ins — all in one place.
          </p>

          <div className="mil-up flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[#1c2410] bg-[#dddcd7] hover:bg-white transition-colors text-base"
            >
              Get started free →
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold border border-[#546048] text-[#7a9268] hover:border-[#dddcd7] hover:text-[#dddcd7] transition-all text-base"
            >
              Log in
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mil-up mt-20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#546048] flex items-center justify-center animate-bounce">
              <svg className="w-3.5 h-3.5 text-[#7a9268]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#546048]">Scroll to explore</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES AS BENEFITS ────────────────────────────────────────────── */}
      <section className="bg-[#dddcd7] py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">

          <div className="mb-16">
            <p className="mil-up text-xs font-bold uppercase tracking-[0.25em] text-[#546048] mb-4">
              Everything you need · Nothing you don't
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <h2 className="mil-up text-4xl md:text-5xl font-extrabold text-[#1c2410] leading-tight max-w-lg">
                Built for hosts who{' '}
                <span className="font-light italic text-[#546048]">want more</span>
              </h2>
              <Link
                href="/register"
                className="mil-up inline-flex items-center gap-2 text-sm font-bold text-[#2a3b19] border-b-2 border-[#2a3b19] pb-0.5 hover:opacity-70 transition-opacity self-start md:self-end whitespace-nowrap"
              >
                Start for free →
              </Link>
            </div>
          </div>

          {/* mil-stagger applies staggered GSAP to each child card */}
          <div className="mil-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#c0bfb9] border border-[#c0bfb9] rounded-2xl overflow-hidden">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-[#f2f1eb] hover:bg-[#2a3b19] transition-colors duration-300 p-8 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{f.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#546048] group-hover:text-[#7a9268] bg-[#e8e7e1] group-hover:bg-[#1c2410] px-2.5 py-1 rounded-full transition-colors">
                    {f.benefit}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-[#1c2410] group-hover:text-[#f2f1eb] transition-colors">
                  {f.title}
                </h3>
                <p className="text-[#546048] group-hover:text-[#7a9268] text-sm leading-relaxed transition-colors">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="bg-[#2a3b19] py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="mil-up text-xs font-bold uppercase tracking-[0.25em] text-[#7a9268] mb-4">Simple process</p>
            <h2 className="mil-up text-4xl md:text-5xl font-extrabold text-[#f2f1eb] leading-tight">
              Up and running{' '}
              <span className="font-light italic text-[#7a9268]">in minutes</span>
            </h2>
          </div>

          {/* mil-stagger cascades through the 3 steps */}
          <div className="mil-stagger grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.n} className="border-t border-[#3d5a23] pt-8">
                <p className="text-5xl font-extrabold text-[#3d5a23] mb-6 leading-none">{step.n}</p>
                <h3 className="font-extrabold text-xl text-[#f2f1eb] mb-3">{step.title}</h3>
                <p className="text-[#7a9268] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mil-up mt-14 flex justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[#2a3b19] bg-[#dddcd7] hover:bg-white transition-colors"
            >
              Create your first event →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENTS ─────────────────────────────────────────────────── */}
      {featuredEvents.length > 0 && (
        <section className="bg-[#f2f1eb] py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mil-up mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#546048] mb-4">Happening now</p>
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#1c2410] leading-tight">
                  Featured{' '}
                  <span className="font-light italic text-[#546048]">events</span>
                </h2>
              </div>
            </div>

            <div className="mil-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((ev) => {
                const d = new Date(ev.date);
                const month = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
                const day = d.getDate();
                return (
                  <Link
                    key={ev._id}
                    href={`/e/${ev.uniqueCode}`}
                    className="group block bg-[#dddcd7] border border-[#c0bfb9] rounded-2xl overflow-hidden hover:border-[#2a3b19] hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#2a3b19] relative">
                      {ev.coverImage ? (
                        <img
                          src={ev.coverImage}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#dddcd7]/20 text-8xl font-extrabold">
                            {ev.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-[#f2f1eb] rounded-xl px-3 py-2 text-center min-w-[52px]">
                        <p className="text-[10px] font-bold text-[#546048] uppercase">{month}</p>
                        <p className="text-xl font-extrabold text-[#1c2410] leading-none">{day}</p>
                      </div>
                      <div className="absolute top-3 right-3 bg-[#2a3b19] text-[#dddcd7] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        ⭐ Featured
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-extrabold text-[#1c2410] text-lg leading-tight mb-2 group-hover:text-[#2a3b19] transition-colors">
                        {ev.title}
                      </h3>
                      {ev.venue && (
                        <p className="text-sm text-[#546048] mb-3">📍 {ev.venue}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#546048]">
                          {ev.attendeeCount} {ev.attendeeCount === 1 ? 'person' : 'people'} going
                        </span>
                        <span className="text-xs font-bold text-[#2a3b19] group-hover:underline">RSVP →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#dddcd7] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mil-stagger grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100%', label: 'Free to use', sub: 'No hidden fees ever' },
              { value: '0s', label: 'Setup time', sub: 'No installs needed' },
              { value: '∞', label: 'Events', sub: 'Create as many as you like' },
              { value: '🎟', label: 'QR tickets', sub: 'Auto-generated for every guest' },
            ].map(s => (
              <div key={s.label} className="space-y-1">
                <p className="text-4xl md:text-5xl font-extrabold text-[#1c2410]">{s.value}</p>
                <p className="font-bold text-[#1c2410] text-sm uppercase tracking-wider">{s.label}</p>
                <p className="text-xs text-[#546048]">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="bg-[#dddcd7] pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mil-up bg-[#1c2410] rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden">
            <div className="hero-blob absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a3b19] opacity-50 translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#7a9268] mb-6">Get started today</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#f2f1eb] mb-4 leading-tight">
                Ready to host your{' '}
                <span className="font-light italic text-[#7a9268]">next event?</span>
              </h2>
              <p className="text-[#7a9268] mb-10 text-lg max-w-lg mx-auto">
                Free to use. No credit card required. Your first event takes less than 2 minutes to set up.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[#1c2410] bg-[#dddcd7] hover:bg-white transition-colors text-base"
                >
                  Create free account →
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold border border-[#546048] text-[#7a9268] hover:border-[#dddcd7] hover:text-[#dddcd7] transition-all text-base"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#1c2410] text-[#7a9268]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mil-stagger grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Mode Events" className="h-10 w-auto mix-blend-lighten" />
              </div>
              <p className="text-sm leading-relaxed">
                Events, made beautifully simple. Create, share, and manage events — all for free.
              </p>
            </div>
            <div>
              <h6 className="text-xs font-bold uppercase tracking-widest text-[#dddcd7] mb-5">Platform</h6>
              <ul className="space-y-3 text-sm">
                <li><Link href="/register" className="hover:text-[#dddcd7] transition-colors">Get started free</Link></li>
                <li><Link href="/login" className="hover:text-[#dddcd7] transition-colors">Log in</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#dddcd7] transition-colors">Dashboard</Link></li>
                <li><Link href="/events/create" className="hover:text-[#dddcd7] transition-colors">Create event</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="text-xs font-bold uppercase tracking-widest text-[#dddcd7] mb-5">Features</h6>
              <ul className="space-y-3 text-sm">
                <li>🎟 QR Ticket Passes</li>
                <li>📷 Camera Check-in</li>
                <li>🖼 Avatar Cards</li>
                <li>✉️ Broadcast Messaging</li>
              </ul>
            </div>
          </div>
          <div className="mil-up border-t border-[#2a3b19] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} Mode Events. All rights reserved.</p>
            <p>Built with care for event hosts everywhere.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
