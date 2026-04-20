import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import {
  updateContentSection,
  uploadContentImageFile,
  deleteContentImageFile,
} from '../../lib/api';
import { resolveAssetUrl } from '../../lib/api';
import { useHomepageContent } from '../../context/HomepageContentContext';
import type { HeroSlide, UspItem, CategoryItem } from '../../context/HomepageContentContext';
import {
  Megaphone, LayoutDashboard, Flame, Image as ImageIcon, Grid,
  Plus, Trash2, Save, Upload, Loader2, CheckCircle, AlertCircle,
  GripVertical, ChevronDown, ChevronUp,
} from 'lucide-react';

type Tab = 'hero' | 'announcement' | 'usp' | 'offer' | 'categories';

const TABS: { id: Tab; label: string; icon: typeof Megaphone }[] = [
  { id: 'hero', label: 'Hero Slides', icon: ImageIcon },
  { id: 'categories', label: 'Category Cards', icon: Grid },
  { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
  { id: 'usp', label: 'Trust Bar', icon: LayoutDashboard },
  { id: 'offer', label: 'Offer Banner', icon: Flame },
];

const USP_ICONS = ['Truck', 'RefreshCw', 'ShieldCheck', 'Package', 'Star', 'Heart', 'Award', 'Zap'];

// ── Small helpers ─────────────────────────────────────────────────────────

function StatusMsg({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <div className={`flex items-center gap-2 text-[12px] font-medium ${ok ? 'text-green-600' : 'text-red-600'}`}>
      {ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  );
}

function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-[11px] font-semibold tracking-[0.08em] uppercase hover:opacity-80 disabled:opacity-50 transition-opacity"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      Save Changes
    </button>
  );
}

// ── Hero Slides Tab ───────────────────────────────────────────────────────

const emptySlide = (): HeroSlide => ({
  badge: '',
  title: ['', ''],
  description: '',
  cta: 'Shop Now',
  ctaLink: '/shop',
  image: '',
  saveBadge: '',
  saveSub: '',
});

