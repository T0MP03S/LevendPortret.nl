# Plan van aanpak — Levend Portret (MVP t/m 15 nov)

## Doel en scope
- **Live-datum**: 15 november met minimaal 5 clips zichtbaar.
- **MVP-scope**:
  - levendportret.nl (marketing): Home, Over ons, Communicatie (basic), Privacy/Voorwaarden. Geen checkout; CTA = aanmeldingsformulier/contact.
  - club.levendportret.nl: Publiek overzicht bedrijven + detailpagina’s (met 30s clip), login/registratie/wachtwoord-vergeten, eenvoudig bedrijfsbeheer (velden uit intake), optioneel Kaart als v2.
  - fund.levendportret.nl: Voor nu skeleton (landing + detail lay-out), doneren via Mollie = v2 (na 15 nov). Wel concept slugs en pagina’s klaarzetten.
  - admin.levendportret.nl: Login + minimale moderatieflow: clips/bedrijf publicatie-goedkeuring.

## Stackkeuze (GitHub basis)
- **Monorepo**: Turborepo + pnpm + TypeScript.
- **Framework**: Next.js (App Router) per app (SSR/ISR waar nuttig).
- **UI**: Tailwind CSS + shadcn/ui + Lucide iconen.
- **Auth (SSO)**: Auth.js (NextAuth) met Google + E-mail/wachtwoord. Gedeelde sessiecookie op `.levendportret.nl` voor subdomeinen.
- **Database**: Postgres (Neon of Supabase). ORM: Prisma. Migraties in repo.
- **Video**: Vimeo (zoals aangevinkt). Alleen ID’s/URL’s opslaan.
- **Foto-opslag**: Cloudflare R2 (S3-compatibel) met signed uploads/downloads.
- **Betalingen (v2)**: Mollie (iDEAL, recurring). Webhooks + refundproces in admin.
- **Kaart**: React-Leaflet + OpenStreetMap (v2 of als tijd rest, basic v1).
- **E-mail (v2)**: Resend/Postmark voor transactional mails (registratie, reset, donatiebewijs).
- **Hosting**: Vercel voor apps. Cloudflare DNS voor subdomeinen (CNAME naar Vercel). R2 via eigen subdomain indien gewenst.

## Repo-structuur (voorgesteld)
```
/ (monorepo)
  apps/
    web/        # levendportret.nl (marketing)
    club/       # club.levendportret.nl
    fund/       # fund.levendportret.nl
    admin/      # admin.levendportret.nl
  packages/
    ui/         # gedeelde UI (shadcn, thema, icon wrappers)
    config/     # eslint, tsconfig, tailwind presets
    db/         # prisma schema + client + seed
    auth/       # NextAuth config, cookie domein, providers
    utils/      # gedeelde helpers (R2 S3 client, Vimeo utils, etc.)
```

## Domeinen, DNS en hosting
- **DNS**: Cloudflare beheert alle records.
- **Subdomeinen**:
  - web → `levendportret.nl`
  - club → `club.levendportret.nl`
  - fund → `fund.levendportret.nl`
  - admin → `admin.levendportret.nl`
- **SSL**: Automatisch via Vercel; HSTS later toevoegen.
- **Cookies/SSO**: Auth cookies met `domain=.levendportret.nl`.

## Beveiliging en privacy (MVP)
- **HTTPS** overal, secrets in Vercel env vars.
- **2FA**: in MVP voor admins niet verplicht; in v2 via TOTP/WebAuthn.
- **Audit logging**: basishooks (login, publicatie, rolwijzigingen) in v2.
- **Dataretentie**: beleid 5 jaar (zoals intake) — opnemen in privacy.

## Datamodel v1 (Prisma)
- `User` (naam, e-mail, role, createdAt)
- `Account`/`Session`/`VerificationToken` (Auth.js)
- `Company` (slug, naam, tagline, beschrijving, sector, locatie, website, socials, logoUrl, ownerId)
- `Clip` (companyId, type [long|short], vimeoId, titel, duur, thumbnailUrl, beschrijving, published)
- `Membership` (userId/companyId, start, eind, status)
- `Fund` (companyId, titel, verhaal, doelbedrag, deadline, isPublic, slug)
- `Donation` (fundId, amount, recurring, donorName/email [optioneel], isAnonymous, status, mollieId)
- `Moderation` (resourceType, resourceId, status, reviewerId, notes)

## Omgevingsvariabelen (voorbeeld)
- DATABASE_URL
- NEXTAUTH_URL, NEXTAUTH_SECRET
- AUTH_COOKIE_DOMAIN=.levendportret.nl
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
- VIMEO_ACCESS_TOKEN
- MOLLIE_API_KEY (v2)

## MVP-functionaliteit per app
- **web**: Home (hero, werkwijze, coach, clips teaser, club, cadeau, prijs), Over ons, Communicatie (placeholder), Privacy/Voorwaarden, Contact/aanmelden.
- **club**: Overzicht bedrijven (grid + 30s clip preview on click), detailpagina met lange clip embed, login/register/reset, Mijn-profiel/bedrijf bewerken, publiceerflow (moderatie vereist).
- **fund**: Overzicht + detail skeleton, toggle public/privé, UI voor doneren later aan.
- **admin**: Login, dashboard, lijst bedrijven/clips/funds/donaties, knop “Publiceren/Afkeuren”, exports (CSV voor donateurs v2).

## Wireframe-notes (globaal)
- Heldere CTA’s: “Meld je aan” (home), “Word lid van de Club” (web → club), “Geef een Levend Portret” (cadeau).
- In club-overzicht: kaart in v2; v1 = grid met logo/naam en 30s clip modal.
- Company detail: hero met logo/naam/tagline, lange clip, beschrijving, contact/socials, optioneel fund-teaser.

## Tijdlijn naar 15 november
- Dag 1–2: Monorepo skeleton (apps+packages), UI theme, auth skeleton, DB schema init, R2 client.
- Dag 3–4: web (Home/Over/Privacy/Voorwaarden/Contact), content vullen met 1–2 cases.
- Dag 5–6: club (list/detail, auth, bedrijf bewerken, 30s clip preview), eenvoudige moderatie.
- Dag 7: admin (login + publish flow), seed 1–5 bedrijven/clips.
- Dag 8: fund skeleton (routing, detail UI zonder betalingen), toggles public/privé.
- Dag 9: QA, accessibility pass, OG/SEO basics, sitemap/robots, deploy naar staging + domeinkoppeling.

## Definitie van ‘done’ (MVP)
- Pages en slugs volgens Sitestructuur-document bestaan en renderen.
- 1–5 bedrijven zichtbaar, met werkende Vimeo-embeds en thumbnails vanuit R2.
- Auth werkt met Google + e-mail/wachtwoord, shared session tussen web/club/admin.
- Admin kan publiceren/afkeuren.
- Basis SEO: meta titles/descriptions, OG-image per hoofdpage.

## Open punten / keuzes
- Mollie (v2): recurring setup en webhooks.
- Kaart (v2): privacy (gegeneraliseerde locatie?), UX.
- E-mailprovider (Resend/Postmark) en templates (donatiebewijs v2).
- CMS voor blog (MDX of headless later). Voor nu: MDX in repo.

## Aanpak samenwerken
- Issue-triage in GitHub Projects (MVP board). PR’s klein houden. Dagelijkse korte check-in.
