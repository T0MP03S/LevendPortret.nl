# Clips — Implementatiechecklist (MVP)
## 2b) Clips-overzicht thumbnails
- [x] Als er door admin een 1080x1920 (9:16) thumbnail is aangeleverd via het aparte veld (`clipsThumbnailUrl`), wordt die gebruikt op het Clips-overzicht.
- [x] Zo niet, dan valt de UI terug op de Vimeo oEmbed thumbnail.
- [x] Als ook geen Vimeo-thumbnail beschikbaar is, gebruiken we de eerste galerij-afbeelding.


Doel: alles wat nodig is om het Clips-idee live te krijgen, afgestemd op de ingevulde questionnaire.

## 0) Datamodel & migraties (packages/db)
- [x] Prisma models toevoegen:
  - [x] `Clip` (korte verticale video)
    - [x] id, companyId (FK), vimeoShortId (string), createdAt, updatedAt
    - [x] status: enum `IN_REVIEW` | `PUBLISHED` | `ARCHIVED`
  - [x] `CompanyPage` (interne bedrijfspagina)
    - [x] id, companyId (FK, unique), slug (unique), status: enum `DRAFT` | `IN_REVIEW` | `PUBLISHED` | `ARCHIVED`
    - [x] longVideoVimeoId (string, optioneel)
    - [x] aboutLong (text)
    - [x] gallery (3–5 afbeeldingen, JSON van objects: { url, width, height, type })
    - [x] accentColor (string), titleFont (enum), bodyFont (enum), roundedCorners (boolean)
    - [x] showCompanyNameNextToLogo (boolean)
    - [x] social: { facebook?, instagram?, linkedin?, youtube?, tiktok? }
  - [x] Relaties: `Company 1–1 CompanyPage`, `Company 1–N Clip`
- [x] Index/unique constraints: `CompanyPage.slug` unique; `CompanyPage.companyId` unique
- [x] Slug-generator (server): slugify bedrijfsnaam + unieke suffix bij conflict

## 1) Web — Overzichtspagina /clips (apps/web)
- [x] Route: `/clips` (redirect naar Clips-app)
- [x] Grid met links 9:16 thumbnail/preview, rechts naam + korte beschrijving (uit company.description, max 250)
- [x] Sortering: recentste eerst
- [x] Paginering met nummers en vorige/volgende (2 per pagina desktop, 8 mobiel)
- [x] Klikgedrag:
  - [x] Klik op thumbnail → open lightbox met korte video (Vimeo)
  - [x] Klik op bedrijfsnaam/tekst → externe website in nieuw tab; als géén externe site: interne pagina `/p/[slug]` (later: subdomein clips.levendportret.nl)
- [x] A11y: alt-teksten, focus states, toetsenbordnavigatie
- [x] Performance: thumbnail via Vimeo oEmbed (met caching), lazy-load player
- [x] Beschrijving: HTML gestript, whitespace behouden, minimale bold-markdown ondersteund (** en __)

> Lokale routing:
> - Het daadwerkelijke Clips-overzicht draait nu op de Clips-app (`http://localhost:3002/caityb`) op `http://localhost:3002`.
> - De web-app route `/clips` redirect alleen nog naar `http://localhost:3002`, inclusief de `?page` query.

## 2) Web — Lightbox Player
- [x] Fullscreen overlay, sluitknop (X), Esc, klik-buiten sluit
- [x] Autoplay na gebruikersklik, ontdempt (unmuted)
- [x] Controls: play/pause, tijdlijn, volume
- [x] Lazy-load van player alleen bij open; poster vooraf tonen