function HeroTab() {
  const { content, refresh } = useHomepageContent();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editSlide, setEditSlide] = useState<HeroSlide>(emptySlide());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSlides(JSON.parse(JSON.stringify(content.hero.slides)));
  }, [content.hero.slides]);

  function openAdd() {
    setEditIdx(-1); // -1 = new
    setEditSlide(emptySlide());
    setImageFile(null);
    setImagePreview(null);
    setStatus(null);
  }

  function openEdit(i: number) {
    setEditIdx(i);
    setEditSlide({ ...slides[i], title: [...slides[i].title] });
    setImageFile(null);
    setImagePreview(resolveAssetUrl(slides[i].image));
    setStatus(null);
  }

  function closeForm() {
    setEditIdx(null);
    setImageFile(null);
    setImagePreview(null);
    setStatus(null);
  }

  function onImageChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  }

  async function saveSlide() {
    if (!editSlide.badge || !editSlide.title[0] || !editSlide.cta) {
      setStatus({ ok: false, msg: 'Badge, first title line and CTA are required.' });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      let imagePath = editSlide.image;

      // Upload new image if selected
      if (imageFile) {
        setUploading(true);
        const res = await uploadContentImageFile(imageFile);
        imagePath = res.path;
        setUploading(false);
      }

      const updated = { ...editSlide, image: imagePath };
      const newSlides = [...slides];
      if (editIdx === -1) {
        newSlides.push(updated);
      } else if (editIdx !== null) {
        newSlides[editIdx] = updated;
      }

      await updateContentSection('hero', { slides: JSON.stringify(newSlides) });
      setSlides(newSlides);
      await refresh();
      setStatus({ ok: true, msg: 'Slide saved!' });
      closeForm();
    } catch (e: any) {
      setStatus({ ok: false, msg: e.message || 'Failed to save' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function deleteSlide(i: number) {
    if (!confirm('Delete this slide?')) return;
    const newSlides = slides.filter((_, idx) => idx !== i);
    try {
      await updateContentSection('hero', { slides: JSON.stringify(newSlides) });
      setSlides(newSlides);
      await refresh();
    } catch { /* ignore */ }
  }

  function moveSlide(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    setSlides(next);
  }

  async function saveOrder() {
    setSaving(true);
    try {
      await updateContentSection('hero', { slides: JSON.stringify(slides) });
      await refresh();
      setStatus({ ok: true, msg: 'Order saved!' });
    } catch (e: any) {
      setStatus({ ok: false, msg: e.message || 'Failed' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Slide list */}
      <div className="space-y-3">
        {slides.map((s, i) => (
          <div key={i} className="flex items-center gap-4 bg-white border border-gray-100 p-3 shadow-sm">
            {s.image && (
              <img
                src={resolveAssetUrl(s.image)}
                alt={s.title[0]}
                className="w-20 h-14 object-cover shrink-0 bg-gray-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {!s.image && (
              <div className="w-20 h-14 bg-gray-100 flex items-center justify-center shrink-0">
                <ImageIcon size={18} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate">{s.title.join(' ')}</p>
              <p className="text-[11px] text-muted-foreground truncate">{s.badge}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronUp size={14} /></button>
              <button onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronDown size={14} /></button>
              <button onClick={() => openEdit(i)} className="px-3 py-1.5 text-[11px] font-medium border border-gray-200 hover:bg-gray-50 transition-colors">Edit</button>
              <button onClick={() => deleteSlide(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 border border-foreground text-[11px] font-semibold tracking-[0.08em] uppercase hover:bg-foreground hover:text-background transition-all"
        >
          <Plus size={13} /> Add Slide
        </button>
        {slides.length > 1 && <SaveBtn loading={saving} onClick={saveOrder} />}
        {status && <StatusMsg {...status} />}
      </div>

      {/* Edit / Add form */}
      {editIdx !== null && (
        <div className="border border-gray-200 bg-gray-50 p-6 space-y-5">
          <h3 className="text-[13px] font-semibold">{editIdx === -1 ? 'New Slide' : 'Edit Slide'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="label-text">Badge *</span>
              <input value={editSlide.badge} onChange={e => setEditSlide(p => ({ ...p, badge: e.target.value }))} placeholder="e.g. 🔥 HOT RIGHT NOW" className="form-input mt-1" />
            </label>
            <label className="block">
              <span className="label-text">CTA Button Text *</span>
              <input value={editSlide.cta} onChange={e => setEditSlide(p => ({ ...p, cta: e.target.value }))} placeholder="Shop Now" className="form-input mt-1" />
            </label>
            <label className="block">
              <span className="label-text">Title Line 1 *</span>
              <input value={editSlide.title[0]} onChange={e => setEditSlide(p => ({ ...p, title: [e.target.value, p.title[1]] }))} placeholder="First line of heading" className="form-input mt-1" />
            </label>
            <label className="block">
              <span className="label-text">Title Line 2</span>
              <input value={editSlide.title[1] ?? ''} onChange={e => setEditSlide(p => ({ ...p, title: [p.title[0], e.target.value] }))} placeholder="Second line (optional)" className="form-input mt-1" />
            </label>
            <label className="block sm:col-span-2">
              <span className="label-text">Description</span>
              <textarea rows={2} value={editSlide.description} onChange={e => setEditSlide(p => ({ ...p, description: e.target.value }))} className="form-input mt-1 resize-none" />
            </label>
            <label className="block">
              <span className="label-text">CTA Link</span>
              <input value={editSlide.ctaLink} onChange={e => setEditSlide(p => ({ ...p, ctaLink: e.target.value }))} placeholder="/shop" className="form-input mt-1" />
            </label>
            <div />
            <label className="block">
              <span className="label-text">Save Badge (pill)</span>
              <input value={editSlide.saveBadge} onChange={e => setEditSlide(p => ({ ...p, saveBadge: e.target.value }))} placeholder="SAVE 65%" className="form-input mt-1" />
            </label>
            <label className="block">
              <span className="label-text">Save Subtitle</span>
              <input value={editSlide.saveSub} onChange={e => setEditSlide(p => ({ ...p, saveSub: e.target.value }))} placeholder="Limited sizes left" className="form-input mt-1" />
            </label>
          </div>

          {/* Image upload */}
          <div>
            <span className="label-text block mb-2">Slide Image</span>
            <div className="flex items-start gap-4 flex-wrap">
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="w-32 h-20 object-cover border border-gray-200 bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-[11px] font-medium hover:bg-gray-100 transition-colors"
                >
                  <Upload size={13} /> {imagePreview ? 'Replace Image' : 'Upload Image'}
                </button>
                <p className="text-[10px] text-muted-foreground">Or paste a URL below:</p>
                <input
                  value={imageFile ? '' : editSlide.image}
                  onChange={e => { setEditSlide(p => ({ ...p, image: e.target.value })); setImagePreview(e.target.value); setImageFile(null); }}
                  placeholder="https://... or /uploads/content/..."
                  className="form-input w-64"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-2">
            <SaveBtn loading={saving || uploading} onClick={saveSlide} />
            <button onClick={closeForm} className="text-[11px] text-muted-foreground hover:text-foreground underline">Cancel</button>
            {status && <StatusMsg {...status} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Announcement Tab ──────────────────────────────────────────────────────

function AnnouncementTab() {
  const { content, refresh } = useHomepageContent();
  const [items, setItems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    setItems([...content.announcement.items]);
  }, [content.announcement.items]);

  function update(i: number, val: string) {
    setItems(p => p.map((x, idx) => (idx === i ? val : x)));
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const clean = items.filter(x => x.trim());
      await updateContentSection('announcement', { items: JSON.stringify(clean) });
      await refresh();
      setStatus({ ok: true, msg: 'Saved!' });
    } catch (e: any) {
      setStatus({ ok: false, msg: e.message || 'Failed' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-[12px] text-muted-foreground">
        These items scroll in the top announcement bar. One item per row.
      </p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical size={14} className="text-muted-foreground shrink-0" />
            <input
              value={item}
              onChange={e => update(i, e.target.value)}
              className="form-input flex-1"
              placeholder="Announcement text..."
            />
            <button onClick={() => setItems(p => p.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setItems(p => [...p, ''])}
        className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus size={13} /> Add item
      </button>
      <div className="flex items-center gap-3 pt-2">
        <SaveBtn loading={saving} onClick={save} />
        {status && <StatusMsg {...status} />}
      </div>
    </div>
  );
}

// ── USP / Trust Bar Tab ───────────────────────────────────────────────────

function UspTab() {
  const { content, refresh } = useHomepageContent();
  const [items, setItems] = useState<UspItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    setItems(content.usp.items.map(x => ({ ...x })));
  }, [content.usp.items]);

  function update(i: number, field: keyof UspItem, val: string) {
    setItems(p => p.map((x, idx) => idx === i ? { ...x, [field]: val } : x));
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      await updateContentSection('usp', { items: JSON.stringify(items) });
      await refresh();
      setStatus({ ok: true, msg: 'Saved!' });
    } catch (e: any) {
      setStatus({ ok: false, msg: e.message || 'Failed' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-[12px] text-muted-foreground">
        The trust/USP items shown below the hero section.
      </p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[140px_1fr_1fr_32px] gap-3 items-center bg-white border border-gray-100 p-3 shadow-sm">
            <select
              value={item.iconName}
              onChange={e => update(i, 'iconName', e.target.value)}
              className="form-input text-[11px]"
            >
              {USP_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
            <input value={item.label} onChange={e => update(i, 'label', e.target.value)} placeholder="Label" className="form-input" />
            <input value={item.sub} onChange={e => update(i, 'sub', e.target.value)} placeholder="Sub-text" className="form-input" />
            <button onClick={() => setItems(p => p.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 p-1 rounded">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setItems(p => [...p, { iconName: 'Package', label: '', sub: '' }])}
        className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus size={13} /> Add item
      </button>
      <div className="flex items-center gap-3 pt-2">
        <SaveBtn loading={saving} onClick={save} />
        {status && <StatusMsg {...status} />}
      </div>
    </div>
  );
}

// ── Offer Banner Tab ──────────────────────────────────────────────────────

function OfferTab() {
  const { content, refresh } = useHomepageContent();
  const [form, setForm] = useState({ title: '', subtitle: '', endHour: '22', discount: '75' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    setForm({
      title: content.offer.title,
      subtitle: content.offer.subtitle,
      endHour: String(content.offer.endHour),
      discount: content.offer.discount ?? '75',
    });
  }, [content.offer]);

  async function save() {
    const hour = Number(form.endHour);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      setStatus({ ok: false, msg: 'End hour must be 0–23' });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await updateContentSection('offer', {
        title: form.title,
        subtitle: form.subtitle,
        endHour: form.endHour,
        discount: form.discount,
      });
      await refresh();
      setStatus({ ok: true, msg: 'Saved!' });
    } catch (e: any) {
      setStatus({ ok: false, msg: e.message || 'Failed' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-xl">
      <p className="text-[12px] text-muted-foreground">
        Configure the red promotional banner with countdown timer.
      </p>
      <label className="block">
        <span className="label-text">Offer Title</span>
        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Today's Offer — Up to 70% Off" className="form-input mt-1" />
      </label>
      <label className="block">
        <span className="label-text">Subtitle</span>
        <input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Offer ends at 10 PM tonight" className="form-input mt-1" />
      </label>
      <label className="block">
        <span className="label-text">Discount % (shown on banner, e.g. 75)</span>
        <input type="number" min={1} max={99} value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} className="form-input mt-1 w-24" />
        <p className="text-[11px] text-muted-foreground mt-1">Displays as "UPTO XX% OFF" on the banner image</p>
      </label>
      <label className="block">
        <span className="label-text">Countdown End Hour (0–23, 24h format)</span>
        <input type="number" min={0} max={23} value={form.endHour} onChange={e => setForm(p => ({ ...p, endHour: e.target.value }))} className="form-input mt-1 w-24" />
        <p className="text-[11px] text-muted-foreground mt-1">e.g. 22 = 10 PM</p>
      </label>
      <div className="flex items-center gap-3 pt-2">
        <SaveBtn loading={saving} onClick={save} />
        {status && <StatusMsg {...status} />}
      </div>
    </div>
  );
}

// ── Categories Tab ────────────────────────────────────────────────────────

const SLUG_META: Record<string, { name: string }> = {
  tshirt:     { name: 'T-Shirts' },
  shirt:      { name: 'Shirts' },
  hoodies:    { name: 'Hoodies' },
  coord:      { name: 'Co-ord Sets' },
  jeans:      { name: 'Jeans' },
  trackpants: { name: 'Track Pants' },
  shorts:     { name: 'Shorts' },
  trousers:   { name: 'Trousers' },
};

function CategoriesTab() {
  const { content, refresh } = useHomepageContent();
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<CategoryItem>({ slug: '', image: '', count: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(JSON.parse(JSON.stringify(content.categories.items)));
  }, [content.categories.items]);

  function openEdit(item: CategoryItem) {
    setEditSlug(item.slug);
    setEditItem({ ...item });
    setImageFile(null);
    setImagePreview(resolveAssetUrl(item.image));
    setStatus(null);
  }

  function closeForm() {
    setEditSlug(null);
    setImageFile(null);
    setImagePreview(null);
    setStatus(null);
  }

  function onImageChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  async function saveItem() {
    setSaving(true);
    setStatus(null);
    try {
      let imagePath = editItem.image;
      if (imageFile) {
        setUploading(true);
        const res = await uploadContentImageFile(imageFile);
        imagePath = res.path;
        setUploading(false);
      }
      const updated = items.map(it => it.slug === editSlug ? { ...editItem, image: imagePath } : it);
      await updateContentSection('categories', { items: JSON.stringify(updated) });
      setItems(updated);
      await refresh();
      setStatus({ ok: true, msg: 'Saved!' });
      closeForm();
    } catch (e: any) {
      setStatus({ ok: false, msg: e.message || 'Failed to save' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-[12px] text-muted-foreground">Edit the image and style count displayed on each category card on the homepage.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.slug} className="border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              {item.image ? (
                <img src={resolveAssetUrl(item.image)} alt={item.slug} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-gray-300" /></div>
              )}
            </div>
            <div className="bg-[#1d1d1f] px-3 py-2">
              <p className="text-white text-[11px] font-semibold">{SLUG_META[item.slug]?.name ?? item.slug}</p>
              <p className="text-white/55 text-[10px]">{item.count}</p>
            </div>
            <div className="p-2">
              <button onClick={() => openEdit(item)} className="w-full py-1.5 text-[11px] font-medium border border-gray-200 hover:bg-gray-50 transition-colors">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editSlug !== null && (
        <div className="border border-gray-200 bg-gray-50 p-6 space-y-5">
          <h3 className="text-[13px] font-semibold">Edit — {SLUG_META[editSlug]?.name ?? editSlug}</h3>
          <label className="block">
            <span className="label-text">Style Count Label</span>
            <input value={editItem.count} onChange={e => setEditItem(p => ({ ...p, count: e.target.value }))} placeholder="30+ Styles" className="form-input mt-1" />
          </label>
          <div>
            <span className="label-text block mb-2">Category Image</span>
            <div className="flex items-start gap-4 flex-wrap">
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover border border-gray-200 bg-gray-100" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-[11px] font-medium hover:bg-gray-100 transition-colors">
                  <Upload size={13} /> {imagePreview ? 'Replace Image' : 'Upload Image'}
                </button>
                <p className="text-[10px] text-muted-foreground">Or paste a URL:</p>
                <input
                  value={imageFile ? '' : editItem.image}
                  onChange={e => { setEditItem(p => ({ ...p, image: e.target.value })); setImagePreview(e.target.value); setImageFile(null); }}
                  placeholder="https://... or /uploads/content/..."
                  className="form-input w-72"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap pt-2">
            <SaveBtn loading={saving || uploading} onClick={saveItem} />
            <button onClick={closeForm} className="text-[11px] text-muted-foreground hover:text-foreground underline">Cancel</button>
            {status && <StatusMsg {...status} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export function AdminHomepage() {
  const [tab, setTab] = useState<Tab>('hero');

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Homepage Content</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Edit homepage sections live — changes reflect immediately on the storefront.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-[12px] font-medium tracking-[0.04em] whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'hero' && <HeroTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'announcement' && <AnnouncementTab />}
        {tab === 'usp' && <UspTab />}
        {tab === 'offer' && <OfferTab />}
      </div>
    </div>
  );
}
