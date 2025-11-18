"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft as IconLeft, ArrowRight as IconRight, Trash2, Loader2 } from "lucide-react";

export default function ClipReviewDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [ok, setOk] = useState<string>("");
  const [page, setPage] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [v1, setV1] = useState<string>("");
  const [v2, setV2] = useState<string>("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const rejectRef = useRef<HTMLDivElement | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [thumbUploading, setThumbUploading] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [moderations, setModerations] = useState<any[]>([]);

  const FONT_OPTIONS = [
    "Montserrat","Roboto","Open Sans","Lato","Poppins","Inter","Source Sans 3","Nunito","Merriweather","Playfair Display","Oswald","Raleway","Work Sans","Rubik","PT Sans","PT Serif","Noto Sans","Noto Serif","Fira Sans","Karla","Cabin","Quicksand","Manrope","IBM Plex Sans","Archivo"
  ];

  const load = async () => {
    setLoading(true); setError(""); setOk("");
    try {
      const res = await fetch(`/api/admin/company-pages/${params.id}`, { cache: 'no-store' });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Kon gegevens niet laden');
      setPage(data.page);
      setClips(data.clips || []);
      setCompany(data.page?.company || null);
      setModerations(Array.isArray(data.moderations) ? data.moderations : []);
      const ids = (data.clips || []).filter((c: any) => c.status === 'PUBLISHED').map((c: any)=> c.vimeoShortId);
      setV1(ids[0] || "");
      setV2(ids[1] || "");
    } catch (e: any) {
      setError(e?.message || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  // Load Google Fonts dynamically for preview
  useEffect(() => {
    if (!page) return;
    const makeGoogleFont = (name: string) => String(name || '').replace(/ /g, "+");
    const title = page?.titleFont || FONT_OPTIONS[0];
    const body = page?.bodyFont || FONT_OPTIONS[1];
    const families = Array.from(new Set([title, body])).map((f: string) => `${makeGoogleFont(f)}:wght@400;700`).join("&family=");
    const href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    let link = document.getElementById("lp-fonts-link-admin") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "lp-fonts-link-admin";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [page?.titleFont, page?.bodyFont]);

  const removeGalleryAt = (idx: number) => {
    setPage((p: any) => ({
      ...p,
      gallery: (Array.isArray(p?.gallery) ? p.gallery : []).length <= 3
        ? (Array.isArray(p?.gallery) ? p.gallery : [])
        : (Array.isArray(p?.gallery) ? p.gallery : []).filter((_: any, i: number) => i !== idx),
    }));
  };

  const moveGallery = (from: number, to: number) => {
    setPage((p:any) => {
      const list = Array.isArray(p?.gallery) ? [...p.gallery] : [];
      if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return p;
      const item = list.splice(from,1)[0];
      list.splice(to,0,item);
      return { ...p, gallery: list };
    });
  };

  const addGalleryUrl = () => {
    const url = (newImageUrl || '').trim();
    if (!url) return;
    try {
      const u = new URL(url);
      const ok = /\.(png|jpe?g|webp)$/i.test(u.pathname);
      if (!ok) throw new Error('Alleen png/jpg/jpeg/webp URLs');
      setPage((p: any) => ({ ...p, gallery: [...(Array.isArray(p?.gallery) ? p.gallery : []), { url }] }));
      setNewImageUrl('');
    } catch {
      setError('Ongeldige afbeelding-URL');
    }
  };

  const saveCompanyInfo = async () => {
    if (!company?.ownerId) { setError('Geen eigenaar gevonden'); return; }
    setError(''); setOk(''); setSaving(true);
    try {
      // Client-side validatie voor werkmail en telefoon
      const phone = String(company.workPhone || '').trim();
      const email = String(company.workEmail || '').trim();
      const phoneRegex = /^[0-9+\s\-()]{6,20}$/;
      if (phone && !phoneRegex.test(phone)) { throw new Error('Ongeldig werktelefoonnummer'); }
      if (email) {
        // eenvoudige e-mail validatie; server valideert strenger
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) throw new Error('Ongeldig zakelijk e-mailadres');
      }
      const body: any = { company: {
        name: company.name,
        city: company.city,
        address: company.address,
        zipCode: company.zipCode,
        houseNumber: company.houseNumber,
        workPhone: company.workPhone || null,
        workEmail: company.workEmail || null,
        kvkNumber: company.kvkNumber || null,
        website: company.website || null,
      } };
      const res = await fetch(`/api/admin/users/${company.ownerId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Opslaan bedrijfsinfo mislukt');
      setOk('Bedrijfsinformatie opgeslagen');
    } catch (e: any) {
      setError(e?.message || 'Opslaan bedrijfsinfo mislukt');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { load(); }, [params.id]);

  const publish = async () => {
    setError(""); setOk(""); setSaving(true);
    try {
      // Altijd eerst wijzigingen opslaan
      await doSaveEdits();

      const res = await fetch(`/api/admin/company-pages/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PUBLISH', vimeoIds: [v1, v2] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Publiceren mislukt');
      setOk('Gepubliceerd');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Publiceren mislukt');
    } finally {
      setSaving(false);
    }
  };

  const doSaveEdits = async () => {
    // Validate socials for admins
    const s = page?.socials || {};
    const isValidUrl = (v: string) => { try { const u = new URL(v); return !!u; } catch { return false; } };
    for (const [key, raw] of Object.entries(s)) {
      const v = String(raw || '').trim();
      if (!v) continue;
      if (key === 'instagram' || key === 'tiktok') {
        if (!(v.startsWith('@') || (isValidUrl(v) && /^(?:[^.]*\.)?(instagram|tiktok)\.com$/i.test(new URL(v).hostname)))) {
          throw new Error(`Ongeldige ${key} link. Gebruik @handle of een geldige URL.`);
        }
      } else if (key === 'youtube') {
        if (!(v.startsWith('@') || (isValidUrl(v) && /(youtube\.com|youtu\.be)/i.test(new URL(v).hostname)))) {
          throw new Error('Ongeldige YouTube link. Gebruik @handle of een geldige kanaal/video URL.');
        }
      } else if (key === 'facebook') {
        if (!(isValidUrl(v) && /facebook\.com/i.test(new URL(v).hostname))) { throw new Error('Ongeldige Facebook link. Gebruik een geldige facebook.com URL.'); }
      } else if (key === 'linkedin') {
        if (!(isValidUrl(v) && /linkedin\.com/i.test(new URL(v).hostname))) { throw new Error('Ongeldige LinkedIn link. Gebruik een geldige linkedin.com URL.'); }
      }
    }
    const payload: any = {
      action: 'UPDATE',
      aboutLong: page.aboutLong,
      gallery: page.gallery,
      accentColor: page.accentColor,
      titleFont: page.titleFont,
      bodyFont: page.bodyFont,
      roundedCorners: page.roundedCorners,
      showCompanyNameNextToLogo: page.showCompanyNameNextToLogo,
      socials: page.socials,
      showContactPage: page.showContactPage,
      clipsThumbnailUrl: page.clipsThumbnailUrl || null,
      longVideoVimeoId: page.longVideoVimeoId || null,
    };
    const res = await fetch(`/api/admin/company-pages/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt');
  };

  const saveEdits = async () => {
    setError(""); setOk(""); setSaving(true);
    try {
      await doSaveEdits();
      setOk('Opgeslagen');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    setError(""); setOk(""); setSaving(true);
    try {
      const res = await fetch(`/api/admin/company-pages/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'REJECT', notes: rejectNotes }) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Afwijzen mislukt');
      setOk('Afgewezen');
      setRejectVisible(false);
      setTimeout(()=> setRejectOpen(false), 150);
      router.push('/dashboard/clips');
    } catch (e: any) {
      setError(e?.message || 'Afwijzen mislukt');
    } finally {
      setSaving(false);
    }
  };

  const revertToReview = async () => {
    setError(""); setOk(""); setSaving(true);
    try {
      const res = await fetch(`/api/admin/company-pages/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'REVERT_TO_REVIEW' }) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Terugzetten mislukt');
      setOk('Teruggezet naar IN_REVIEW');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Terugzetten mislukt');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!rejectOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setRejectVisible(false); setTimeout(()=> setRejectOpen(false), 150); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [rejectOpen]);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setConfirmVisible(false); setTimeout(()=> setConfirmOpen(false), 150); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmOpen]);

  const openConfirm = () => { setConfirmOpen(true); requestAnimationFrame(()=> setConfirmVisible(true)); };
  const closeConfirm = () => { setConfirmVisible(false); setTimeout(()=> setConfirmOpen(false), 150); };

  useEffect(() => {
    if (!rejectOpen) return;
    const el = rejectRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusables.length) focusables[0].focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = Array.from(focusables).filter(x => !x.hasAttribute('disabled'));
      if (list.length === 0) return;
      const idx = list.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey) {
        e.preventDefault();
        const prev = idx <= 0 ? list[list.length - 1] : list[idx - 1];
        prev.focus();
      } else {
        e.preventDefault();
        const next = idx === list.length - 1 ? list[0] : list[idx + 1];
        next.focus();
      }
    };
    el.addEventListener('keydown', onKeyDown as any);
    return () => el.removeEventListener('keydown', onKeyDown as any);
  }, [rejectOpen]);

  const openReject = () => { setRejectOpen(true); requestAnimationFrame(()=> setRejectVisible(true)); };
  const closeReject = () => { setRejectVisible(false); setTimeout(()=> setRejectOpen(false), 150); };

  const canPublish = useMemo(() => /^\d+$/.test(v1.trim()) && /^\d+$/.test(v2.trim()), [v1, v2]);

  if (loading) return <div className="max-w-5xl mx-auto p-6">Laden…</div>;
  if (error) return <div className="max-w-5xl mx-auto p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {ok && <div className="text-emerald-700">{ok}</div>}

      <div className="text-xs text-zinc-500">Dashboard &gt; Clipsbeheer &gt; {page?.status === 'PUBLISHED' ? 'Gepubliceerd' : 'Aanvragen'} &gt; {page?.slug}</div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <a href="/dashboard/clips" className="px-3 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Terug</a>
          <h1 className="text-2xl font-bold">{page?.slug}</h1>
        </div>
        <div className="text-sm text-zinc-600">Status: {page?.status}</div>
      </div>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Clips (Vimeo)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-zinc-700">Short (9x16)</label>
            <input value={v1} onChange={e=>setV1(e.target.value)} placeholder="Vimeo ID (short)" className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-zinc-700">Lang (16x9)</label>
            <input
              value={v2}
              onChange={e=>{ const v = e.target.value; setV2(v); setPage((p:any)=>({ ...p, longVideoVimeoId: v })); }}
              placeholder="Vimeo ID (lang)"
              className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-700">Thumbnail (9x16) URL</label>
            <input
              value={page?.clipsThumbnailUrl || ''}
              onChange={e=>setPage((p:any)=>({ ...p, clipsThumbnailUrl: e.target.value }))}
              placeholder="https://... (aanbevolen 1080x1920, PNG/JPG/WEBP)"
              className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2"
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-navy text-white hover:brightness-110"
                onClick={async ()=>{
                  try {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/png,image/jpeg,image/webp';
                    input.onchange = async () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      setSaving(true); setThumbUploading(true); setError(""); setOk("");
                      try {
                        const objectUrl = URL.createObjectURL(file);
                        setThumbPreview(objectUrl);
                        // compute SHA-256 hash of file
                        const buf = await file.arrayBuffer();
                        const hashBuf = await crypto.subtle.digest('SHA-256', buf);
                        const hashArr = Array.from(new Uint8Array(hashBuf));
                        const contentHash = hashArr.map(b=>b.toString(16).padStart(2,'0')).join('');
                        const metaRes = await fetch(`/api/admin/company-pages/${params.id}/thumbnail-upload`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ fileName: file.name, contentType: file.type, contentHash })
                        });
                        const meta = await metaRes.json();
                        if (!metaRes.ok) throw new Error(meta?.error || 'Kon upload-URL niet ophalen');
                        if (meta.uploadUrl) {
                          const putRes = await fetch(meta.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
                          if (!putRes.ok) throw new Error('Upload naar opslag mislukt');
                        }
                        setPage((p:any)=>({ ...p, clipsThumbnailUrl: meta.publicUrl }));
                        setThumbPreview(meta.publicUrl);
                        // Automatisch opslaan
                        await doSaveEdits();
                        setOk('Thumbnail geüpload en opgeslagen');
                        URL.revokeObjectURL(objectUrl);
                      } catch(e:any) {
                        setError(e?.message || 'Upload mislukt');
                      } finally {
                        setSaving(false);
                        setThumbUploading(false);
                      }
                    };
                    input.click();
                  } catch (e:any) {
                    setError(e?.message || 'Kon bestandskiezer niet openen');
                  }
                }}
              >Upload thumbnail</button>
              {thumbUploading ? (
                <span className="inline-flex items-center gap-2 text-sm text-zinc-600">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploaden…
                </span>
              ) : null}
              {(thumbPreview || page?.clipsThumbnailUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbPreview || page.clipsThumbnailUrl} alt="Preview" className="h-20 w-12 rounded border object-cover" />
              ) : null}
              {page?.clipsThumbnailUrl ? (
                <a href={page.clipsThumbnailUrl} target="_blank" rel="noreferrer" className="text-sm text-coral hover:underline">Voorbeeld openen</a>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-zinc-600">Optioneel. Als leeg: gebruiken we automatisch de Vimeo thumbnail. Aanbevolen verhouding 9×16, 1080×1920.</p>
          </div>
        </div>
        <div className="text-xs text-zinc-600">Je moet 2 geldige Vimeo IDs invullen om te kunnen publiceren.</div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3">
        <h2 className="text-xl font-semibold">Aanvragen / Notities</h2>
        {moderations.length === 0 ? (
          <div className="text-sm text-zinc-600">Geen notities gevonden.</div>
        ) : (
          <ul className="space-y-2">
            {moderations.slice(0,10).map((m:any)=> (
              <li key={m.id} className="border rounded-md p-3">
                <div className="text-xs text-zinc-600">{new Date(m.createdAt).toLocaleString()} — {m.status}</div>
                {m.notes ? <div className="text-sm mt-1 whitespace-pre-wrap">{m.notes}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Inhoud</h2>
        <label className="text-sm text-zinc-700">Over ons</label>
        <textarea rows={6} className="w-full border border-zinc-300 rounded-md px-3 py-2" value={page?.aboutLong || ''} onChange={e=>setPage((p:any)=>({...p, aboutLong: e.target.value}))} />
        <div className="grid grid-cols-3 gap-3 mt-2">
          {(Array.isArray(page?.gallery) ? page.gallery : []).map((g:any, idx:number) => (
            <div key={idx} className="relative border rounded-md overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt="" className="w-full h-24 object-cover" />
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button title="Naar links" className="p-1 bg-white/90 rounded border" onClick={()=>moveGallery(idx, Math.max(0, idx-1))} disabled={idx===0}><IconLeft className="w-4 h-4" /></button>
                <button title="Naar rechts" className="p-1 bg-white/90 rounded border" onClick={()=>moveGallery(idx, Math.min((Array.isArray(page?.gallery)?page.gallery.length:1)-1, idx+1))} disabled={idx===(Array.isArray(page?.gallery)?page.gallery.length:1)-1}><IconRight className="w-4 h-4" /></button>
                <button title="Verwijder" className="p-1 bg-white/90 rounded border" onClick={()=>removeGalleryAt(idx)} disabled={(Array.isArray(page?.gallery)?page.gallery.length:0) <= 3}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input value={newImageUrl} onChange={e=>setNewImageUrl(e.target.value)} placeholder="Afbeelding URL (png/jpg/jpeg/webp)" className="flex-1 border border-zinc-300 rounded-md px-3 py-2" />
          <button onClick={addGalleryUrl} className="px-3 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Toevoegen</button>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Huisstijl</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-zinc-700">Accentkleur</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="color" className="w-10 h-10 border rounded" value={page?.accentColor || '#191970'} onChange={e=>setPage((p:any)=>({ ...p, accentColor: e.target.value }))} />
              <input className="flex-1 border border-zinc-300 rounded-md px-3 py-2" value={page?.accentColor || ''} onChange={e=>setPage((p:any)=>({ ...p, accentColor: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-700">Titel font</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={page?.titleFont || FONT_OPTIONS[0]} onChange={e=>setPage((p:any)=>({ ...p, titleFont: e.target.value }))}>
              {FONT_OPTIONS.map(f=> <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-700">Body font</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={page?.bodyFont || FONT_OPTIONS[1]} onChange={e=>setPage((p:any)=>({ ...p, bodyFont: e.target.value }))}>
              {FONT_OPTIONS.map(f=> <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="rounded" type="checkbox" checked={!!page?.roundedCorners} onChange={e=>setPage((p:any)=>({ ...p, roundedCorners: e.target.checked }))} />
            <label htmlFor="rounded" className="text-sm text-zinc-700">Afgeronde hoeken</label>
          </div>
          <div className="flex items-center gap-2">
            <input id="shownamelogo" type="checkbox" checked={!!page?.showCompanyNameNextToLogo} onChange={e=>setPage((p:any)=>({ ...p, showCompanyNameNextToLogo: e.target.checked }))} />
            <label htmlFor="shownamelogo" className="text-sm text-zinc-700">Toon bedrijfsnaam naast logo</label>
          </div>
          <div className="flex items-center gap-2">
            <input id="contactpage" type="checkbox" checked={!!page?.showContactPage} onChange={e=>setPage((p:any)=>({ ...p, showContactPage: e.target.checked }))} />
            <label htmlFor="contactpage" className="text-sm text-zinc-700">Toon contactsectie</label>
          </div>
        </div>
        <div className="mt-2 border border-zinc-200 rounded-md p-4" style={{ background: '#fafafa' }}>
          <div style={{ fontFamily: `'${page?.titleFont || FONT_OPTIONS[0]}', sans-serif`, fontWeight: 700 }} className="text-lg">Voorbeeld titel - {page?.titleFont || FONT_OPTIONS[0]}</div>
          <div style={{ fontFamily: `'${page?.bodyFont || FONT_OPTIONS[1]}', sans-serif`, fontWeight: 400 }} className="text-sm text-zinc-700">Voorbeeld body - {page?.bodyFont || FONT_OPTIONS[1]}.</div>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Socials</h2>
        {['facebook','instagram','linkedin','youtube','tiktok'].map((key)=> {
          const placeholders: Record<string,string> = {
            facebook: 'https://facebook.com/bedrijfsnaam',
            instagram: 'https://instagram.com/bedrijfsnaam of @bedrijfsnaam',
            linkedin: 'https://www.linkedin.com/company/bedrijfsnaam',
            youtube: 'https://www.youtube.com/@kanaal of https://www.youtube.com/channel/ID',
            tiktok: 'https://www.tiktok.com/@gebruikersnaam',
          };
          return (
            <div key={key}>
              <label className="block text-sm text-zinc-700">{key}</label>
              <input
                placeholder={placeholders[key]}
                className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2"
                value={(page?.socials?.[key] as string) || ''}
                onChange={e=>setPage((p:any)=>({ ...p, socials: { ...(p?.socials || {}), [key]: e.target.value } }))}
              />
            </div>
          );
        })}
        <p className="text-xs text-zinc-500">Ondersteunt @handles en volledige URLs. Voor YouTube worden channel-/@-links ondersteund.</p>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Contact en bedrijf</h2>
        {company ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {company.logoUrl ? (
              <div className="md:col-span-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={company.logoUrl} alt="Logo" className="h-12 w-auto" />
                <span className="text-sm text-zinc-600">Logo</span>
              </div>
            ) : null}
            <div>
              <label className="block text-sm text-zinc-700">Bedrijfsnaam</label>
              <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.name || ''} onChange={e=>setCompany((c:any)=>({ ...c, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-zinc-700">Plaats</label>
              <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.city || ''} onChange={e=>setCompany((c:any)=>({ ...c, city: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-zinc-700">Adres</label>
              <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.address || ''} onChange={e=>setCompany((c:any)=>({ ...c, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-zinc-700">Postcode</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.zipCode || ''} onChange={e=>setCompany((c:any)=>({ ...c, zipCode: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Huisnummer</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.houseNumber || ''} onChange={e=>setCompany((c:any)=>({ ...c, houseNumber: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-700">Werktelefoon</label>
              <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.workPhone || ''} onChange={e=>setCompany((c:any)=>({ ...c, workPhone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-zinc-700">Zakelijk e-mailadres</label>
              <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" type="email" value={company.workEmail || ''} onChange={e=>setCompany((c:any)=>({ ...c, workEmail: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-zinc-700">KVK-nummer</label>
              <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.kvkNumber || ''} onChange={e=>setCompany((c:any)=>({ ...c, kvkNumber: e.target.value }))} />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <button onClick={saveCompanyInfo} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Bedrijfsinfo opslaan</button>
              {company?.ownerId && (
                <a href={`/dashboard/gebruiker/${company.ownerId}`} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Open gebruiker</a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-600">Geen bedrijfsgegevens gevonden.</div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <button disabled={saving || !canPublish} onClick={openConfirm} className="px-4 py-2 rounded-md bg-coral text-white disabled:opacity-50">{page?.status === 'PUBLISHED' ? 'Opnieuw publiceren' : 'Publiceren'}</button>
        <button disabled={saving} onClick={openReject} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Afwijzen</button>
        {page?.status === 'PUBLISHED' && (
          <button disabled={saving} onClick={revertToReview} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Zet terug naar IN_REVIEW</button>
        )}
        <button onClick={()=>router.push('/dashboard/clips')} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Terug</button>
      </div>

      {rejectOpen && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${rejectVisible ? 'opacity-100' : 'opacity-0'}`} role="dialog" aria-modal="true" onClick={closeReject}>
          <div ref={rejectRef} className={`w-full max-w-sm bg-white rounded-xl border border-zinc-200 shadow-xl p-5 transform transition-all duration-150 ${rejectVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'}`} onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Afwijzen</h3>
            <p className="mt-2 text-sm text-zinc-600">Beschrijf wat de gebruiker moet aanpassen.</p>
            <textarea rows={5} value={rejectNotes} onChange={e=>setRejectNotes(e.target.value)} className="mt-3 w-full border border-zinc-300 rounded-md px-3 py-2" placeholder="Reden van afwijzing" />
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={closeReject} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Annuleren</button>
              <button disabled={!rejectNotes.trim()} onClick={reject} className="px-4 py-2 rounded-md bg-coral text-white disabled:opacity-50">Versturen</button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${confirmVisible ? 'opacity-100' : 'opacity-0'}`} role="dialog" aria-modal="true" onClick={closeConfirm}>
          <div className={`w-full max-w-sm bg-white rounded-xl border border-zinc-200 shadow-xl p-5 transform transition-all duration-150 ${confirmVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'}`} onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold">{page?.status === 'PUBLISHED' ? 'Opnieuw publiceren' : 'Publiceren'}</h3>
            <p className="mt-2 text-sm text-zinc-600">Weet je zeker dat je dit wilt {page?.status === 'PUBLISHED' ? 'opnieuw publiceren' : 'publiceren'}? Je kunt dit annuleren.</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={closeConfirm} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Annuleren</button>
              <button disabled={saving || !canPublish} onClick={async()=>{ await publish(); closeConfirm(); }} className="px-4 py-2 rounded-md bg-coral text-white disabled:opacity-50">{page?.status === 'PUBLISHED' ? 'Opnieuw publiceren' : 'Publiceren'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
