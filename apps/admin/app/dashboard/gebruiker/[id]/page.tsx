"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Company = {
  id: string;
  name: string | null;
  city: string | null;
  address: string | null;
  zipCode: string | null;
  houseNumber: string | null;
  workPhone: string | null;
  kvkNumber: string | null;
  website: string | null;
  slug: string | null;
};

type Item = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  company?: Company | null;
  memberships?: { product: string; status: string; startDate: string; endDate: string | null }[];
};

export default function GebruikerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMembershipConfirm, setShowMembershipConfirm] = useState(false);
  const [membershipConfirmTarget, setMembershipConfirmTarget] = useState<'FUND' | 'CLUB_COACH' | 'SWITCH_TO_FUND' | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    company: {
      name: "",
      city: "",
      address: "",
      zipCode: "",
      houseNumber: "",
      workPhone: "",
      kvkNumber: "",
      website: "",
    },
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kon gebruiker niet laden");
      const it = data.item as Item;
      setItem(it);
      setForm({
        name: it.name || "",
        phone: (it as any).phone || "",
        company: {
          name: it.company?.name || "",
          city: it.company?.city || "",
          address: it.company?.address || "",
          zipCode: it.company?.zipCode || "",
          houseNumber: it.company?.houseNumber || "",
          workPhone: it.company?.workPhone || "",
          kvkNumber: it.company?.kvkNumber || "",
          website: it.company?.website || "",
        },
      });
    } catch (e: any) {
      setError(e?.message || "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  const onConfirmMembershipAction = async () => {
    const target = membershipConfirmTarget;
    setShowMembershipConfirm(false);
    if (target === 'FUND') {
      await grantMembership('FUND');
    } else if (target === 'CLUB_COACH') {
      await grantClubCoachClips();
    } else if (target === 'SWITCH_TO_FUND') {
      await switchToFund();
    }
    setMembershipConfirmTarget(null);
  };

  const grantClubCoachClips = async () => {
    await grantMembership('CLUB');
    await grantMembership('COACH');
    await grantMembership('CLIPS');
    await load();
  };

  const grantMembership = async (product: 'CLUB' | 'COACH' | 'FUND' | 'CLIPS') => {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'GRANT_MEMBERSHIP', product })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Membership toekennen mislukt");
      setItem((prev) => {
        if (!prev) return prev;
        const list = [...(prev.memberships || [])];
        const idx = list.findIndex((m) => m.product === product);
        const updated = { product, status: 'ACTIVE', startDate: (data.membership?.startDate || new Date().toISOString()), endDate: null } as any;
        if (idx >= 0) list[idx] = updated; else list.push(updated);
        return { ...prev, memberships: list } as any;
      });
      setStatus("Membership toegekend");
    } catch (e: any) {
      setError(e?.message || "Membership toekennen mislukt");
    } finally {
      setSaving(false);
      await load();
    }
  };

  const switchToFund = async () => {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'SWITCH_TO_FUND' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Terug naar FUND mislukt");
      setStatus("Overgezet naar FUND");
      await load();
    } catch (e: any) {
      setError(e?.message || "Terug naar FUND mislukt");
    } finally {
      setSaving(false);
    }
  };

  const expireMembership = async (product: 'CLUB' | 'COACH' | 'FUND' | 'CLIPS') => {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'EXPIRE_MEMBERSHIP', product })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Membership beëindigen mislukt");
      setItem((prev) => {
        if (!prev) return prev;
        const list = [...(prev.memberships || [])];
        const idx = list.findIndex((m) => m.product === product);
        if (idx >= 0) list[idx] = { ...list[idx], status: 'EXPIRED', endDate: (data.membership?.endDate || new Date().toISOString()) } as any;
        return { ...prev, memberships: list } as any;
      });
      setStatus("Membership beëindigd");
    } catch (e: any) {
      setError(e?.message || "Membership beëindigen mislukt");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("company.")) {
      const key = name.split(".")[1] as keyof typeof form.company;
      setForm((prev) => ({ ...prev, company: { ...prev.company, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSave = async () => {
    setSaving(true);
    setStatus("");
    try {
      const payload = {
        name: form.name,
        phone: form.phone || null,
        company: {
          name: form.company.name,
          city: form.company.city,
          address: form.company.address,
          zipCode: form.company.zipCode,
          houseNumber: form.company.houseNumber,
          workPhone: form.company.workPhone || null,
          kvkNumber: form.company.kvkNumber || null,
          website: form.company.website || null,
        },
      };
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 400 && data?.issues?.fieldErrors) {
          setError("Ongeldige invoer. Controleer de velden (postcode/telefoon).");
          return;
        }
        throw new Error(data?.error || "Opslaan mislukt");
      }
      setStatus("Opgeslagen");
    } catch (e: any) {
      setError(e?.message || "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setShowDeleteConfirm(false);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Verwijderen mislukt");
      router.push("/dashboard/gebruikers");
    } catch (e: any) {
      setError(e?.message || "Verwijderen mislukt");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (action: 'APPROVE' | 'REJECT' | 'SET_PENDING') => {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Status wijzigen mislukt");
      setItem((prev) => (prev ? { ...prev, status: data.status || prev.status } : prev));
      await load();
      setStatus("Status gewijzigd");
    } catch (e: any) {
      setError(e?.message || "Status wijzigen mislukt");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-zinc-500">Dashboard &gt; Gebruikers &gt; {item?.name || item?.email || 'Gebruiker'}</div>
        <h1 className="text-3xl md:text-4xl font-bold">Gebruiker bewerken</h1>
        <div className="mt-3 flex items-center gap-3">
          <Link href="/dashboard/gebruikers" className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Terug naar gebruikers</Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
        {loading ? (
          <div>Laden…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !item ? (
          <div>Niet gevonden</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Naam</label>
                <input name="name" value={form.name} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input value={item.email} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-zinc-50 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefoon</label>
                <input name="phone" value={form.phone} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <input value={item.status} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-zinc-50 rounded-md" />
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-lg font-semibold">Memberships</h2>
              <div className="mt-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(item?.memberships || []).map((m, idx) => (
                    <span key={idx} className={`text-[11px] px-1.5 py-0.5 rounded-full ${m.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'}`}>{m.product}:{m.status}</span>
                  ))}
                </div>
                {(() => {
                  const hasClub = (item?.memberships || []).some((m:any)=> m.product==='CLUB' && m.status==='ACTIVE');
                  const hasCoach = (item?.memberships || []).some((m:any)=> m.product==='COACH' && m.status==='ACTIVE');
                  const hasClips = (item?.memberships || []).some((m:any)=> m.product==='CLIPS' && m.status==='ACTIVE');
                  const hasFund = (item?.memberships || []).some((m:any)=> m.product==='FUND' && m.status==='ACTIVE');
                  const fullAccess = hasClub && hasCoach && hasClips;
                  return (
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-zinc-700">Volledige toegang</label>
                      <button
                        onClick={async ()=>{
                          if (saving) return; setSaving(true);
                          try {
                            if (fullAccess) {
                              // Toggle OFF => FUND aan; CLUB/COACH/CLIPS uit
                              await expireMembership('CLUB');
                              await expireMembership('COACH');
                              await expireMembership('CLIPS');
                              if (!hasFund) { await grantMembership('FUND'); }
                            } else {
                              // Toggle ON => CLUB+COACH+CLIPS aan; FUND uit
                              await grantClubCoachClips();
                              if (hasFund) { await expireMembership('FUND'); }
                            }
                          } finally { setSaving(false); await load(); }
                        }}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm border ${fullAccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'}`}
                      >{fullAccess ? 'Aan' : 'Uit'}</button>
                      <span className="text-xs text-zinc-500">Aan = CLUB+COACH+CLIPS; Uit = FUND</span>
                    </div>
                  );
                })()}
                {(() => {
                  const activePaid = (item?.memberships || []).filter((m:any) => (m.product==='CLUB' || m.product==='COACH') && m.status==='ACTIVE');
                  const paidDate = activePaid.length ? new Date(Math.min(...activePaid.map((m:any)=> new Date(m.startDate).getTime()))) : null;
                  return paidDate ? (<div className="text-sm text-zinc-700">Betaald op: {paidDate.toLocaleDateString()}</div>) : null;
                })()}
                {/* Extra losse actieknoppen verwijderd ten gunste van de Volledige toegang schakelaar */}
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-lg font-semibold">Bedrijfsgegevens</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Naam</label>
                  <input name="company.name" value={form.company.name} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plaats</label>
                  <input name="company.city" value={form.company.city} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Straat</label>
                  <input name="company.address" value={form.company.address} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postcode</label>
                  <input name="company.zipCode" value={form.company.zipCode} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Huisnummer</label>
                  <input name="company.houseNumber" value={form.company.houseNumber} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Werktelefoon</label>
                  <input name="company.workPhone" value={form.company.workPhone} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">KVK-nummer</label>
                  <input name="company.kvkNumber" value={form.company.kvkNumber} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input name="company.website" value={form.company.website} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {item?.status !== 'ACTIVE' && (
                <button onClick={() => changeStatus('APPROVE')} disabled={saving} className="px-4 py-2 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60">Goedkeuren</button>
              )}
              {item?.status !== 'REJECTED' && (
                <button onClick={() => changeStatus('REJECT')} disabled={saving} className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60">Afkeuren</button>
              )}
              {item?.status !== 'PENDING_APPROVAL' && (
                <button onClick={() => changeStatus('SET_PENDING')} disabled={saving} className="px-4 py-2 rounded-md border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-60">Zet op in behandeling</button>
              )}
              <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61] disabled:opacity-60">{saving ? 'Opslaan…' : 'Opslaan'}</button>
              <button onClick={() => setShowDeleteConfirm(true)} disabled={saving} className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60">Verwijderen</button>
              {status && <span className="text-sm text-green-700">{status}</span>}
            </div>

            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                  <h3 className="text-lg font-semibold mb-2">Gebruiker verwijderen?</h3>
                  <p className="text-sm text-zinc-600">Dit verwijdert ook het bijbehorende bedrijf. Deze actie kan niet ongedaan worden gemaakt.</p>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50">Annuleren</button>
                    <button onClick={onDelete} className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">Verwijderen</button>
                  </div>
                </div>
              </div>
            )}

            {showMembershipConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                  <h3 className="text-lg font-semibold mb-2">Bevestig actie</h3>
                  <p className="text-sm text-zinc-600">
                    {membershipConfirmTarget === 'FUND' && 'Weet je zeker dat je FUND wilt toekennen?'}
                    {membershipConfirmTarget === 'CLUB_COACH' && 'Weet je zeker dat je CLUB + COACH wilt toekennen?'}
                    {membershipConfirmTarget === 'SWITCH_TO_FUND' && 'Weet je zeker dat je terug wilt naar FUND? Alle CLUB/COACH memberships worden verwijderd.'}
                  </p>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button onClick={() => { setShowMembershipConfirm(false); setMembershipConfirmTarget(null); }} className="px-3 py-1.5 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50">Annuleren</button>
                    <button onClick={onConfirmMembershipAction} className="px-3 py-1.5 rounded-md bg-coral text-white hover:bg-[#e14c61]">Bevestigen</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
