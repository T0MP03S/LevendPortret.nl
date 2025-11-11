### Beleid credentials login
- Credentials login is toegestaan zodra het e-mailadres is geverifieerd (niet afhankelijk van `ACTIVE`).
- Niet-ACTIVE gebruikers kunnen wel inloggen maar worden door middleware en `/post-auth` beperkt tot `/in-behandeling` (en onboarding indien nodig).

### TODO
- Na succesvolle registratie een notificatiemail sturen naar `info@levendportret.nl` (server-side) met de ingevulde gegevens en link naar admin-overzicht.
# Levend Portret — Docs gids (stap-voor-stap)

Gebruik dit document als centrale leidraad. We lopen in deze volgorde:
 
## 0) Beslispunten (eerst afvinken)
- [x] Prijscommunicatie op site: € 2.450 excl. btw
- [x] Primaire CTA: “Meld je aan” (formulier)
- [x] Kaart (club): opnemen in v2, niet in MVP

Links ter referentie:
- Plan: [TODO - Plan van aanpak](./TODO%20-%20Plan%20van%20aanpak.md)
- Structuur: [Sitestructuur - Domeinen en Slugs](./Sitestructuur%20-%20Domeinen%20en%20Slugs.md)

---

## 1) Setup & Infra
- [x] GitHub repo (monorepo: Turborepo + pnpm + TypeScript)
- [x] Lokaal ontwikkelen: Node 18+, pnpm, Turbo
- [x] Database lokaal: Postgres 16 via Docker Compose
- [x] Compose en env voorbeeld toegevoegd (docker-compose.yml, .env.example)
- [x] Prisma .env voor lokaal instellen (DATABASE_URL)
- [x] Shared Auth package toegevoegd (NextAuth + PrismaAdapter)
- [x] Google OAuth geconfigureerd en getest (env invullen + redirect URIs)
- [x] E-mail/wachtwoord provider (Credentials) + /register pagina toegevoegd
- [x] ENV templates aanwezig (.env.local.example / .env.production.example)
- [x] Env-unificatie: alleen root `.env.local` (dev) en `.env.production` (prod). Per-app `.env.local(.example)` en `packages/db/.env` vervallen.
- [ ] (Later) Vercel projecten: web, club, fund, admin
- [ ] (Later) Cloudflare DNS: CNAME records naar Vercel voor web/club/fund/admin

## 2) Codebase opzetten
- [x] Turborepo skeleton met apps: `web`, `club`, `fund`, `admin`
- [x] Packages: `db` (Prisma), `auth` (NextAuth)
- [x] Packages: `ui`, `config`, `utils`
- [x] Prisma schema + eerste migratie
- [x] Tailwind + shadcn/ui + Lucide setup gedeeld in `ui`
- [ ] Auth SSO: shared cookie domein `.levendportret.nl`

## 3) Pagina’s & flows bouwen (MVP)
- [x] Web: Home pagina
- [x] Web: Even voorstellen pagina
- [x] Web: Aanmelden formulier
- [ ] Web: Communicatie (placeholder)
- [ ] Web: Settings pagina waar je je account en bedrijf kunt beheren
- [ ] Web: Privacy & Voorwaarden
- [ ] Club (club.levendportret.nl): Overzicht (grid + 30s modal), Detail (5 min embed), Login/Register/Reset, Mijn-bedrijf bewerken
- [ ] Moderatie: status “Ingediend/Goedgekeurd/Gepubliceerd” zichtbaar en beheerbaar (admin)
- Admin (admin.levendportret.nl):
  - [x] Login (magic link → registratie → credentials)
  - [x] Dashboard (skeleton)
  - [ ] Bedrijven/Clips/Funds/Donaties
  - [ ] Moderatie-flow


## 4) Content & integraties
- [ ] Vimeo integratie (embeds): 30s + 5 min IDs per bedrijf
- [ ] Thumbnails/foto’s upload naar R2, signed URL’s in UI
 - [ ] Clips: zie de vragenlijst voor scope en UX → [docs/clips/QUESTIONNAIRE.md](./clips/QUESTIONNAIRE.md)

### Cloudflare R2 voor logo uploads (web)

- **Wat we gebruiken**
  - Presigned PUT URL vanaf server: `POST /api/settings/logo-upload` retourneert `uploadUrl` + `publicUrl`.
  - Client uploadt direct naar R2 via S3 API. Resultaat-URL wordt opgeslagen in `Company.logoUrl` via `POST /api/settings/logo` (dedicated endpoint).

