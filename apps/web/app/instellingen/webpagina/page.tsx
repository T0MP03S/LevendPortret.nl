"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, ArrowRight, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

type GalleryItem = { url: string; width?: number | null; height?: number | null; type?: string | null };

const FONT_OPTIONS = [
  "Montserrat","Roboto","Open Sans","Lato","Poppins","Inter","Source Sans 3","Nunito","Merriweather","Playfair Display","Oswald","Raleway","Work Sans","Rubik","PT Sans","PT Serif","Noto Sans","Noto Serif","Fira Sans","Karla","Cabin","Quicksand","Manrope","IBM Plex Sans","Archivo"
];

export default function WebpaginaInstellingenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [fullAccess, setFullAccess] = useState<boolean>(true);

  const [companyHasWebsite, setCompanyHasWebsite] = useState(false);
  const [status, setStatus] = useState<string>("DRAFT");
  const [slug, setSlug] = useState<string>("");
  const [aboutLong, setAboutLong] = useState("");
  const [longVideo, setLongVideo] = useState<string>("");
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [accentColor, setAccentColor] = useState<string>("#191970");
  const [titleFont, setTitleFont] = useState<string>(FONT_OPTIONS[0]);
  const [bodyFont, setBodyFont] = useState<string>(FONT_OPTIONS[1]);
  const [roundedCorners, setRoundedCorners] = useState<boolean>(false);
  const [showNameNextToLogo, setShowNameNextToLogo] = useState<boolean>(true);
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [showContactPage, setShowContactPage] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [initial, setInitial] = useState<any>(null);
  const [confirmBackOpen, setConfirmBackOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState<string>("");
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmSubmitVisible, setConfirmSubmitVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLDivElement | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const canSubmit = useMemo(() => !companyHasWebsite && gallery.length >= 3 && gallery.length <= 5, [companyHasWebsite, gallery.length]);
  const isLocked = status === 'IN_REVIEW';

  const load = async () => {
    setLoading(true); setError(""); setOk("");
    try {
      // Check membership access
      try {
        const meRes = await fetch('/api/settings', { cache: 'no-store' });
        const meJson = await meRes.json().catch(()=>({}));
        if (meRes.ok) setFullAccess(!!meJson.fullAccess);
      } catch {}
      const res = await fetch("/api/settings/webpage", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Kon webpagina instellingen niet laden");
      setCompanyHasWebsite(!!json.companyHasWebsite);
      const p = json.page;
      setRejectionMessage(json.lastRejectionMessage || "");
      if (p) {
        setStatus(p.status || "DRAFT");
        setSlug(p.slug || "");
        setAboutLong(p.aboutLong || "");
        setLongVideo(p.longVideoVimeoId || "");
        setGallery(p.gallery ? (typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery) : []);
        setAccentColor(p.accentColor || "#191970");
        setTitleFont(p.titleFont || FONT_OPTIONS[0]);
        setBodyFont(p.bodyFont || FONT_OPTIONS[1]);
        setRoundedCorners(!!p.roundedCorners);
        setShowNameNextToLogo(p.showCompanyNameNextToLogo ?? true);
        setSocials(p.socials ? (typeof p.socials === 'string' ? JSON.parse(p.socials) : p.socials) : {});
        setShowContactPage(p.showContactPage ?? true);
        setInitial({
          status: p.status || "DRAFT",
          aboutLong: p.aboutLong || "",
          gallery: p.gallery ? (typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery) : [],
          accentColor: p.accentColor || "#191970",
          titleFont: p.titleFont || FONT_OPTIONS[0],
          bodyFont: p.bodyFont || FONT_OPTIONS[1],
          roundedCorners: !!p.roundedCorners,
          showCompanyNameNextToLogo: p.showCompanyNameNextToLogo ?? true,
          socials: p.socials ? (typeof p.socials === 'string' ? JSON.parse(p.socials) : p.socials) : {},
          showContactPage: p.showContactPage ?? true,
        });
      } else {
        setInitial({
          status: "DRAFT",
          aboutLong: "",
          longVideo: "",
          gallery: [],
          accentColor: "#191970",
          titleFont: FONT_OPTIONS[0],
          bodyFont: FONT_OPTIONS[1],
          roundedCorners: false,
          showCompanyNameNextToLogo: true,
          socials: {},
          showContactPage: true,
        });
      }
    } catch (e: any) {
      setError(e?.message || "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (nextStatus?: string) => {
    setError(""); setOk(""); setSaving(true);
    if (aboutLong.length > 5000) { setError("Over ons is te lang (max 5000 tekens)"); setSaving(false); return; }
    if (!/^#?[0-9A-Fa-f]{3,6}$/.test(accentColor)) { setError("Accentkleur moet een geldige HEX zijn"); setSaving(false); return; }
    // Validate socials: allow @handles for IG/YouTube/TikTok, enforce correct domains for URLs
    const s = socials || {};
    const isValidUrl = (v: string) => {
      try { const u = new URL(v); return !!u; } catch { return false; }
    };
    for (const [key, raw] of Object.entries(s)) {
      const v = String(raw || '').trim();
      if (!v) continue;
      if (key === 'instagram' || key === 'tiktok') {
        if (!(v.startsWith('@') || (isValidUrl(v) && /^(?:[^.]*\.)?(instagram|tiktok)\.com$/i.test(new URL(v).hostname)))) {
          setError(`Ongeldige ${key} link. Gebruik @handle of een geldige URL.`); setSaving(false); return;
        }
      } else if (key === 'youtube') {
        if (!(v.startsWith('@') || (isValidUrl(v) && /(youtube\.com|youtu\.be)/i.test(new URL(v).hostname)))) {
          setError('Ongeldige YouTube link. Gebruik @handle of een geldige kanaal/video URL.'); setSaving(false); return;
        }
      } else if (key === 'facebook') {
        if (!(isValidUrl(v) && /facebook\.com/i.test(new URL(v).hostname))) { setError('Ongeldige Facebook link. Gebruik een geldige facebook.com URL.'); setSaving(false); return; }
      } else if (key === 'linkedin') {
        if (!(isValidUrl(v) && /linkedin\.com/i.test(new URL(v).hostname))) { setError('Ongeldige LinkedIn link. Gebruik een geldige linkedin.com URL.'); setSaving(false); return; }
      }
    }
    const res = await fetch("/api/settings/webpage", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      aboutLong, gallery, accentColor, titleFont, bodyFont, roundedCorners, showCompanyNameNextToLogo: showNameNextToLogo, socials, showContactPage, status: nextStatus
    }) });
    const json = await res.json().catch(()=>({}));
    if (!res.ok) { setError(json?.error || "Opslaan mislukt"); setSaving(false); return; }
    setOk("Opgeslagen");
    await load();
    setSaving(false);
  };

  const submitForReview = async () => {
    setError(""); setOk("");
    if (!canSubmit) { setError("Vul minimaal 3 en maximaal 5 afbeeldingen in"); return; }
    const res = await fetch("/api/settings/webpage/submit", { method: "POST" });
    const json = await res.json().catch(()=>({}));
    if (!res.ok) { setError(json?.error || "Indienen mislukt"); return; }
    setOk("Ingediend voor review");
    router.push('/instellingen');
  };

  const dirty = useMemo(() => {
    if (!initial) return false;
    const current = {
      status,
      aboutLong,
      longVideo,
      gallery,
      accentColor,
      titleFont,
      bodyFont,
      roundedCorners,
      showCompanyNameNextToLogo: showNameNextToLogo,
      socials,
      showContactPage,
    };
    try {
      return JSON.stringify(current) !== JSON.stringify(initial);
    } catch {
      return false;
    }
  }, [initial, status, aboutLong, gallery, accentColor, titleFont, bodyFont, roundedCorners, showNameNextToLogo, socials, showContactPage]);

  const handleBack = async () => {
    if (!dirty) { router.push('/instellingen'); return; }
    setConfirmBackOpen(true);
    requestAnimationFrame(() => setConfirmVisible(true));
  };

  const onSelectGallery = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const arr = Array.from(files);
    for (const f of arr) {
      if (!['image/png','image/jpeg','image/webp'].includes(f.type)) { setError('Alleen png, jpg/jpeg of webp toegestaan'); return; }
      if (f.size > 5 * 1024 * 1024) { setError('Bestand is te groot (max 5MB)'); return; }
    }
    for (const f of arr) {
      // Compute SHA-256 for dedupe
      const buf = await f.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hashArr = Array.from(new Uint8Array(hashBuf));
      const contentHash = hashArr.map(b=>b.toString(16).padStart(2,'0')).join('');
      const metaRes = await fetch('/api/settings/webpage/gallery-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: f.name, contentType: f.type, contentHash }) });
      const meta = await metaRes.json();
      if (!metaRes.ok) { setError(meta?.error || 'Kon upload-URL niet ophalen'); setUploading(false); return; }
      if (meta.uploadUrl) {
        const putRes = await fetch(meta.uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f });
        if (!putRes.ok) { setError('Upload mislukt'); setUploading(false); return; }
      }
      setGallery(g => [...g, { url: meta.publicUrl }]);
    }
    setUploading(false);
  };

  const removeAt = (idx: number) => setGallery(g => {
    if (g.length <= 3) return g; // must keep at least 3
    return g.filter((_,i)=>i!==idx);
  });
  const move = (from: number, to: number) => setGallery(g => {
    const copy = g.slice();
    const item = copy.splice(from,1)[0];
    copy.splice(to,0,item);
    return copy;
  });

  useEffect(() => {
    const makeGoogleFont = (name: string) => name.replace(/ /g, "+");
    const families = Array.from(new Set([titleFont, bodyFont])).map(f => `${makeGoogleFont(f)}:wght@400;700`).join("&family=");
    const href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    let link = document.getElementById("lp-fonts-link") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "lp-fonts-link";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [titleFont, bodyFont]);

  useEffect(() => {
    if (!confirmBackOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeConfirm(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmBackOpen]);

  useEffect(() => {
    if (!confirmSubmitOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setConfirmSubmitVisible(false); setTimeout(()=>setConfirmSubmitOpen(false),150); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmSubmitOpen]);

  const closeConfirm = () => {
    setConfirmVisible(false);
    setTimeout(() => setConfirmBackOpen(false), 150);
  };

  useEffect(() => {
    if (!confirmBackOpen) return;
    const el = confirmRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
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
  }, [confirmBackOpen]);

  useEffect(() => {
    if (!confirmSubmitOpen) return;
    const el = confirmRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
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
  }, [confirmSubmitOpen]);

  // Autosave every 30s when there are unsaved changes
  useEffect(() => {
    if (!dirty || loading || saving || uploading || isLocked) return;
    const t = setInterval(() => { void save('DRAFT'); }, 30000);
    return () => clearInterval(t);
  }, [dirty, loading, saving, uploading, isLocked]);

  if (loading) return <div className="max-w-3xl mx-auto p-6">Laden…</div>;
  if (!fullAccess) return <div className="max-w-3xl mx-auto p-6">Je hebt geen toegang tot Webpagina instellingen. Neem contact op met support of een admin om CLIPS te activeren.</div>;
  if (companyHasWebsite) return <div className="max-w-3xl mx-auto p-6">Je hebt een externe website opgegeven. De webpagina-instellingen zijn niet nodig.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {error && <div className="text-red-600">{error}</div>}
      {ok && <div className="text-emerald-700">{ok}</div>}
      {status === 'PUBLISHED' && (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">Je webpagina staat live op Levend Portret. Wil je iets laten aanpassen? Vraag een update aan bij de admins.</div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <a href="/instellingen" className="inline-flex items-center px-3 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">Update aanvragen</a>
              {slug && <a href={`/p/${slug}`} className="inline-flex items-center px-3 py-2 rounded-md border border-emerald-300 text-emerald-800 hover:bg-emerald-100">Webpagina bekijken</a>}
            </div>
          </div>
        </div>
      )}
      {status === 'DRAFT' && rejectionMessage && (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-900">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">Afgewezen</div>
            <div className="text-sm">{rejectionMessage}</div>
            <div className="text-sm mt-1">Pas je pagina aan en dien opnieuw in.</div>
          </div>
        </div>
      )}
      <div className="text-xs text-zinc-500">Instellingen &gt; Webpagina</div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">
          <ArrowLeft className="w-4 h-4" />
          <span>Terug</span>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">Webpagina instellingen</h1>
        {dirty && <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">Niet opgeslagen</span>}
      </div>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Inhoud</h2>
        <label className="block text-sm text-zinc-700">Over ons</label>
        <textarea className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" rows={6} value={aboutLong} onChange={e=>setAboutLong(e.target.value)} disabled={isLocked} />
        <div className="text-xs text-zinc-500">{aboutLong.length}/5000</div>
        <div className="text-xs text-zinc-500">Tip: je kunt eenvoudige Markdown gebruiken, zoals **vet** en [link](https://voorbeeld.nl).</div>

        {/* Lange video is alleen voor admins; verborgen in klant UI */}
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Galerij (3–5 afbeeldingen)</h2>
        <div className="text-sm text-zinc-600">Geselecteerd: {gallery.length} / 5</div>
        <div className="grid grid-cols-3 gap-3">
          {gallery.map((g,idx)=> (
            <div key={idx} className="relative border rounded-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt="" className="w-full h-24 object-cover" />
              <div className="absolute top-1 right-1 flex gap-1">
                <button title="Naar links" className="p-1 bg-white/90 rounded border" onClick={()=>move(idx, Math.max(0, idx-1))} disabled={isLocked || idx===0}><ArrowLeft className="w-4 h-4" /></button>
                <button title="Naar rechts" className="p-1 bg-white/90 rounded border" onClick={()=>move(idx, Math.min(gallery.length-1, idx+1))} disabled={isLocked || idx===gallery.length-1}><ArrowRight className="w-4 h-4" /></button>
                <button title="Verwijder" className="p-1 bg-white/90 rounded border" onClick={()=>removeAt(idx)} disabled={isLocked || gallery.length<=3}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={e=>onSelectGallery(e.target.files)} disabled={isLocked} />
        <div className="flex items-center gap-3">
          <button type="button" className="px-4 py-2 rounded-md bg-navy text-white hover:opacity-90 disabled:opacity-50" onClick={()=>fileInputRef.current?.click()} disabled={uploading || isLocked}>Kies bestanden</button>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <span className="inline-block w-4 h-4 border-2 border-zinc-300 border-t-coral rounded-full animate-spin" /> Uploaden...
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Huisstijl</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-700">Accentkleur</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="color" className="w-10 h-10 border rounded" value={accentColor} onChange={e=>setAccentColor(e.target.value)} disabled={isLocked} />
              <input className="flex-1 border border-zinc-300 rounded-md px-3 py-2" value={accentColor} onChange={e=>setAccentColor(e.target.value)} disabled={isLocked} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-700">Titel font</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={titleFont} onChange={e=>setTitleFont(e.target.value)} disabled={isLocked}>
              {FONT_OPTIONS.map(f=> <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-700">Body font</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={bodyFont} onChange={e=>setBodyFont(e.target.value)} disabled={isLocked}>
              {FONT_OPTIONS.map(f=> <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="rounded" type="checkbox" checked={roundedCorners} onChange={e=>setRoundedCorners(e.target.checked)} className="sr-only" disabled={isLocked} />
            <label htmlFor="rounded" className="flex items-center gap-2 cursor-pointer">
              <span className={`w-5 h-5 rounded-md border-2 grid place-items-center transition-colors ${roundedCorners ? 'bg-coral border-coral text-white' : 'border-coral bg-white'}`}>
                {roundedCorners ? <Check className="w-4 h-4" /> : null}
              </span>
              <span>Afgeronde hoeken</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input id="shownamelogo" type="checkbox" checked={showNameNextToLogo} onChange={e=>setShowNameNextToLogo(e.target.checked)} className="sr-only" disabled={isLocked} />
            <label htmlFor="shownamelogo" className="flex items-center gap-2 cursor-pointer">
              <span className={`w-5 h-5 rounded-md border-2 grid place-items-center transition-colors ${showNameNextToLogo ? 'bg-coral border-coral text-white' : 'border-coral bg-white'}`}>
                {showNameNextToLogo ? <Check className="w-4 h-4" /> : null}
              </span>
              <span>Toon bedrijfsnaam naast logo</span>
            </label>
          </div>
        </div>
        <div className="mt-4 border border-zinc-200 rounded-md p-4" style={{ background: "#fafafa" }}>
          <div style={{ fontFamily: `'${titleFont}', sans-serif`, fontWeight: 700 }} className="text-lg">Voorbeeld titel - {titleFont}</div>
          <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: 400 }} className="text-sm text-zinc-700">Voorbeeld body - {bodyFont}. Dit is een korte voorbeeldtekst om het font te zien.</div>
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
              <input placeholder={placeholders[key]} className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={socials[key] || ''} onChange={e=>setSocials(s=>({ ...s, [key]: e.target.value }))} disabled={isLocked} />
            </div>
          );
        })}
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Contact</h2>
        <div className="flex items-center gap-2">
          <input id="contactpage" type="checkbox" checked={showContactPage} onChange={e=>setShowContactPage(e.target.checked)} className="sr-only" disabled={isLocked} />
          <label htmlFor="contactpage" className="flex items-center gap-2 cursor-pointer">
            <span className={`w-5 h-5 rounded-md border-2 grid place-items-center transition-colors ${showContactPage ? 'bg-coral border-coral text-white' : 'border-coral bg-white'}`}>
              {showContactPage ? <Check className="w-4 h-4" /> : null}
            </span>
            <span>Toon contactsectie (gebaseerd op je bedrijfsinformatie)</span>
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        {status === 'DRAFT' && (
          <>
            <button
              disabled={saving || isLocked}
              className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50"
              onClick={()=>save('DRAFT')}
            >
              {saving ? 'Opslaan…' : 'Opslaan als concept'}
            </button>
            <button
              disabled={!canSubmit || saving || uploading || isLocked}
              className="px-4 py-2 rounded-md bg-coral text-white disabled:opacity-50"
              onClick={()=>{ setConfirmSubmitOpen(true); requestAnimationFrame(()=>setConfirmSubmitVisible(true)); }}
            >
              Indienen voor review
            </button>
          </>
        )}
        {status === 'IN_REVIEW' && (
          <button
            disabled={saving}
            className="px-4 py-2 rounded-md bg-navy text-white hover:opacity-90 disabled:opacity-50"
            onClick={async ()=>{ await save('DRAFT'); }}
          >
            {saving ? 'Terugzetten…' : 'Terug naar concept'}
          </button>
        )}
        {status === 'PUBLISHED' && (
          <p className="text-sm text-zinc-600">
            Je pagina is gepubliceerd. Wil je iets laten aanpassen? Vraag een update aan via de instellingenpagina.
          </p>
        )}
      </div>

      {confirmBackOpen && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${confirmVisible ? 'opacity-100' : 'opacity-0'}`} role="dialog" aria-modal="true" onClick={closeConfirm}>
          <div ref={confirmRef} className={`w-full max-w-sm bg-white rounded-xl border border-zinc-200 shadow-xl p-5 transform transition-all duration-150 ${confirmVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'}`} onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Terug naar instellingen?</h3>
            <p className="mt-2 text-sm text-zinc-600">Je hebt niet-opgeslagen wijzigingen. Wil je eerst opslaan of zonder opslaan teruggaan?</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50" onClick={closeConfirm}>Annuleren</button>
              <button className="px-4 py-2 rounded-md bg-navy text-white hover:opacity-90" onClick={async ()=>{ await save('DRAFT'); closeConfirm(); router.push('/instellingen'); }}>Eerst opslaan</button>
              <button className="px-4 py-2 rounded-md bg-coral text-white hover:opacity-90" onClick={()=>{ closeConfirm(); router.push('/instellingen'); }}>Terug zonder opslaan</button>
            </div>
          </div>
        </div>
      )}

      {confirmSubmitOpen && (
        <div className={`fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${confirmSubmitVisible ? 'opacity-100' : 'opacity-0'}`} role="dialog" aria-modal="true" onClick={()=>{ setConfirmSubmitVisible(false); setTimeout(()=>setConfirmSubmitOpen(false),150); }}>
          <div ref={confirmRef} className={`w-full max-w-sm bg-white rounded-xl border border-zinc-200 shadow-xl p-5 transform transition-all duration-150 ${confirmSubmitVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'}`} onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Indienen voor review?</h3>
            <p className="mt-2 text-sm text-zinc-600">Je concept wordt ter controle aangeboden. Je kunt pas weer aanpassen nadat de review is afgerond of afgewezen.</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50" onClick={()=>{ setConfirmSubmitVisible(false); setTimeout(()=>setConfirmSubmitOpen(false),150); }}>Annuleren</button>
              <button className="px-4 py-2 rounded-md bg-coral text-white hover:opacity-90" onClick={async ()=>{ await submitForReview(); }}>
                Indienen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
