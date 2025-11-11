# Clips Questionnaire

Doel: scherp de scope en UX van Clips (overzicht, detail, admin, klantinstellingen) met concrete beslissingen per onderwerp. Vul per vraag aan of kies een optie.

## 1. Overzichtspagina (Web)
- [Doel] Wat is het primaire doel? (ontdekken/scrollen, snel kijken, doorklik naar bedrijf)
- [Layout] Grid van tegels met:
  - Verticaal videovoorbeeld (Vimeo) aan de linkerkant
  - Rechts: bedrijfsnaam, korte beschrijving (max 250), klikgebied bedrijfsnaam/tekst
- [Kaart-interactie]
  - Klik links (video-thumbnail) → open “lightbox” player over de hele pagina (korte clip)
  - Klik rechts (bedrijfsnaam/tekst) → ga naar: (A) opgegeven website van bedrijf, of (B) interne bedrijfspagina (door admin aangemaakt)
- [Sortering/filters]
  - Default sortering? (recentste clips, alfabetisch, handmatig)
  - Filters: categorie, regio/stad, tag(s)?
- [Paginatie] Eindeloze scroll of paginering (nummers/vorige-volgende)?
- [Toegankelijkheid] Thumbnail alt-tekst (bedrijfsnaam + “clip”), toetsenbordnavigatie, focus states.

## 2. Lightbox Player (korte video)
- [Gedrag] Fullscreen overlay, sluitknop (Esc), klik buiten sluit?
- [Autoplay] Autoplay aan/uit, muted by default?
- [Controls] Play/pause, tijdlijn, volume, captions?
- [Performance] Lazy load player pas bij open; vooraf poster-image tonen.

## 3. Clip data en assets
- [Bron] Vimeo (video-id’s, poster/thumbnail URL’s)
- [Aspect ratio] Verticaal (9:16). Conventies voor uploads en minimale resolutie?
- [Validatie] Max lengte korte clip (bijv. 30s), bestands- of ID-validaties? 
- [Moderatie] Moet elke clip eerst door admin worden goedgekeurd voordat zichtbaar?

## 4. Gedrag bij klik op bedrijfsnaam
- [Als bedrijf website heeft] Direct naar externe site (nieuw tabblad ofzelfde tab?)
- [Als geen website] Link naar interne bedrijfspagina (route ontwerp?)
- [Fallback] Wat tonen als interne pagina nog niet gepubliceerd is? (404, “in aanbouw”, aangepast bericht)

## 5. Interne bedrijfspagina (indien geen website)
- [Eigenaarschap] Alleen admins kunnen publiceren; klant kan inhoud aanleveren via “Webpagina instellingen”.
- [Inhoud] Titel, beschrijving(en), logo, adres, kaart, contactknoppen, social links, uitgelichte clip(s)?
- [SEO] Titel/description, open graph, canonical?
- [URL-structuur] /bedrijf/[slug] of /clips/[slug]?
- [Moderatie/publish] Status: draft → in review → published. Publicatie alleen door admin.

## 6. Klantinstellingen: “Webpagina instellingen” (extra tab)
- [Toegankelijkheid] Tab zichtbaar in user dropdown boven Instellingen als klant geen eigen website opgeeft.
- [Invoer] Velden: hero-tekst, galerij, CTA-knoppen, social links, openingstijden?
- [Validatie] Max lengtes, URL-validaties, beeldformaten (R2-upload?), volgorde elementen.
- [Preview] Live preview of preview-knop?
- [Workflow] “Opslaan als concept” en “Indienen voor review”.

## 7. Admin dashboard — Clips beheren
- [Locatie] Admin-app: nieuw menu “Clips”.
- [Acties] Clip toevoegen (Vimeo ID), bewerken, (de)publiceren, verwijderen.
- [Moderatie] Review-queue voor nieuwe/gewijzigde clips en voor nieuwe “webpagina instellingen” inzendingen.
- [Koppeling] Clip koppelen aan een bedrijf; meerdere clips per bedrijf?
- [Status] Draft/In review/Published; history bijhouden?
- [Bulk] Bulk publicatie/archivering?

## 8. Admin dashboard — Bedrijfspagina’s
- [Aanmaken] Admin kan interne bedrijfspagina aanmaken/activeren wanneer klant geen website heeft.
- [Content] Goedkeuren/aanpassen van door klant aangeleverde content.
- [Publicatie] Alleen admin kan publiceren; zichtbaarheid toggle.
- [Huisstijl] Thema (licht/donker), accentkleur, component-keuzes?

## 9. Beveiliging & rechten
- [Toegang] Alleen ingelogde admins zien admin-secties. Klant ziet alleen eigen “Webpagina instellingen”.
- [Rate limiting] Voor clip-aanlevering en pagina-aanlevering.
- [Audit log] Wie heeft wat gepubliceerd/gewijzigd en wanneer?

## 10. Performance & hosting
- [CDN] Poster/thumbnail via R2 of direct Vimeo? Caching-strategie (stale-while-revalidate)?
- [Lighthouse] Doelen voor LCP/CLS; lazy loading, responsive images.
- [Vimeo] Player parameters (loop, dnt, autopause) en policy.

## 11. Analytics & events
- [Tracking] Impressies (kaart/clip), play events, click-out naar externe site, tijd bekeken.
- [Dashboard] Overzicht statistieken per bedrijf en per clip.

## 12. Toegankelijkheid & i18n
- [A11y] Contrast, focus states, aria-labels, captions.
- [Taal] NL eerst; later meertaligheid nodig?

## 13. Mobile-first ontwerp
- [Grid] 1 kolom mobiel, 2+ desktop. Swipe voor clip switch?
- [Player] Volledig scherm op mobiel, easy dismiss.

## 14. Test- en acceptatiecriteria
- [UAT] Scenario’s: clip kijken, doorklik naar site, fallback naar interne pagina, admin publicatieflow.
- [E2E] Minimale tests: overzicht laad, lightbox werkt, admin kan clip publiceren, klant ziet tab indien geen website.

## 15. MVP-scope en vervolgstappen
- [MVP] Overzicht + lightbox + admin publicatie van clips; basis interne pagina; “webpagina instellingen” concept-indiening.
- [Vervolg] Filters/zoek, statistiek-dashboard, thematisering bedrijfspagina’s, social share.