- **Benodigdheden in Cloudflare**
  - Maak een R2 bucket, bv. `levendportret`.
  - Maak een API Token met R2 `Edit` rechten op deze bucket (Account → R2 → API Tokens → Create API Token → Permissions: Object Read & Write voor de bucket).
  - Noteer jouw Account ID (te zien in R2 dashboard).
  - Optioneel/public: stel een Public Domain in voor de bucket (R2 → jouw bucket → Public Access → Custom domain of R2 public URL).

- **Endpoint (S3 API)**
  - Endpoint: `https://<accountid>.r2.cloudflarestorage.com` (S3-compatible). Region: `auto`.
  - We gebruiken path-style (`forcePathStyle: true`).

- **CORS instellen (bucket)**
  - Sta uploads vanaf localhost toe. Voorbeeld CORS (conceptueel):
    - Allowed Origins: `http://localhost:3000`
    - Allowed Methods: `PUT, GET, HEAD`
    - Allowed Headers: `Content-Type, Authorization`
    - Max Age: `3600`
  - Zet dit in de R2 bucket CORS-instellingen.

- **Env variabelen (.env.local, root)**
  - R2_ENDPOINT=`https://<accountid>.r2.cloudflarestorage.com`
  - R2_ACCESS_KEY_ID=`<api token access key>`
  - R2_SECRET_ACCESS_KEY=`<api token secret>`
  - R2_BUCKET=`levendportret`
  - R2_PUBLIC_BASE_URL=`https://<public-domain-of-bucket-or-r2-public-url>`

- **Welke sleutel waar (mapping)**
  - Cloudflare “Token value” (voor de Cloudflare Management API) → NIET gebruikt voor S3 uploads.
  - R2/S3 “Access key id” → zet in `R2_ACCESS_KEY_ID`.
  - R2/S3 “Secret access key” → zet in `R2_SECRET_ACCESS_KEY`.
  - Jurisdiction/Region endpoint (S3) → zet in `R2_ENDPOINT`, b.v. `https://<accountid>.r2.cloudflarestorage.com` (of EU-variant indien van toepassing).
  - Publieke URL van je bucket/domein → zet in `R2_PUBLIC_BASE_URL` (b.v. `https://pub-xxxxx.r2.dev/<bucket>` of je eigen domein).

- **Installeren dependencies (eenmalig)**
  - `pnpm -C apps/web add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`

- **Testen**
  - Start dev (`pnpm dev`).
  - Ga naar `http://localhost:3000/instellingen` → sectie Bedrijf → upload een logo.
  - Controleer dat na upload de `logoUrl` zichtbaar is en `PUT /api/settings/company` dit bewaart.

- [ ] Eerste 1–5 bedrijven/clips ingeven (seed of via admin)

## Security
- Rate limiting:
  - Magic link: 5/uur per e-mail (NextAuth Email provider)
  - Credentials login: 10/10min per e-mail
  - Registratie: 10/10min per IP, 5/uur per e-mail
  - Onboarding company: 30/10min per IP
  - NB: In-memory limiter in dev; in productie Upstash/Redis configureren.
- Input validatie: Zod op `POST /api/auth/register` en `POST /api/onboarding/company`.
- HTTP headers (via next.config.mjs -> headers()): CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- NextAuth: e-mail normalisatie, credentials alleen na e-mailverificatie, status gating via middleware.
- Aanbevelingen productie:
  - Zet `debug` en console logging uit
  - Gebruik native `bcrypt` met hogere cost (12) op Linux/Node 20
  - Vervang in-memory rate limiter door Upstash/Redis
  - Verfijn CSP (alleen noodzakelijke origins) en forceer HTTPS (HSTS)

## 5) QA, SEO & Go-live
- [ ] SEO/OG basics: meta titles/descriptions, OG-image(s), sitemap/robots per app
- [ ] Toegankelijkheid quick pass; performance basics
- [ ] Staging-deploys werkend; redirect www→apex, http→https
- [ ] Go-live checklist doorlopen en akkoord

## Lokale URLs en run
- web: http://localhost:3000
- club: http://localhost:3001
- fund: http://localhost:3002
- admin: http://localhost:3003

Start alles: `pnpm dev`
Per app: `pnpm -C apps/web dev` (of club/fund/admin)

### Lokale subdomeinen & SSO (aanbevolen)
- Voeg aan je hosts file toe (Windows: `C:\\Windows\\System32\\drivers\\etc\\hosts`):
  - `127.0.0.1 web.levendportret.local`
  - `127.0.0.1 club.levendportret.local`
  - `127.0.0.1 fund.levendportret.local`
  - `127.0.0.1 admin.levendportret.local`
