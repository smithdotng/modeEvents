'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import EventCard from '@/components/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(({ events }) => { setEvents(events || []); setLoading(false); });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1c2410]">My Events</h1>
          <p className="text-[#546048] mt-1">Create and manage your events.</p>
        </div>
        <Link
          href="/events/create"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create event
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl">
          <p className="text-5xl mb-4">🎟</p>
          <p className="text-[#1c2410] font-bold text-lg mb-2">No events yet</p>
          <p className="text-[#546048] text-sm mb-6">Create your first event and start collecting RSVPs.</p>
          <Link
            href="/events/create"
            className="inline-block px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#2a3b19] to-[#1e2d12] hover:opacity-90 transition-opacity"
          >
            Create event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => (
            <EventCard
              key={ev._id}
              event={ev}
              onDelete={id => setEvents(prev => prev.filter(e => e._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
