# Clips Questionnaire

Doel: scherp de scope en UX van Clips (overzicht, detail, admin, klantinstellingen) met concrete beslissingen per onderwerp. Vul per vraag aan of kies een optie.

## 1. Overzichtspagina (Web)
- [Doel] Wat is het primaire doel? (ontdekken/scrollen, snel kijken, doorklik naar bedrijf)
    Video Zien en Doorklik naar bedrijf/ bedrijfs pagina

- [Layout] Grid van tegels met:
  - Verticaal videovoorbeeld (Vimeo) aan de linkerkant
  - Rechts: bedrijfsnaam, korte beschrijving (max 250), klikgebied bedrijfsnaam/tekst
    Ja Precies
    
- [Kaart-interactie]
  - Klik links (video-thumbnail) → open “lightbox” player over de hele pagina (korte clip) ja
  - Klik rechts (bedrijfsnaam/tekst) → ga naar: (A) opgegeven website van bedrijf, of (B) interne bedrijfspagina (door admin aangemaakt) ja
- [Sortering/filters]
  - Default sortering? (recentste clips, alfabetisch, handmatig) Recentste eerst
  - Filters: categorie, regio/stad, tag(s)? Geen
- [Paginatie] Eindeloze scroll of paginering (nummers/vorige-volgende)? paginering nummers/vorige-volgende
- [Toegankelijkheid] Thumbnail alt-tekst (bedrijfsnaam + “clip”), toetsenbordnavigatie, focus states. Wat jou het beste lijkt.

## 2. Lightbox Player (korte video)
- [Gedrag] Fullscreen overlay, sluitknop (Esc), klik buiten sluit?  Ja
- [Autoplay] Autoplay aan/uit, muted by default? Autoplay voor de kleinne video is uit ofcourse dat moet alleen een thumbnail zijn met een play knop en als je er op drukt dan gaat de video afspelen. unmuted en automatisch.
- [Controls] Play/pause, tijdlijn, volume, captions? Play/pause, tijdlijn, volume, geen captions
- [Performance] Lazy load player pas bij open; vooraf poster-image tonen. wat jou het beste lijkt.

## 3. Clip data en assets
- [Bron] Vimeo (video-id’s, poster/thumbnail URL’s) Vimeo
- [Aspect ratio] Verticaal (9:16). Conventies voor uploads en minimale resolutie? we geven gewoon een vimeo link of id denk ik?
- [Validatie] Max lengte korte clip (bijv. 30s), bestands- of ID-validaties?  geen
- [Moderatie] Moet elke clip eerst door admin worden goedgekeurd voordat zichtbaar? de admin vult deze clips in dus de vimeo link of id

## 4. Gedrag bij klik op bedrijfsnaam
- [Als bedrijf website heeft] Direct naar externe site (nieuw tabblad ofzelfde tab?) nieuw tabblad
- [Als geen website] Link naar interne bedrijfspagina (route ontwerp?) ja word dan clips.levendportret.nl/[bedrijfsnaam]
- [Fallback] Wat tonen als interne pagina nog niet gepubliceerd is? (404, “in aanbouw”, aangepast bericht) in aanbouw maar ga ervanuit dat de admin pas publiceert als deze pagina aangemaakt kan worden.

## 5. Interne bedrijfspagina (indien geen website)
- [Eigenaarschap] Alleen admins kunnen publiceren; klant kan inhoud aanleveren via “Webpagina instellingen”. exact. op de pagina dat admin publiceert moet de admin een vimeo link of id geven. de titel en korte beschrijving worden gepakt van de klant zijn company data.
- [Inhoud] Titel, beschrijving(en), logo, adres, kaart, contactknoppen, social links, uitgelichte clip(s)? het word een 1 page website zegmaar met een header en footer en een body. 
er komt een logo (rechts van het logo bedrijfsnaam dit kunnen ze aan of uit zetten via de webpagina instellingen) in de header (uit company informatie) er komt een wat langere over ons bovenin op de pagina komt de langere vimeo video. ze moeten minimaal 3 fotos hebben en maximaal 5 om onderin op de website te laten zien. in de footer komt er wel een text dat het van levend portret is, ze moeten 1 kleur kiezen die ze over de website willen gebruiken voor de accents zegmaar. verder mogen ze kiezen uit een lijst met fonts voor de titel en een lijst met fonts voor de broodtekst. ook mogen ze kiezen of de hoeken worden afgerond of niet. en onder de foto's komt een contact stukje met een google kaart van de locatie en company telefoonnummer, email adress etc. gewoon een algemene contact sectie met wat van de company data zegmaar. Helemaal rechts van de header komen social media iconen hiervoor moeten ze zelf linkjes naar hun social media invullen en als ze zijn ingevuld worden de iconen zichtbaar dus zijn optioneel.

