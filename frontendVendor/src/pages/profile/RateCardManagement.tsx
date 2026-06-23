import { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface RateCard {
  id: number;
  serviceName: string;
  category: string;
  unit: string;
  baseRate: number;
  minQuantity: number;
  currency: string;
  notes: string;
}

const initialRates: RateCard[] = [
  { id: 1, serviceName: 'Catering – Per Head', category: 'Catering', unit: 'per person', baseRate: 2500, minQuantity: 50, currency: '₹', notes: 'Includes 3-course meal, staff, and cleanup.' },
  { id: 2, serviceName: 'Floral Stage Setup', category: 'Decoration', unit: 'per event', baseRate: 85000, minQuantity: 1, currency: '₹', notes: 'Includes installation and removal post-event.' },
  { id: 3, serviceName: 'DJ + Lighting Rig', category: 'Entertainment', unit: 'per night', baseRate: 45000, minQuantity: 1, currency: '₹', notes: '4-hour set. Additional hours billed at ₹8,000/hr.' },
  { id: 4, serviceName: 'AV Equipment – Basic', category: 'AV Equipment', unit: 'per day', baseRate: 22000, minQuantity: 1, currency: '₹', notes: 'Projector, PA system, mic set. Setup included.' },
];

const CATEGORIES = ['Catering', 'Decoration', 'Entertainment', 'Photography', 'AV Equipment', 'Security', 'Transport'];
const UNITS = ['per person', 'per event', 'per day', 'per night', 'per hour', 'per unit', 'flat rate'];

const emptyForm = { serviceName: '', category: 'Catering', unit: 'per event', baseRate: '', minQuantity: '1', notes: '' };

export default function RateCardManagement() {
  const [rates, setRates] = useState<RateCard[]>(initialRates);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RateCard | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (r: RateCard) => {
    setEditing(r);
    setForm({ serviceName: r.serviceName, category: r.category, unit: r.unit, baseRate: String(r.baseRate), minQuantity: String(r.minQuantity), notes: r.notes });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.serviceName.trim() || !form.baseRate) { message.error('Name and rate are required'); return; }
    if (editing) {
      setRates(prev => prev.map(r => r.id === editing.id ? { ...r, ...form, baseRate: Number(form.baseRate), minQuantity: Number(form.minQuantity) } : r));
      message.success('Rate card updated');
    } else {
      setRates(prev => [...prev, { id: Date.now(), ...form, baseRate: Number(form.baseRate), minQuantity: Number(form.minQuantity), currency: '₹' }]);
      message.success('Rate card added');
    }
    setModalOpen(false);
  };

  const doDelete = () => { setRates(prev => prev.filter(r => r.id !== deleteId)); setDeleteId(null); message.success('Rate card removed'); };

  const totalRevenuePotential = rates.reduce((a, r) => a + r.baseRate * r.minQuantity, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, paddingBottom: 16, borderBottom: '2px solid rgba(133,18,23,0.1)' }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 6 }}>Rate Card Management</h1>
          <p style={{ fontSize: 15, color: 'var(--on-surface-variant)' }}>Define pricing for your services. Clients will see these rates when browsing your profile.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}
          style={{ background: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 8, height: 44, fontWeight: 600, padding: '0 24px' }}>
          Add Rate Card
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Rate Cards', value: rates.length, icon: 'credit_card' },
          { label: 'Categories', value: [...new Set(rates.map(r => r.category))].length, icon: 'category' },
          { label: 'Avg. Base Rate', value: `₹${(rates.reduce((a, r) => a + r.baseRate, 0) / rates.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'trending_up' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--surface-container-lowest)', padding: 20, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{stat.label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Manrope', color: 'var(--on-surface)' }}>{stat.value}</p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(133,18,23,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rate Cards Table */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--surface-container)', background: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Manrope', fontSize: 16, fontWeight: 700 }}>Pricing Table</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(133,18,23,0.08)', borderRadius: 99 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>info</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>Min. contract value: ₹{totalRevenuePotential.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)' }}>
              {['Service', 'Category', 'Base Rate', 'Unit', 'Min. Qty', 'Notes', 'Actions'].map((h, i) => (
                <th key={h} style={{ padding: '14px 20px', textAlign: i >= 5 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--surface-container)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '18px 20px', fontWeight: 600, color: 'var(--on-surface)', fontSize: 15 }}>{r.serviceName}</td>
                <td style={{ padding: '18px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 99, background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', fontSize: 12, fontWeight: 700 }}>{r.category}</span>
                </td>
                <td style={{ padding: '18px 20px', fontSize: 18, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Manrope' }}>
                  {r.currency}{r.baseRate.toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--secondary)', fontWeight: 500 }}>{r.unit}</td>
                <td style={{ padding: '18px 20px', fontSize: 14, color: 'var(--on-surface)', fontWeight: 600 }}>{r.minQuantity}</td>
                <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--on-surface-variant)', maxWidth: 220, textAlign: 'right' }}>{r.notes}</td>
                <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => openEdit(r)} style={{ padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-highest)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    ><EditOutlined /></button>
                    <button onClick={() => setDeleteId(r.id)} style={{ padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    ><DeleteOutlined /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info banner */}
      <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'linear-gradient(135deg, #1a1a2e, #851217)', color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>tips_and_updates</span>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 2, fontFamily: 'Manrope' }}>Pro Tip: Competitive Pricing</p>
          <p style={{ fontSize: 13, opacity: 0.8, lineHeight: '20px' }}>Vendors with clearly defined rate cards receive 3× more purchase order inquiries. Keep your pricing current and competitive to maximize event bookings.</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={editing ? 'Edit Rate Card' : 'Add Rate Card'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={save}
        okText={editing ? 'Save Changes' : 'Add Rate Card'}
        okButtonProps={{ style: { background: 'var(--primary)', borderColor: 'var(--primary)' } }}
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 0' }}>
          {[
            { label: 'Service Name', key: 'serviceName', placeholder: 'e.g. Catering – Per Head' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>{label}</label>
              <input value={(form as Record<string, string>)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Category</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none', background: '#fff' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Unit</label>
              <select value={form.unit} onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none', background: '#fff' }}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Base Rate (₹)</label>
              <input type="number" value={form.baseRate} onChange={(e) => setForm(f => ({ ...f, baseRate: e.target.value }))}
                placeholder="0"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Minimum Quantity</label>
              <input type="number" value={form.minQuantity} onChange={(e) => setForm(f => ({ ...f, minQuantity: e.target.value }))}
                placeholder="1"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any inclusions, conditions, or special terms..."
              rows={2}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>
      </Modal>

      <Modal title="Remove Rate Card" open={deleteId !== null} onCancel={() => setDeleteId(null)} onOk={doDelete} okText="Remove" okButtonProps={{ danger: true }}>
        <p>Are you sure you want to delete this rate card?</p>
      </Modal>
    </div>
  );
}