- Start elke app met eigen URL/poort en zet per app `NEXTAUTH_URL`:
  - web: `http://web.levendportret.local:3000`
  - club: `http://club.levendportret.local:3001`
  - fund: `http://fund.levendportret.local:3002`
  - admin: `http://admin.levendportret.local:3003`
- SSO over subdomeinen inschakelen (zelfde login op alle apps):
  - Zet in `.env.local` (root) dezelfde `NEXTAUTH_SECRET` voor alle apps.
  - Zet `AUTH_COOKIE_DOMAIN=.levendportret.local` (de auth-config gebruikt dit voor shared cookies).

### Lokale setup zonder subdomeinen (localhost)
- Gebruik alleen:
  - http://localhost:3000 (web)
  - http://localhost:3001 (club)
  - http://localhost:3002 (fund)
  - http://localhost:3003 (admin)
- Laat `AUTH_COOKIE_DOMAIN` LEGE of verwijder deze variabele in `.env.local` (niet geldig op localhost).
- Hou dezelfde `NEXTAUTH_SECRET` voor alle apps.
- Start elke app met zijn eigen `NEXTAUTH_URL` (PowerShell):
  - web: `$env:NEXTAUTH_URL="http://localhost:3000"; pnpm -C apps/web dev`
  - club: `$env:NEXTAUTH_URL="http://localhost:3001"; pnpm -C apps/club dev`
  - fund: `$env:NEXTAUTH_URL="http://localhost:3002"; pnpm -C apps/fund dev`
  - admin: `$env:NEXTAUTH_URL="http://localhost:3003"; pnpm -C apps/admin dev`

Belangrijk:
- Plaats de root `.env.local` in de map `LevendPortret.nl/` (dezelfde map als deze README en het root `package.json`).
- De admin dev-script laadt deze via `dotenv -e ../../.env.local` (vanuit `apps/admin`).
- Minimale vereiste variabelen:
  - `DATABASE_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAILS`, (optioneel) `EMAIL_FROM`.

Let op:
- Per-app `dev` scripts laden nu automatisch de root `.env.local` via `dotenv-cli`. Je hebt dus géén per-app `.env.local` nodig.
- Op localhost is `NEXTAUTH_URL` optioneel; NextAuth gebruikt de request-origin (http://localhost:3000, etc.). Alleen zetten als je expliciet wilt forceren.

#### Eén app starten met root .env.local
- Gebruik `dotenv-cli` om de root `.env.local` te laden als je één app los wilt starten:
  - admin: `dotenv -e .env.local -- pnpm -C apps/admin dev`
  - web: `dotenv -e .env.local -- pnpm -C apps/web dev`
  - club: `dotenv -e .env.local -- pnpm -C apps/club dev`
  - fund: `dotenv -e .env.local -- pnpm -C apps/fund dev`

#### Troubleshooting: JWT_SESSION_ERROR (JWEDecryptionFailed)
- Oorzaak: cookie is versleuteld met een andere `NEXTAUTH_SECRET` of cookie werd gezet met een ongeldig domein.
- Oplossing:
  - Verwijder `AUTH_COOKIE_DOMAIN` op localhost (cookie domains met poort/`.localhost` zijn ongeldig).
  - Wis cookies voor `localhost` in je browser (naam: `next-auth.session-token`).
  - Zorg dat `NEXTAUTH_SECRET` overal hetzelfde is en ongewijzigd blijft.
  - Herstart dev servers na env-wijzigingen.

### Admin inloggen (policy)
- Admin-app (localhost:3003):
  1. **Eerste keer**: Ga naar http://localhost:3003 → zie welkomstpagina met "Inloggen" knop.
  2. Klik "Inloggen" → `/inloggen` → vul je e-mailadres in (moet in `ADMIN_EMAILS` staan).
  3. Client-side pre-check: als e-mailadres niet in `ADMIN_EMAILS` staat, wordt géén magic link verzonden (en geen token aangemaakt). Je krijgt een melding.
  4. Als het e-mailadres wél is toegestaan: je krijgt een magic link via e-mail (dev: link wordt gelogd in terminal). Je gaat naar `/admin-verificatie?email=<jouw-mail>` waar je mailadres zichtbaar is en tips staan (check spam/terminal).
  5. Klik de magic link → redirect naar `/dashboard` (callback). Middleware stuurt je indien nodig door naar `/admin-registratie` om eerst een wachtwoord te zetten.
  6. Stel je wachtwoord in (min 8 tekens) → je wordt automatisch ingelogd en doorgestuurd naar `/dashboard`.
  7. Vanaf nu: alleen inloggen met e-mail + wachtwoord. Google is uitgeschakeld in admin.
  8. Admin-e-mails (opgenomen in `ADMIN_EMAILS`) worden na verificatie automatisch als `ADMIN` gemarkeerd en krijgen status `ACTIVE`. Zij komen nooit in de lijst "In behandeling" terecht.
- Middleware:
  - Publieke routes (`/inloggen`, `/admin-verificatie`, `/admin-registratie`) zijn altijd toegankelijk.
  - Beschermde routes (zoals `/dashboard`) dwingen je eerst naar `/admin-registratie` als je nog geen wachtwoord hebt.
- API:
  - `POST /api/admin/set-password` met `{ password }` (min 8 tekens).

#### Admin UI
- Header is "floating" (navy, afgeronde hoeken, schaduw) en toont, zodra ingelogd:
  - Gebruikersnaam (of e-mail) en een Uitloggen-knop.
  - Link naar Dashboard.
- Fonts: admin gebruikt zelf-gehoste Bree voor headings en Montserrat voor body.
- Registratie: we vragen ook om Naam bij het instellen van het wachtwoord; deze wordt in de header getoond.

### Env-beheer (unified)
- Gebruik alleen root `.env.local` (development) en `.env.production` (productie).
- Prisma en Turbo laden het root-env via `dotenv-cli`.
- Vereiste keys (minimaal lokaal):
  - `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
  - Optioneel nu: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`


### Inloggen met Credentials (e-mail/wachtwoord)
- Prisma schema heeft `User.passwordHash` (bcrypt) voor credentials-login.
- Registratie: ga naar `/register` om een account aan te maken (maakt `User` met `passwordHash`).
- Stappen:
  1) Dependencies installeren: `pnpm install`
  2) Migratie draaien: `pnpm prisma:migrate:dev`
  3) Genereer hash (vervang WACHTWOORD):
     - PowerShell: `node -e "console.log(require('bcryptjs').hashSync('WACHTWOORD', 10))"`
  4) Open Prisma Studio: `pnpm prisma:studio` → User → zet `passwordHash` op de hash → Save
  5) Ga naar `/api/auth/signin` en kies Credentials (email + wachtwoord)

