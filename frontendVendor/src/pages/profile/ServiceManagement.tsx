import { useState, useEffect } from 'react';
import { Button, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Service {
  id: string;
  name: string;
  description?: string;
  rate?: number;
  currency?: string;
}

const CATEGORIES = ['Catering', 'Decoration', 'Entertainment', 'Photography', 'AV Equipment', 'Security', 'Transport'];
const ICONS: Record<string, string> = { Catering: 'restaurant', Decoration: 'local_florist', Entertainment: 'audiotrack', Photography: 'photo_camera', 'AV Equipment': 'speaker', Security: 'security', Transport: 'airport_shuttle' };

function getIcon(name: string) {
  const key = CATEGORIES.find(c => name.toLowerCase().includes(c.toLowerCase()));
  return key ? ICONS[key] : 'miscellaneous_services';
}

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: '', description: '', rate: '', currency: 'INR' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/vendors/me/services', { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setServices(d.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', rate: '', currency: 'INR' }); setModalOpen(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ name: s.name, description: s.description ?? '', rate: s.rate ? String(s.rate) : '', currency: s.currency ?? 'INR' }); setModalOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { message.error('Service name is required'); return; }
    const body = { name: form.name, description: form.description || undefined, rate: form.rate ? Number(form.rate) : undefined, currency: form.currency };
    try {
      if (editing) {
        const res = await fetch(`http://localhost:5000/api/v1/vendors/me/services/${editing.id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const d = await res.json();
        setServices(prev => prev.map(s => s.id === editing.id ? d.data : s));
        message.success('Service updated');
      } else {
        const res = await fetch('http://localhost:5000/api/v1/vendors/me/services', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const d = await res.json();
        setServices(prev => [...prev, d.data]);
        message.success('Service added');
      }
      setModalOpen(false);
    } catch { message.error('Failed to save service'); }
  };

  const doDelete = async () => {
    try {
      await fetch(`http://localhost:5000/api/v1/vendors/me/services/${deleteId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setServices(prev => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
      message.success('Service removed');
    } catch { message.error('Failed to delete service'); }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading services...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, paddingBottom: 16, borderBottom: '2px solid rgba(133,18,23,0.1)' }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 6 }}>Service Management</h1>
          <p style={{ fontSize: 15, color: 'var(--on-surface-variant)' }}>Configure and manage the services your business offers to event clients.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ background: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 8, height: 44, fontWeight: 600, padding: '0 24px' }}>
          Add New Service
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Services', value: services.length, icon: 'room_service', color: 'var(--primary)' },
          { label: 'With Pricing', value: services.filter(s => s.rate).length, icon: 'price_check', color: '#15803d' },
          { label: 'Categories', value: new Set(services.map(s => s.currency)).size, icon: 'category', color: '#2563eb' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--surface-container-lowest)', padding: 20, borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Manrope', color: 'var(--on-surface)' }}>{stat.value}</p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(133,18,23,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>room_service</span>
          <p style={{ fontWeight: 600 }}>No services yet</p>
          <p style={{ fontSize: 14, marginTop: 4 }}>Add your first service to start receiving orders.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {services.map((s) => (
          <div key={s.id} style={{ background: 'var(--surface-container-lowest)', borderRadius: 12, boxShadow: 'var(--card-shadow)', border: '1px solid var(--surface-container)', padding: 24, display: 'flex', alignItems: 'center', gap: 24, transition: 'border-color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(133,18,23,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--surface-container)')}
          >
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(133,18,23,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>{getIcon(s.name)}</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 4 }}>{s.name}</h3>
              {s.description && <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 8 }}>{s.description}</p>}
              {s.rate && <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{s.currency ?? 'INR'} {parseFloat(String(s.rate)).toLocaleString('en-IN')}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => openEdit(s)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'none', cursor: 'pointer', color: 'var(--secondary)' }}><EditOutlined /></button>
              <button onClick={() => setDeleteId(s.id)} style={{ padding: 10, borderRadius: 8, border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', color: '#dc2626' }}><DeleteOutlined /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal title={editing ? 'Edit Service' : 'Add New Service'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={save} okText={editing ? 'Save Changes' : 'Add Service'} okButtonProps={{ style: { background: 'var(--primary)', borderColor: 'var(--primary)' } }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 0' }}>
          {[{ label: 'Service Name *', key: 'name', placeholder: 'e.g. Premium Catering Package' }, { label: 'Description', key: 'description', placeholder: 'What does this service include?' }].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 6 }}>{label}</label>
              <input value={(form as any)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 6 }}>Base Rate</label>
              <input type="number" value={form.rate} onChange={(e) => setForm(f => ({ ...f, rate: e.target.value }))} placeholder="0"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 6 }}>Currency</label>
              <select value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}>
                {['INR', 'USD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <Modal title="Remove Service" open={deleteId !== null} onCancel={() => setDeleteId(null)} onOk={doDelete} okText="Yes, Remove" okButtonProps={{ danger: true }}>
        <p>Are you sure you want to remove this service? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
