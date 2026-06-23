import { useState } from 'react';
import { Button, message } from 'antd';

interface EventAllocation {
  id: string;
  eventName: string;
  eventType: string;
  date: string;
  venue: string;
  client: string;
  clientInitials: string;
  services: string[];
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  pax: number;
  value: string;
}

const events: EventAllocation[] = [
  {
    id: 'EV-2024-041', eventName: 'Grand Horizon Annual Gala', eventType: 'Corporate Gala',
    date: 'Nov 12, 2024', venue: 'The Ritz Carlton, Bangalore',
    client: 'Julianne Smith', clientInitials: 'JS',
    services: ['Catering', 'Decoration', 'AV Setup'],
    status: 'Upcoming', pax: 350, value: '₹4,80,000',
  },
  {
    id: 'EV-2024-038', eventName: 'Royal Wedding – Sharma–Kapoor', eventType: 'Wedding',
    date: 'Nov 05, 2024', venue: 'Leela Palace, Delhi',
    client: 'Marcus Reed', clientInitials: 'MR',
    services: ['Catering', 'Floral Decoration', 'Photography'],
    status: 'In Progress', pax: 600, value: '₹9,20,000',
  },
  {
    id: 'EV-2024-033', eventName: 'Summit 360 – Tech Leaders Meet', eventType: 'Conference',
    date: 'Oct 28, 2024', venue: 'JW Marriott, Mumbai',
    client: 'Eleanor Vance', clientInitials: 'EV',
    services: ['Catering', 'AV Setup'],
    status: 'Completed', pax: 200, value: '₹1,85,000',
  },
  {
    id: 'EV-2024-029', eventName: 'Elite Fashion Week – Finale', eventType: 'Fashion Event',
    date: 'Oct 18, 2024', venue: 'Taj Mahal Palace, Mumbai',
    client: 'Diana Moore', clientInitials: 'DM',
    services: ['Decoration', 'DJ & Lighting'],
    status: 'Completed', pax: 450, value: '₹3,10,000',
  },
  {
    id: 'EV-2024-025', eventName: 'Amara Hotel Series – Q4 Launch', eventType: 'Product Launch',
    date: 'Oct 09, 2024', venue: 'Conrad Hotel, Pune',
    client: 'Robert Chen', clientInitials: 'RC',
    services: ['Catering', 'AV Setup', 'Decoration'],
    status: 'Cancelled', pax: 150, value: '₹1,20,000',
  },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  'Upcoming':    { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  'In Progress': { bg: '#fefce8', color: '#d97706', dot: '#fbbf24' },
  'Completed':   { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  'Cancelled':   { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE['Upcoming'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 12, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}

export default function EventAllocations() {
  const [filter, setFilter] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<EventAllocation | null>(null);

  const FILTERS = ['All', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'];
  const filtered = filter === 'All' ? events : events.filter(e => e.status === filter);

  const statCounts = {
    Upcoming: events.filter(e => e.status === 'Upcoming').length,
    'In Progress': events.filter(e => e.status === 'In Progress').length,
    Completed: events.filter(e => e.status === 'Completed').length,
    Cancelled: events.filter(e => e.status === 'Cancelled').length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, paddingBottom: 16, borderBottom: '2px solid rgba(133,18,23,0.1)' }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 6 }}>Event Allocations</h1>
          <p style={{ fontSize: 15, color: 'var(--on-surface-variant)' }}>Track all events your services are allocated to, from upcoming bookings to completed deliveries.</p>
        </div>
        <Button type="primary" style={{ background: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 8, height: 44, fontWeight: 600, padding: '0 24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: 'middle' }}>download</span>
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Upcoming', value: statCounts.Upcoming, icon: 'event_upcoming', iconBg: '#eff6ff', iconColor: '#2563eb' },
          { label: 'In Progress', value: statCounts['In Progress'], icon: 'pending_actions', iconBg: '#fefce8', iconColor: '#d97706' },
          { label: 'Completed', value: statCounts.Completed, icon: 'task_alt', iconBg: '#f0fdf4', iconColor: '#15803d' },
          { label: 'Cancelled', value: statCounts.Cancelled, icon: 'cancel', iconBg: '#fef2f2', iconColor: '#dc2626' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--surface-container-lowest)', padding: 20, borderRadius: 12,
            boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Manrope', color: 'var(--on-surface)' }}>{stat.value}</p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: stat.iconColor, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: '4px', background: 'var(--surface-container-low)', borderRadius: 10, width: 'fit-content' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: filter === f ? '#fff' : 'transparent',
            color: filter === f ? 'var(--primary)' : 'var(--secondary)',
            fontWeight: filter === f ? 700 : 500, fontSize: 13,
            boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s',
          }}>{f}</button>
        ))}
      </div>

      {/* Event Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((event) => (
          <div key={event.id}
            onClick={() => setSelectedEvent(event)}
            style={{
              background: 'var(--surface-container-lowest)', borderRadius: 12,
              boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)',
              padding: 24, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(133,18,23,0.25)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--surface-container)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 20, flex: 1 }}>
                {/* Client Avatar */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--secondary-container)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0, fontFamily: 'Manrope' }}>
                  {event.clientInitials}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)' }}>{event.eventName}</h3>
                    <span style={{ padding: '2px 10px', borderRadius: 99, background: 'var(--surface-container)', color: 'var(--secondary)', fontSize: 11, fontWeight: 700 }}>{event.eventType}</span>
                    <StatusBadge status={event.status} />
                  </div>

                  <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                    {[
                      { icon: 'person', text: event.client },
                      { icon: 'calendar_today', text: event.date },
                      { icon: 'location_on', text: event.venue },
                      { icon: 'group', text: `${event.pax} pax` },
                    ].map(({ icon, text }) => (
                      <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--secondary)', fontSize: 13 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{icon}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {event.services.map(s => (
                      <span key={s} style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(133,18,23,0.07)', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', marginBottom: 2 }}>CONTRACT VALUE</p>
                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Manrope', color: 'var(--primary)' }}>{event.value}</p>
                <p style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 2 }}>{event.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setSelectedEvent(null)}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 32 }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h2 style={{ fontFamily: 'Manrope', fontSize: 22, fontWeight: 700 }}>{selectedEvent.eventName}</h2>
                  <StatusBadge status={selectedEvent.status} />
                </div>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{selectedEvent.id} · {selectedEvent.eventType}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Client Name', value: selectedEvent.client },
                { label: 'Event Date', value: selectedEvent.date },
                { label: 'Venue', value: selectedEvent.venue },
                { label: 'Guest Count', value: `${selectedEvent.pax} pax` },
                { label: 'Contract Value', value: selectedEvent.value },
                { label: 'Event Type', value: selectedEvent.eventType },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: 16, background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Allocated Services</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {selectedEvent.services.map(s => (
                  <span key={s} style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(133,18,23,0.08)', color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedEvent(null)} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <button onClick={() => { message.success('Report downloaded'); setSelectedEvent(null); }} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Download Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