### Sessies verifiëren per app
- web: `http://localhost:3000/api/auth/session`
- club: `http://localhost:3001/api/auth/session`
- fund: `http://localhost:3002/api/auth/session`
- admin: `http://localhost:3003/api/auth/session`
- Tip voor lokale loginflow per app: start elke app met z’n eigen `NEXTAUTH_URL`:
  - club: `$env:NEXTAUTH_URL="http://localhost:3001"; pnpm -C apps/club dev`
  - fund: `$env:NEXTAUTH_URL="http://localhost:3002"; pnpm -C apps/fund dev`
  - admin: `$env:NEXTAUTH_URL="http://localhost:3003"; pnpm -C apps/admin dev`

### Fonts (Self-hosted)
- **Status:** We hosten de fonts nu zelf voor maximale betrouwbaarheid.
- **Bestanden:** `.woff2` bestanden staan in `apps/web/public/fonts/`. Let op: Bree-bestandsnamen bevatten spaties, bv. `Bree Regular.woff2` en `Bree Bold.woff2`.
- **Implementatie:** De `@font-face` regels in `apps/web/app/globals.css` zijn aangepast naar deze exacte bestandsnamen om 404's te voorkomen.
- **Headings:** Bree (Bold, 700)
- **Body:** Montserrat (Regular, 400)

## Notities
- Foto’s/galerij via Cloudflare R2 (S3), video via Vimeo.
- SSO-cookie domein: `.levendportret.nl`.
- Betalingen Mollie (iDEAL, recurring) in v2 (webhooks + refundregistratie in admin).
- Root Next dependency verwijderd om versieconflict te voorkomen. Gebruik per app Next 14.2.14; Node 20 LTS aanbevolen voor stabiliteit.

## Plan van Aanpak: Nieuwe Aanmeld- en Goedkeuringsflow

Dit plan vervangt de standaard registratie met een professionele, meertraps aanmeldflow.

**Fase 1: Database Model Aanpassen (`packages/db`)**
- [x] Nieuw `Company` model aanmaken in `schema.prisma` met alle bedrijfsvelden.
- [x] `User` en `Company` koppelen (één-op-één).
- [x] `status` veld toevoegen aan `User` (`PENDING_VERIFICATION`, `PENDING_APPROVAL`, `ACTIVE`, `REJECTED`).

**Fase 2: UI - Het Aanmeldformulier (`apps/web`)**
- [x] Huidig `/aanmelden` formulier vervangen door uitgebreide versie met alle nieuwe velden.
- [x] Wachtwoordsterkte-validatie toevoegen (client-side).
- [x] Verplichte vinkjes voor Algemene Voorwaarden en Privacybeleid.