- [SEO] Titel/description, open graph, canonical? ja
- [URL-structuur] /bedrijf/[slug] of /clips/[slug]? nee word clips.levendportret.nl/[bedrijfsnaam]
- [Moderatie/publish] Status: draft → in review → published. Publicatie alleen door admin. die doet dit aan de hand van de webpagina instellingen. van de klant.

## 6. Klantinstellingen: “Webpagina instellingen” (extra tab)
- [Toegankelijkheid] Tab zichtbaar in user dropdown boven Instellingen als klant geen eigen website opgeeft. ja
- [Invoer] Velden: hero-tekst, galerij, CTA-knoppen, social links, openingstijden? ja lees even bij 5. interne bedrijfspagina hierboven
- [Validatie] Max lengtes, URL-validaties, beeldformaten (R2-upload?), volgorde elementen. ja, fotos via r2 upload volgorde elementen staat ook bij 5. interne bedrijfspagina hierboven
- [Preview] Live preview of preview-knop? ja als dat makkelijk is anders lekker weglaten nog.
- [Workflow] “Opslaan als concept” en “Indienen voor review”. ja

## 7. Admin dashboard — Clips beheren
- [Locatie] Admin-app: nieuw menu “Clips”. ja er komt een dashboard/clips pagina hier komen de ingediende webpagina instellingen binnen per bedrijf. of de gebruikers die dus wel een eigen website hebben staan er al in en daar hoeven ze alleen de vimdeo id/ of links in te vullen voor de korte langwerpige video en de lange video. (misschien in 2 verschillende tabjes) dit kunnen ze dan publiceren.
- [Acties] Clip toevoegen (Vimeo ID), bewerken, (de)publiceren, verwijderen. ja zie hierboven 
- [Moderatie] Review-queue voor nieuwe/gewijzigde clips en voor nieuwe “webpagina instellingen” inzendingen. ja ze kunnen dan ook de informatie die de klant heeft ingevuld in de webpagina instellingen goedkeuren en eventueel aanpassen.
- [Koppeling] Clip koppelen aan een bedrijf; meerdere clips per bedrijf? je hebt een korte video en een lange video de korte video komt op de clips overview pagina en de lange video komt op de bedrijfs pagina. (als ze al een website hebben gaan we er vanuit dat deze op hun website komt maar word wel ingevuld door de admin)
- [Status] Draft/In review/Published; history bijhouden? ja
- [Bulk] Bulk publicatie/archivering? nee

## 8. Admin dashboard — Bedrijfspagina’s
- [Aanmaken] Admin kan interne bedrijfspagina aanmaken/activeren wanneer klant geen website heeft. ja
- [Content] Goedkeuren/aanpassen van door klant aangeleverde content. ja
- [Publicatie] Alleen admin kan publiceren; zichtbaarheid toggle. ja
- [Huisstijl] Thema (licht/donker), accentkleur, component-keuzes? ja dit word door de klant zelf ingevuld.

## 9. Beveiliging & rechten
- [Toegang] Alleen ingelogde admins zien admin-secties. Klant ziet alleen eigen “Webpagina instellingen”. ja?
- [Rate limiting] Voor clip-aanlevering en pagina-aanlevering. clips niet dit word alleen door de admin ingevuld pagina aanlevering ja denk ik als dat makkelijk is maar lijkt me dat het niet nodig is het moet wel zo zijn dat als de klant het heeft aangeleverd dat het nog aangepast kan worden tot het word gepubliceerd.
- [Audit log] Wie heeft wat gepubliceerd/gewijzigd en wanneer? ja

## 10. Performance & hosting
- [CDN] Poster/thumbnail via R2 of direct Vimeo? Caching-strategie (stale-while-revalidate)? via vimeo
- [Lighthouse] Doelen voor LCP/CLS; lazy loading, responsive images. ja denk ik?
- [Vimeo] Player parameters (loop, dnt, autopause) en policy. ja

## 11. Analytics & events
- [Tracking] Impressies (kaart/clip), play events, click-out naar externe site, tijd bekeken. ja doe maar voor toekomstige zaken
- [Dashboard] Overzicht statistieken per bedrijf en per clip. ja ook voor toekomstige zaken

## 12. Toegankelijkheid & i18n
- [A11y] Contrast, focus states, aria-labels, captions. ja
- [Taal] NL eerst; later meertaligheid nodig? nee

## 13. Mobile-first ontwerp
- [Grid] 1 kolom mobiel, 2+ desktop. Swipe voor clip switch? ja
- [Player] Volledig scherm op mobiel, easy dismiss. ja

## 14. Test- en acceptatiecriteria
- [UAT] Scenario’s: clip kijken, doorklik naar site, fallback naar interne pagina, admin publicatieflow. ja
- [E2E] Minimale tests: overzicht laad, lightbox werkt, admin kan clip publiceren, klant ziet tab indien geen website. ja

