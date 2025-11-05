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
- [ ] Web: Privacy & Voorwaarden
- [ ] Club (club.levendportret.nl): Overzicht (grid + 30s modal), Detail (5 min embed), Login/Register/Reset, Mijn-bedrijf bewerken
- [ ] Moderatie: status “Ingediend/Goedgekeurd/Gepubliceerd” zichtbaar en beheerbaar (admin)
- [ ] Admin (admin.levendportret.nl): Login, Dashboard, Bedrijven/Clips/Funds/Donaties, Moderatie-flow
- [ ] Fund (fund.levendportret.nl): Overzicht + detail skeleton; betalingen v2

## 4) Content & integraties
- [ ] Vimeo integratie (embeds): 30s + 5 min IDs per bedrijf
- [ ] Thumbnails/foto’s upload naar R2, signed URL’s in UI
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
  - Alleen e-mails in `ADMIN_EMAILS` ontvangen een magic link.
  - Eerste keer inloggen via magic link → redirect naar `/wachtwoord-instellen` om een wachtwoord te zetten.
  - Daarna: alleen nog inloggen met Credentials (e-mail + wachtwoord). Google is uitgeschakeld in admin.
  - Middleware dwingt `/wachtwoord-instellen` af zolang er geen wachtwoord is (`needsPassword`).
- API:
  - `POST /api/admin/set-password` met `{ password }` (min 8 tekens).

#### Bekend probleem (lokaal)
- Symptoom: in admin staat in de terminal “Magic link geblokkeerd (ADMIN ONLY)… e-mailadres staat niet in ADMIN_EMAILS”, terwijl het mailadres wel in `.env.local` staat.
- Oorzaak: admin-app draait zonder de root `.env.local` (env niet geladen), of e-mailadres wijkt af (spatie/case).
- Fix:
  - Start met per-app dev script (laadt automatisch root env): `pnpm -C apps/admin dev`.
  - Of: `dotenv -e .env.local -- pnpm -C apps/admin dev`.
  - Controleer `ADMIN_EMAILS` exact (geen spaties, juiste casing) en herstart.
  - Wis cookies voor `localhost` na env-wijzigingen.
  
  [next-auth][debug][adapter_getUserByEmail] { args: [ 'tomvaneijk031@gmail.com' ] }
admin:dev: 
admin:dev: ┌───────────────────────────────────────────
admin:dev: │  Magic link geblokkeerd (ADMIN ONLY)
admin:dev: │  Aan:  tomvaneijk031@gmail.com
admin:dev: │  Reden: e-mailadres staat niet in ADMIN_EMAILS
admin:dev: [next-auth][debug][adapter_createVerificationToken] {
admin:dev:   args: [
admin:dev:     {
admin:dev: └───────────────────────────────────────────
admin:dev:       identifier: 'tomvaneijk031@gmail.com',
admin:dev:
admin:dev:       token: '41edecd264797b07e5e76a939b85c320414507cbbf84270581fdf74051ad050e',
admin:dev:       expires: 2025-11-06T03:33:13.604Z
admin:dev:     }
admin:dev:   ]
admin:dev: }

Na opschonen root (Next verwijderd uit package.json): voer `pnpm install` opnieuw uit.

### Env-beheer (unified)
- Gebruik alleen root `.env.local` (development) en `.env.production` (productie).
- Prisma en Turbo laden het root-env via `dotenv-cli`.
- Vereiste keys (minimaal lokaal):
  - `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
  - Optioneel nu: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Voorbeeld .env.local
```
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/levendportret?schema=public"

# NextAuth (zelfde secret voor alle apps voor SSO)
NEXTAUTH_SECRET="vervang-door-een-sterke-random-string"

# Shared cookie domein voor lokale subdomeinen (SSO)
AUTH_COOKIE_DOMAIN=.levendportret.local

# Admin bootstrap (e-mails worden ADMIN bij eerste sign-in)
ADMIN_EMAILS="jij@example.com"

# Google OAuth (optioneel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# E-mail (magic link) — optioneel in dev; zonder SMTP wordt de link in de terminal gelogd
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="no-reply@levendportret.local"
```

Opmerking: zet `NEXTAUTH_URL` per app in de shell wanneer je meerdere apps tegelijk draait (bijv. PowerShell):
- web: `$env:NEXTAUTH_URL="http://web.levendportret.local:3000"; pnpm -C apps/web dev`
- club: `$env:NEXTAUTH_URL="http://club.levendportret.local:3001"; pnpm -C apps/club dev`
- fund: `$env:NEXTAUTH_URL="http://fund.levendportret.local:3002"; pnpm -C apps/fund dev`
- admin: `$env:NEXTAUTH_URL="http://admin.levendportret.local:3003"; pnpm -C apps/admin dev`

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
- [ ] Middleware uitbreiden voor app-sectie `/admin` zodra beschikbaar.
- [ ] Middleware uitbreiden voor app-sectie `/fund` zodra beschikbaar.


**Fase 6: Admin Goedkeuringsflow (`apps/admin`)**
- [ ] Overzichtspagina bouwen in de admin-app met alle `PENDING_APPROVAL` gebruikers.
- [ ] Detailweergave met alle bedrijfsgegevens.
- [ ] Actieknoppen ("Goedkeuren" / "Afwijzen") om de gebruikersstatus aan te passen.

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