**Fase 3: Backend & E-mailverificatie (`packages/auth`)**
- [x] API route (`/api/auth/register`) verwerkt formulier en maakt `User` + `Company` aan met status `PENDING_VERIFICATION`.
- [x] E-mailverificatie in development: via `signIn('email')` vanaf de client; link wordt in de terminal gelogd (geen SMTP nodig).
- [x] Na verificatie: status updaten naar `PENDING_APPROVAL` via `events.signIn` (Email provider).

**Fase 4: Verificatie en In Behandeling Pagina's (`apps/web`)**
- [x] Pagina aangemaakt op `/verificatie` (NextAuth verifyRequest): na het aanvragen van een magic link kom je hier terecht met instructie "check je e-mail".
- [x] Pagina aangemaakt op `/in-behandeling`: na succesvolle e-mailverificatie wordt de gebruiker hierheen geleid met de melding dat we contact opnemen voor een afspraak.

- **Fase 5: Aangepaste Login & Middleware**
- [x] Redirects na login/verificatie via serverpagina `/post-auth`: `ACTIVE` → `/`, anders → `/in-behandeling`.
- [x] Middleware toegevoegd: ingelogde gebruikers kunnen `/inloggen` niet bezoeken; niet-ACTIVE gebruikers worden beperkt tot openbare pagina's, `/in-behandeling`, `/post-auth` en `/onboarding/bedrijf`.
- [ ] Middleware uitbreiden voor app-sectie `/club` zodra beschikbaar.
- [x] Middleware uitbreiden voor app-sectie `/admin` (gerealiseerd in admin-app).
- [ ] Middleware uitbreiden voor app-sectie `/fund` zodra beschikbaar.

**Fase 6: Admin Goedkeuringsflow (`apps/admin`)**
- [x] Overzichtspagina met alle `PENDING_APPROVAL` gebruikers (incl. snelle Goedkeuren/Afwijzen knoppen).
- [x] Detailweergave met alle bedrijfsgegevens.
- [x] Actieknoppen ("Goedkeuren" / "Afwijzen") om de gebruikersstatus aan te passen (zowel in lijst als detail).

## Recente voortgang & Volgende stappen

**Laatst voltooid (Fase A & B):**
- **Auth & Basis:** Volledige setup van NextAuth (Google & Credentials), database migraties, en een stabiele lokale dev-omgeving.
- **UI Package:** Gedeelde UI-bibliotheek opgezet met Tailwind, kleuren, en self-hosted fonts (Bree & Montserrat).
- **Web Pagina's (MVP):**
  - `Home`: Volledig gestyled met hero, features, werkwijze en prijs.
  - `Even voorstellen`: Team-pagina met placeholders.
  - `Aanmelden`: Uitgebreid formulier met validatie, wachtwoord-toggle (Lucide Eye/EyeOff), Google-knop bovenaan. Na indienen: `signIn('email', { callbackUrl: '/post-auth' })` triggert verificatielink (development: link wordt gelogd in de terminal waar `pnpm dev:web` draait) en redirect naar `/verificatie`. Na klikken op de link: je komt op `/post-auth`, die je doorstuurt naar `/in-behandeling` zolang je nog niet `ACTIVE` bent.
  - `Inloggen`: Custom pagina op `/inloggen` met twee stappen. Stap 1: Google-knop staat boven het e-mailadres veld. Stap 2: kies methode (magic link (Email) of credentials). Wachtwoordveld heeft een toon/verberg-icoon. Ingelogd → redirect naar `/`.
  - `Onboarding`: `/onboarding/bedrijf` om bedrijfsgegevens aan te vullen als je via Google of magic link nog geen bedrijf hebt. `post-auth` route stuurt automatisch naar onboarding als er nog geen company is; daarna naar `/in-behandeling`.
  - Fonts: Bree-bestandsnamen met spaties gemapt in `globals.css` om 404's te fixen.

**Volgende stappen:**
1.  **Web Pagina's afronden:**
    - `Privacy` en `Voorwaarden` pagina's aanmaken met placeholder-tekst.
2.  **Start Fase C (Club):**
    - Bouwen van het overzicht van bedrijven (`/club`).
    - Detailpagina per bedrijf met video-embeds.

### Stappenplan: Instellingen → Fund (per questionnaire)

