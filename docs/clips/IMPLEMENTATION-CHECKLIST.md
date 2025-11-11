# Clips — Implementatiechecklist (MVP)

Doel: alles wat nodig is om het Clips-idee live te krijgen, afgestemd op de ingevulde questionnaire.

## 0) Datamodel & migraties (packages/db)
- [ ] Prisma models toevoegen:
  - [ ] `Clip` (korte verticale video)
    - [ ] id, companyId (FK), vimeoShortId (string), createdAt, updatedAt
    - [ ] status: enum `DRAFT` | `IN_REVIEW` | `PUBLISHED` | `ARCHIVED`
  - [ ] `CompanyPage` (interne bedrijfspagina)
    - [ ] id, companyId (FK, unique), slug (unique), status enum als hierboven
    - [ ] longVideoVimeoId (string, optioneel)
    - [ ] aboutLong (text)
    - [ ] gallery (3–5 afbeeldingen, JSON van objects: { url, width, height, type })
    - [ ] accentColor (string), titleFont (enum), bodyFont (enum), roundedCorners (boolean)
    - [ ] showCompanyNameNextToLogo (boolean)
    - [ ] social: { facebook?, instagram?, linkedin?, youtube?, tiktok? }
  - [ ] Relaties: `Company 1–1 CompanyPage`, `Company 1–N Clip`
- [ ] Index/unique constraints: `CompanyPage.slug` unique; `CompanyPage.companyId` unique
- [ ] Slug-generator (server): slugify bedrijfsnaam + unieke suffix bij conflict

## 1) Web — Overzichtspagina /clips (apps/web)
- [ ] Route: `/clips`
- [ ] Grid met links 9:16 thumbnail/preview, rechts naam + korte beschrijving (uit company.description, max 250)
- [ ] Sortering: recentste eerst
- [ ] Paginering met nummers en vorige/volgende (12 per pagina desktop, 8 mobiel)
- [ ] Klikgedrag:
  - [ ] Klik op thumbnail → open lightbox met korte video (Vimeo)
  - [ ] Klik op bedrijfsnaam/tekst → externe website in nieuw tab óf interne pagina `/bedrijf/[slug]` (later: subdomein clips.levendportret.nl)
- [ ] A11y: alt-teksten, focus states, toetsenbordnavigatie
- [ ] Performance: thumbnail via Vimeo oEmbed (met caching), lazy-load player

## 2) Web — Lightbox Player
- [ ] Fullscreen overlay, sluitknop (X), Esc, klik-buiten sluit
- [ ] Autoplay na gebruikersklik, ontdempt (unmuted)
- [ ] Controls: play/pause, tijdlijn, volume
- [ ] Lazy-load van player alleen bij open; poster vooraf tonen

## 3) Web — Interne bedrijfspagina `/bedrijf/[slug]`
- [ ] Header: logo, optioneel bedrijfsnaam naast logo, social iconen (alleen tonen indien links)
- [ ] Bovenin: lange Vimeo-video
- [ ] Body: langere over-ons tekst
- [ ] Galerij: 3–5 foto’s onderin (grid)
- [ ] Contact-sectie: kaart (eenvoudige Google embed), telefoon, e-mail, adres (uit company)
- [ ] Styling: accentkleur, title/body font, rounded corners toggle
- [ ] SEO/OG/canonical per pagina
- [ ] “In aanbouw”-fallback wanneer status ≠ PUBLISHED

## 4) Web — Klant “Webpagina instellingen” (apps/web)
- [ ] Zichtbaarheid: tab/link boven “Instellingen” als company.website leeg is
- [ ] Route: `/instellingen/webpagina`
- [ ] Form velden:
  - [ ] aboutLong (text)
  - [ ] gallery (3–5 afbeeldingen via R2 upload)
  - [ ] social links (fb/ig/li/yt/tk)
  - [ ] lange video Vimeo ID/URL
  - [ ] accentColor (selectie), titleFont/bodyFont (selectie), roundedCorners (toggle)
  - [ ] showCompanyNameNextToLogo (toggle)
- [ ] Validatie: URL’s, galerij 3–5, bestandstypes (jpg/png/webp), max-grootte (2–4 MB)
- [ ] Acties: Opslaan als concept, Indienen voor review
- [ ] Preview: indien eenvoudig, anders later

## 5) Uploads & assets (Cloudflare R2)
- [ ] Presigned upload endpoints voor galerijafbeeldingen (vergelijkbaar met logo-upload)
- [ ] Client: bestandsselectie + previews, volgorde kunnen wijzigen
- [ ] Opslag: publieke base URL vanuit R2; alleen URL’s opslaan in DB
- [ ] CORS/headers OK (re-use bestaande setup)

## 6) Admin — Clips beheren (apps/admin)
- [ ] Nieuw menu “Clips”
- [ ] Lijst/queue: statusfilters (Draft/In review/Published/Archived)
- [ ] Per bedrijf: velden voor korte (overzicht) en lange (pagina) Vimeo ID/URL
- [ ] Acties: aanmaken/bewerken, publiceren/depubliceren, archiveren
- [ ] Moderatie: review changes voor “Webpagina instellingen” inzendingen
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

## Notities / Open vragen
- Vimeo ID of URL? Voorstel: UI accepteert URL, backend slaat ID op.
- Thumbnail/poster via Vimeo oEmbed met caching; geen aparte opslag nodig in MVP.
- Paginering: 12 items/pg desktop, 8 mobiel (bevestigen).
- Google Maps: eenvoudige embed in MVP; API key later indien nodig.
- Font/kleurenkeuze: 4–6 fonts (self-hosted); 10–12 accentkleuren incl. merk-kleuren (lijst nog bepalen).
