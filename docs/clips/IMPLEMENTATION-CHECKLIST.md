# Clips — Implementatiechecklist (MVP)
## 2b) Clips-overzicht thumbnails
- [x] Als er door admin een 1080x1920 (9:16) thumbnail is aangeleverd via de galerij (eerste item), wordt die gebruikt op het Clips-overzicht.
- [x] Zo niet, dan valt de UI terug op de Vimeo oEmbed thumbnail.


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

> Lokale routing:
> - Het daadwerkelijke Clips-overzicht draait nu op de Clips-app (`apps/fund`) op `http://localhost:3002`.
> - De web-app route `/clips` redirect alleen nog naar `http://localhost:3002`, inclusief de `?page` query.

## 2) Web — Lightbox Player
- [x] Fullscreen overlay, sluitknop (X), Esc, klik-buiten sluit
- [x] Autoplay na gebruikersklik, ontdempt (unmuted)
- [x] Controls: play/pause, tijdlijn, volume
- [x] Lazy-load van player alleen bij open; poster vooraf tonen

## 3) Web — Interne bedrijfspagina `/p/[slug]`
- [x] Header: logo, optioneel bedrijfsnaam naast logo, social iconen (alleen tonen indien links)
- [x] Bovenin: lange Vimeo-video (indien ingevuld)
- [x] Body: langere over-ons tekst
- [x] Galerij: 3–5 foto’s onderin (grid)
- [ ] Contact-sectie: kaart (Maps API indien gratis mogelijk; anders eenvoudige embed), telefoon, e-mail, adres (uit company)
- [x] Styling: accentkleur via color picker (HEX), title/body font via selectie (~25 Google Fonts), rounded corners toggle
- [ ] SEO/OG/canonical per pagina
- [x] “In aanbouw”-fallback wanneer status ≠ PUBLISHED (via 404/notFound)

> Clips-domein:
> - Naast de web-route `/p/[slug]` is de bedrijfspagina ook bereikbaar via de Clips-app (`apps/fund` → Clips) op `http://localhost:3002/[slug]`.

## 4) Web — Klant “Webpagina instellingen” (apps/web)
- [x] Zichtbaarheid: tab/link boven “Instellingen” als company.website leeg is
- [x] Route: `/instellingen/webpagina`
- [x] Form velden:
  - [x] aboutLong (text)
  - [x] gallery (3–5 afbeeldingen via R2 upload)
  - [x] social links (fb/ig/li/yt/tk)
  - [x] lange video Vimeo ID/URL
  - [x] accentColor (selectie), titleFont/bodyFont (selectie), roundedCorners (toggle)
  - [x] showCompanyNameNextToLogo (toggle)
- [x] Validatie: URL’s, galerij 3–5, bestandstypes (jpg/png/webp), max-grootte (5 MB)
- [x] Acties: Opslaan als concept, Indienen voor review (IN_REVIEW/PUBLISHED), terug naar concept, update aanvragen
- [x] Validatie: indien een externe website is ingevuld, is een korte beschrijving (max 250 tekens) verplicht
- [ ] Preview: indien eenvoudig, anders later

## 5) Uploads & assets (Cloudflare R2)
- [ ] Presigned upload endpoints voor galerijafbeeldingen (vergelijkbaar met logo-upload)
- [ ] Client: bestandsselectie + previews, volgorde kunnen wijzigen
- [ ] Opslag: publieke base URL vanuit R2; alleen URL’s opslaan in DB
- [ ] CORS/headers OK (re-use bestaande setup)

## 6) Admin — Clips beheren (apps/admin)
- [x] Nieuw menu “Clips” (kaart op dashboard naar `/dashboard/clips`)
- [x] Lijst/queue: tabs Websites / Aanvragen / Gepubliceerd
- [x] Per bedrijf: velden voor korte (overzicht) en lange (pagina) Vimeo ID/URL (via admin detail + Clips openen modal)
- [x] Acties: aanmaken/bewerken, publiceren/depubliceren, archiveren (m.b.v. status en PATCH acties)
- [ ] Moderatie: review changes voor “Webpagina instellingen” inzendingen (notes zichtbaar maken in Aanvragen-detail blijft nog open)
- [ ] Eenvoudige history/audit (wie/wat/wanneer)

## 7) Admin — Bedrijfspagina’s beheren
- [ ] Aanmaken/activeren interne pagina voor bedrijven zonder eigen site
- [ ] Reviewen/aanpassen klantcontent, zichtbaarheid togglen
- [ ] Publiceren alleen door admin (status → PUBLISHED)

## 8) Security & rechten
- [ ] Toegang admin-secties alleen voor ADMIN
- [ ] Klant ziet en wijzigt enkel eigen Webpagina-instellingen
- [ ] Rate limiting optioneel op “indienen voor review”
- [ ] Audit log entries bij publish/depublish/update

## 9) Performance & SEO
- [ ] Cache policy voor thumbnails (stale-while-revalidate)
- [ ] Lazy load images (gallery) en video iframes
- [ ] SEO: meta tags en OG-data voor `/bedrijf/[slug]`

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