## 15. MVP-scope en vervolgstappen
- [MVP] Overzicht + lightbox + admin publicatie van clips; basis interne pagina; “webpagina instellingen” concept-indiening. ja
- [Vervolg] Filters/zoek, statistiek-dashboard, thematisering bedrijfspagina’s, social share. ja voor toekomstige zaken

---

## Beslissingen (samenvatting op basis van ingevulde antwoorden)

- **Overzichtspagina**
  - Doel: ontdekken/scrollen, snel kijken, doorklik naar bedrijf.
  - Layout: grid met links een 9:16 thumbnail/preview; rechts bedrijfsnaam + korte beschrijving (max 250).
  - Klikgedrag: klik op thumbnail → lightbox met korte video. Klik op bedrijfsnaam/tekst → externe site (indien aanwezig) anders interne pagina.
  - Sortering: recentste eerst. Geen filters. Paginering met vorige/volgende + nummers. Aantallen: desktop 2, mobiel 8.
  - A11y: alt-tekst, toetsenbordnavigatie, focus states (invulling door ons).

- **Lightbox Player (korte video)**
  - Gedrag: fullscreen overlay, sluitknop, Esc en klik-buiten sluit = JA.
  - Autoplay: lightbox opent met poster + play-knop; na klik speelt de korte video automatisch met geluid (unmuted).
  - Controls: play/pause, scrub/tijdlijn, volume. Geen captions.
  - Performance: lazy-load player bij open; poster tonen vooraf (invulling door ons).

- **Clip data**
  - Bron: Vimeo (UI accepteert URL of ID; backend slaat altijd het Vimeo ID op).
  - Aspect ratio: verticaal 9:16.
  - Validatie: geen extra lengte/ID-validaties in MVP.
  - Moderatie: admin voert clip(s) in en publiceert.

- **Klik op bedrijfsnaam**
  - Met website: open in nieuw tabblad.
  - Zonder website: route = `clips.levendportret.nl/[bedrijfsnaam]` (interne pagina).
  - Als er een externe website is opgegeven, komt er voor nu géén interne pagina.
  - Fallback: “in aanbouw” (admin publiceert pas wanneer pagina gereed is).

- **Interne bedrijfspagina**
  - Eigenaarschap: admin publiceert; klant levert content via “Webpagina instellingen”. Alleen voor bedrijven zonder externe website.
  - Inhoud: one-page site met header (logo; bedrijfsnaam optioneel), langere “over ons”, lange Vimeo video bovenin, 3–5 foto’s onderin, footer met “van Levend Portret”.
  - Huisstijl: accentkleur via color picker (HEX vrij), fonts keuze uit ±25 Google Fonts voor titel en body; optioneel afgeronde hoeken. Social iconen in header (alleen tonen als links zijn ingevuld).
  - Contact: sectie met kaart (Google), telefoon, e-mail, adres uit company data.
  - SEO: titel/description, OG, canonical = JA.
  - URL-structuur: `clips.levendportret.nl/[bedrijfsnaam]`.
  - Workflow: draft → in review → published (alleen admin publiceert).

- **Klantinstellingen (“Webpagina instellingen”)**
  - Zichtbaarheid: tab zichtbaar als klant geen eigen website opgeeft.
  - Velden: volgens interne pagina (hero/over-ons, galerij 3–5 foto’s, social links, CTA’s, …).
  - Validatie: URL’s; afbeeldingen via R2-upload; galerij 3–5 items; bestandstypes jpg/png/webp; max 5 MB per foto; volgorde elementen zoals bij 5 beschreven.
  - Preview: indien eenvoudig, anders later.
  - Workflow: klant kan opslaan als concept (alleen zichtbaar voor klant) of “indienen voor review”.

- **Admin dashboard**
  - Clips: nieuw menu. Korte (overzicht) en lange (bedrijfs­pagina) Vimeo link/ID invullen per bedrijf; publiceren/depubliceren; status In review/Published/Archived (geen klant-draft voor clips); geen bulk.
  - Bedrijfspagina’s: aanmaken/activeren bij geen website; content reviewen/aanpassen; zichtbaarheid toggle; thema-keuzes vanuit klant.

- **Security/Performance/Analytics**
  - Toegang: admins zien admin-secties; klant ziet alleen eigen Webpagina-instellingen.
  - Rate limiting: niet nodig voor clips; optioneel voor pagina-aanlevering.
  - Audit log: ja (wie/wat/wanneer).
  - Thumbnails/posters: via Vimeo oEmbed (zonder key) en gecachet; géén opslag in R2 voor posters in MVP.
  - Lighthouse/Player params: toepassen.
  - Analytics: events vastleggen (toekomstbestendig).
  - i18n: NL-only.
  - Mobile: 1 kolom mobiel; 2+ desktop; fullscreen player mobiel.
  - Maps: indien gratis mogelijk Maps API gebruiken; anders eenvoudige embed.