## 3) Web — Interne bedrijfspagina `/p/[slug]`
- [x] Header: logo, optioneel bedrijfsnaam naast logo, social iconen (alleen tonen indien links)
- [x] Mobiel: hamburger-menu (Lucide Menu/X), sluit bij klik op item
- [x] Bovenin: lange Vimeo-video (indien ingevuld)
- [x] Body: langere over-ons tekst
- [x] Galerij: 3–5 foto’s onderin (grid)
- [x] Contact-sectie: kaart (eenvoudige embed), telefoon, e-mail, adres (uit company)
- [x] Styling: accentkleur via color picker (HEX), title/body font via selectie (~25 Google Fonts), rounded corners toggle
 - [x] SEO/OG/canonical per pagina
  - [x] Meta title/description uit Company/CompanyPage
  - [x] OG-tags: og:title/description/image (gebruik 9×16 of eerste gallery)
  - [x] Canonical naar https://clips.levendportret.nl/[slug]
  - [x] Sitemap + robots voor Clips-app
- [x] “In aanbouw”-fallback wanneer status ≠ PUBLISHED (via 404/notFound)

> Clips-domein:
> - De web-route `/p/[slug]` redirect nu naar de Clips-app (`apps/fund` → Clips) op `http://localhost:3002/[slug]`.
> - Slug-pagina in Clips verbergt globale header/footer en toont eigen compacte header.
> - Onder aan de slug-pagina staat een lokale footer met verwijzing naar LevendPortret.nl.
> - Anchor-knoppen (Video/Over ons/Foto's/Contact) zijn ingevuld in de accentkleur (geen outlines).
> - De hele pagina gebruikt de gekozen body/titel-fonts (Google Fonts dynamic load).
> - Foto's-sectie heeft witte achtergrond; “Over ons” behoudt alineas/witregels.
> - Over ons ondersteunt minimale bold-markdown: **vet** en __vet__ (veilig; HTML wordt ge-escaped).
> - Contact: adresregel wordt getoond; iconen zijn uniform; socials onder elkaar met naam en icoon; links uit CompanyPage.socials en Company.socials (fallback).

## 4) Web — Klant “Webpagina instellingen” (apps/web)
- [x] Zichtbaarheid: tab/link boven “Instellingen” als company.website leeg is
- [x] Route: `/instellingen/webpagina`
- [x] Form velden:
  - [x] aboutLong (text)
  - [x] gallery (3–5 afbeeldingen via R2 upload)
  - [x] social links (fb/ig/li/yt/tk)
  - [x] lange video Vimeo ID/URL — alleen voor admins (verborgen in klant UI)
  - [x] accentColor (selectie), titleFont/bodyFont (selectie), roundedCorners (toggle)
  - [x] showCompanyNameNextToLogo (toggle)
- [x] Validatie: URL’s, galerij 3–5, bestandstypes (jpg/png/webp), max-grootte (5 MB)
- [x] Acties: Opslaan als concept, Indienen voor review (IN_REVIEW/PUBLISHED), terug naar concept, update aanvragen
- [x] Validatie: indien een externe website is ingevuld, is een korte beschrijving (max 250 tekens) verplicht
- [ ] Preview: indien eenvoudig, anders later

> Socials-validatie:
> - Ondersteunt @handles voor Instagram/YouTube/TikTok.
> - YouTube accepteert ook kanaal- en @-links (bijv. https://www.youtube.com/channel/ID of https://www.youtube.com/@kanaal).
> - Facebook/LinkedIn vereisen geldige domein-URLs.

## 5) Uploads & assets (Cloudflare R2)
- [x] Presigned upload endpoints voor galerijafbeeldingen (apps/web/app/api/settings/webpagina/gallery-upload/route.ts)
- [x] Client: bestandsselectie + previews, volgorde kunnen wijzigen (apps/web/app/instellingen/webpagina/page.tsx)
- [x] Opslag: publieke base URL vanuit R2; alleen URL’s opslaan in DB
- [x] CORS/headers OK (zelfde als logo-upload; dev getest)

## 6) Admin — Clips beheren (apps/admin)
- [x] Nieuw menu “Clips” (kaart op dashboard naar `/dashboard/clips`)
- [x] Lijst/queue: tabs Websites / Aanvragen / Gepubliceerd
- [x] Per bedrijf: velden voor korte (overzicht) en lange (pagina) Vimeo ID/URL (via admin detail)
- [x] Acties: aanmaken/bewerken, publiceren/depubliceren, archiveren (m.b.v. status en PATCH acties)
 - [x] Publiceren: bevestigingsmodal in-site (Annuleren mogelijk). Bij status=PUBLISHED is de knoptekst “Opnieuw publiceren”.
 - [x] Na (opnieuw) publiceren worden ingediende update-aanvragen (Moderation: SUBMITTED) automatisch op APPROVED gezet en verdwijnen ze uit het Aanvragen-tab.
- [x] Admin kan volledige pagina beheren: inhoud (over ons, galerij), huisstijl (kleur/fonts/rounded), socials, contact-toggle, longVideoVimeoId, custom 9×16 thumbnail.
- [ ] Moderatie: review changes voor “Webpagina instellingen” inzendingen (notes zichtbaar maken in Aanvragen-detail blijft nog open)
- [ ] Eenvoudige history/audit (wie/wat/wanneer)

## 7) Admin — Bedrijfspagina’s beheren
- [ ] Reviewen/aanpassen klantcontent, zichtbaarheid togglen
- [ ] Publiceren alleen door admin (status → PUBLISHED)

## 8) Security & rechten
- [ ] Toegang admin-secties alleen voor ADMIN
- [ ] Klant ziet en wijzigt enkel eigen Webpagina-instellingen
- [ ] Rate limiting optioneel op “indienen voor review”
- [ ] Audit log entries bij publish/depublish/update
 - [x] CSP: Google Fonts toegestaan (fonts.gstatic.com), style-src https/inline voor GF CSS
 - [x] CSP: frame-src voor Vimeo en Google Maps embeds (Clips/Web)

## 9) Performance & SEO
- [ ] Cache policy voor thumbnails (stale-while-revalidate)
- [ ] Lazy load images (gallery) en video iframes
- [ ] SEO: meta tags en OG-data  

## 10) Analytics (basis, optioneel voor nu)
- [ ] Events: impressie clip-tegel, open lightbox, play, click-out naar externe site
- [ ] Logging naar console/telemetry stub (later naar analytics tool)

## 11) Tests & acceptatie
- [ ] UAT scenario’s: clip kijken, klik naar site, fallback interne pagina, admin publicatieflow
- [ ] E2E rooktest: overzicht laadt, lightbox werkt, admin kan publiceren, klant ziet tab indien geen website

## 12) Uitrol & documentatie
- [ ] README bijwerken met link naar deze checklist
- [ ] Documenteer env-keys en R2 endpoints voor galerij-upload
- [ ] Admin-handleiding: hoe te publiceren/archiveren

---

## Notities
- Vimeo: UI accepteert URL of ID; backend slaat Vimeo ID op.
- Thumbnails/posters: via Vimeo oEmbed, gecachet; geen R2 opslag in MVP.
- Paginering: 2 items/pg desktop, 8 mobiel.
- Maps: API indien gratis; anders embed.
- Fonts/kleuren: ±25 Google Fonts; kleur via vrije HEX color picker.

---

## Pre-launch & QA (Clips)
- [x] Moderation detail: toon inzend-notities/historie in `/dashboard/clips/[id]`
- [x] Lazy-load: gallery afbeeldingen en Vimeo iframe via IntersectionObserver
- [ ] A11y: aria-labels/menu focus voor hamburger, alt-teksten, contrast-check
- [ ] Performance: cache policy voor thumbnails; Next/Image waar mogelijk
- [ ] Security: CSP in productie aanscherpen (geen `https:` wildcard voor fonts, geen `unsafe-eval` indien haalbaar)
- [ ] Rate limiting: submit/publish endpoints
- [ ] Audit logging: publish/depublish/update (minimaal)
- [ ] UAT/E2E rooktest: overview, lightbox, publish-flow, fallback slug
- [ ] Domein: `clips.levendportret.nl` DNS/redirects + canonical check
