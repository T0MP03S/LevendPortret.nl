Copy-richtlijnen
### Clips overzicht — zichtbaarheid en volgorde
- Zichtbaarheid: een bedrijf verschijnt in het Clips-overzicht zodra er minimaal 1 `Clip` met `status = PUBLISHED` bestaat voor dat bedrijf.
- Admin (Clips detail): stel 2 geldige Vimeo IDs in (short en lang). We bewaren maximaal 2 `Clip`-records en archiveren oudere entries.
- Links: als `company.website` bestaat gaat de knop “Bekijk webpagina” naar de externe site; anders naar de interne pagina (`/p/[slug]`).
- Sortering: nieuwste eerst (volgorde op `updatedAt desc`), zodat zojuist opgeslagen clips bovenaan staan.
- Paginatie: mobiel 8 per pagina, desktop 12 per pagina.

### Admin: Clipsbeheer tabs
- Tabs: `Aanvragen`, `Updates`, `Gepubliceerd` (het tabje “Websites” is vervallen).
- Aanvragen: interne pagina’s met `status = IN_REVIEW`, eigenaar `ACTIVE`, product `CLIPS` actief, en zonder externe website.
- Updates: gepubliceerde interne pagina’s (`status = PUBLISHED`) met een ingediende update-aanvraag (`Moderation.status = SUBMITTED`).
- Gepubliceerd: omvat
  - Interne pagina’s met `status = PUBLISHED`.
  - Bedrijven met een externe website en ≥1 `Clip.status = PUBLISHED` (als “Extern”).
  - Wanneer een bedrijf zijn externe website verwijdert in Instellingen, verdwijnt deze externe vermelding automatisch uit “Gepubliceerd”. Interne gepubliceerde pagina’s blijven zichtbaar totdat de status wordt aangepast.
- "Aanmelding ontvangen" (voor goedkeuring): vermeld dat we binnenkort bellen om de aanmelding te bespreken en geef het contactadres `info@levendportret.nl` als alternatief.
- "Account geaccepteerd" (na goedkeuring): geen bel‑informatie meer; focus op welkom en CTA naar `/instellingen` om het account aan te vullen.
### Beleid credentials login
## E-mail checklist (deliverability & UX)
- **Domein-authenticatie**
  - SPF: voeg je SMTP-provider toe in het SPF-record (bijv. `v=spf1 include:_spf.provider.nl ~all`).
  - DKIM: public key TXT op `selector._domainkey.<domein>` (selector bij provider).
  - DMARC: start mild (`p=none`), later `quarantine/reject`. Voorbeeld: `_dmarc.<domein>` → `v=DMARC1; p=none; rua=mailto:postmaster@<domein>`.
  - Optioneel: BIMI (logo-imago) zodra DMARC op `quarantine/reject` staat.
- **Headers**
  - From: `EMAIL_FROM` op het geauthenticeerde domein.
  - Reply-To: instellen op serviceadres (`EMAIL_REPLY_TO`, bv. `info@levendportret.nl`).
  - List-Unsubscribe: alleen voor marketing/mailings (niet voor transactionele mails).
- **Content**
  - Preheader-tekst en plain-text fallback aanwezig (alle templates).
  - Logo inline via CID; gebruik PNG (`apps/admin/public/logo-email.png`), fallback SVG.
  - Alt-teksten voor afbeeldingen; knoppen zijn `<a>` met inline styles.
  - Consistente huisstijl: Bree als heading, Montserrat als body (met systeemfallbacks).
  - Korte, duidelijke onderwerpregel zonder spamtriggers; NL-teksten.
- **Footer & compliance**
  - Bedrijfsnaam, domeinlink en contact e-mail staan onderin.
  - Voor marketing: voeg opt-out/unsubscribe link toe en (indien van toepassing) fysiek adres.
- **Links & tracking**
  - Gebruik HTTPS-links met herkenbaar domein; geen IP’s/localhost in productie.
  - Voeg UTM-tags toe voor marketingcampagnes (niet voor auth-transacties).
- **Testing**
  - Testmatrix: Gmail (web/iOS/Android), Outlook (Win/Mac), Apple Mail (iOS/macOS).
  - Controleer spam/“gevaarlijk” waarschuwingen na DNS-aanpassingen (duurt soms 30–60 min).
- **Env**
  - `EMAIL_FROM`, `EMAIL_SERVER_*`, `EMAIL_SEND_IN_DEV`, `EMAIL_REPLY_TO` (optioneel, standaard `info@levendportret.nl`).

- Credentials login is toegestaan zodra het e-mailadres is geverifieerd (niet afhankelijk van `ACTIVE`).
- Niet-ACTIVE gebruikers kunnen wel inloggen maar worden door middleware en `/post-auth` beperkt tot `/in-behandeling` (en onboarding indien nodig).

### TODO
- [x] Na succesvolle registratie een notificatiemail sturen naar admins die "Mail bij nieuwe aanmelding" hebben ingeschakeld (server-side) met een link naar het admin-dashboard.
# Levend Portret — Docs gids (stap-voor-stap)

Gebruik dit document als centrale leidraad. We lopen in deze volgorde:
 
## 0) Beslispunten (eerst afvinken)
- [x] Prijscommunicatie op site: € 1.675 excl. btw
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

