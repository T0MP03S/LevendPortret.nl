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
- [ ] Auth providers: Google OAuth + e-mail/wachtwoord (Auth.js)
- [ ] ENV variabelen gezet (NEXTAUTH, DB, R2, VIMEO, enz.)
- [ ] (Later) Vercel projecten: web, club, fund, admin
- [ ] (Later) Cloudflare DNS: CNAME records naar Vercel voor web/club/fund/admin

## 2) Codebase opzetten
- [x] Turborepo skeleton met apps: `web`, `club`, `fund`, `admin`
- [ ] Packages: `ui`, `config`, `db` (Prisma), `auth`, `utils`
- [x] Prisma schema + eerste migratie
- [ ] Tailwind + shadcn/ui + Lucide setup gedeeld in `ui`
- [ ] Auth SSO: shared cookie domein `.levendportret.nl`

## 3) Pagina’s & flows bouwen (MVP)
- [ ] Web (levendportret.nl): Home, Even voorstellen, Communicatie (placeholder), Aanmelden, Privacy, Voorwaarden
- [ ] Club (club.levendportret.nl): Overzicht (grid + 30s modal), Detail (5 min embed), Login/Register/Reset, Mijn-bedrijf bewerken
- [ ] Moderatie: status “Ingediend/Goedgekeurd/Gepubliceerd” zichtbaar en beheerbaar (admin)
- [ ] Admin (admin.levendportret.nl): Login, Dashboard, Bedrijven/Clips/Funds/Donaties, Moderatie-flow
- [ ] Fund (fund.levendportret.nl): Overzicht + detail skeleton; betalingen v2

## 4) Content & integraties
- [ ] Vimeo integratie (embeds): 30s + 5 min IDs per bedrijf
- [ ] Thumbnails/foto’s upload naar R2, signed URL’s in UI
- [ ] Eerste 1–5 bedrijven/clips ingeven (seed of via admin)

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

## Notities
- Foto’s/galerij via Cloudflare R2 (S3), video via Vimeo.
- SSO-cookie domein: `.levendportret.nl`.
- Betalingen Mollie (iDEAL, recurring) in v2 (webhooks + refundregistratie in admin).
