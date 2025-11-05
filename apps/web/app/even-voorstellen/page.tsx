import { Mail } from 'lucide-react';
import { TeamImage } from './team-image';

const team = [
  { name: 'Bert Kranendonk', role: 'Coach', email: 'bert@levendportret.nl', imageUrl: '/team/bert.jpg' },
  { name: 'Henk van Schilt', role: 'Coach', email: 'henk@levendportret.nl', imageUrl: '/team/henk.jpg' },
  { name: 'Herma Holtland', role: 'Accountmanager', email: 'herma@levendportret.nl', imageUrl: '/team/herma.jpg' },
  { name: 'Barry Annes', role: 'Filmmaker', email: 'barry@levendportret.nl', imageUrl: '/team/barry.jpg' },
  { name: 'Frank van Eijk', role: 'Filmmaker', email: 'frank@levendportret.nl', imageUrl: '/team/frank.jpg' },
];

export default function EvenVoorstellenPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Mission Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">Even voorstellen</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Levend Portret biedt een communityoplossing voor ondernemingen aan het begin van hun bestaansgeschiedenis.
        </p>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-navy text-center mb-12">Ons Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {team.map((member) => (
            <div key={member.name} className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 overflow-hidden">
                {/* Placeholder for image */}
                <TeamImage src={member.imageUrl} alt={member.name} />
              </div>
              <h3 className="text-lg font-bold text-navy">{member.name}</h3>
              <p className="text-coral mb-2">{member.role}</p>
              <a href={`mailto:${member.email}`} className="text-sm text-gray-500 hover:text-navy flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                {member.email}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-navy mb-4">Neem contact op</h2>
        <p className="text-lg text-gray-700 mb-2">Voor algemene vragen zijn we bereikbaar via:</p>
        <a href="mailto:info@levendportret.nl" className="text-xl text-coral font-bold hover:underline">
          info@levendportret.nl
        </a>
      </section>
    </div>
  );
}
