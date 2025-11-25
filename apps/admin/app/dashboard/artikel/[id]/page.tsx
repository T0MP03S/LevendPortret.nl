"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Eye, Settings, FileText } from "lucide-react";
import BlockEditor from "../../../components/blocks/BlockEditor";
import ThumbnailUpload from "../../../components/blocks/ThumbnailUpload";
import CategorySelector from "../../../components/CategorySelector";
import type { Block } from "../../../components/blocks/types";

export default function ArtikelEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [data, setData] = useState<any>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'settings' | 'seo'>('settings');

  const load = async () => {
    setLoading(true); setError(""); setOk("");
    try {
      const res = await fetch(`/api/admin/articles/${params.id}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Kon artikel niet laden");
      setData(json.article);
      // Parse blocks from body
      const body = json.article.body;
      if (Array.isArray(body)) {
        setBlocks(body);
      } else if (body && typeof body === 'object' && body.blocks) {
        setBlocks(body.blocks);
      } else {
        setBlocks([]);
      }
    } catch (e: any) {
      setError(e?.message || "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params.id]);

  const save = async () => {
    try {
      setError(""); setOk(""); setSaving(true);
      const payload: any = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        categoryId: data.categoryId || null,
        status: data.status,
        visibility: data.visibility,
        publishedAt: data.publishedAt,
        thumbnailUrl: data.thumbnailUrl,
        body: blocks, // Save blocks array directly
        tags: data.tags || [],
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        ogImageUrl: data.ogImageUrl || null,
      };
      const res = await fetch(`/api/admin/articles/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Opslaan mislukt');
      setOk('Opgeslagen');
      setTimeout(() => setOk(''), 3000);
    } catch (e: any) {
      setError(e?.message || 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setConfirmVisible(false); setTimeout(() => setConfirmOpen(false), 150); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmOpen]);

  const openConfirm = () => { setConfirmOpen(true); requestAnimationFrame(() => setConfirmVisible(true)); };
  const closeConfirm = () => { setConfirmVisible(false); setTimeout(() => setConfirmOpen(false), 150); };

  const doDelete = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/articles/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Verwijderen mislukt');
      router.push('/dashboard/artikelen');
    } catch (e: any) {
      setError(e?.message || 'Verwijderen mislukt');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) return <div className="flex items-center justify-center min-h-screen text-zinc-500">Laden…</div>;
  if (error && !data) return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-50 -mx-6 -mt-10">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-2 md:py-3">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <a href="/dashboard/artikelen" className="p-1.5 md:p-2 hover:bg-zinc-100 rounded-lg flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </a>
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={data.title || ''}
                onChange={e => setData((d: any) => ({ ...d, title: e.target.value }))}
                placeholder="Artikel titel..."
                className="text-base md:text-xl font-semibold bg-transparent border border-transparent hover:border-zinc-200 focus:border-coral focus:outline-none rounded px-2 py-1 -ml-2 w-full transition-colors"
              />
              <div className="flex items-center gap-2 text-xs text-zinc-500 truncate">
                <span className={`px-2 py-0.5 rounded-full flex-shrink-0 ${data.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : data.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>
                  {data.status}
                </span>
                <span className="truncate">/{data.slug}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {ok && <span className="text-sm text-emerald-600 hidden md:block">{ok}</span>}
            {error && <span className="text-sm text-red-600 hidden md:block">{error}</span>}
            <button onClick={openConfirm} className="p-1.5 md:p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Verwijderen">
              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <a 
              href={data.status === 'PUBLISHED' 
                ? `${process.env.NEXT_PUBLIC_CLUB_URL || 'http://localhost:3001'}/nieuws/${data.slug}`
                : `${process.env.NEXT_PUBLIC_CLUB_URL || 'http://localhost:3001'}/nieuws/preview/${params.id}`
              } 
              target="_blank" 
              className="p-1.5 md:p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg hidden sm:flex" 
              title={data.status === 'PUBLISHED' ? 'Bekijken' : 'Preview (draft)'}
            >
              <Eye className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <button onClick={save} disabled={saving} className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-coral text-white text-sm rounded-lg hover:bg-coral/90 disabled:opacity-50">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{saving ? 'Opslaan...' : 'Opslaan'}</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row bg-white rounded-b-2xl shadow-sm overflow-hidden">
          {/* Editor area */}
          <div className="flex-1 p-3 md:p-6 min-h-[50vh] lg:min-h-[calc(100vh-200px)] overflow-auto order-2 lg:order-1 bg-zinc-50">
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200 bg-white lg:min-h-[calc(100vh-200px)] overflow-auto order-1 lg:order-2">
          <div className="sticky top-0 bg-white border-b border-zinc-200">
            <div className="flex">
              <button
                onClick={() => setSidebarTab('settings')}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${sidebarTab === 'settings' ? 'text-coral border-b-2 border-coral' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                <Settings className="w-4 h-4" />
                Instellingen
              </button>
              <button
                onClick={() => setSidebarTab('seo')}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${sidebarTab === 'seo' ? 'text-coral border-b-2 border-coral' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                <FileText className="w-4 h-4" />
                SEO
              </button>
            </div>
          </div>

          <div className="p-4 space-y-5">
            {sidebarTab === 'settings' && (
              <>
                <ThumbnailUpload
                  value={data.thumbnailUrl}
                  onChange={(url) => setData((d: any) => ({ ...d, thumbnailUrl: url }))}
                />

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={data.slug || ''}
                    onChange={e => {
                      // Auto-convert spaces to dashes and lowercase
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '')
                        .replace(/-+/g, '-');
                      setData((d: any) => ({ ...d, slug }));
                    }}
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-zinc-700">Excerpt</label>
                    {!data.excerpt && (
                      <span className="text-xs text-zinc-400">Auto uit tekst</span>
                    )}
                  </div>
                  {data.excerpt ? (
                    <div className="relative">
                      <textarea
                        value={data.excerpt}
                        onChange={e => setData((d: any) => ({ ...d, excerpt: e.target.value }))}
                        rows={3}
                        className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none"
                        placeholder="Korte samenvatting..."
                      />
                      <button
                        type="button"
                        onClick={() => setData((d: any) => ({ ...d, excerpt: '' }))}
                        className="absolute top-2 right-2 text-xs text-zinc-400 hover:text-zinc-600"
                      >
                        Verwijderen
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setData((d: any) => ({ ...d, excerpt: ' ' }))}
                      className="w-full text-sm border border-dashed border-zinc-300 rounded-lg px-3 py-3 text-zinc-500 hover:border-coral hover:text-coral transition-colors"
                    >
                      + Handmatige excerpt toevoegen
                    </button>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">Laat leeg voor automatische excerpt uit eerste tekstblok</p>
                </div>

                <CategorySelector
                  value={data.categoryId}
                  onChange={(categoryId) => setData((d: any) => ({ ...d, categoryId }))}
                />

                {/* Quick actions */}
                <div className="flex gap-2">
                  {data.status !== 'PUBLISHED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setData((d: any) => ({ 
                          ...d, 
                          status: 'PUBLISHED', 
                          publishedAt: new Date().toISOString() 
                        }));
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Publiceer nu
                    </button>
                  )}
                  {data.status === 'PUBLISHED' && (
                    <button
                      type="button"
                      onClick={() => setData((d: any) => ({ ...d, status: 'DRAFT' }))}
                      className="flex-1 px-3 py-2 text-sm bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors"
                    >
                      Unpublish
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
                    <select
                      value={data.status}
                      onChange={e => {
                        const newStatus = e.target.value;
                        setData((d: any) => ({ 
                          ...d, 
                          status: newStatus,
                          // Auto-set publishedAt when publishing
                          publishedAt: newStatus === 'PUBLISHED' && !d.publishedAt 
                            ? new Date().toISOString() 
                            : d.publishedAt
                        }));
                      }}
                      className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="SCHEDULED">Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Zichtbaarheid</label>
                    <select
                      value={data.visibility}
                      onChange={e => setData((d: any) => ({ ...d, visibility: e.target.value }))}
                      className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="MEMBERS">Members</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    {data.status === 'SCHEDULED' ? 'Inplannen voor' : 'Publicatiedatum'}
                  </label>
                  <input
                    type="datetime-local"
                    value={data.publishedAt ? (() => {
                      const d = new Date(data.publishedAt);
                      // Format as local datetime (YYYY-MM-DDTHH:mm)
                      const year = d.getFullYear();
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      const hours = String(d.getHours()).padStart(2, '0');
                      const minutes = String(d.getMinutes()).padStart(2, '0');
                      return `${year}-${month}-${day}T${hours}:${minutes}`;
                    })() : ''}
                    onChange={e => setData((d: any) => ({ ...d, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
                  />
                  {data.status === 'SCHEDULED' && data.publishedAt && new Date(data.publishedAt) > new Date() && (
                    <p className="text-xs text-blue-600 mt-1">
                      Wordt gepubliceerd over {(() => {
                        const diff = new Date(data.publishedAt).getTime() - Date.now();
                        const minutes = Math.ceil(diff / (1000 * 60));
                        if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'}`;
                        const hours = Math.ceil(diff / (1000 * 60 * 60));
                        return `${hours} ${hours === 1 ? 'uur' : 'uur'}`;
                      })()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={(data.tags || []).join(', ')}
                    onChange={e => setData((d: any) => ({ ...d, tags: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
                    placeholder="tag1, tag2, tag3"
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
                  />
                </div>
              </>
            )}

            {sidebarTab === 'seo' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Meta titel</label>
                  <input
                    type="text"
                    value={data.metaTitle || ''}
                    onChange={e => setData((d: any) => ({ ...d, metaTitle: e.target.value }))}
                    placeholder={data.title || 'Artikel titel'}
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
                  />
                  <p className="text-xs text-zinc-400 mt-1">{(data.metaTitle || data.title || '').length}/60</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Meta beschrijving</label>
                  <textarea
                    value={data.metaDescription || ''}
                    onChange={e => setData((d: any) => ({ ...d, metaDescription: e.target.value }))}
                    rows={3}
                    placeholder={data.excerpt || 'Korte beschrijving voor zoekmachines...'}
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none"
                  />
                  <p className="text-xs text-zinc-400 mt-1">{(data.metaDescription || data.excerpt || '').length}/160</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">OG afbeelding URL</label>
                  <input
                    type="text"
                    value={data.ogImageUrl || ''}
                    onChange={e => setData((d: any) => ({ ...d, ogImageUrl: e.target.value }))}
                    placeholder={data.thumbnailUrl || 'https://...'}
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Laat leeg om thumbnail te gebruiken</p>
                </div>

                {/* Preview card */}
                <div className="mt-4 p-3 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-2">Google preview</p>
                  <div className="text-blue-600 text-sm font-medium truncate">{data.metaTitle || data.title || 'Artikel titel'}</div>
                  <div className="text-xs text-emerald-700 truncate">levendportret.nl/nieuws/{data.slug}</div>
                  <div className="text-xs text-zinc-600 line-clamp-2 mt-1">{data.metaDescription || data.excerpt || 'Beschrijving van het artikel...'}</div>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmOpen && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${confirmVisible ? 'opacity-100' : 'opacity-0'}`} role="dialog" aria-modal="true" onClick={closeConfirm}>
          <div className={`w-full max-w-sm bg-white rounded-xl border border-zinc-200 shadow-xl p-5 transform transition-all duration-150 ${confirmVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Artikel verwijderen</h3>
            <p className="mt-2 text-sm text-zinc-600">Weet je zeker dat je dit artikel wilt verwijderen? Dit kan niet ongedaan worden gemaakt.</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={closeConfirm} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Annuleren</button>
              <button onClick={async () => { await doDelete(); closeConfirm(); }} className="px-4 py-2 rounded-md bg-coral text-white">Verwijderen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
