export default function AdminLoginPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Inloggen</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 text-center">
        <p className="text-zinc-700">Log in met e-mail. Je ontvangt één link om je wachtwoord in te stellen. Daarna log je voortaan alleen met e-mail + wachtwoord in.</p>
        <a href="/api/auth/signin" className="inline-block w-full px-4 py-2 rounded-md bg-zinc-900 text-white hover:bg-zinc-800">Ga naar inloggen</a>
      </div>
    </div>
  );
}
