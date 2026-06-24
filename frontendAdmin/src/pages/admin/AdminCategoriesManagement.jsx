import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import Modal from "../../components/Modal";

export default function AdminCategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/vendors/categories', { headers });
      const d = await res.json();
      setCategories(d.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setForm({ name: '', description: '' }); setError(''); setShowCreate(true); };
  const openEdit = (cat) => { setEditTarget(cat); setForm({ name: cat.name, description: cat.description ?? '' }); setError(''); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Category name is required'); return; }
    setSaving(true); setError('');
    try {
      const isEdit = !!editTarget;
      const url = isEdit
        ? `http://localhost:5000/api/v1/vendors/categories/${editTarget.id}`
        : 'http://localhost:5000/api/v1/vendors/categories';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || null }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      if (isEdit) {
        setCategories(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...d.data } : c));
        setEditTarget(null);
      } else {
        setCategories(prev => [...prev, { ...d.data, _count: { vendors: 0 } }]);
        setShowCreate(false);
      }
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setSaving(true); setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/v1/vendors/categories/${id}`, { method: 'DELETE', headers });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      setCategories(prev => prev.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch (e) { setError(e.message); setSaving(false); }
    finally { setSaving(false); }
  };

  const totalVendors = categories.reduce((sum, c) => sum + (c._count?.vendors ?? 0), 0);

  return (
    <AdminLayout searchPlaceholder="Search categories...">
      <div className="admin-page">
        <PageHeader
          title="Categories & Services"
          subtitle="Manage vendor service categories used across the platform."
          actions={<button className="admin-btn admin-btn--primary" onClick={openCreate}>+ New Category</button>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Categories" value={categories.length.toString()} accentColor="#b51b1e" />
          <StatCard label="Total Vendors Assigned" value={totalVendors.toString()} accentColor="#2563eb" />
          <StatCard label="Empty Categories" value={categories.filter(c => (c._count?.vendors ?? 0) === 0).length.toString()} accentColor="#6b7280" />
        </div>

        {loading ? (
          <div className="admin-card" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading categories...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {categories.map(cat => (
              <div key={cat.id} className="admin-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#2563eb' }}>category</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>{cat.name}</p>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
                        {cat._count?.vendors ?? 0} vendor{(cat._count?.vendors ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => openEdit(cat)}
                      style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12, color: '#374151', fontWeight: 600 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setDeleteConfirm(cat); setError(''); }}
                      style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {cat.description && (
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, margin: 0 }}>{cat.description}</p>
                )}
                {/* Vendor count bar */}
                <div>
                  <div style={{ height: 4, borderRadius: 9999, background: '#f3f4f6', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 9999, background: '#2563eb', width: `${totalVendors > 0 ? Math.min(100, ((cat._count?.vendors ?? 0) / totalVendors) * 100) : 0}%`, transition: 'width 0.4s' }} />
                  </div>
                  <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                    {totalVendors > 0 ? `${Math.round(((cat._count?.vendors ?? 0) / totalVendors) * 100)}% of vendor base` : 'No vendors yet'}
                  </p>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, background: '#f9fafb', borderRadius: 14, border: '1px dashed #d1d5db' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#9ca3af', display: 'block', marginBottom: 10 }}>category</span>
                <p style={{ fontWeight: 700, color: '#374151' }}>No categories yet</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>Create your first vendor category to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Create Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Category"
          footer={<>
            <button className="admin-btn admin-btn--outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Creating...' : 'Create Category'}</button>
          </>}
        >
          <CategoryForm form={form} setForm={setForm} error={error} />
        </Modal>

        {/* Edit Modal */}
        <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit: ${editTarget?.name}`}
          footer={<>
            <button className="admin-btn admin-btn--outline" onClick={() => setEditTarget(null)}>Cancel</button>
            <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </>}
        >
          <CategoryForm form={form} setForm={setForm} error={error} />
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Category"
          footer={<>
            <button className="admin-btn admin-btn--outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(deleteConfirm?.id)} disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</button>
          </>}
        >
          <p style={{ fontSize: 13, color: '#374151' }}>
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
            {(deleteConfirm?._count?.vendors ?? 0) > 0 && (
              <span style={{ color: '#dc2626' }}> This category has {deleteConfirm._count.vendors} vendor(s) assigned and cannot be deleted.</span>
            )}
          </p>
          {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{error}</p>}
        </Modal>
      </div>
    </AdminLayout>
  );
}

function CategoryForm({ form, setForm, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <span className="admin-label">Category Name *</span>
        <input className="admin-input" placeholder="e.g. Audio-Visual Equipment" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div>
        <span className="admin-label">Description</span>
        <textarea className="admin-input" rows={3} placeholder="Brief description of services under this category..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: 12 }}>{error}</p>}
    </div>
  );
}