### Productie VPS — OS image
- Aanrader: **Debian 12 (Bookworm) 64‑bit** (OVH image) of alternatief **Ubuntu 22.04 LTS**.
- Reden: beste compatibiliteit met Node 20 LTS, Next.js (SWC), en native modules (glibc).
- Optioneel: Docker/Compose op Debian 12 met Node 20 base images (`node:20-bookworm-slim`).

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
  - [ ] Clips implementatiechecklist → [docs/clips/IMPLEMENTATION-CHECKLIST.md](./clips/IMPLEMENTATION-CHECKLIST.md)

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
    - Allowed Origins: `http://localhost:3000`, `http://localhost:3002`, `http://localhost:3003`
    - Allowed Methods: `PUT, GET, HEAD`
    - Allowed Headers: `Content-Type`
    - Expose Headers: `ETag` (optioneel)
    - Max Age: `3600`
  - Zet dit in de R2 bucket CORS-instellingen.

  Opmerking: dit is vereist voor de nieuwe admin thumbnail upload (presigned PUT vanaf `http://localhost:3003`).

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

#### Duplicaten voorkomen (content-hash)
- Alle uploads (logo, galerij, admin Clips-thumbnail) gebruiken nu client-side `SHA-256` hashing.
- Server bouwt de sleutel als er een hash is: `.../sha256/<hash>.<ext>` en doet `HEAD` naar R2.
  - Bestaat het object al: geen nieuwe upload; je krijgt direct de bestaande `publicUrl` terug.
  - Bestaat het niet: je krijgt een presigned `uploadUrl` en uploadt éénmalig.
- Hierdoor voorkom je dat exact dezelfde bestanden meerdere keren in de bucket komen.

#### Duplicaten opruimen (scripts)
Er is een script om bestaande duplicaten te vinden en de oudste te verwijderen (dry-run standaard):

```powershell
# Dry-run (zien wat er weg kan)
dotenv -e .env.local -- pnpm -C apps/admin exec node scripts/r2-dedupe.js --prefix logos/ --prefix company-pages/ --prefix clips-thumbnails/

# Effectief verwijderen
dotenv -e .env.local -- pnpm -C apps/admin exec node scripts/r2-dedupe.js --prefix clips-thumbnails/ --delete
```

Het script groepeert op:
- `sha256:<hash>` wanneer het pad `.../sha256/<hash>.<ext>` bevat
- anders op `etag:<md5>` (let op: ETag is niet altijd MD5 bij grotere/multipart uploads)

- [ ] Eerste 1–5 bedrijven/clips ingeven (seed of via admin)

## E-mail (NextAuth Magic Link)

- SMTP env (development):
  - `NEXTAUTH_URL=http://localhost:3000`
  - `EMAIL_FROM="Levend Portret <noreply@domein.nl>"`
  - `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT` (meestal 587), `EMAIL_SERVER_SECURE=false` (true bij 465)
  - `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`
  - `EMAIL_SEND_IN_DEV=true` om in dev echt te versturen (anders wordt de link alleen gelogd)
- Testen:
  1. Dev herstarten na env-wijzigingen.
  2. Ga naar `/inloggen` (web, 3000) en kies e-mail.
  3. Vul een testadres in en controleer de inbox (of spam). Klik de link om in te loggen.

### Transactionele e-mails — Overzicht van flows (dev/prod)
- Na registratie + verificatie (Email provider): gebruiker ontvangt "Aanmelding ontvangen — e-mail geverifieerd".
- Na Google signup (zonder traditionele verificatie): gebruiker ontvangt "Aanmelding ontvangen" (status → PENDING_APPROVAL).
- Magic link login-aanvraag: gebruiker ontvangt de verificatiemail (via NextAuth EmailProvider).
- Statuswijziging door admin:
  - ACTIVE → gebruiker ontvangt "Je account is geaccepteerd — welkom!" met CTA naar Instellingen.
  - REJECTED → gebruiker ontvangt "Aanmelding niet goedgekeurd".
- Publicatie bedrijfspagina: eigenaar ontvangt "Je webpagina is gepubliceerd".
- Admin notificatie bij nieuwe aanmelding: admins die het vinkje aan hebben (of in `ADMIN_EMAILS` staan) krijgen een melding; toggle staat rechts van de Dashboard-titel.

Stijl
- Alle transactionele e-mails gebruiken nu één uniforme, branded template (navy header, coral CTA, Montserrat), met optionele inline logo‑bijlage waar beschikbaar.

Links/URLs in e-mails
- Gebruikers‑CTA’s (bijv. “Ga naar de website”, “Bekijk je pagina”) linken naar:
  - `NEXT_PUBLIC_WEB_URL` (prod) of fallback `NEXTAUTH_URL` (web app) of `http://localhost:3000` (dev)
  - Zet in prod: `NEXT_PUBLIC_WEB_URL=https://levendportret.nl`
- Admin‑CTA’s (bijv. “Naar admin dashboard”) linken naar:
  - `NEXT_PUBLIC_ADMIN_URL` of fallback `http://localhost:3003` (dev)
  - Zet in prod: `NEXT_PUBLIC_ADMIN_URL=https://admin.levendportret.nl`
