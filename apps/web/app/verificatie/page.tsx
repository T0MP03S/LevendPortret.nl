export default function VerificatiePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-navy mb-4">Controleer je e-mail</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <p>
          We hebben je een verificatielink gestuurd. Klik op de link in je e-mail om je e-mailadres te bevestigen.
        </p>
        <p className="text-sm text-gray-600">
          Ontvang je niets? Controleer je spam of probeer het later opnieuw via de inlogpagina.
        </p>
      </div>
    </div>
  );
}