Fase 1 — Web `/instellingen` (profiel bewerken)
- Route: `apps/web/app/instellingen/page.tsx` (client) + API endpoints.
- Toegang: alleen `ACTIVE` gebruikers (middleware + server checks).
- Header: in user-dropdown een link “Instellingen” (alleen voor ACTIVE).
- Secties en velden:
  - Persoonlijk: naam, telefoon.
  - Wachtwoord wijzigen: oud wachtwoord + nieuw + bevestiging. Niet toegestaan voor Google-only accounts (behalve naam/telefoon).
  - Bedrijf: naam, plaats, logo-upload, korte beschrijving (max 250 tekens), optioneel adres/website. Publieke toggles: toon naam/logo/locatie.
- Validaties: NL-telefoon, logo-bestandsformaten, max-lengtes.
- Opslaan: aparte API’s voor user en company updates. Toon in-site bevestigingsmodals bij gevoelige acties (wachtwoord).

#### Web Instellingen (gerealiseerd)
- Route: `/instellingen` (alleen `ACTIVE` via middleware).
- Header: link “Instellingen” in user dropdown als je `ACTIVE` bent.
- Secties:
  - Persoonlijk: naam, telefoon → `PUT /api/settings/user`.
  - Wachtwoord wijzigen: oud + nieuw + bevestiging (min 8). Niet voor Google-only accounts → `POST /api/settings/password`.
  - Bedrijf: naam, bedrijfsadres, huisnummer, postcode, plaats, werktelefoon (optioneel), KVK-nummer (optioneel), website (optioneel), logo upload (R2), korte beschrijving (max 250) → `PUT /api/settings/company`.
- Laden: `GET /api/settings` (geeft user + company terug).

Fase 2 — Fund (fund.levendportret.nl)
- Guards & middleware:
  - Beheer-routes alleen voor gebruikers met `FUND` membership (en bij voorkeur `ACTIVE`).
  - Fund starten is geblokkeerd wanneer profiel incompleet → CTA naar `/instellingen`.
- Dashboard routes:
  - `/dashboard` overzicht: statuskaarten (Profielstatus, Fund-status), CTA’s “Fund aanmaken” of “Beheer Fund/Stoppen”.
  - `/dashboard/fund-aanmaken`: formulier met `startDate` (klant kan instellen vóór start; na start alleen admin wijzigbaar) + basiscontent (titel, pitch, cover).
  - `/dashboard/fund-beheren`: status, voortgangsbalk, resterende tijd (dagen), stoppen-knop (in-site confirm).
- API (fund-app):
  - GET `/api/fund`: huidige fund + company.
  - POST `/api/fund/start`: maakt/activeert FUND met `startDate` en content; status eerst “in review/pending publish”.
  - POST `/api/fund/stop`: zet FUND op `EXPIRED` (met confirm).
- Admin review/publish (admin-app):
  - Nieuwe kaarten voor Fund-aanvragen: publish/afkeur/verlengen (90 dagen), melding naar klant bij publish, bij behalen doel: automatische publish-flow naar CLUB/COACH en FUND beëindigen (v1: knoppen; v2: jobs/webhooks).
- Publieke pagina’s (fund-app):
  - `/[bedrijfsnaam]`: titel, pitch, cover, progress-bar, “nu nog X nodig”, deadline (23:59:59 NL), bedrijfsinfo (naam/logo/locatie aan/uit), social share, doneren (Mollie v1 gewenst).
  - `/` overzicht: lijst van lopende funds met progress.

Fase 3 — Betaal- en notificatieflow (kort na v1)
- Mollie integratie: doneren, transactiekostenregel (< €50 door donateur), refunds bij falen, mailnotificaties (succes/falen/keuze A/B/C), admin-inzage en handmatige bijbetaling (factuur) voor optie A.
- Scheduler jobs: auto-succes bij behalen doel, 90-dagen deadline en 1-week keuzevenster, auto-archivering, e-mail triggers.

