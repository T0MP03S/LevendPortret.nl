"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from 'lucide-react';

type Company = {
  id: string;
  name: string | null;
  address: string | null;
  houseNumber: string | null;
  zipCode: string | null;
  city: string | null;
  workPhone: string | null;
  workEmail: string | null;
  kvkNumber: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
};

type Current = {
  user: { id: string; name: string | null; email: string; status: string; phone?: string | null };
  company: Company | null;
};

export default function InstellingenPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [data, setData] = useState<Current | null>(null);
  const [pageStatus, setPageStatus] = useState<string>("");
  const [fullAccess, setFullAccess] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateNotes, setUpdateNotes] = useState("");
  const [pageRejectionMessage, setPageRejectionMessage] = useState("");
  const updateModalRef = useRef<HTMLDivElement | null>(null);
  const updateOpenBtnRef = useRef<HTMLButtonElement | null>(null);
  const updateCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const [personal, setPersonal] = useState({ name: "", phone: "" });
  const [password, setPassword] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [company, setCompany] = useState({
    name: "",
    address: "",
    houseNumber: "",
    zipCode: "",
    city: "",
    workPhone: "",
    workEmail: "",
    kvkNumber: "",
    website: "",
    description: "",
    logoUrl: "",
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFileName, setLogoFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasExternalWebsite = !!(data?.company?.website);

  const load = async () => {
    setLoading(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      let json: any = {};
      try {
        json = await res.json();
      } catch {
        json = {};
      }
      if (!res.ok) throw new Error(json?.error || "Kon instellingen niet laden");
      setData(json as Current);
      setFullAccess(!!(json as any).fullAccess);
      setPersonal({ name: json.user?.name || "", phone: (json.user?.phone || "") });
      setCompany({
        name: json.company?.name || "",
        address: json.company?.address || "",
        houseNumber: json.company?.houseNumber || "",
        zipCode: json.company?.zipCode || "",
        city: json.company?.city || "",
        workPhone: json.company?.workPhone || "",
        workEmail: (json.company as any)?.workEmail || "",
        kvkNumber: json.company?.kvkNumber || "",
        website: json.company?.website || "",
        description: json.company?.description || "",
        logoUrl: json.company?.logoUrl || "",
      });
      // Load company page status + eventuele afwijsreden voor banners
      try {
        const r2 = await fetch('/api/settings/webpage', { cache: 'no-store' });
        const j2 = await r2.json().catch(()=>({}));
        if (r2.ok && j2?.page?.status) {
          setPageStatus(j2.page.status);
          setPageRejectionMessage(j2.lastRejectionMessage || "");
        } else {
          setPageStatus("");
          setPageRejectionMessage("");
        }
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSavePersonal = async () => {
    setError(""); setOk("");
    const res = await fetch("/api/settings/user", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: personal.name, phone: personal.phone || null }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError(json?.error || "Opslaan mislukt"); return; }
    setOk("Persoonlijke gegevens opgeslagen");
    await load();
  };

  const onChangePassword = async () => {
    setError(""); setOk("");
    if (!password.oldPassword || !password.newPassword || password.newPassword !== password.confirm) {
      setError("Wachtwoord ongeldig of bevestiging komt niet overeen");
      return;
    }
    const res = await fetch("/api/settings/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldPassword: password.oldPassword, newPassword: password.newPassword }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError(json?.error || "Wachtwoord wijzigen mislukt"); return; }
    setOk("Wachtwoord gewijzigd");
    setPassword({ oldPassword: "", newPassword: "", confirm: "" });
  };

  const onSaveCompany = async () => {
    setError(""); setOk("");
    const res = await fetch("/api/settings/company", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      name: company.name,
      address: company.address,
      houseNumber: company.houseNumber,
      zipCode: company.zipCode,
      city: company.city,
      workPhone: company.workPhone || null,
      workEmail: company.workEmail || null,
      kvkNumber: company.kvkNumber || null,
      website: company.website || null,
      description: company.description || null,
      logoUrl: company.logoUrl || null,
    }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError(json?.error || "Opslaan mislukt"); return; }
    setOk("Bedrijfsgegevens opgeslagen");
    await load();
  };

  const onSelectLogo = async (file: File | undefined | null) => {
    if (!file) return;
    setError(""); setOk(""); setUploadingLogo(true);
    try {
      const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
      if (!allowed.includes(file.type)) throw new Error("Alleen svg, png, jpg/jpeg of webp zijn toegestaan");
      const maxBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxBytes) throw new Error("Bestand is te groot (max 2MB)");
      setLogoFileName(file.name);
      const localUrl = URL.createObjectURL(file);
      setLogoPreview(localUrl);
      // Compute SHA-256 for dedupe
      const buf = await file.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hashArr = Array.from(new Uint8Array(hashBuf));
      const contentHash = hashArr.map(b=>b.toString(16).padStart(2,'0')).join('');
      const metaRes = await fetch("/api/settings/logo-upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type, contentHash }) });
      const meta = await metaRes.json();
      if (!metaRes.ok) throw new Error(meta?.error || "Kon upload-URL niet ophalen");
      if (meta.uploadUrl) {
        const putRes = await fetch(meta.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!putRes.ok) throw new Error("Upload naar opslag mislukt");
      }

      // Save the logo URL immediately via the new dedicated endpoint
      const saveRes = await fetch('/api/settings/logo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logoUrl: meta.publicUrl }) });
      if (!saveRes.ok) {
        const errJson = await saveRes.json().catch(() => ({}));
        throw new Error(errJson?.error || 'Logo kon niet worden opgeslagen');
      }

      setCompany(v => ({ ...v, logoUrl: meta.publicUrl }));
      setOk("Logo succesvol opgeslagen");
      setLogoFileName(""); // Reset filename
    } catch (e: any) {
      setError(e?.message || "Upload mislukt");
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold">Instellingen</h1>
      {!hasExternalWebsite && pageStatus === 'DRAFT' && pageRejectionMessage && (
        <div className="p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-900">
          <p className="text-sm font-semibold">Je vorige aanvraag is afgewezen.</p>
          <p className="mt-1 text-sm">{pageRejectionMessage}</p>
          <p className="mt-1 text-sm">Pas je webpagina aan via Webpagina instellingen en dien vervolgens opnieuw in.</p>
        </div>
      )}
      {!hasExternalWebsite && pageStatus === 'IN_REVIEW' && (
        <div className="p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-900">
          <p className="text-sm">Je webpagina staat in review. Aanpassen kan weer zodra de review is afgerond of je de pagina terugzet naar concept.</p>
        </div>
      )}
      {!hasExternalWebsite && pageStatus === 'PUBLISHED' && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm">Je webpagina staat live op Levend Portret. Wil je iets laten aanpassen? Vraag een update aan bij de admins.</p>
            <button ref={updateOpenBtnRef} onClick={()=>{ setUpdateModalOpen(true); requestAnimationFrame(()=>setUpdateModalVisible(true)); }} className="inline-flex items-center px-3 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">Update aanvragen</button>
          </div>
        </div>
      )}
      {data?.company && !data.company.website && fullAccess && pageStatus !== 'PUBLISHED' ? (
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-zinc-800">
              {pageStatus === 'IN_REVIEW'
                ? 'Je hebt een interne bedrijfspagina in review. Je kunt deze bekijken en eventueel terugzetten naar concept via Webpagina instellingen.'
                : 'Geen externe website opgegeven. Stel je interne bedrijfspagina in via Webpagina instellingen.'}
            </p>
            <a href="/instellingen/webpagina" className="inline-flex items-center px-3 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">Webpagina instellingen</a>
          </div>
        </div>
      ) : null}
      {loading ? <div>Laden…</div> : (
        <>
          {error && <div className="text-red-600">{error}</div>}
          {ok && (
            <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-sm">{ok}</div>
          )}

          <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Persoonlijk</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-700">Naam</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={personal.name} onChange={e=>setPersonal(v=>({...v,name:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Telefoon</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={personal.phone} onChange={e=>setPersonal(v=>({...v,phone:e.target.value}))} />
              </div>
            </div>
            <button onClick={onSavePersonal} className="px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">Opslaan</button>
          </section>

          <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Wachtwoord wijzigen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-zinc-700">Oud wachtwoord</label>
                <input type="password" className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={password.oldPassword} onChange={e=>setPassword(v=>({...v,oldPassword:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Nieuw wachtwoord</label>
                <input type="password" className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={password.newPassword} onChange={e=>setPassword(v=>({...v,newPassword:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Bevestig wachtwoord</label>
                <input type="password" className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={password.confirm} onChange={e=>setPassword(v=>({...v,confirm:e.target.value}))} />
              </div>
            </div>
            <button onClick={onChangePassword} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Wachtwoord wijzigen</button>
            <div className="text-xs text-zinc-500">Niet beschikbaar voor Google-only accounts.</div>
          </section>

          <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Bedrijf</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-700">Bedrijfsnaam</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.name} onChange={e=>setCompany(v=>({...v,name:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Bedrijfsadres</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.address} onChange={e=>setCompany(v=>({...v,address:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Huisnummer</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.houseNumber} onChange={e=>setCompany(v=>({...v,houseNumber:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Postcode</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.zipCode} onChange={e=>setCompany(v=>({...v,zipCode:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Plaats</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.city} onChange={e=>setCompany(v=>({...v,city:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Website (optioneel)</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.website} onChange={e=>setCompany(v=>({...v,website:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Werktelefoon (optioneel)</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.workPhone} onChange={e=>setCompany(v=>({...v,workPhone:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Zakelijk e-mailadres (optioneel)</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" type="email" value={company.workEmail} onChange={e=>setCompany(v=>({...v,workEmail:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">KVK-nummer (optioneel)</label>
                <input className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" value={company.kvkNumber} onChange={e=>setCompany(v=>({...v,kvkNumber:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Logo upload</label>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={e=>onSelectLogo(e.target.files?.[0])} />
                <div className="mt-1 flex items-center gap-3">
                  <button type="button" onClick={()=>fileInputRef.current?.click()} className="inline-flex items-center px-3 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">
                    Kies logo…
                  </button>
                  {logoFileName ? <span className="text-sm text-zinc-700 truncate max-w-[12rem]" title={logoFileName}>{logoFileName}</span> : <span className="text-sm text-zinc-500">Nog geen bestand gekozen</span>}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  {(logoPreview || company.logoUrl) ? (
                    <img src={logoPreview || company.logoUrl} alt="Logo" className="h-10 w-10 object-contain border border-zinc-200 rounded bg-white" />
                  ) : null}
                  {company.logoUrl ? (
                    <span className="text-sm text-zinc-700">{(company.logoUrl.split('?')[0].split('/').pop())}</span>
                  ) : null}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Toegestaan: svg, png, jpg/jpeg, webp. Max 2MB.</div>
                {uploadingLogo && <div className="text-xs text-zinc-500 mt-1">Uploaden…</div>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-700">Korte beschrijving (max 250 tekens)</label>
                <textarea className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" maxLength={250} rows={3} value={company.description} onChange={e=>setCompany(v=>({...v,description:e.target.value}))} />
              </div>
            </div>
            <button onClick={onSaveCompany} className="px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">Opslaan</button>
          </section>
        </>
      )}

      {updateModalOpen && (
        <div
          className={`fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${updateModalVisible ? 'opacity-100' : 'opacity-0'}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-modal-title"
          aria-describedby="update-modal-desc"
          onClick={()=>{ setUpdateModalVisible(false); setTimeout(()=>{ setUpdateModalOpen(false); updateOpenBtnRef.current?.focus(); },150); }}
          onKeyDown={(e)=>{
            if (e.key==='Escape') { setUpdateModalVisible(false); setTimeout(()=>{ setUpdateModalOpen(false); updateOpenBtnRef.current?.focus(); },150); }
            if (e.key==='Tab' && updateModalRef.current){
              const nodes = updateModalRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
              if (nodes.length){
                const first = nodes[0]; const last = nodes[nodes.length-1];
                const active = document.activeElement as HTMLElement | null;
                if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
              }
            }
          }}
        >
          <div ref={updateModalRef} className={`w-full max-w-sm bg-white rounded-xl border border-zinc-200 shadow-xl p-5 transform transition-all duration-150 ${updateModalVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'}`} onClick={(e)=>e.stopPropagation()} aria-busy={submittingUpdate}>
            <h3 id="update-modal-title" className="text-lg font-semibold">Update voor je webpagina aanvragen</h3>
            <p id="update-modal-desc" className="mt-2 text-sm text-zinc-600">Beschrijf zo concreet mogelijk wat je wilt laten wijzigen op je gepubliceerde webpagina. Dit bericht komt direct bij de admins terecht.</p>
            <div className="mt-4">
              <label className="block text-sm text-zinc-700">Wat wil je aanpassen?</label>
              <textarea
                className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
                rows={4}
                placeholder="Bijvoorbeeld: 'Logo updaten naar nieuwe versie' of 'Tekst in de intro aanpassen'."
                value={updateNotes}
                onChange={e=>setUpdateNotes(e.target.value)}
                />
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button ref={updateCloseBtnRef} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50" disabled={submittingUpdate} onClick={()=>{ setUpdateModalVisible(false); setTimeout(()=>{ setUpdateModalOpen(false); updateOpenBtnRef.current?.focus(); },150); }}>Annuleren</button>
              <button
                className="px-4 py-2 rounded-md bg-coral text-white hover:opacity-90 disabled:opacity-50 inline-flex items-center"
                disabled={!updateNotes.trim() || submittingUpdate}
                onClick={async ()=>{
                  setError(""); setOk("");
                  const notes = updateNotes.trim();
                  if (!notes) { setError('Beschrijf wat je wilt aanpassen'); return; }
                  setSubmittingUpdate(true);
                  const r = await fetch('/api/settings/webpage/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notes }),
                  });
                  const j = await r.json().catch(()=>({}));
                  if (!r.ok) {
                    setError(j?.error || 'Aanvraag mislukt');
                  } else {
                    setOk('Update aangevraagd. Een admin bekijkt je verzoek en kan je pagina tijdelijk terugzetten naar concept zodat je zelf de tekst en beelden kunt aanpassen.');
                    setUpdateNotes('');
                  }
                  setUpdateModalVisible(false);
                  setTimeout(()=>setUpdateModalOpen(false),150);
                  setSubmittingUpdate(false);
                }}
              >
                {submittingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aanvraag versturen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
