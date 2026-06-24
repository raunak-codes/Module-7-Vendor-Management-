import { useState, useEffect } from 'react';
import { Button, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface RateCard {
  id: string;
  name: string;
  description?: string;
  rate: number;
  currency: string;
}

const UNITS = ['per person', 'per event', 'per day', 'per night', 'per hour', 'per unit', 'flat rate'];
const emptyForm = { name: '', description: '', rate: '', currency: 'INR' };

export default function RateCardManagement() {
  const [rates, setRates] = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RateCard | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/vendors/me/services', { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setRates((d.data ?? []).filter((s: any) => s.rate));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (r: RateCard) => { setEditing(r); setForm({ name: r.name, description: r.description ?? '', rate: String(r.rate), currency: r.currency }); setModalOpen(true); };

  const save = async () => {
    if (!form.name.trim() || !form.rate) { message.error('Name and rate are required'); return; }
    const body = { name: form.name, description: form.description || undefined, rate: Number(form.rate), currency: form.currency };
    try {
      if (editing) {
        const res = await fetch(`http://localhost:5000/api/v1/vendors/me/services/${editing.id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const d = await res.json();
        setRates(prev => prev.map(r => r.id === editing.id ? d.data : r));
        message.success('Rate card updated');
      } else {
        const res = await fetch('http://localhost:5000/api/v1/vendors/me/services', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const d = await res.json();
        if (d.data?.rate) setRates(prev => [...prev, d.data]);
        message.success('Rate card added');
      }
      setModalOpen(false);
    } catch { message.error('Failed to save rate card'); }
  };

  const doDelete = async () => {
    try {
      await fetch(`http://localhost:5000/api/v1/vendors/me/services/${deleteId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setRates(prev => prev.filter(r => r.id !== deleteId));
      setDeleteId(null);
      message.success('Rate card removed');
    } catch { message.error('Failed to delete rate card'); }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading rate cards...</div>;

  const avgRate = rates.length ? rates.reduce((a, r) => a + r.rate, 0) / rates.length : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, paddingBottom: 16, borderBottom: '2px solid rgba(133,18,23,0.1)' }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 6 }}>Rate Card Management</h1>
          <p style={{ fontSize: 15, color: 'var(--on-surface-variant)' }}>Define pricing for your services. Clients will see these rates when browsing your profile.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ background: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 8, height: 44, fontWeight: 600, padding: '0 24px' }}>
          Add Rate Card
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Rate Cards', value: rates.length, icon: 'credit_card' },
          { label: 'Currencies', value: [...new Set(rates.map(r => r.currency))].length, icon: 'category' },
          { label: 'Avg. Base Rate', value: rates.length ? `₹${Math.round(avgRate).toLocaleString('en-IN')}` : '—', icon: 'trending_up' },
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

      {rates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>credit_card</span>
          <p style={{ fontWeight: 600 }}>No rate cards yet</p>
          <p style={{ fontSize: 14, marginTop: 4 }}>Add pricing for your services to attract more clients.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--surface-container)', background: 'var(--surface-container-low)' }}>
            <h3 style={{ fontFamily: 'Manrope', fontSize: 16, fontWeight: 700 }}>Pricing Table</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)' }}>
                {['Service', 'Base Rate', 'Currency', 'Notes', 'Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: i >= 3 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--surface-container)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '18px 20px', fontWeight: 600, color: 'var(--on-surface)', fontSize: 15 }}>{r.name}</td>
                  <td style={{ padding: '18px 20px', fontSize: 18, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Manrope' }}>{r.currency} {r.rate.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '18px 20px' }}><span style={{ padding: '3px 10px', borderRadius: 99, background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', fontSize: 12, fontWeight: 700 }}>{r.currency}</span></td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: 'var(--on-surface-variant)', textAlign: 'right', maxWidth: 220 }}>{r.description}</td>
                  <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(r)} style={{ padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--secondary)' }}><EditOutlined /></button>
                      <button onClick={() => setDeleteId(r.id)} style={{ padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}><DeleteOutlined /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal title={editing ? 'Edit Rate Card' : 'Add Rate Card'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={save} okText={editing ? 'Save Changes' : 'Add Rate Card'} okButtonProps={{ style: { background: 'var(--primary)', borderColor: 'var(--primary)' } }} width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 0' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Service Name *</label>
            <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Catering – Per Head"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Base Rate *</label>
              <input type="number" value={form.rate} onChange={(e) => setForm(f => ({ ...f, rate: e.target.value }))} placeholder="0"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Currency</label>
              <select value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}>
                {['INR', 'USD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Notes</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Any inclusions, conditions, or special terms..." rows={2}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>
      </Modal>

      <Modal title="Remove Rate Card" open={deleteId !== null} onCancel={() => setDeleteId(null)} onOk={doDelete} okText="Remove" okButtonProps={{ danger: true }}>
        <p>Are you sure you want to delete this rate card?</p>
      </Modal>
    </div>
  );
}
