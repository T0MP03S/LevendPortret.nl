"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@levendportret/ui';

export default function OnboardingBedrijfPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: '' | 'error' | 'success'; message: string }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    phone: '',
    name: '',
    city: '',
    address: '',
    zipCode: '',
    houseNumber: '',
    workPhone: '',
    kvkNumber: '',
    website: '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Kon bedrijfsgegevens niet opslaan.');
      }
      setStatus({ type: 'success', message: 'Bedrijfsgegevens opgeslagen.' });
      router.replace('/in-behandeling');
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-6">Bedrijfsgegevens aanvullen</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <p className="text-gray-700 mb-4">Vul hieronder je bedrijfsgegevens aan zodat we je aanmelding compleet kunnen maken.</p>
        {status.message && (
          <div className={`mb-4 p-3 rounded text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status.message}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="phone">Jouw telefoonnummer</label>
            <input id="phone" name="phone" value={form.phone} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="name">Bedrijfsnaam</label>
            <input id="name" name="name" value={form.name} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="city">Plaats</label>
              <input id="city" name="city" value={form.city} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="zipCode">Postcode</label>
              <input id="zipCode" name="zipCode" value={form.zipCode} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="address">Straat</label>
              <input id="address" name="address" value={form.address} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="houseNumber">Huisnummer</label>
              <input id="houseNumber" name="houseNumber" value={form.houseNumber} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="workPhone">Zakelijk telefoonnummer (optioneel)</label>
              <input id="workPhone" name="workPhone" value={form.workPhone} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="kvkNumber">KvK-nummer (optioneel)</label>
              <input id="kvkNumber" name="kvkNumber" value={form.kvkNumber} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="website">Website (optioneel)</label>
            <input id="website" name="website" value={form.website} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" />
          </div>
          <Button type="submit" variant="coral" className="w-full" disabled={loading}>
            {loading ? 'Opslaan...' : 'Gegevens opslaan'}
          </Button>
        </form>
      </div>
    </div>
  );
}
