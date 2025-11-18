import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl md:text-4xl text-navy font-heading mb-3">Alleen voor leden</h1>
        <p className="text-gray-700 font-body">Log in om de Club-pagina met nieuws, tips en tricks te bekijken.</p>
        <div className="mt-6">
          <a href="http://localhost:3000/inloggen" className="inline-flex items-center px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">Inloggen</a>
        </div>
      </main>
    );
  }
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl md:text-4xl text-center text-navy font-heading mb-2">Club</h1>
      <p className="text-center text-gray-700 font-body mb-8">Binnenkort vind je hier nieuws, tips & tricks en club-updates.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg text-navy font-heading mb-2">Nieuws</h3>
          <p className="text-gray-700 font-body">Updates over evenementen, releases en clubactiviteiten.</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg text-navy font-heading mb-2">Tips & tricks</h3>
          <p className="text-gray-700 font-body">Praktische inzichten om je onderneming en zichtbaarheid te laten groeien.</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg text-navy font-heading mb-2">Community</h3>
          <p className="text-gray-700 font-body">Met en voor leden: samenwerken, vragen stellen en ervaringen delen.</p>
        </div>
      </div>
    </main>
  );
}