- Magic‑link (inlog) gebruikt de door NextAuth gebouwde URL op basis van de app‑specifieke `NEXTAUTH_URL`.
  - Web app: `NEXTAUTH_URL=https://levendportret.nl` in prod (dev: http://localhost:3000)
  - Admin app: `NEXTAUTH_URL=https://admin.levendportret.nl` in prod (dev: http://localhost:3003)

#### Geen hardcoded URLs (policy)
- Gebruik altijd environment variabelen voor domeinen/links in code en e‑mails; geen hardcoded `localhost` of productiedomeinen in componenten/templates.
- Beschikbare variabelen (client/server):
  - `NEXT_PUBLIC_WEB_URL` (bv. https://levendportret.nl)
  - `NEXT_PUBLIC_ADMIN_URL` (bv. https://admin.levendportret.nl)
  - `NEXT_PUBLIC_CLUB_URL` (bv. https://club.levendportret.nl)
  - `NEXT_PUBLIC_CLIPS_URL` (bv. https://clips.levendportret.nl)
  - `NEXTAUTH_URL` (per app; voor magic link en auth callbacks)
- Toepaspunten (geconsolideerd in code):
  - Navigatie en CTA’s in Header/Footer (packages/ui)
  - Redirects voor Clips: `/clips` en `/p/[slug]` → `NEXT_PUBLIC_CLIPS_URL`
  - SEO: `metadataBase`, `robots.ts`, `sitemap.ts` gebruiken de juiste `NEXT_PUBLIC_*`
  - E‑mails: logo/footers en CTA’s gebruiken `NEXT_PUBLIC_WEB_URL` (users) of `NEXT_PUBLIC_ADMIN_URL` (admins)
  - Fallbacks in dev: respectievelijk `http://localhost:3000/3001/3002/3003`

Notes
- Development: voor auth-verificatie mails is `EMAIL_SEND_IN_DEV=true` vereist; overige transactionele mails (admin-notificatie/status/publicatie) gebruiken de SMTP envs direct.
- SMTP variabelen moeten in de root `.env.local` staan en worden door alle apps gebruikt.

### Admin: E-mail templates testen (dev)
- UI: `http://localhost:3003/dashboard/email-test`
- API: `POST /api/dev/send-test { to, type }`
- Templates: `magic-link`, `registration-received`, `approved`, `rejected`, `default`
- Vereist dezelfde SMTP env-variabelen als hierboven. In development: `EMAIL_SEND_IN_DEV=true` om echt te versturen.

**Logo in e-mails**
- De admin e-mails proberen het logo inline mee te sturen (CID).
- Plaats een PNG voor maximale compatibiliteit op: `apps/admin/public/logo-email.png` (aanbevolen ~280×70px, transparante achtergrond).
- Als `logo-email.png` ontbreekt, valt het systeem terug op `apps/admin/public/logo.svg`. Let op: sommige clients (Gmail) tonen inline SVG niet; gebruik daarom bij voorkeur PNG.
- In sommige clients moet je eerst “Afbeeldingen weergeven” toestaan voordat het logo verschijnt.

**Dark mode (mobiel/clients)**
- Template is gehard tegen automatische inversie: `color-scheme: light`, `supported-color-schemes: light`, `x-apple-disable-message-reformatting` en expliciete `bgcolor` op `<body>`, buitenste/inner tables en cellen.
- Als een client toch dwingt tot dark-mode, overweeg een PNG-headerstrip met ingebrande kleur.

#### Troubleshooting: e-mail versturen (development)
- **Waar zie ik fouten?**
  - Admin server terminal (`pnpm -C apps/admin dev`): fouten van `POST /api/dev/send-test` (bv. invalid login, connect ETIMEDOUT) komen hier binnen.
  - Web server terminal (`pnpm -C apps/web dev`): NextAuth EmailProvider logt waarschuwingen in dev (rate limit, `EMAIL_SEND_IN_DEV` ontbreekt) en eventuele SMTP-fouten bij magic links.
  - Browser DevTools → Network tab op `/dashboard/email-test`: open de request `POST /api/dev/send-test` en bekijk de JSON response `{ ok: false, error: "..." }`.
- **Snelle checks**
  - Herstart dev na `.env.local` wijzigingen.
  - `EMAIL_SERVER_PORT=587` → `EMAIL_SERVER_SECURE=false`. Voor `465` → `EMAIL_SERVER_SECURE=true`.
  - `EMAIL_FROM` domein en afzender moeten door jouw SMTP-provider zijn toegestaan (soms moet dit exact het inlogadres zijn).
  - Controleer user/pass en of SMTP in jouw mailbox is ingeschakeld.
  - Check spammap; nieuwe domeinen/afzenders komen vaak in spam terecht.
- **Magic link specifiek**
  - In dev zonder `EMAIL_SEND_IN_DEV=true` wordt de link alleen in de web-terminal gelogd (niet verstuurd). Zet `EMAIL_SEND_IN_DEV=true` om echt te mailen.
  - Test via `http://localhost:3000/inloggen` en volg de logs in de web-terminal.

#### Troubleshooting: Next.js dev "Unexpected end of JSON input" (load-manifest)
- Symptoom: tijdens dev verschijnt `SyntaxError: Unexpected end of JSON input` in `load-manifest.js` bij `getNextFontManifest`.
- Oorzaak: tijdelijk/corrupt `.next` manifest tijdens hot reload.
- Oplossing (web-app):
  1) Stop de dev server voor web.
  2) Verwijder de build map en start opnieuw.
     - PowerShell:
       ```powershell
       Remove-Item -Recurse -Force "apps/web/.next"
       # optioneel cache
       Remove-Item -Recurse -Force "apps/web/node_modules/.cache" -ErrorAction SilentlyContinue
       ```
  3) Start opnieuw: `pnpm -C apps/web dev` of `pnpm dev`.


## Security
- Rate limiting:
  - Magic link: 5/uur per e-mail (NextAuth Email provider)
  - Credentials login: 10/10min per e-mail
  - Registratie: 10/10min per IP, 5/uur per e-mail
  - Onboarding company: 30/10min per IP
  - NB: In-memory limiter in dev; in productie Upstash/Redis configureren.
- Input validatie: Zod op `POST /api/auth/register` en `POST /api/onboarding/company`.
- HTTP headers (via next.config.mjs -> headers()): CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy.
  - CSP details (dev):
    - font-src: allow self, data, and https://fonts.gstatic.com (voor Google Fonts)
    - Clips-app (dev): font-src tijdelijk verbreed naar https: om Google Fonts issues te voorkomen; in productie bij voorkeur weer beperken naar specifieke hosts
    - style-src: allow 'unsafe-inline' en https: (voor Google Fonts CSS)
    - frame-src (clips/web): allow https://player.vimeo.com en https://www.google.com (voor Vimeo en Maps embeds)
    - Let op: na wijzigen van headers: herstart de betreffende app dev-server.
- NextAuth: e-mail normalisatie, credentials alleen na e-mailverificatie, status gating via middleware.
- Aanbevelingen productie:
  - Zet `debug` en console logging uit
  - Gebruik native `bcrypt` met hogere cost (12) op Linux/Node 20
  - Vervang in-memory rate limiter door Upstash/Redis
  - Verfijn CSP (alleen noodzakelijke origins) en forceer HTTPS (HSTS)

### Security audit (quick pass) — 2025-11-17
- **Top acties (hoogste prioriteit)**
  - Cookies/SSO: in productie `AUTH_COOKIE_DOMAIN=.levendportret.nl` + `secure: true` + `__Secure-` prefix (NextAuth regelt dit bij HTTPS). Zorg voor consistente `NEXTAUTH_SECRET` en HSTS.
  - CSP (prod): verwijder `unsafe-inline`/`unsafe-eval`; beperk `connect-src` tot eigen domeinen en vereiste APIs; `img-src` beperken tot eigen CDN/R2 en Vimeo (indien nodig); houd `frame-src` op alleen Vimeo/Maps indien gebruikt.
  - Rate limiting: vervang in-memory limiter door Redis (Upstash) voor auth en register API.
  - Uploads: voeg server-side size policies toe voor R2 (policy of post-HeadObject check) en mime sniffing (niet alleen `Content-Type`).
  - Password hashing: verhoog cost naar 12 met native `bcrypt` (Node 20) in productie.
  - SMTP deliverability: SPF/DKIM/DMARC voor `EMAIL_FROM` domein (zie E-mail checklist).
- **Aanvullend**
  - Logging: mask secrets in logs; zet verbose logs uit in prod.
  - CSRF: SameSite=Lax dekt POST requests; houd API’s op JSON en check origin/referer in admin‑kanten.
  - Dependencies: periodiek `pnpm audit` en update minor/patch (Turbo 2.6.1 e.d.).

**CSP (productie) voorbeeld**
```
default-src 'self';
img-src 'self' data: https://<jouw-cdn> https://i.vimeocdn.com;
font-src 'self' data:;
style-src 'self';
script-src 'self';
connect-src 'self' https://<benodigde-apis>; 
frame-src 'self' https://player.vimeo.com;
frame-ancestors 'none';
base-uri 'self';
```

### Implementaties (Fase 1)
- Web/Admin/Fund: productie-CSP en HSTS headers toegevoegd (dev blijft relaxed).
- Rate limiting: Upstash Redis ondersteuning (REST) + async usage in API’s (register/onboarding). In dev fallback op in‑memory.
- Wachtwoord hashing: cost 12.
- Uploads (logo): server‑side HEAD validatie (type=image/*, max 5MB) voordat de URL wordt opgeslagen.
- E-mail: NextAuth verificatie gebruikt nu dezelfde branded HTML als admin (CID‑logo, preheader, plain‑text, dark‑mode hardening, reply‑to).

Upstash (optioneel, productie):
```
UPSTASH_REDIS_REST_URL= https://<region>-<id>.upstash.io
UPSTASH_REDIS_REST_TOKEN= <token>
```
Zodra deze variabelen aanwezig zijn, schakelen de rate limiters automatisch over naar Redis.

### UX updates (Fase 2 — 2025-11-17)
- Web: nieuwe pagina’s `/privacy` en `/voorwaarden` (placeholder-teksten) + links staan al in de Footer.
- Modals toegankelijker (Even voorstellen + Instellingen): focus trap, ESC‑sluiten, aria‑labelledby/‑describedby en focus terug naar trigger.
- Aanmelden/Inloggen: duidelijke begeleidende tekst, aria‑live op status en foutensamenvatting boven het formulier.
- Inloggen: inline validatie voor e‑mail en wachtwoord (met aria‑attributen).
- Afbeeldingen: teamgrid lazy‑loaded; modale teamfoto eager + priority voor snelle weergave.
- Focus: duidelijke focus-visible outlines (coral) voor toetsenbordnavigatie.
- Forms: knoppen tonen nu duidelijke loading states (disablen + spinner) bij Inloggen, Aanmelden en Update‑modal.
- Autofill: consistente styling van browser‑autofill in inputs.
- Onboarding + Aanmelden: het veld ‘Website’ accepteert nu domeinen zonder http(s) en voegt automatisch `https://` toe.
- In-site modals: alle browser-popups (confirm/alert/prompt) zijn vervangen door in-site modals. Admin > Gebruiker verwijderen gebruikt nu een modaal. Audit uitgevoerd: geen resterende `window.confirm/alert/prompt` meer in de apps.

### UX updates (Fase 2 — 2025-11-18)
- In behandeling: wanneer een account is geaccepteerd toont de pagina alleen nog een knop naar `Instellingen` (geen extra knoppen).
- In behandeling: call/contact-paragrafen worden alleen getoond voor PENDING gebruikers; bij ACTIVE of REJECTED worden deze niet meer weergegeven.
- Instellingen toegang: geaccepteerde gebruikers kunnen altijd naar `/instellingen` voor account/bedrijf. De sectie “Webpagina instellingen” is nu alleen zichtbaar/toegankelijk met een actieve CLIPS‑membership.
- Navigatie: de link “In behandeling” wordt automatisch verborgen 7 dagen nadat de pagina voor het eerst is bekeken (client‑cookie `lp_pending_seen_at`).
- Auth foutenpagina: nieuwe pagina op `/auth/error` met duidelijke meldingen (bijv. “Verificatie mislukt”) en knoppen “Opnieuw inloggen” en “Terug naar home”. “Verification” fouten ontstaan vaak wanneer een magic link al is gebruikt of verlopen is; vraag in dat geval een nieuwe link aan.
- Verificatie: de pagina `/verificatie` heeft nu een knop “Nieuwe magic link” die eerst oude verificatielinks ongeldig maakt en vervolgens een nieuwe link verstuurt (met rate limiting).
- Instellingen prefilling: `/api/settings` levert nu gegevens voor alle ingelogde gebruikers (ook in behandeling), waardoor velden in Instellingen automatisch ingevuld zijn met gegevens uit de aanmelding.
  - Indien een gebruiker (bv. via Google) nog geen `Company` heeft, wordt een minimale placeholder aangemaakt bij het laden van `/api/settings` zodat de Instellingen-pagina nooit leeg is.
- Even voorstellen: team toont 3 leden gecentreerd: Bert (met foto), Barry (zonder foto → nette fallback), Frank (met foto). Plaats Frank's afbeelding als `apps/web/public/team/frank.jpg` (bestand hernoemen naar `frank.jpg`).
- Aanmelden: privacy en voorwaarden zijn nu samengevoegd tot één verplichte checkbox met links naar `/privacy` en `/voorwaarden`. Zonder vinkje kun je niet indienen.
- Homepage facelift: subtiele achtergrond‑gradients/shapes, verbeterde depth (hover/shadow/border) op kaarten, hero met glass‑effect, en pricinglijst met check‑iconen. CTA‑links bijgewerkt naar `/aanmelden`.
- Homepage visuals tweaked: storende blobs verwijderd; alleen een subtiele bottom‑gradient op desktop (verborgen op mobiel). Pricing overlay verzacht.
- Homepage visuals update: laatste bottom‑blur volledig verwijderd (strakker, minder afleiding).
- Mobile UX: tap‑targets op Even Voorstellen (mailknop, "Over" en modaal sluiten) vergroot naar ~44px.
- Mobile UX: grotere tap‑targets voor wachtwoord toggles op Aanmelden en Inloggen (~44px) met grotere iconen.
- Routing: Coach-pagina CTA wijst nu naar `/aanmelden`.
 - Even voorstellen: intro uitgebreid met een langere toelichting; bio van Bert Kranendonk bijgewerkt.
 - Footer: logo boven de tekst geplaatst en introparagraaf aangepast.
## 5) QA, SEO & Go-live
- [ ] SEO/OG: per pagina een duidelijke title/description; OG-image(s); sitemap.xml en robots.txt
- [ ] Toegankelijkheid: focus zichtbaar; alt-teksten; heading-structuur; toetsenbord in modals werkt (getest); kleurcontrast check
- [ ] Performance: hero zonder blur op mobiel; beelden lazy waar kan; fonts al preload; test Lighthouse mobiel/desktop
- [ ] Security headers: HSTS, no-sniff, X-Frame-Options; (optioneel) Content Security Policy
- [ ] Redirects: www→apex en http→https actief op server/proxy
- [ ] 404/500 pagina’s netjes (App Router not-found/error)
- [ ] Monitoring: Sentry of vergelijkbaar (fouten vastleggen)
- [ ] Analytics: optioneel cookieloze analytics (Plausible/Umami); anders cookie‑banner nodig
- [ ] E‑mail: productiedomein met SPF/DKIM/DMARC; mooie afzendernaam; magic link testen
- [ ] Legal: privacy/voorwaarden staan (basis). Juridische review gewenst. Bedrijfsgegevens (adres/KvK) toevoegen.
- [ ] ENV: NEXTAUTH_URL, NEXTAUTH_SECRET, MAIL_* provider, DATABASE_URL, APP_URLS per app, IMAGE_DOMAINS (indien nodig)
- [ ] Database: Prisma migraties draaien op prod
- [ ] Caching: headers voor static assets; image domains whitelisten indien extern
- [ ] Navigatie: CTA’s en links naar `/aanmelden`; header tap‑targets vergroot (~44px)

## VPS Deploy (praktisch)
Aanrader OS: Debian 12 (Bookworm) of Ubuntu 22.04 LTS. Zorg voor A-records naar je VPS voor alle domeinen/subdomeinen (bijv. levendportret.nl, admin.levendportret.nl, club.levendportret.nl, clips.levendportret.nl).

Benodigd env’s (voorbeeld, zie ook eerdere hoofdstukken):
- DATABASE_URL (Postgres)
- NEXTAUTH_URL per app
- SMTP (EMAIL_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_REPLY_TO)
- R2 (R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)
- Upstash (optioneel): UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

### Optie A — Docker Compose + Caddy (auto-HTTPS)
1) Installeer Docker + Compose plugin
- Debian/Ubuntu: volg docs.docker.com (apt-get installatie).
2) Maak map op VPS, bv. `/srv/levend-portret` en zet hier:
- `compose.yml` (services: web, admin, club, fund, caddy)
- `.env` per service (of 1 globale .env) met secrets en URLs
- `Caddyfile` met domein→service reverse proxy
3) Build & run
- `docker compose up -d --build`
4) Updaten na lokale wijzigingen
- Git push naar remote; op VPS: `git pull` (als je compose.yml in repo houdt)
- `docker compose pull && docker compose up -d` (bij image registry)
- of `docker compose up -d --build` (builden op VPS)

Tip: kies Caddy voor automatische TLS (Let’s Encrypt). Voorbeeld Caddyfile snippet:
```
levendportret.nl {
  reverse_proxy web:3000
}
admin.levendportret.nl {
  reverse_proxy admin:3003
}
club.levendportret.nl {
  reverse_proxy club:3001
}
clips.levendportret.nl {
  reverse_proxy fund:3002
}
```

### Optie B — PM2 + Nginx/Caddy (zonder containers)
1) Installeer Node LTS (≥18) en pnpm
2) Clone repo op VPS, zet `.env` bestanden per app in `apps/*/.env`
3) Build
- `pnpm i`
- `pnpm --filter web build`
- `pnpm --filter admin build`
- `pnpm --filter club build`
- `pnpm --filter fund build`
4) Start met PM2 (production)
- `pm2 start "pnpm --filter web start" --name web`
- `pm2 start "pnpm --filter admin start" --name admin`
- `pm2 start "pnpm --filter club start" --name club`
- `pm2 start "pnpm --filter fund start" --name fund`
- `pm2 save && pm2 startup` (auto-restart na reboot)
5) Reverse proxy
- Met Caddy (auto-HTTPS) of Nginx: proxy domeinen naar `127.0.0.1:3000/3001/3002/3003`

### Migrate database (Prisma)
Voer na first-deploy en bij schema-wijzigingen uit op de VPS:
```
pnpm --filter web prisma migrate deploy
```
(of in de app waar Prisma CLI staat geconfigureerd)

### Update workflow na livegang (eenvoudig)
- Lokaal: wijzigingen maken en committen
- Push naar git remote (GitHub/GitLab)
- VPS:
  - PM2: `git pull && pnpm i --frozen-lockfile && pnpm -r build && pm2 reload all`
  - Docker: `git pull && docker compose up -d --build` of `docker compose pull && docker compose up -d`

Backups/secrets: beheer `.env` buiten versiebeheer; gebruik een password manager of een secrets manager. Maak databasebackups (bijv. via provider of `pg_dump` cron).

### Cloudflare setup (aanbevolen)
- **DNS**: maak A-records voor alle hosts (web root en subdomeinen) en zet de oranje wolk (Proxy) aan.
- **SSL/TLS**: zet op Full (strict).
  - Optie 1 (aanrader bij Proxy=on): maak per host een Cloudflare Origin Certificate, installeer op de VPS en laat Caddy dat certificaat gebruiken.
    - Cloudflare Dashboard → SSL/TLS → Origin Server → Create Certificate → Domains toevoegen → Download (PEM + private key)
    - Plaats bv. in `/etc/ssl/cf-origin/<host>.pem` en `<host>-key.pem` (chmod 600)
    - Caddyfile per host:
      ```
      levendportret.nl {
        tls /etc/ssl/cf-origin/levendportret.nl.pem /etc/ssl/cf-origin/levendportret.nl-key.pem
        reverse_proxy 127.0.0.1:3000
      }
      ```
  - Optie 2: tijdelijk Proxy uit (grijze wolk), Caddy laat Let’s Encrypt certificaat halen, daarna Proxy weer aan. (Niet ideaal ivm toekomstige renewals.)
- **Performance**: HTTP/2, HTTP/3 en Brotli aan. Rocket Loader uit (kan front-end breken).
- **Caching**: standaard cachet Cloudflare geen HTML. Voeg Cache Rules toe om API en admin niet te cachen:
  - Bypass cache op URL patterns: `*levendportret.nl/api/*`, `*admin.levendportret.nl/*`
  - Je kunt desgewenst ook op Cookie presence (bijv. `__Secure-next-auth.session-token`) bypassen.
- **Security headers**: we sturen al strikte headers/HSTS vanuit apps. Cloudflare kan aanvullend HSTS aanzetten; voorkom dubbele tegenstrijdige instellingen.
- **IP-adres van echte bezoeker**: achter Cloudflare zie je het echte IP in de header `CF-Connecting-IP`.
  - In Node/Next app routes kun je het IP bepalen met: `req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]`.
  - Handig voor rate limiting en logging.
- **Cache purge na deploy**: als je agressievere caching gebruikt, purge cache na een release (Dashboard → Caching → Purge Everything of gerichte rules).

## Lokale URLs en run
- web: http://localhost:3000
- club: http://localhost:3001
- clips (voorheen fund): http://localhost:3002
- admin: http://localhost:3003

Start alles: `pnpm dev`
Per app: `pnpm -C apps/web dev` (of club/clips/admin)

### Lokale subdomeinen & SSO (aanbevolen)
- Voeg aan je hosts file toe (Windows: `C:\\Windows\\System32\\drivers\\etc\\hosts`):
  - `127.0.0.1 web.levendportret.local`
  - `127.0.0.1 club.levendportret.local`
  - `127.0.0.1 clips.levendportret.local` (gebruikt de huidige fund-app als Clips-frontend)
  - `127.0.0.1 admin.levendportret.local`
- Start elke app met eigen URL/poort en zet per app `NEXTAUTH_URL`:
  - web: `http://web.levendportret.local:3000`
  - club: `http://club.levendportret.local:3001`
  - clips: `http://clips.levendportret.local:3002` (app: `apps/fund`)
  - admin: `http://admin.levendportret.local:3003`
- SSO over subdomeinen inschakelen (zelfde login op alle apps):
  - Zet in `.env.local` (root) dezelfde `NEXTAUTH_SECRET` voor alle apps.
  - Zet `AUTH_COOKIE_DOMAIN=.levendportret.local` (de auth-config gebruikt dit voor shared cookies).

### Lokale setup zonder subdomeinen (localhost)
- Gebruik alleen:
  - http://localhost:3000 (web)
  - http://localhost:3001 (club)
  - http://localhost:3002 (clips)
  - http://localhost:3003 (admin)
- Laat `AUTH_COOKIE_DOMAIN` LEGE of verwijder deze variabele in `.env.local` (niet geldig op localhost).
- Hou dezelfde `NEXTAUTH_SECRET` voor alle apps.
- Start elke app met zijn eigen `NEXTAUTH_URL` (PowerShell):
  - web: `$env:NEXTAUTH_URL="http://localhost:3000"; pnpm -C apps/web dev`
  - club: `$env:NEXTAUTH_URL="http://localhost:3001"; pnpm -C apps/club dev`
  - clips: `$env:NEXTAUTH_URL="http://localhost:3002"; pnpm -C apps/fund dev`
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
  - clips: `dotenv -e .env.local -- pnpm -C apps/fund dev`

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
- clips: `http://localhost:3002/api/auth/session`
- admin: `http://localhost:3003/api/auth/session`
- Tip voor lokale loginflow per app: start elke app met z’n eigen `NEXTAUTH_URL`:
  - club: `$env:NEXTAUTH_URL="http://localhost:3001"; pnpm -C apps/club dev`
  - clips: `$env:NEXTAUTH_URL="http://localhost:3002"; pnpm -C apps/fund dev`
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
  - Header navigatie volgorde aangepast: Clips → Club → Coach → Fund → Even voorstellen (packages/ui Header).
  - Actieve navigatie highlight: huidige app/pagina wordt eenvoudig gemarkeerd (desktop + mobiel menu).
- **Web Pagina's (MVP):**
  - `Home`: Volledig gestyled met hero, features, werkwijze en prijs. Copy aangevuld met aangeleverde tekst (adviesgesprek, digitale toolkit, club-voordelen) en extra CTA. "Geef een cadeau" CTA tijdelijk verwijderd. Features-sectie voorzien van subtiele achtergrond (meer contrast).
  - `Coach`: Coming soon placeholder (apps/web/app/coach).
  - `Fund`: Coming soon placeholder (apps/web/app/fund).
  - `Club` (localhost:3001): Shell klaar met gedeelde Header/Footer/Fonts/Logo via `@levendportret/ui`. Pagina is afgeschermd (alleen voor ingelogde gebruikers) en toont voorlopig "coming soon". Na wijzigingen in dependencies voer `pnpm install` in de repo-root uit en herstart `pnpm dev`.
  - `Even voorstellen`: Team-overzicht met uniforme mail-icoontjes. "Over Bert" opent nu een in-site, focusbare modal (geen aparte pagina).

**Fonts (Club app)**
- Club (3001) gebruikt dezelfde Bree/Montserrat-styling als web. Self-hosted Bree-bestanden staan onder `apps/web/public/fonts`. Kopieer voor Club naar `apps/club/public/fonts` (minimaal `Bree Regular.woff2` en `Bree Bold.woff2`).
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

#### UX updates (12-11-2025)
- 404 pagina’s voor alle apps (`web`, `club`, `fund`, `admin`) met NL-teksten, icoon en knop terug naar home/dashboard.
- Instellingen Bedrijf: `website` wordt automatisch als URL genormaliseerd (prefix `https://` indien ontbreekt).
- Webpagina-instellingen: checkboxes visueel gestyled, bestand-kiezer vervangen door knop en upload-spinner toegevoegd, socials placeholders verbeterd, tip voor eenvoudige Markdown bij “Over ons”.
- Webpagina-instellingen: in-site bevestigingsmodal bij terugnavigatie met niet-opgeslagen wijzigingen (geen browser popups).
  - Modal toegankelijkheid: focus trap binnen de modal en sluiting via ESC.
  - Modal animaties: fade voor backdrop, scale+translate voor inhoud.
  - Autosave: wijzigingen worden automatisch als concept opgeslagen (debounce ~1.5s) zolang er geen upload of handmatige save bezig is.

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

#### Admin updates (12-11-2025)
- Dashboard: nieuwe kaart “Clipsbeheer” die linkt naar `/dashboard/clips`.
- Clipsbeheer pagina met 2 tabbladen:
  - Websites: bedrijven met een externe `website` (alfabetisch op naam).
  - Aanvragen: alleen wanneer er géén externe website is, de eigenaar `ACTIVE` is, en `CompanyPage.status = IN_REVIEW`.
    - Niet ACTIVE + verstuurd → niet zichtbaar.
    - Wel ACTIVE + concept (niet verstuurd) → niet zichtbaar.
    - Wel ACTIVE + verstuurd → zichtbaar als aanvraag.
    - Wanneer status van eigenaar later `ACTIVE` wordt, verschijnt de aanvraag automatisch.
- Extra: zoekbalk voor filteren op naam/plaats, badge met aantal aanvragen op de Clipsbeheer-kaart.
- Nieuw tabblad: Gepubliceerd (alle `PUBLISHED` interne pagina’s, zonder externe website). Vanuit detail kun je altijd terugzetten naar `IN_REVIEW` en content aanpassen.
- Review detail: `/dashboard/clips/[id]`
  - Vereist 2 geldige Vimeo IDs om te publiceren (anders disabled/400).
  - Admin kan inhoud deels aanpassen (tekst, etc.) en publiceren of afwijzen met reden.
  - Afwijzen zet de status terug naar `DRAFT` en slaat een reden op (Moderation-notitie) die de klant ziet.
  - Publiceren zet de status op `PUBLISHED` en de 2 clips op `PUBLISHED`; overige clips worden gearchiveerd.
  - Extra: galerij beheren (verwijderen + toevoegen via URL), breadcrumb en Terug-knop, labels voor Short (9x16) en Lang (16x9).
  - Bedrijfsinfo tonen en bijwerken (naam, adres, postcode, plaats, telefoon, kvk, website) en link naar gebruiker in gebruikersbeheer.
  - Huisstijl: accentkleur is color picker; galerij heeft Lucide pijl-links/pijl-rechts en verwijderknop (verwijderen pas bij 4+).
  - Contactsectie-toggle wordt correct getoond (server levert `showContactPage`).
- Slug-regel voor CompanyPage: nette slug op basis van bedrijfsnaam, bij conflict `-2`, `-3`, ... (bijv. `CaityB`, `CaityB-2`).
- Publieke route: `/p/[slug]` toont alleen gepubliceerde pagina’s (middleware staat publiek toe).
- Web instellingen: als `CompanyPage.status = IN_REVIEW` wordt op `/instellingen` bovenaan een gele infobanner getoond (“in review, aanpassen kan weer na review of na terugzetten naar concept”). Als `status = PUBLISHED` is, verschijnt een groene banner met knop “Update aanvragen” die een in-site modal met tekstveld opent; de tekst wordt opgeslagen als Moderation-notitie voor de admins.
- Webpagina instellingen: indienen vraagt om bevestiging via in-site modal, velden zijn vergrendeld tijdens `IN_REVIEW`, autosave elke 30 seconden zolang er wijzigingen zijn. Bij `IN_REVIEW` is er een knop “Terug naar concept” die de status terugzet naar `DRAFT`. Bij `PUBLISHED` wordt alleen een tekst getoond dat je via de instellingenpagina een update kunt aanvragen (geen directe wijzigingen meer).
  - Alleen beschikbaar met “Volledige toegang” (CLUB + COACH + CLIPS alle drie `ACTIVE`). APIs `/api/settings/webpage` en `/api/settings/webpage/submit` controleren dit.
- Statuswijzigingen: wanneer een gebruiker wordt afgekeurd (REJECTED) of teruggezet naar in behandeling (PENDING_APPROVAL), worden alle actieve memberships automatisch `EXPIRED`.
- Bevestigingen: bij “FUND toekennen” en “CLUB + COACH toekennen” verschijnt een bevestigingsdialoog.
- `startDate`: bij het aanmaken van `CLUB/COACH` memberships wordt de startdatum gezet (voor 3 jaar-logica). Voor `FUND` wordt de startdatum later ingesteld via de Fund aanmaken/bewerken pagina (niet via admin).
- Extra actie: `SWITCH_TO_FUND` verwijdert alle `CLUB/COACH` memberships (ook verlopen) en activeert `FUND` opnieuw.

- **Gebruikerslijst** `/dashboard/gebruikers`:
  - Filters: `status` (ACTIVE/PENDING_APPROVAL/REJECTED/PENDING_VERIFICATION) en `product` (CLUB/COACH/FUND of Alle).
  - Lijst toont membership-badges per gebruiker (product + status), naast bedrijfsnaam/plaats.
  - Inline acties: Goedkeuren, Afkeuren, Op in behandeling.
  - Link naar detail: `/dashboard/gebruiker/[id]`.
  - Detail: breadcrumb toegevoegd. “Volledige toegang” schakelaar:
    - Aan: CLUB + COACH ACTIVE, FUND EXPIRED
    - Uit: FUND ACTIVE, CLUB + COACH EXPIRED
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

### Schema update (Clips): Company.workEmail
- Nieuw veld: `Company.workEmail` (optioneel) voor zakelijk e-mailadres in contactsectie op de klantpagina.
- UI/API:
  - apps/web Instellingen → Bedrijf: nieuw inputveld “Zakelijk e-mailadres”.
  - API `/api/settings/company` accepteert en bewaart `workEmail`.
  - Slugpagina (Clips) gebruikt `company.workEmail` als primaire e-mail (fallback: eigenaar e-mail).
- Na updaten: draai migratie + generate en herstart dev servers.
  
  ### Clips — Webpagina instellingen (UI + schema update)
  
  - UI wijzigingen:
    - Lange video veld verwijderd uit klant-UI (waarde in DB blijft bestaan; API wist het niet tenzij expliciet meegestuurd).
    - Galerij: previews staan boven het bestand-veld, teller “geselecteerd X/5”, volgorde-knoppen blijven.
    - Socials: placeholders toegevoegd (bijv. `https://instagram.com/bedrijfsnaam`).
    - Huisstijl: live font-preview (titel vet, body normaal) met dynamische Google Fonts loading.
    - Contact: nieuwe toggle “Toon contactsectie (gebaseerd op je bedrijfsinformatie)”.
    - Validatie/UX: live character count voor “Over ons” (max 5000), HEX-validatie voor accentkleur, bestandscontrole (type/5MB).
  
  - Schema wijziging:
    - `CompanyPage.showContactPage Boolean @default(true)` toegevoegd.
  
  - Na aanpassing lokaal migreren en Prisma Client regenereren:
  
    ```powershell
    pnpm --filter @levendportret/db run prisma:migrate:dev
    pnpm --filter @levendportret/db run prisma:generate
    pnpm dev
    ```
  
  - Troubleshooting TypeScript na schema-wijziging:
    - Fout “Property 'companyPage' does not exist on PrismaClient” → Prisma Client types zijn verouderd. Los op met het bovenstaande `prisma:generate` en herstart dev server/TS Server.

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
