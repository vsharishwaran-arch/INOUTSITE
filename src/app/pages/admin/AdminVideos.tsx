import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  adminFetchVideos,
  adminCreateVideo,
  adminUpdateVideo,
  adminDeleteVideo,
  adminUploadVideo,
  type ShoppableVideo,
} from '../../lib/api';
import { Plus, Pencil, Trash2, X, Loader2, Video, Upload } from 'lucide-react';

const SIZES_OPTIONS = ['S', 'M', 'L', 'XL'] as const;

function isUploadedVideoUrl(url: string) {
  return url.startsWith('/uploads/videos/') || /res\.cloudinary\.com/i.test(url);
}

interface VideoForm {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  overlayText: string;
  price: string;
  discountPrice: string;
  sizes: string[];
  productLink: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: VideoForm = {
  title: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  overlayText: 'Comment "7"',
  price: '',
  discountPrice: '',
  sizes: ['S', 'M', 'L', 'XL'],
  productLink: '',
  sortOrder: '0',
  isActive: true,
};

export function AdminVideos() {
  const [videos, setVideos] = useState<ShoppableVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ShoppableVideo | null>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const { url } = await adminUploadVideo(file);
      setForm(p => ({ ...p, videoUrl: url }));
    } catch (err: any) {
      setUploadErr(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      // Reset so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function load() {
    setLoading(true);
    try {
      const items = await adminFetchVideos();
      setVideos(items);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  }

  function openEdit(v: ShoppableVideo) {
    setEditing(v);
    setForm({
      title: v.title,
      description: v.description,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
      overlayText: v.overlayText,
      price: v.price != null ? String(v.price) : '',
      discountPrice: v.discountPrice != null ? String(v.discountPrice) : '',
      sizes: v.sizes,
      productLink: v.productLink,
      sortOrder: String(v.sortOrder),
      isActive: v.isActive,
    });
    setShowForm(true);
    setError('');
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setError('');
  }

  function toggleSize(size: string) {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.videoUrl.trim()) {
      setError('Please upload a video file.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        videoUrl: form.videoUrl,
        thumbnailUrl: form.thumbnailUrl,
        overlayText: form.overlayText,
        price: form.price ? Number(form.price) : null,
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        sizes: form.sizes,
        productLink: form.productLink,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      if (editing) {
        await adminUpdateVideo(editing.id, payload);
      } else {
        await adminCreateVideo(payload);
      }
      closeForm();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this video?')) return;
    setDeletingId(id);
    try {
      await adminDeleteVideo(id);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Shoppable Videos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the Watch &amp; Shop section on the homepage</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#E31E24] text-white px-4 py-2.5 text-[13px] font-semibold tracking-wide hover:bg-[#c0171c] transition-colors"
        >
          <Plus size={16} /> Add Video
        </button>
      </div>

      {error && !showForm && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      {/* ── Form panel ── */}
      {showForm && (
        <div className="bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#0A0A0A]">
              {editing ? 'Edit Video' : 'Add New Video'}
            </h2>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Summer Casual T-Shirt"
                className="w-full border border-gray-200 px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0A0A0A] transition-colors"
              />
            </div>

            {/* Video upload (file only) */}
            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-1.5">
                Upload Video File <span className="text-red-500">*</span>
              </label>
              
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoFileChange}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 border border-gray-300 px-4 py-2.5 text-[12px] font-semibold text-gray-700 hover:border-[#0A0A0A] hover:text-[#0A0A0A] disabled:opacity-50 transition-colors"
                >
                  {uploading
                    ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                    : <><Upload size={13} /> Choose Video File</>}
                </button>
                {uploading && (
                  <span className="text-[12px] text-gray-500">Please wait — uploading video…</span>
                )}
                {uploadErr && (
                  <span className="text-[12px] text-red-600 font-medium">{uploadErr}</span>
                )}
                {!uploading && form.videoUrl && isUploadedVideoUrl(form.videoUrl) && (
                  <span className="text-[12px] text-green-700 font-semibold">✓ Video uploaded</span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-gray-400">
                Supported formats: MP4, WebM. Max 200 MB. Videos play directly on the website.
              </p>
            </div>

            {/* Thumbnail URL */}
            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-1.5">
                Thumbnail URL
                <span className="ml-2 font-normal normal-case text-gray-400">(optional, used as card cover image)</span>
              </label>
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full border border-gray-200 px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0A0A0A] transition-colors"
              />
              {form.thumbnailUrl && (
                <img
                  src={form.thumbnailUrl}
                  alt="Thumbnail preview"
                  className="mt-2 h-20 w-auto object-cover border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>

            {/* Overlay text */}
            <div>
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-1.5">
                Overlay Text
              </label>
              <input
                type="text"
                value={form.overlayText}
                onChange={e => setForm(p => ({ ...p, overlayText: e.target.value }))}
                placeholder='Comment "7"'
                className="w-full border border-gray-200 px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0A0A0A] transition-colors"
              />
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0A0A0A] transition-colors"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-1.5">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="499"
                className="w-full border border-gray-200 px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0A0A0A] transition-colors"
              />
            </div>

            {/* Discount price */}
            <div>
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-1.5">
                Discount Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discountPrice}
                onChange={e => setForm(p => ({ ...p, discountPrice: e.target.value }))}
                placeholder="299"
                className="w-full border border-gray-200 px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0A0A0A] transition-colors"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Short product description shown in the modal..."
                className="w-full border border-gray-200 px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0A0A0A] transition-colors resize-none"
              />
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-2">
                Available Sizes
              </label>
              <div className="flex gap-2">
                {SIZES_OPTIONS.map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSize(s)}
                    className={`w-10 h-10 text-[12px] font-semibold border-2 transition-colors ${
                      form.sizes.includes(s)
                        ? 'border-[#E31E24] bg-[#E31E24] text-white'
                        : 'border-gray-300 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Product link */}
            <div>
              <label className="block text-[12px] font-semibold tracking-wide text-gray-600 uppercase mb-1.5">
                Product Link
                <span className="ml-2 font-normal normal-case text-gray-400">(e.g. /tshirt or /product/42)</span>
              </label>
              <input
                type="text"
                value={form.productLink}
                onChange={e => setForm(p => ({ ...p, productLink: e.target.value }))}
                placeholder="/tshirt"
                className="w-full border border-gray-200 px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0A0A0A] transition-colors"
              />
            </div>

            {/* Active toggle */}
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 accent-[#E31E24]"
              />
              <label htmlFor="isActive" className="text-[13px] text-gray-700 font-medium cursor-pointer">
                Visible on storefront
              </label>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#0A0A0A] text-white px-6 py-2.5 text-[13px] font-semibold tracking-wide hover:bg-[#333] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {editing ? 'Save Changes' : 'Add Video'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 text-[13px] font-medium text-gray-600 border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Video list ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200">
          <Video size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No videos yet. Add your first shoppable video.</p>
          <button
            onClick={openCreate}
            className="mt-4 text-[12px] font-semibold tracking-wide text-[#E31E24] hover:underline"
          >
            + Add Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {videos.map(video => (
            <div key={video.id} className="group relative">
              {/* Card preview */}
              <div className="relative aspect-[9/16] bg-[#111] overflow-hidden">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video size={32} className="text-gray-600" />
                  </div>
                )}
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* Overlay text */}
                {video.overlayText && (
                  <p
                    className="absolute bottom-10 left-2 right-2 text-[#E31E24] font-black text-[14px] leading-tight"
                    style={{ fontStyle: 'italic', textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
                  >
                    {video.overlayText}
                  </p>
                )}

                {/* Status badge */}
                <div className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 tracking-wide ${
                  video.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {video.isActive ? 'LIVE' : 'HIDDEN'}
                </div>

                {/* Action buttons (hover) */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => openEdit(video)}
                    className="w-9 h-9 bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} className="text-[#0A0A0A]" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    disabled={deletingId === video.id}
                    className="w-9 h-9 bg-[#E31E24] flex items-center justify-center hover:bg-[#c0171c] transition-colors disabled:opacity-60"
                    title="Delete"
                  >
                    {deletingId === video.id
                      ? <Loader2 size={14} className="text-white animate-spin" />
                      : <Trash2 size={14} className="text-white" />
                    }
                  </button>
                </div>
              </div>

              {/* Title below */}
              <p className="mt-1.5 text-[12px] font-medium text-[#0A0A0A] truncate">{video.title}</p>
              {video.price != null && (
                <p className="text-[11px] text-gray-400">
                  {video.discountPrice != null ? (
                    <>
                      <span className="text-[#0A0A0A] font-semibold">₹{video.discountPrice}</span>
                      {' '}
                      <span className="line-through">₹{video.price}</span>
                    </>
                  ) : `₹${video.price}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
