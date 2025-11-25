# Club Blog/News — Stappenplan (afstreep-lijst)

- [ ] Architectuur en data
  - [x] Prisma model `Article`: `id`, `slug` (unique), `title`, `excerpt`, `body` (JSON/Tiptap), `thumbnailUrl`, `status` (`DRAFT` | `PUBLISHED` | `SCHEDULED`), `visibility` (`PUBLIC` | `MEMBERS`), `publishedAt`, `createdAt`, `updatedAt`, `authorId`
  - [x] Optioneel: `tags[]`, `readingMinutes`, `metaTitle`, `metaDescription`, `ogImageUrl`
  - [x] Indexen: `slug` unique, `status+publishedAt` voor listing
  - [x] Migratie aanmaken en draaien

- [ ] Bestanden & routes
  - [x] Admin: `apps/admin/app/dashboard/artikelen/page.tsx` (overzicht + filters)
  - [x] Admin: `apps/admin/app/dashboard/artikel/nieuw/page.tsx` (nieuw artikel)
  - [x] Admin: `apps/admin/app/dashboard/artikel/[id]/page.tsx` (bewerken)
  - [x] API: `apps/admin/app/api/admin/articles/*` (CRUD; upload/schedule volgt)
  - [x] Club site: `apps/club/app/nieuws/page.tsx` (overzicht)
  - [x] Club site: `apps/club/app/nieuws/[slug]/page.tsx` (detail, SSR)

- [x] Rich text editor & media
  - [x] Block-based editor met drag-and-drop (dnd-kit)
  - [x] Block types: Tekst (Tiptap), Kop, Afbeelding, Quote, Video (YouTube/Vimeo), Code, Witruimte
  - [x] Extra block types: Call-to-Action, Galerij, Accordion/FAQ
  - [x] Thumbnail upload naar R2 met presigned PUT
  - [x] Thumbnail crop popup met drag-to-position en zoom slider (16:9, 1280x720)
  - [x] Thumbnail verwijderen uit R2 bij delete (API: `/api/admin/upload/delete`)
  - [x] Fullwidth layout met sidebar voor instellingen en SEO
  - [x] CSP updates in club `next.config.mjs` voor Vimeo/YouTube embeds
  - [x] Category systeem met URL structuur `/[category]/[slug]` (relatie naar Category model)
  - [x] Dynamische categorieën (admin kan aanmaken, lege worden verwijderd)
  - [x] Auto-slug generatie met streepjes (spaties → dashes)
  - [x] Responsive admin UI (mobile-friendly)
  - [x] Club site: grotere titels (text-lg font-bold), vaste hoogtes voor grid/list cards
  - [x] Club site: zoekfunctie (titel + excerpt)
  - [x] Club site: auto-excerpt uit eerste tekst-blok als geen excerpt is ingesteld
  - [x] Favicons en webmanifest voor alle apps (web, club, admin)
  - [x] Admin artikel editor: breedte gelijk aan header (max-w-5xl)
  - [x] R2 delete bij verwijderen van afbeeldingen in Image en Gallery blocks
  - [x] Excerpt toggle: handmatig of automatisch uit eerste tekstblok
  - [x] Responsive thumbnail crop (kleiner op mobiel)
  - [x] Touch support voor thumbnail crop (mobiel slepen)
  - [x] Body scroll blokkeren bij open modals
  - [x] Draft preview met token systeem (`/api/preview?secret=xxx&id=xxx`)
  - [x] Sitemap voor public artikelen (`/sitemap.xml`)
  - [x] RSS feed voor public artikelen (`/feed.xml`)
  - [ ] Server-side image resize (1080w, webp) - TODO
  - [ ] Video upload met compressie naar R2 - TODO

- [x] Statussen & planning
  - [x] Publiceer nu knop (zet `status=PUBLISHED`, `publishedAt=now`)
  - [x] Unpublish knop (zet `status=DRAFT`)
  - [x] Inplannen (SCHEDULED) via `publishedAt` datum picker
  - [x] Auto-publish: scheduled artikelen worden automatisch gepubliceerd bij pageload
  - [x] Members-only toggle (`visibility=MEMBERS`), gate in club app (auth check)

- [x] Admin UI/UX
  - [x] Snelle acties: Publish/Unpublish in sidebar
  - [x] Preview knop (draft preview of live artikel)
  - [x] Stijl consistent (navy/coral, Montserrat, Lucide iconen)
  - [ ] Lijst: filters (status, visibility), zoeken (titel/slug) - TODO
  - [ ] Validaties: unieke slug, titel verplicht - TODO

- [x] Club site rendering
  - [x] Overzichtspagina: grid met thumbnail, titel, excerpt, datum
  - [x] Detailpagina: hero-thumbnail, titel, datum, body render
  - [x] Zoekfunctie (titel + excerpt)
  - [x] Members-only: redirect naar inloggen bij niet ingelogd
  - [x] Sitemap en RSS voor public artikelen

- [ ] Beveiliging & performance
  - [ ] Sanitization HTML render (whitelist), server-side validation
  - [ ] Rate limiting op API’s (admin) en auth guard (ADMIN)
  - [ ] ISR/tag revalidate bij publish/unpublish

- [ ] DevOps
  - [ ] ENV: R2_* voor uploads; CLUB_BASE URLs; PREVIEW_SECRET voor draft preview
  - [ ] Scheduler (PM2 cron / platform): SCHEDULED → PUBLISHED
  - [ ] Logging/monitoring (Sentry) en optionele audit trail van statuswijzigingen

- [ ] QA
  - [ ] Mobile tests (overzicht/detail), toetsenbordnavigatie, focus zichtbaar
  - [ ] Content smoke tests: lange titels, veel media, embeds, members-only gating
  - [ ] Lighthouse (images webp, lazy, CLS)

---

## Scheduler voor geplande artikelen

De scheduler publiceert automatisch artikelen met status `SCHEDULED` wanneer hun `publishedAt` datum is verstreken.

### Lokaal testen
```powershell
# Eenmalig uitvoeren
pnpm scheduler

# Continu draaien (elke 5 minuten)
pnpm scheduler:watch
```

### Productie
Stel een cron job in die elke 5 minuten draait:
```bash
*/5 * * * * cd /path/to/project && node scripts/scheduler.js
```

Of gebruik een externe service (Vercel Cron, Railway, etc.) die deze endpoint aanroept:
```
POST https://admin.levendportret.nl/api/admin/articles/publish-scheduled
Authorization: Bearer {CRON_SECRET}
```

---

## Dev setup (eenmalig lokaal)

Voer na deze commit het volgende uit om Prisma types te genereren en de migratie te maken:

```powershell
pnpm -C packages/db prisma:migrate:dev -- --name add-article
pnpm -C packages/db prisma:generate
```

Start vervolgens je dev servers opnieuw.
