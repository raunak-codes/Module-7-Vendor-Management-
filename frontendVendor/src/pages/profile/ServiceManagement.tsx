import { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  status: 'Active' | 'Inactive';
  icon: string;
  orderCount: number;
}

const initialServices: Service[] = [
  { id: 1, name: 'Premium Catering Package', category: 'Catering', description: 'Full-service Michelin-star quality dining for up to 500 guests, including setup and staff.', status: 'Active', icon: 'restaurant', orderCount: 24 },
  { id: 2, name: 'Luxury Floral Decoration', category: 'Decoration', description: 'Bespoke floral arrangements and stage design for gala events and corporate functions.', status: 'Active', icon: 'local_florist', orderCount: 18 },
  { id: 3, name: 'AV & Sound System Setup', category: 'AV Equipment', description: 'Professional audio-visual installation and live sound engineering for events up to 1000 pax.', status: 'Inactive', icon: 'speaker', orderCount: 5 },
  { id: 4, name: 'Live DJ Performance', category: 'Entertainment', description: 'International DJ sets, curated playlists, and full lighting rigs for premium nighttime events.', status: 'Active', icon: 'audiotrack', orderCount: 11 },
];

const CATEGORIES = ['Catering', 'Decoration', 'Entertainment', 'Photography', 'AV Equipment', 'Security', 'Transport'];
const ICONS: Record<string, string> = { Catering: 'restaurant', Decoration: 'local_florist', Entertainment: 'audiotrack', Photography: 'photo_camera', 'AV Equipment': 'speaker', Security: 'security', Transport: 'airport_shuttle' };

function StatusBadge({ status }: { status: 'Active' | 'Inactive' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99,
      background: status === 'Active' ? '#f0fdf4' : '#f9fafb',
      color: status === 'Active' ? '#15803d' : '#6b7280',
      fontSize: 12, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: status === 'Active' ? '#22c55e' : '#d1d5db', display: 'inline-block' }} />
      {status}
    </span>
  );
}

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: '', category: 'Catering', description: '' });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openAdd = () => { setEditing(null); setForm({ name: '', category: 'Catering', description: '' }); setModalOpen(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ name: s.name, category: s.category, description: s.description }); setModalOpen(true); };

  const save = () => {
    if (!form.name.trim()) { message.error('Service name is required'); return; }
    if (editing) {
      setServices(prev => prev.map(s => s.id === editing.id ? { ...s, ...form, icon: ICONS[form.category] || 'miscellaneous_services' } : s));
      message.success('Service updated');
    } else {
      const newService: Service = { id: Date.now(), ...form, status: 'Active', icon: ICONS[form.category] || 'miscellaneous_services', orderCount: 0 };
      setServices(prev => [...prev, newService]);
      message.success('Service added');
    }
    setModalOpen(false);
  };

  const toggleStatus = (id: number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
  };

  const confirmDelete = (id: number) => { setDeleteId(id); };
  const doDelete = () => { setServices(prev => prev.filter(s => s.id !== deleteId)); setDeleteId(null); message.success('Service removed'); };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, paddingBottom: 16, borderBottom: '2px solid rgba(133,18,23,0.1)' }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)', marginBottom: 6 }}>Service Management</h1>
          <p style={{ fontSize: 15, color: 'var(--on-surface-variant)' }}>Configure and manage the services your business offers to event clients.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}
          style={{ background: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 8, height: 44, fontWeight: 600, padding: '0 24px' }}>
          Add New Service
        </Button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Services', value: services.length, icon: 'room_service', color: 'var(--primary)' },
          { label: 'Active Services', value: services.filter(s => s.status === 'Active').length, icon: 'check_circle', color: '#15803d' },
          { label: 'Total Orders', value: services.reduce((a, s) => a + s.orderCount, 0), icon: 'shopping_cart', color: '#2563eb' },
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

      {/* Service Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {services.map((s) => (
          <div key={s.id} style={{
            background: 'var(--surface-container-lowest)', borderRadius: 12, boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--surface-container)', padding: 24,
            display: 'flex', alignItems: 'center', gap: 24,
            transition: 'border-color 0.2s',
            opacity: s.status === 'Inactive' ? 0.7 : 1,
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(133,18,23,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--surface-container)')}
          >
            {/* Icon */}
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(133,18,23,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Manrope', color: 'var(--on-surface)' }}>{s.name}</h3>
                <span style={{ padding: '2px 10px', borderRadius: 99, background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', fontSize: 11, fontWeight: 700 }}>{s.category}</span>
                <StatusBadge status={s.status} />
              </div>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: '20px', marginBottom: 8 }}>{s.description}</p>
              <p style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>shopping_cart</span>
                {s.orderCount} orders fulfilled
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => toggleStatus(s.id)} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid var(--outline-variant)',
                background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                color: s.status === 'Active' ? '#d97706' : '#15803d',
              }}>
                {s.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => openEdit(s)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              ><EditOutlined /></button>
              <button onClick={() => confirmDelete(s.id)} style={{ padding: 10, borderRadius: 8, border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              ><DeleteOutlined /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={editing ? 'Edit Service' : 'Add New Service'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={save}
        okText={editing ? 'Save Changes' : 'Add Service'}
        okButtonProps={{ style: { background: 'var(--primary)', borderColor: 'var(--primary)' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 0' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 6 }}>Service Name</label>
            <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Premium Catering Package"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 6 }}>Category</label>
            <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none', background: '#fff' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--secondary)', marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this service includes..."
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 8, fontSize: 14, fontFamily: 'Hanken Grotesk', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        title="Remove Service"
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onOk={doDelete}
        okText="Yes, Remove"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to remove this service? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
