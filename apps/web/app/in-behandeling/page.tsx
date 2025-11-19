import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function InBehandelingPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  const email = session?.user?.email || null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  const status = (user as any)?.status as string | undefined;

  // Mark this page as seen for up to 7 days to optionally hide the tab/link later
  try {
    const jar = cookies();
    const key = 'lp_pending_seen_at';
    const existing = jar.get(key)?.value;
    if (!existing) {
      jar.set(key, String(Date.now()), { path: '/', maxAge: 60 * 60 * 24 * 180 });
    }
  } catch {}

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-navy mb-4">Aanmelding in behandeling</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        {status === 'ACTIVE' ? (
          <div className="space-y-3">
            <div className="p-3 rounded text-sm bg-emerald-50 text-emerald-800">Je account is geaccepteerd. Welkom!</div>
            <div className="flex items-center gap-3 pt-1">
              <Link href="/instellingen" className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Naar instellingen</Link>
            </div>
          </div>
        ) : status === 'REJECTED' ? (
          <div className="p-3 rounded text-sm bg-red-100 text-red-800">Je aanmelding is helaas afgewezen. Neem contact op via <a className="underline" href="mailto:info@levendportret.nl">info@levendportret.nl</a> als je vragen hebt.</div>
        ) : (
          <div className="p-3 rounded text-sm bg-yellow-50 text-yellow-800">Status: in behandeling (wachtend op goedkeuring).</div>
        )}
        <p>Bedankt voor je aanmelding! We hebben je gegevens ontvangen.</p>
        <p>
          We nemen zo snel mogelijk telefonisch contact met je op om een afspraak in te plannen. Tijdens dit gesprek spreek je met een coach die je aanmelding beoordeelt, je account
          kan goedkeuren en je kort meeneemt in hoe alles werkt.
        </p>
        <p>
          Plan je liever direct per e-mail? Stuur dan een bericht naar
          <a className="text-coral font-medium ml-1 hover:underline" href="mailto:info@levendportret.nl">info@levendportret.nl</a>.
        </p>
        <div className="pt-2">
          <Link href="/" className="inline-flex px-4 py-2 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50">Terug</Link>
        </div>
      </div>
    </div>
  );
}
