import { useEffect, useState } from 'react';
import { fetchReviews, approveReview, deleteReview, adminUpdateReview, adminCreateReview, type Review } from '../../lib/api';
import { Star, Check, Trash2, Loader2, Plus, Pencil, X, Save } from 'lucide-react';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={18} className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: { customerName: string; rating: number; comment: string; productName: string };
  onSave: (v: { customerName: string; rating: number; comment: string; productName: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  return (
    <div className="bg-gray-50 border border-gray-200 p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Customer Name *</span>
          <input
            value={form.customerName}
            onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
            className="form-input mt-1 w-full"
            placeholder="e.g. Rahul Sharma"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Rating *</span>
          <div className="mt-2"><StarPicker value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} /></div>
        </label>
      </div>
      <label className="block">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Product Name</span>
        <input
          value={form.productName}
          onChange={e => setForm(p => ({ ...p, productName: e.target.value }))}
          className="form-input mt-1 w-full"
          placeholder="e.g. Premium Oversized Hoodie"
        />
      </label>
      <label className="block">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Comment</span>
        <textarea
          rows={3}
          value={form.comment}
          onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
          className="form-input mt-1 w-full resize-none"
          placeholder="Customer's review text…"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.customerName.trim()}
          className="flex items-center gap-2 px-5 py-2 bg-foreground text-background text-[11px] font-semibold tracking-[0.08em] uppercase hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save
        </button>
        <button onClick={onCancel} className="text-[11px] text-muted-foreground hover:text-foreground underline">Cancel</button>
      </div>
    </div>
  );
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    try {
      const params: Record<string, string> = {};
      if (filter === 'pending') params.approved = 'false';
      if (filter === 'approved') params.approved = 'true';
      const res = await fetchReviews(params);
      setReviews(res.items);
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, [filter]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try { await approveReview(id); await loadReviews(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to approve'); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    setActionId(id);
    try { await deleteReview(id); await loadReviews(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete'); }
    finally { setActionId(null); }
  };

  const handleEdit = async (v: { customerName: string; rating: number; comment: string; productName: string }) => {
    if (!editId) return;
    setSaving(true);
    try {
      await adminUpdateReview(editId, v);
      setEditId(null);
      await loadReviews();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleCreate = async (v: { customerName: string; rating: number; comment: string; productName: string }) => {
    setSaving(true);
    try {
      await adminCreateReview(v);
      setShowCreate(false);
      await loadReviews();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to create'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Reviews & Ratings</h1>
        <button
          onClick={() => { setShowCreate(true); setEditId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[11px] font-semibold tracking-[0.08em] uppercase hover:opacity-80 transition-opacity"
        >
          <Plus size={13} /> Add Review
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="mb-6">
          <p className="text-[12px] font-semibold mb-2">New Review (auto-approved, shown on homepage)</p>
          <ReviewForm
            initial={{ customerName: '', rating: 5, comment: '', productName: '' }}
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
            saving={saving}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1 mb-4">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
              filter === f
                ? 'bg-foreground text-background'
                : 'bg-white border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground self-center">{reviews.length} reviews</span>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className={`bg-white rounded-lg border border-border p-5 ${!review.isApproved ? 'border-l-4 border-l-amber-400' : ''}`}>
            {editId === review.id ? (
              <ReviewForm
                initial={{ customerName: review.customerName, rating: review.rating, comment: review.comment, productName: review.productName || '' }}
                onSave={handleEdit}
                onCancel={() => setEditId(null)}
                saving={saving}
              />
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.customerName}</span>
                      <span className="text-xs text-muted-foreground">{review.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Product: {review.productName || '—'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditId(review.id); setShowCreate(false); }}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={actionId === review.id}
                        className="p-2 hover:bg-green-50 text-green-600 rounded transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        {actionId === review.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionId === review.id}
                      className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {review.comment && <p className="text-sm text-foreground/80 mt-2">{review.comment}</p>}
                {!review.isApproved && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-100 text-amber-800">
                    Pending Approval
                  </span>
                )}
              </>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="bg-white rounded-lg border border-border p-12 text-center text-muted-foreground">
            No reviews found
          </div>
        )}
      </div>
    </div>
  );
}
