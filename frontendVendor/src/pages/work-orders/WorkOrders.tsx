import { Button } from 'antd';
import { FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';

const columns = [
  {
    id: 'todo',
    label: 'To Do',
    dot: '#bdc7d8',
    count: 3,
    cards: [
      {
        id: '#WO-2901', title: 'Stage Setup', category: 'Stage', categoryBg: 'rgba(85,95,109,0.1)', categoryColor: 'var(--on-secondary-container)',
        time: '14 Oct, 10:00 AM', status: 'New', statusColor: 'var(--error)', hasLine: false, progress: null,
        avatars: [null, '+2'],
      },
      {
        id: '#WO-2905', title: 'VIP Entrance Decor', category: 'Floral', categoryBg: 'rgba(0,77,51,0.1)', categoryColor: 'var(--tertiary)',
        time: '14 Oct, 11:30 AM', status: 'Pending', statusColor: 'var(--error)', hasLine: false, progress: null,
        avatars: [null],
      },
    ],
  },
  {
    id: 'inprogress',
    label: 'In Progress',
    dot: 'var(--tertiary)',
    count: 1,
    cards: [
      {
        id: '#WO-2892', title: 'Sound Check', category: 'Audio', categoryBg: 'rgba(85,95,109,0.1)', categoryColor: 'var(--on-secondary-container)',
        time: '14 Oct, 02:00 PM', status: 'Active', statusColor: 'var(--tertiary)', hasLine: true, progress: 65,
        avatars: [null], assignee: 'Marc L.',
      },
    ],
  },
  {
    id: 'completed',
    label: 'Completed',
    dot: 'var(--secondary)',
    count: 2,
    cards: [
      {
        id: '#WO-2880', title: 'Lighting Rigging', category: 'Lighting', categoryBg: 'var(--surface-container-highest)', categoryColor: 'var(--secondary)',
        time: 'Completed 09:15 AM', status: 'Completed', statusColor: 'var(--tertiary)', hasLine: false, progress: null,
        avatars: [null], completed: true,
      },
      {
        id: '#WO-2875', title: 'Main Hall Catering Prep', category: 'F&B', categoryBg: 'var(--surface-container-highest)', categoryColor: 'var(--secondary)',
        time: 'Completed 08:30 AM', status: 'Completed', statusColor: 'var(--tertiary)', hasLine: false, progress: null,
        avatars: [null], completed: true,
      },
    ],
  },
];

export default function WorkOrders() {
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-background)', marginBottom: 6 }}>
            Active Work Orders
          </h2>
          <p style={{ fontSize: 16, color: 'var(--secondary)' }}>Manage and track on-site operational tasks for current events.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<FilterOutlined />} style={{ background: '#fff', border: '1px solid var(--outline-variant)', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            Filter
          </Button>
          <Button icon={<SortAscendingOutlined />} style={{ background: '#fff', border: '1px solid var(--outline-variant)', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            Sort
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {columns.map((col) => (
          <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Column Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: col.dot, display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{col.label}</span>
                <span style={{
                  background: 'var(--surface-container-high)', borderRadius: 4,
                  padding: '1px 6px', fontSize: 10, fontWeight: 700, color: 'var(--secondary)',
                }}>{col.count}</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_horiz</span>
              </button>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {col.cards.map((card: any) => (
                <div key={card.id}
                  style={{
                    background: card.completed ? 'rgba(255,255,255,0.7)' : '#fff',
                    padding: 24, borderRadius: 12,
                    boxShadow: card.completed ? '0 1px 4px rgba(0,0,0,0.04)' : 'var(--card-shadow)',
                    border: card.hasLine ? `4px solid ${card.statusColor}` : '1px solid transparent',
                    borderLeft: card.hasLine ? `4px solid ${card.statusColor}` : '1px solid transparent',
                    cursor: 'pointer', opacity: card.completed ? 0.8 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                    if (!card.hasLine) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-fixed)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0px 8px 30px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    if (!card.hasLine) (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = card.completed ? '0 1px 4px rgba(0,0,0,0.04)' : 'var(--card-shadow)';
                  }}
                >
                  {/* Category Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 9999, fontSize: 12,
                        background: card.categoryBg, color: card.categoryColor,
                        textDecoration: card.completed ? 'line-through' : 'none',
                      }}>{card.category}</span>
                      {card.completed && (
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--tertiary)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--secondary)', opacity: 0 }}>open_in_new</span>
                  </div>

                  {/* Title */}
                  <h4 style={{
                    fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 8,
                    color: card.completed ? 'rgba(25,28,29,0.6)' : 'var(--on-surface)',
                    textDecoration: card.completed ? 'line-through' : 'none',
                  }}>{card.title}</h4>

                  {/* Time + Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--secondary)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {card.completed ? 'done_all' : 'schedule'}
                      </span>
                      <span style={{ fontSize: 14, opacity: card.completed ? 0.6 : 1 }}>{card.time}</span>
                    </div>
                    {!card.completed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: card.statusColor, animation: card.status === 'Active' ? 'pulse 2s infinite' : 'none', display: 'inline-block' }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: card.statusColor }}>Status: {card.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar (In Progress only) */}
                  {card.progress !== null && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ width: '100%', height: 6, background: 'var(--surface-container)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ width: `${card.progress}%`, height: '100%', background: 'var(--tertiary)', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ borderTop: `1px solid ${card.completed ? 'rgba(237,238,239,0.5)' : 'var(--surface-container)'}`, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Avatar placeholder */}
                      <div style={{ display: 'flex' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700, filter: card.completed ? 'grayscale(1)' : 'none' }}>
                          {card.assignee ? card.assignee.charAt(0) : 'V'}
                        </div>
                      </div>
                      {card.assignee && <span style={{ fontSize: 14, fontWeight: 500 }}>{card.assignee}</span>}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)', background: 'var(--surface-container)', padding: '4px 8px', borderRadius: 4 }}>
                      ID: {card.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