### UX updates (06-11-2025)
- Admin-registratie (localhost:3003/admin-registratie): toon/verberg-icoon bij beide wachtwoordvelden.
- Web header (localhost:3000): als gebruiker `ADMIN` is, verschijnt een Dashboard-knop naar `http://localhost:3003/dashboard`.
- Onboarding bedrijf (localhost:3000/onboarding/bedrijf): veldspecifieke validatiefouten worden nu onder de inputs getoond; optionele velden worden juist als `null` verzonden.
- Web in-behandeling (localhost:3000/in-behandeling): toont nu actuele status (in behandeling of afgewezen) en heeft een Terug-knop.
- Registratie (localhost:3000/aanmelden): validatie aangescherpt voor NL-postcode (bv. 1234 AB) en telefoonnummer; foutmeldingen per veld zichtbaar.
- Admin gebruikersbeheer: API toegevoegd voor lijst (GET /api/admin/users?status=ACTIVE), update (PUT /api/admin/users/[id]) en verwijderen (DELETE /api/admin/users/[id]); eerste lijstpagina op `/dashboard/gebruikers` toegevoegd. Detail-bewerken pagina volgt.
- Admin afkeur-tab: nieuwe pagina `/dashboard/afgekeurd` met overzicht van REJECTED gebruikers en een knop om alsnog te goedkeuren.
- Onboarding flow guards: middleware stuurt ingelogde niet-ACTIVE gebruikers die `/` openen eerst naar `/post-auth` (hervat onboarding of toont in-behandeling). `/onboarding/bedrijf` is alleen toegankelijk voor ingelogde niet-ACTIVE gebruikers.
- Admin gebruikersbeheer: dashboard heeft nu tegels naar `/dashboard/gebruikers` en `/dashboard/afgekeurd`.
- Gebruikersbeheer lijst: header bevat een knoplink naar `/dashboard/afgekeurd`.
- Gebruiker detail: actieknoppen toegevoegd om te Goedkeuren, Afkeuren of opnieuw op "In behandeling" (SET_PENDING) te zetten.
- Admin styling: secundaire knop-stijl toegepast voor navigatielinks (Terug naar dashboard, Naar Afgekeurd, etc.) op alle dashboardpagina's.
- Web post-auth: loop opgelost door middleware-aanpassing (geen automatische redirect van `/` naar `/post-auth`). `post-auth` route stuurt nu correct door: ACTIVE → `/`, non-ACTIVE zonder bedrijf → `/onboarding/bedrijf`, anders → `/in-behandeling`.
  - Web in-behandeling: als gebruiker `ACTIVE` is, wordt een acceptatiebericht getoond met knoppen naar Home/Club/Fund.

#### Admin updates (07-11-2025)
- Gebruikerslijst: filters gelokaliseerd (Status: Alle/Actief/In behandeling/Afgekeurd/Verificatie; Product: Alle/CLUB-COACH/FUND). Status=ALL is ondersteund in API.
- Membershipbeheer: van FUND naar CLUB+COACH is een “schakelaar”. Bij toekennen van CLUB/COACH wordt een actieve FUND automatisch `EXPIRED`. Als CLUB/COACH actief is, kun je geen FUND toekennen.
- Dashboard: badge met aantal `PENDING_APPROVAL` gebruikers naast “Gebruikersbeheer” (1 = “!”, >1 = het aantal, 0 = geen badge).
- Pagina’s gedeactiveerd: `/dashboard/in-behandeling` en `/dashboard/afgekeurd` redirecten nu naar `/dashboard/gebruikers` met de juiste filter.
- Prisma Client regenereren (Windows PowerShell):
  ```powershell
  pnpm --filter @levendportret/db run prisma:generate
  pnpm dev
  ```
- Statuswijzigingen: wanneer een gebruiker wordt afgekeurd (REJECTED) of teruggezet naar in behandeling (PENDING_APPROVAL), worden alle actieve memberships automatisch `EXPIRED`.
- Bevestigingen: bij “FUND toekennen” en “CLUB + COACH toekennen” verschijnt een bevestigingsdialoog.
- `startDate`: bij het aanmaken van `CLUB/COACH` memberships wordt de startdatum gezet (voor 3 jaar-logica). Voor `FUND` wordt de startdatum later ingesteld via de Fund aanmaken/bewerken pagina (niet via admin).
- Extra actie: `SWITCH_TO_FUND` verwijdert alle `CLUB/COACH` memberships (ook verlopen) en activeert `FUND` opnieuw.

### Admin gebruikersbeheer (unified)

- **Gebruikerslijst** `/dashboard/gebruikers`:
  - Filters: `status` (ACTIVE/PENDING_APPROVAL/REJECTED/PENDING_VERIFICATION) en `product` (CLUB/COACH/FUND of Alle).
  - Lijst toont membership-badges per gebruiker (product + status), naast bedrijfsnaam/plaats.
  - Inline acties: Goedkeuren, Afkeuren, Op in behandeling.
  - Link naar detail: `/dashboard/gebruiker/[id]`.
- **Gebruiker detail** `/dashboard/gebruiker/[id]`:
  - Sectie “Memberships”: voor CLUB/COACH/FUND per kaart de actuele status met knoppen “Toekennen” (GRANT_MEMBERSHIP) of “Beëindigen” (EXPIRE_MEMBERSHIP).
  - Bestaande bewerk- en statusacties blijven.

Opmerking: rechten/entitlements komen uit `Membership`. `User.plan` is slechts een billing-indicator en wordt uitgefaseerd (zie hieronder).

### Plan (FREE/PAID) verwijderd

