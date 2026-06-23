'use client';
import Link from 'next/link';

export default function EventCard({ event, onDelete }) {
  const date = new Date(event.date);
  const isPast = date < new Date();

  const statusColor = {
    published: 'text-green-400 bg-green-500/10 border-green-500/20',
    draft: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
  }[event.status] || '';

  async function handleDelete() {
    if (!confirm(`Delete "${event.title}"? This also removes all attendees.`)) return;
    await fetch(`/api/events/${event._id}`, { method: 'DELETE' });
    onDelete(event._id);
  }

  return (
    <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl overflow-hidden hover:border-[#2a3b19] transition-colors flex flex-col">
      {/* Cover image — square */}
      <div className="aspect-square relative flex-shrink-0">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2a3b19] to-[#3d5a23] flex items-center justify-center">
            <span className="text-[#dddcd7]/40 text-6xl font-extrabold tracking-tighter select-none">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full border ${statusColor}`}>
          {event.status}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-[#1c2410] text-base leading-tight line-clamp-2">{event.title}</h3>

        <div className="text-xs text-[#546048] space-y-1">
          <p>📅 {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          {event.venue && <p>📍 {event.venue}</p>}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-mono bg-[#e8e7e1] text-[#2a3b19] px-2 py-1 rounded-lg border border-[#c0bfb9] flex-1 truncate">
            {event.uniqueCode}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/e/${event.uniqueCode}`)}
            className="text-xs text-[#546048] hover:text-[#2a3b19] px-2 py-1 rounded-lg border border-[#c0bfb9] hover:border-[#2a3b19] transition-all whitespace-nowrap"
          >
            Copy link
          </button>
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/events/${event._id}`}
            className="flex-1 text-center py-2 rounded-lg text-xs font-bold bg-[#e8e7e1] text-[#546048] hover:text-white hover:bg-[#2a3b19] transition-all"
          >
            Manage
          </Link>
          <Link
            href={`/e/${event.uniqueCode}`}
            target="_blank"
            className="py-2 px-3 rounded-lg text-xs font-bold bg-[#e8e7e1] text-[#546048] hover:text-[#2a3b19] transition-all border border-[#c0bfb9]"
          >
            View
          </Link>
          <button
            onClick={handleDelete}
            className="py-2 px-3 rounded-lg text-xs font-bold bg-[#e8e7e1] text-[#546048] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
