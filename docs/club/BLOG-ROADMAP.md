# Club Blog/News — Stappenplan (afstreep-lijst)

- [ ] Architectuur en data
  - [ ] Prisma model `Article`: `id`, `slug` (unique), `title`, `excerpt`, `body` (JSON/Tiptap), `thumbnailUrl`, `status` (`DRAFT` | `PUBLISHED` | `SCHEDULED`), `visibility` (`PUBLIC` | `MEMBERS`), `publishedAt`, `createdAt`, `updatedAt`, `authorId`
  - [ ] Optioneel: `tags[]`, `readingMinutes`, `metaTitle`, `metaDescription`, `ogImageUrl`
  - [ ] Indexen: `slug` unique, `status+publishedAt` voor listing
  - [ ] Migratie aanmaken en draaien

- [ ] Bestanden & routes
  - [ ] Admin: `apps/admin/app/dashboard/artikelen/page.tsx` (overzicht + filters)
  - [ ] Admin: `apps/admin/app/dashboard/artikel/nieuw/page.tsx` (nieuw artikel)
  - [ ] Admin: `apps/admin/app/dashboard/artikel/[id]/page.tsx` (bewerken)
  - [ ] API: `apps/admin/app/api/admin/articles/*` (CRUD, upload, schedule)
  - [ ] Club site: `apps/club/app/nieuws/page.tsx` (overzicht met paginatie, filters)
  - [ ] Club site: `apps/club/app/nieuws/[slug]/page.tsx` (detail, SSR/ISR)

- [ ] Rich text editor & media
  - [ ] Editor (Tiptap of TinyMCE) met toolbar (koppen, bold/italic, lists, links, quotes, code, afbeeldingen, video/embed)
  - [ ] Beeld upload naar R2 met presigned PUT; na upload automatische verkleining (1080w, webp) server-side
  - [ ] Media manager: huidige thumbnail tonen, vervangen/verwijderen
  - [ ] Embed whitelist (YouTube/Vimeo) en CSP updates in club `next.config.mjs`

- [ ] Statussen & planning
  - [ ] Draft autosave (debounce) en handmatige “Opslaan”
  - [ ] Publiceer nu (zet `status=PUBLISHED`, `publishedAt=now`)
  - [ ] Inplannen (SCHEDULED) via `publishedAt` + scheduler (cron/edge job) die publiceert
  - [ ] Members-only toggle (`visibility=MEMBERS`), gate in club app (auth check)

- [ ] Admin UI/UX
  - [ ] Lijst: filters (status, visibility), zoeken (titel/slug), sorteren op `publishedAt desc`
  - [ ] Snelle acties: Publish/Unpublish, Schedule, Duplicate, Delete (bevestiging in-site)
  - [ ] Preview (open op club domein, draft preview token)
  - [ ] Validaties: unieke slug, titel verplicht, publishedAt bij PUBLISHED/SCHEDULED
  - [ ] Stijl consistent (navy/coral, Bree/Montserrat, Lucide iconen)

- [ ] Club site rendering
  - [ ] Overzichtspagina: grid met thumbnail, titel, excerpt, datum, badge `Members`
  - [ ] Detailpagina: SEO meta + OG, hero-thumbnail, titel, datum, auteur, body render (sanitized)
  - [ ] Paginatie (±10 p/p), filters (public/members), zoek
  - [ ] Members-only: redirect naar inloggen of 403 bij niet ingelogd
  - [ ] Sitemap en RSS voor public artikelen

- [ ] Beveiliging & performance
  - [ ] Sanitization HTML render (whitelist), server-side validation
  - [ ] Rate limiting op API’s (admin) en auth guard (ADMIN)
  - [ ] ISR/tag revalidate bij publish/unpublish
  - [ ] Afbeeldingen via toegestane domains/CDN

- [ ] DevOps
  - [ ] ENV: R2_* voor uploads; CLUB_BASE URLs; PREVIEW_SECRET voor draft preview
  - [ ] Scheduler (PM2 cron / platform): SCHEDULED → PUBLISHED
  - [ ] Logging/monitoring (Sentry) en optionele audit trail van statuswijzigingen

- [ ] QA
  - [ ] Mobile tests (overzicht/detail), toetsenbordnavigatie, focus zichtbaar
  - [ ] Content smoke tests: lange titels, veel media, embeds, members-only gating
  - [ ] Lighthouse (images webp, lazy, CLS)
