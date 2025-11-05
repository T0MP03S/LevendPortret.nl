export default function InBehandelingPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-navy mb-4">Aanmelding in behandeling</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <p>Bedankt voor je aanmelding! We hebben je gegevens ontvangen.</p>
        <p>
          We nemen zo snel mogelijk telefonisch contact met je op om een afspraak in te plannen. Tijdens dit gesprek spreek je met een coach die je aanmelding beoordeelt, je account
          kan goedkeuren en je kort meeneemt in hoe alles werkt.
        </p>
        <p>
          Plan je liever direct per e-mail? Stuur dan een bericht naar
          <a className="text-coral font-medium ml-1 hover:underline" href="mailto:info@levendportret.nl">info@levendportret.nl</a>.
        </p>
      </div>
    </div>
  );
}
