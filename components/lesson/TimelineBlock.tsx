type TimelineEvent = { date?: string; title?: string; description?: string };

export type TimelineValue = { title?: string; events?: TimelineEvent[] };

export default function TimelineBlock({ value }: { value: TimelineValue }) {
  const events = value.events ?? [];

  return (
    <div className="my-6">
      {value.title && <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide mb-4">{value.title}</p>}
      <div className="flex flex-col">
        {events.map((event, i) => (
          <div key={i} className="relative pl-8 pb-8 last:pb-0">
            {i < events.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-px bg-hairline" />}
            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-forest border-2 border-panel shadow-[0_0_0_1px_#DFD9C8]" />
            <div className="font-mono text-[11px] text-gold-text tracking-widest uppercase mb-1">{event.date}</div>
            <div className="text-[15px] font-bold text-ink mb-1">{event.title}</div>
            {event.description && <p className="text-[14px] text-ink-dim leading-relaxed">{event.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
