import { useState } from 'react';
import { Select } from 'antd';
import { LikeOutlined } from '@ant-design/icons';

const ratingDistribution = [
  { stars: 5, pct: 75 },
  { stars: 4, pct: 18 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 },
];

const sentimentTags = [
  'High Quality (450)', 'Great Service (312)', 'Prompt (198)',
];

const reviews = [
  {
    id: 1, initials: 'JS', name: 'Julianne Smith', role: 'Event Director @ Grand Horizon',
    rating: 5, date: 'October 24, 2023', helpfulCount: 24,
    comment: '"The level of professionalism displayed by the EventHub360 concierge team was nothing short of exceptional. Every detail for our luxury gala was handled with surgical precision. Their vendor marketplace made sourcing the floral arrangements a breeze. Truly a premium experience."',
    avatarBg: 'var(--secondary-fixed)', avatarColor: 'var(--primary)',
    vendorResponse: null,
  },
  {
    id: 2, initials: 'MR', name: 'Marcus Reed', role: 'Founder, Reed Enterprises',
    rating: 4, date: 'October 22, 2023', helpfulCount: 8,
    comment: '"Great platform for managing high-volume requests. The real-time updates saved us hours of back-and-forth communication. Minor latency issue during the weekend peak, but otherwise, the service is flawless."',
    avatarBg: 'var(--tertiary-fixed)', avatarColor: 'var(--tertiary-container)',
    vendorResponse: 'Thank you for the feedback, Marcus! We\'ve already implemented a server upgrade to handle peak weekend traffic more efficiently.',
  },
  {
    id: 3, initials: 'EV', name: 'Eleanor Vance', role: 'Chief Operations Officer',
    rating: 5, date: 'October 20, 2023', helpfulCount: 31,
    comment: '"As a partner who manages international events, having a unified dashboard for all ratings and reviews is vital. EventHub360 provides the transparency and data density I need to make informed decisions for my high-net-worth clients."',
    avatarBg: 'var(--surface-container)', avatarColor: 'var(--secondary)',
    vendorResponse: null,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', color: 'var(--primary)' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="material-symbols-outlined" style={{
          fontSize: 18,
          fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0",
        }}>star</span>
      ))}
    </div>
  );
}

export default function RatingsReviews() {
  const [activeTab, setActiveTab] = useState('recent');

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 4 }}>Ratings & Reviews</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>Real-time feedback from your event clients and partners.</p>
        </div>

        {/* Overall Rating Card */}
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid var(--surface-container-highest)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Overall Rating</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)' }}>4.8</span>
              <span style={{ fontSize: 14, color: 'var(--secondary)' }}>/ 5.0</span>
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: 'var(--surface-container-highest)' }} />
          <div>
            <StarRating rating={5} />
            <p style={{ fontSize: 12, color: 'var(--tertiary)', fontWeight: 600, marginTop: 4 }}>Based on 1,248 reviews</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Analytics Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Rating Distribution */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-low)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Rating Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ratingDistribution.map((r) => (
                <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)', width: 28, flexShrink: 0 }}>{r.stars}★</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--surface-container)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.pct}%`, background: 'var(--primary)', borderRadius: 9999, transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface)', width: 32, flexShrink: 0, textAlign: 'right' }}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment */}
          <div style={{ background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 160 }}>auto_awesome</span>
            </div>
            <div style={{ position: 'relative' }}>
              <h3 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Review Sentiment</h3>
              <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 20, lineHeight: '20px' }}>
                Clients frequently mention "Efficiency" and "Premium Quality" in their latest feedback.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sentimentTags.map((tag) => (
                  <span key={tag} style={{
                    padding: '4px 12px', background: 'rgba(255,255,255,0.2)',
                    borderRadius: 9999, fontSize: 12, fontWeight: 600, backdropFilter: 'blur(8px)',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filter Bar */}
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid var(--surface-container-low)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 24 }}>
              {['recent', 'top', 'critical'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'Manrope',
                    color: activeTab === tab ? 'var(--primary)' : 'var(--secondary)',
                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                    paddingBottom: 4,
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'recent' ? 'Recent Reviews' : tab === 'top' ? 'Top Rated' : 'Critical'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--secondary)' }}>Sort by:</span>
              <Select
                defaultValue="newest" size="small"
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'high', label: 'High to Low' },
                ]}
                style={{ width: 130 }}
              />
            </div>
          </div>

          {/* Review Cards */}
          {reviews.map((review) => (
            <div key={review.id} style={{
              background: '#fff', padding: 24, borderRadius: 12,
              boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container-low)',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(133,18,23,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--surface-container-low)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: review.avatarBg, color: review.avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 16,
                  }}>{review.initials}</div>
                  <div>
                    <h4 style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{review.name}</h4>
                    <p style={{ fontSize: 12, color: 'var(--secondary)' }}>{review.role}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StarRating rating={review.rating} />
                  <p style={{ fontSize: 12, color: 'var(--secondary)', fontStyle: 'italic', marginTop: 4 }}>{review.date}</p>
                </div>
              </div>

              <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginBottom: 16, lineHeight: '26px' }}>
                {review.comment}
              </p>

              {review.vendorResponse && (
                <div style={{ padding: 16, background: 'var(--surface-container-low)', borderRadius: 8, marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>reply</span>
                    Vendor Response:
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>"{review.vendorResponse}"</p>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--surface-container-low)', paddingTop: 16, display: 'flex', gap: 20 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--secondary)')}
                >
                  <LikeOutlined style={{ fontSize: 16 }} />
                  Helpful ({review.helpfulCount})
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--secondary)')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>reply</span>
                  Reply
                </button>
              </div>
            </div>
          ))}

          {/* Load More */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <button style={{
              padding: '12px 32px', background: 'var(--surface-container)',
              border: 'none', borderRadius: 9999, fontWeight: 600, fontSize: 12,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-high)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-container)')}
            >
              View More Reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
