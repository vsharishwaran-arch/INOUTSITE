import { useEffect, useState, type FormEvent } from 'react';
import { fetchCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon, type Coupon } from '../../lib/api';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';

interface CouponForm {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  minOrderAmount: string;
  maxUses: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
}

const emptyForm: CouponForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '0',
  maxUses: '',
  isActive: true,
  startsAt: '',
  expiresAt: '',
};

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadCoupons = async () => {
    try {
      const res = await fetchCoupons();
      setCoupons(res.items);
    } catch {
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCoupons(); }, []);

  const openCreate = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: String(coupon.minOrderAmount),
      maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
      isActive: coupon.isActive,
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
      };
      if (editingCoupon) {
        await adminUpdateCoupon(editingCoupon.id, data);
      } else {
        await adminCreateCoupon(data);
      }
      setShowForm(false);
      await loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await adminDeleteCoupon(id);
      await loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Coupons & Promotions</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-xs font-semibold tracking-wide uppercase rounded hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Coupon list */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#fafafa]">
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Type</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Value</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Min Order</th>
                <th className="text-center px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Usage</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Expires</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className={`hover:bg-[#fafafa] transition-colors ${!coupon.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-mono font-semibold">{coupon.code}</td>
                  <td className="px-4 py-3 capitalize">{coupon.type}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">₹{coupon.minOrderAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(coupon)} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(coupon.id)} className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No coupons. Click "Add Coupon" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => !submitting && setShowForm(false)}>
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold">{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Code</label>
                <input type="text" required value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">
                    Value {form.type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input type="number" step="0.01" min="0" required value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Min Order (₹)</label>
                  <input type="number" step="0.01" min="0" value={form.minOrderAmount}
                    onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Max Uses</label>
                  <input type="number" min="1" value={form.maxUses} placeholder="Unlimited"
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Starts At</label>
                  <input type="datetime-local" value={form.startsAt}
                    onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5">Expires At</label>
                  <input type="datetime-local" value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="accent-foreground"
                />
                Active
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} disabled={submitting}
                  className="flex-1 py-2.5 border border-border text-xs font-medium uppercase tracking-wide rounded hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-foreground text-background text-xs font-semibold uppercase tracking-wide rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