- Betaalstatus wordt nu afgeleid van memberships:
  - Betaald: ten minste één `ACTIVE` membership voor `CLUB` of `COACH`.
  - Crowdfunding: alleen `FUND` actief → nog niet betaald.
- Uitgevoerd:
  - Prisma: `AccountPlan` enum en `User.plan`/`User.planUpdatedAt` verwijderd (migratie: `remove-plan`).
  - API: `plan`-filter uit `/api/admin/users` verwijderd; `SET_PLAN` uit PATCH verwijderd.
  - UI: planvelden niet meer gebruikt; beheer verloopt via Memberships.
  - Business logica: bij toekennen `CLUB` of `COACH` wordt een actieve `FUND` automatisch op `EXPIRED` gezet. Bij `APPROVE` → `ACTIVE` en géén betaalde memberships, wordt `FUND` (indien afwezig of niet-actief) op `ACTIVE` gezet.

## Database & migraties

- Membership-entitlements: `MembershipProduct` enum (CLUB/COACH/FUND) toegevoegd + `Membership.product` en unieke sleutel op `(userId, companyId, product)`.
- Plan kolommen zijn verwijderd in migratie `remove-plan` (plan was alleen billing-indicator; rechten komen nu volledig uit memberships).
- Voer na pull/push lokaal de migraties en generate uit (gebruik workspace filter, niet `-C`):

  ```bash
  pnpm --filter @levendportret/db run prisma:migrate:dev
  pnpm --filter @levendportret/db run prisma:generate
  ```

- Zorg dat Postgres draait (zie `docker-compose.yml`):

  ```bash
  docker compose up -d postgres
  
 
 Als `DATABASE_URL` niet wordt opgepikt: plaats een `.env` in `packages/db` met dezelfde `DATABASE_URL` als in je root `.env.local`, of gebruik `dotenv` om met die file te runnen.

  ### Membership-entitlements & klantflows: FUND vs Direct Pay
 
 Deze sectie definieert hoe product-rechten (entitlements) via `Membership` werken voor twee klantpaden.
  - **Producten (MembershipProduct):** `FUND`, `CLUB`, `COACH`.
  - **Unieke sleutel:** per gebruiker/bedrijf/product bestaat maximaal één membership (`@@unique([userId, companyId, product])`). Deze migratie kan waarschuwen als er bestaande duplicaten zijn — dit is normaal. Los duplicaten op voor je de migratie draait.
  - **Opmerking:** `User.plan` is verwijderd; rechten/toegang komen volledig uit `Membership`. Zie ook: “Plan (FREE/PAID) verwijderd”.
 
 #### 1) FUND-route (crowdfunding)
 
 - **Start:** Klant kiest crowdfunding en maakt een fund aan op `fund.levendportret.nl/fund-aanmaken`.
 - **Entitlement bij start:** geef `Membership` met `product=FUND` (status `ACTIVE`).
 - **Doel & termijn:** binnen 3 maanden via donaties € 2.450 ophalen.
 - **Niet gehaald:** geld wordt teruggestort aan donateurs. Klant kan kiezen:
   - A) Bijbetalen tot € 2.450 → krijgt alsnog het Levend Portret Cadeau → entitlements `CLUB` + `COACH` actief, `FUND` beëindigen.
   - B) Alles terugstorten → geen `CLUB`/`COACH` entitlements, `FUND` beëindigen.
 - **Gelukt (doel gehaald):** stuur alle donateurs een bevestigingsmail. Verwijder/beëindig `FUND` en activeer `CLUB` + `COACH` entitlements voor de klant.
 
 Technisch (richting implementatie):
 - Bij aanmaken fund: creëer `Membership(FUND)` voor `(userId, companyId)`.
 - Bij succes: zet `FUND` op `EXPIRED` en creëer/activeer `CLUB` en `COACH` memberships.
 - Bij falen: op basis van klantkeuze ofwel `CLUB`/`COACH` activeren met bijbetaling, of alles terugstorten en `FUND` beëindigen.
 - Donateursnotificaties: bij succes een e-mailupdate sturen.
 
 #### 2) Directe betaling (in één keer)
 
 - **Start:** Klant betaalt het volledige bedrag in één keer.
 - **Entitlements:** direct `CLUB` + `COACH` actief. `FUND` wordt hier nooit verleend.
 - **Plan:** je kunt `User.plan` op `PAID` zetten als signaal voor betaalde klant; rechten blijven via `Membership` bepaald.
 
 Opmerking: deze sectie beschrijft de gewenste werking voor de launch; implementatie en automatisering (jobs/webhooks) volgen in een latere fase.
