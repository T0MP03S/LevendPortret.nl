"use client";

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@levendportret/ui';

export default function AanmeldenPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '', 
    phone: '',
    companyName: '',
    companyCity: '',
    companyAddress: '',
    companyZip: '',
    companyHouseNumber: '',
    companyWorkPhone: '',
    companyKvk: '',
    companyWebsite: '',
    agreeLegal: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const focusFieldById = (id: string) => {
    const el = document.getElementById(id) as HTMLElement | null;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Wachtwoord moet minimaal 8 tekens lang zijn.';
    if (!/\d/.test(password)) return 'Wachtwoord moet minimaal één cijfer bevatten.';
    if (!/[A-Z]/.test(password)) return 'Wachtwoord moet minimaal één hoofdletter bevatten.';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _removed, ...rest } = prev;
        return rest;
      });
    }

    if (name === 'password' || name === 'confirmPassword') {
      const newPassword = name === 'password' ? value : formData.password;
      const newConfirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;

      const validationError = validatePassword(newPassword);
      if (validationError) {
        setPasswordError(validationError);
      } else if (newPassword !== newConfirmPassword && newConfirmPassword) {
        setPasswordError('Wachtwoorden komen niet overeen.');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit triggered');
    e.preventDefault();
    setStatus({ type: '', message: '' });
    if (passwordError) {
      setStatus({ type: 'error', message: 'Los de fouten in het wachtwoord op.' });
      requestAnimationFrame(()=>focusFieldById('password'));
      return;
    }
    if (!formData.agreeLegal) {
      setStatus({ type: 'error', message: 'U moet akkoord gaan met de voorwaarden en het privacybeleid.' });
      requestAnimationFrame(()=>focusFieldById('agreeLegal'));
      return;
    }
    try {
      setSubmitting(true);
      const { agreeLegal, ...rest } = formData as any;
      const payload = {
        ...rest,
        phone: rest.phone || null,
        companyWorkPhone: rest.companyWorkPhone || null,
        companyKvk: rest.companyKvk || null,
        companyWebsite: rest.companyWebsite || null,
      };
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 400 && data?.issues?.fieldErrors) {
          const fieldErrors = data.issues.fieldErrors as Record<string, string[]>;
          setErrors(fieldErrors);
          setStatus({ type: 'error', message: data.error || 'Ongeldige invoer' });
          const firstField = Object.keys(fieldErrors)[0];
          if (firstField) requestAnimationFrame(()=>focusFieldById(firstField));
          setSubmitting(false);
          return;
        }
        throw new Error(data.error || 'Er is iets misgegaan.');
      }

      // Trigger NextAuth email verification (development logs link in terminal)
      // Include callbackUrl so that after clicking the email link, NextAuth redirects to our post-auth router
      await signIn('email', {
        email: formData.email,
        callbackUrl: '/post-auth',
        redirect: true
      });
      setStatus({ type: 'success', message: 'Aanmelding succesvol! Check de pagina “Verificatie” en je e-mail.' });

    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-navy mb-8 text-center">Meld je bedrijf aan</h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
        <p className="text-sm text-gray-600">
          Na het indienen ontvang je een verificatiemail. Klik op de link in die mail om je aanmelding te bevestigen.
        </p>
        <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => signIn('google', { callbackUrl: '/post-auth' })}>
          <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 261.8 0 123.8 111.8 12.8 244 12.8c70.3 0 136.5 28.7 184.4 75.4l-62.9 62.9C337 119.3 293.8 96 244 96c-88.8 0-160.1 71.1-160.1 158.8s71.3 158.8 160.1 158.8c98.2 0 135-70.4 140.8-106.9H244v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
          Aanmelden met Google
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Of meld je aan met e-mail</span></div>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy={submitting}>
          {status.message && (
            <div role="alert" aria-live="polite" className={`md:col-span-2 p-4 rounded-md text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {status.message}
            </div>
          )}
          {Object.keys(errors).length > 0 && (
            <div className="md:col-span-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
              <p className="font-semibold mb-1">Controleer de invoer in onderstaande velden:</p>
              <ul className="list-disc ml-5">
                {Object.keys(errors).map((k)=> (
                  <li key={k}>{k} — {errors[k]?.[0]}</li>
                ))}
              </ul>
            </div>
          )}
        
        {/* Personal Info */}
        <div className="md:col-span-2 font-bold text-lg text-navy">Jouw Gegevens</div>
        <InputField label="Voornaam" name="firstName" value={formData.firstName} onChange={handleChange} required error={errors.firstName?.[0]} />
        <InputField label="Achternaam" name="lastName" value={formData.lastName} onChange={handleChange} required error={errors.lastName?.[0]} />
        <InputField label="E-mailadres" name="email" type="email" value={formData.email} onChange={handleChange} required error={errors.email?.[0]} />
        <InputField label="Telefoonnummer" name="phone" type="tel" value={formData.phone} onChange={handleChange} required error={errors.phone?.[0]} />
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Wachtwoord</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coral focus:border-coral pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-1 my-auto w-10 h-10 flex items-center justify-center rounded text-gray-600 hover:text-navy"
              aria-label={showPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Bevestig Wachtwoord</label>
          <div className="relative mt-1">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coral focus:border-coral pr-16"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-1 my-auto w-10 h-10 flex items-center justify-center rounded text-gray-600 hover:text-navy"
              aria-label={showConfirm ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {passwordError && <p className="md:col-span-2 text-red-500 text-xs -mt-4">{passwordError}</p>}

        {/* Company Info */}
        <div className="md:col-span-2 font-bold text-lg text-navy mt-4">Bedrijfsgegevens</div>
        <InputField label="Bedrijfsnaam" name="companyName" value={formData.companyName} onChange={handleChange} required error={errors.companyName?.[0]} />
        <InputField label="Bedrijfsadres" name="companyAddress" value={formData.companyAddress} onChange={handleChange} required error={errors.companyAddress?.[0]} />
        <InputField label="Huisnummer" name="companyHouseNumber" value={formData.companyHouseNumber} onChange={handleChange} required error={errors.companyHouseNumber?.[0]} />
        <InputField label="Postcode" name="companyZip" value={formData.companyZip} onChange={handleChange} required error={errors.companyZip?.[0]} />
        <InputField label="Plaats" name="companyCity" value={formData.companyCity} onChange={handleChange} required error={errors.companyCity?.[0]} />
        <InputField label="Werktelefoon (optioneel)" name="companyWorkPhone" type="tel" value={formData.companyWorkPhone} onChange={handleChange} error={errors.companyWorkPhone?.[0]} />
        <InputField label="KVK-nummer (optioneel)" name="companyKvk" value={formData.companyKvk} onChange={handleChange} error={errors.companyKvk?.[0]} />
        <InputField
          label="Website (optioneel)"
          name="companyWebsite"
          type="url"
          value={formData.companyWebsite}
          onChange={handleChange}
          onBlur={(e)=>{
            const raw = e.target.value.trim();
            if (raw && !/^https?:\/\//i.test(raw)) {
              setFormData(prev=>({...prev, companyWebsite: `https://${raw}`}));
            }
          }}
          error={errors.companyWebsite?.[0]}
        />

        {/* Agreements & Submit */}
        <div className="md:col-span-2 mt-4 space-y-4">
          <CheckboxField
            label={<>Ik ga akkoord met de <Link href="/voorwaarden" className="text-coral hover:underline">algemene voorwaarden</Link> en het <Link href="/privacy" className="text-coral hover:underline">privacybeleid</Link></>}
            name="agreeLegal"
            checked={formData.agreeLegal}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" variant="coral" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aanmelding Voltooien
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
}

// Helper components for cleaner form structure
const InputField = ({ label, name, type = 'text', value, onChange, onBlur, required = false, error }: { label: string; name: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; required?: boolean; error?: string }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input type={type} name={name} id={name} required={required} value={value} onChange={onChange} onBlur={onBlur} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coral focus:border-coral" />
    {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
  </div>
);

const CheckboxField = ({ label, name, checked, onChange }: { label: React.ReactNode; name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="flex items-center">
    <input type="checkbox" name={name} id={name} checked={checked} onChange={onChange} className="h-4 w-4 text-coral border-gray-300 rounded focus:ring-coral" />
    <label htmlFor={name} className="ml-2 block text-sm text-gray-900">{label}</label>
  </div>
);
