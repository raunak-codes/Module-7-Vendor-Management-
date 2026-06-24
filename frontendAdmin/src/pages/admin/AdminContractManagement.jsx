import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const STATUS_COLOR = { DRAFT: '#6b7280', ACTIVE: '#16a34a', EXPIRED: '#d97706', TERMINATED: '#dc2626' };
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—';

const BLANK_FORM = { vendorId: '', title: '', startDate: '', endDate: '', notes: '', documentUrl: '', slas: [] };
const BLANK_SLA = { metric: '', target: '', penaltyPct: '' };

export default function AdminContractManagement() {
  const [contracts, setContracts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [slaForm, setSlaForm] = useState(BLANK_SLA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [terminateModal, setTerminateModal] = useState(null);
  const [terminateReason, setTerminateReason] = useState('');

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, vRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/contracts?limit=100', { headers }),
        fetch('http://localhost:5000/api/v1/vendors?limit=200', { headers }),
      ]);
      const [cData, vData] = await Promise.all([cRes.json(), vRes.json()]);
      setContracts(cData.data?.contracts ?? cData.data ?? []);
      setVendors(vData.data?.items ?? vData.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = statusFilter === 'ALL' ? contracts : contracts.filter(c => c.status === statusFilter);

  const openDetail = (row) => { setSelected(row); setError(''); };

  const handleCreate = async () => {
    if (!form.vendorId || !form.title || !form.startDate || !form.endDate) {
      setError('Vendor, title, start and end date are required.'); return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/v1/contracts', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slas: form.slas.filter(s => s.metric) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to create contract');
      setContracts(prev => [d.data, ...prev]);
      setShowCreate(false); setForm(BLANK_FORM);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleActivate = async (id) => {
    setSaving(true); setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/v1/contracts/${id}/activate`, { method: 'PATCH', headers });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'ACTIVE', signedAt: d.data.signedAt } : c));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'ACTIVE' }));
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleTerminate = async () => {
    if (!terminateModal) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/v1/contracts/${terminateModal}/terminate`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: terminateReason }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      setContracts(prev => prev.map(c => c.id === terminateModal ? { ...c, status: 'TERMINATED' } : c));
      setTerminateModal(null); setTerminateReason('');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleAddSla = async () => {
    if (!slaForm.metric || !slaForm.target) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/contracts/${selected.id}/slas`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(slaForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      setSelected(prev => ({ ...prev, slas: [...(prev.slas ?? []), d.data] }));
      setContracts(prev => prev.map(c => c.id === selected.id ? { ...c, slas: [...(c.slas ?? []), d.data] } : c));
      setSlaForm(BLANK_SLA);
    } catch (e) { setError(e.message); }
  };

  const handleDeleteSla = async (slaId) => {
    try {
      await fetch(`http://localhost:5000/api/v1/contracts/slas/${slaId}`, { method: 'DELETE', headers });
      setSelected(prev => ({ ...prev, slas: prev.slas.filter(s => s.id !== slaId) }));
      setContracts(prev => prev.map(c => c.id === selected.id ? { ...c, slas: c.slas?.filter(s => s.id !== slaId) } : c));
    } catch (e) { setError(e.message); }
  };

  const addSlaToForm = () => setForm(prev => ({ ...prev, slas: [...prev.slas, { metric: '', target: '', penaltyPct: '' }] }));
  const updateFormSla = (i, field, val) => setForm(prev => ({ ...prev, slas: prev.slas.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));
  const removeFormSla = (i) => setForm(prev => ({ ...prev, slas: prev.slas.filter((_, idx) => idx !== i) }));

  const daysLeft = (endDate) => {
    const d = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return d;
  };

  const columns = [
    { key: 'title', header: 'Contract Title', render: r => <strong style={{ fontSize: 13 }}>{r.title}</strong> },
    { key: 'vendor', header: 'Vendor', render: r => r.vendor?.businessName ?? '—' },
    { key: 'status', header: 'Status', render: r => (
      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: STATUS_COLOR[r.status] + '22', color: STATUS_COLOR[r.status] }}>{r.status}</span>
    )},
    { key: 'period', header: 'Period', render: r => `${fmt(r.startDate)} → ${fmt(r.endDate)}` },
    { key: 'slas', header: 'SLAs', render: r => <span style={{ fontSize: 12, color: '#6b7280' }}>{r.slas?.length ?? 0} terms</span> },
    { key: 'expiry', header: 'Expires In', render: r => {
      if (r.status !== 'ACTIVE') return '—';
      const d = daysLeft(r.endDate);
      const color = d <= 7 ? '#dc2626' : d <= 30 ? '#d97706' : '#16a34a';
      return <span style={{ fontSize: 12, fontWeight: 700, color }}>{d > 0 ? `${d}d` : 'Expired'}</span>;
    }},
  ];

  return (
    <AdminLayout searchPlaceholder="Search contracts...">
      <div className="admin-page">
        <PageHeader
          title="Contract Management"
          subtitle="Manage vendor contracts, SLA terms, and lifecycle."
          actions={<button className="admin-btn admin-btn--primary" onClick={() => { setShowCreate(true); setForm(BLANK_FORM); setError(''); }}>+ New Contract</button>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          <StatCard label="Total Contracts" value={contracts.length.toString()} accentColor="#b51b1e" />
          <StatCard label="Active" value={contracts.filter(c => c.status === 'ACTIVE').length.toString()} accentColor="#16a34a" />
          <StatCard label="Draft" value={contracts.filter(c => c.status === 'DRAFT').length.toString()} accentColor="#6b7280" />
          <StatCard label="Expiring Soon" value={contracts.filter(c => c.status === 'ACTIVE' && daysLeft(c.endDate) <= 30 && daysLeft(c.endDate) > 0).length.toString()} accentColor="#d97706" />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['ALL', 'DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: '6px 14px', borderRadius: 9999, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: statusFilter === s ? '2px solid var(--admin-primary)' : '1px solid var(--admin-outline-variant)', background: statusFilter === s ? 'var(--admin-primary)' : 'transparent', color: statusFilter === s ? '#fff' : 'var(--admin-secondary)' }}>
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>

        <div className="admin-card">
          {loading ? <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Loading contracts...</div>
            : <DataTable columns={columns} data={filtered} onRowClick={openDetail} />}
          {!loading && filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No contracts found.</div>}
        </div>

        {/* Create Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Contract" size="lg"
          footer={<>
            <button className="admin-btn admin-btn--outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="admin-btn admin-btn--primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Contract'}</button>
          </>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <span className="admin-label">Vendor *</span>
              <select className="admin-input" value={form.vendorId} onChange={e => setForm(p => ({ ...p, vendorId: e.target.value }))}>
                <option value="">Select vendor...</option>
                {vendors.filter(v => v.status === 'ACTIVE').map(v => (
                  <option key={v.id} value={v.id}>{v.businessName}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="admin-label">Contract Title *</span>
              <input className="admin-input" placeholder="e.g. Audio-Visual Services Agreement FY2026" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <span className="admin-label">Start Date *</span>
                <input type="date" className="admin-input" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <span className="admin-label">End Date *</span>
                <input type="date" className="admin-input" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <span className="admin-label">Document URL (optional)</span>
              <input className="admin-input" placeholder="https://..." value={form.documentUrl} onChange={e => setForm(p => ({ ...p, documentUrl: e.target.value }))} />
            </div>
            <div>
              <span className="admin-label">Notes</span>
              <textarea className="admin-input" rows={2} placeholder="Internal notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>

            {/* SLA rows */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="admin-label" style={{ marginBottom: 0 }}>SLA Terms</span>
                <button type="button" onClick={addSlaToForm} style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add SLA</button>
              </div>
              {form.slas.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: 8, marginBottom: 6 }}>
                  <input className="admin-input" placeholder="Metric (e.g. On-Time Delivery)" value={s.metric} onChange={e => updateFormSla(i, 'metric', e.target.value)} style={{ fontSize: 12 }} />
                  <input className="admin-input" placeholder="Target (e.g. 95%)" value={s.target} onChange={e => updateFormSla(i, 'target', e.target.value)} style={{ fontSize: 12 }} />
                  <input className="admin-input" placeholder="Penalty %" type="number" value={s.penaltyPct} onChange={e => updateFormSla(i, 'penaltyPct', e.target.value)} style={{ fontSize: 12 }} />
                  <button type="button" onClick={() => removeFormSla(i)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, color: '#dc2626', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ))}
              {form.slas.length === 0 && <p style={{ fontSize: 12, color: '#9ca3af' }}>No SLA terms yet. Click "+ Add SLA" to define performance expectations.</p>}
            </div>
            {error && <p style={{ color: '#dc2626', fontSize: 12 }}>{error}</p>}
          </div>
        </Modal>

        {/* Terminate Confirmation Modal */}
        <Modal open={!!terminateModal} onClose={() => { setTerminateModal(null); setTerminateReason(''); }} title="Terminate Contract"
          footer={<>
            <button className="admin-btn admin-btn--outline" onClick={() => setTerminateModal(null)}>Cancel</button>
            <button className="admin-btn admin-btn--danger" onClick={handleTerminate} disabled={saving}>{saving ? 'Terminating...' : 'Terminate'}</button>
          </>}
        >
          <p style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>This will permanently terminate the contract. This action cannot be undone.</p>
          <span className="admin-label">Reason (optional)</span>
          <textarea className="admin-input" rows={3} placeholder="Reason for termination..." value={terminateReason} onChange={e => setTerminateReason(e.target.value)} />
          {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{error}</p>}
        </Modal>

        {/* Detail Modal */}
        <Modal open={!!selected} onClose={() => { setSelected(null); setError(''); }} title={selected ? selected.title : ''} size="lg"
          footer={
            selected && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-btn admin-btn--outline" onClick={() => setSelected(null)}>Close</button>
                {selected.status === 'DRAFT' && (
                  <button className="admin-btn admin-btn--primary" onClick={() => handleActivate(selected.id)} disabled={saving}>
                    {saving ? 'Activating...' : 'Activate Contract'}
                  </button>
                )}
                {['DRAFT', 'ACTIVE'].includes(selected.status) && (
                  <button className="admin-btn admin-btn--danger" onClick={() => { setTerminateModal(selected.id); setTerminateReason(''); setSelected(null); }}>
                    Terminate
                  </button>
                )}
              </div>
            )
          }
        >
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Vendor', value: selected.vendor?.businessName ?? '—' },
                  { label: 'Status', value: <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: STATUS_COLOR[selected.status] + '22', color: STATUS_COLOR[selected.status] }}>{selected.status}</span> },
                  { label: 'Signed At', value: fmt(selected.signedAt) },
                  { label: 'Start Date', value: fmt(selected.startDate) },
                  { label: 'End Date', value: fmt(selected.endDate) },
                  { label: 'Days Remaining', value: selected.status === 'ACTIVE' ? `${daysLeft(selected.endDate)}d` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: 12, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>{label}</p>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Document link */}
              {selected.documentUrl && (
                <div style={{ padding: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#2563eb' }}>attach_file</span>
                  <a href={selected.documentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: 13, fontWeight: 600 }}>View Contract Document</a>
                </div>
              )}

              {/* Notes */}
              {selected.notes && (
                <div>
                  <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>NOTES</p>
                  <p style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap' }}>{selected.notes}</p>
                </div>
              )}

              {/* SLA Table */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>SLA Terms ({selected.slas?.length ?? 0})</p>
                {selected.slas?.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#374151' }}>Metric</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#374151' }}>Target</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#374151' }}>Penalty %</th>
                        {!['EXPIRED', 'TERMINATED'].includes(selected.status) && <th style={{ padding: '8px 12px' }}></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.slas.map(sla => (
                        <tr key={sla.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{sla.metric}</td>
                          <td style={{ padding: '8px 12px' }}>{sla.target}</td>
                          <td style={{ padding: '8px 12px' }}>{sla.penaltyPct != null ? `${sla.penaltyPct}%` : '—'}</td>
                          {!['EXPIRED', 'TERMINATED'].includes(selected.status) && (
                            <td style={{ padding: '8px 12px' }}>
                              <button onClick={() => handleDeleteSla(sla.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}>Remove</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ fontSize: 12, color: '#9ca3af' }}>No SLA terms defined.</p>}

                {/* Add SLA inline */}
                {!['EXPIRED', 'TERMINATED'].includes(selected.status) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: 8, marginTop: 10 }}>
                    <input className="admin-input" placeholder="Metric" value={slaForm.metric} onChange={e => setSlaForm(p => ({ ...p, metric: e.target.value }))} style={{ fontSize: 12 }} />
                    <input className="admin-input" placeholder="Target" value={slaForm.target} onChange={e => setSlaForm(p => ({ ...p, target: e.target.value }))} style={{ fontSize: 12 }} />
                    <input className="admin-input" type="number" placeholder="Penalty %" value={slaForm.penaltyPct} onChange={e => setSlaForm(p => ({ ...p, penaltyPct: e.target.value }))} style={{ fontSize: 12 }} />
                    <button onClick={handleAddSla} className="admin-btn admin-btn--primary" style={{ padding: '0 12px', fontSize: 12 }}>Add</button>
                  </div>
                )}
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: 12 }}>{error}</p>}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
