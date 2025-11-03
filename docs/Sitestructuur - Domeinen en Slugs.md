# Sitestructuur — Domeinen, pagina’s, slugs en wireframes

Deze structuur is afgeleid van de ingevulde intake en het conceptdocument. Focus: snel live (MVP) met groeipad erna.

## Overzicht subdomeinen
- **levendportret.nl** — Marketing/voorzijde, uitleg, prijs en aanmelding.
- **club.levendportret.nl** — Overzicht bedrijven (leden), detailpagina’s en ledenbeheer.
- **fund.levendportret.nl** — Fund-actie per bedrijf (1 per bedrijf), doneren (v2 na 15 nov).
- **admin.levendportret.nl** — Beheer, moderatie en (later) rapportages/exports.

## URL- en slugregels
- Slugs in kleine letters, woorden met `-` gescheiden. Voor bedrijven: `bedrijven-naam` (uniek, evt. `-stad` of `-2`).
- Consistente paden per app. Canonical en breadcrumbs instellen op detailpagina’s.
- Auth cookies met `domain=.levendportret.nl` voor SSO tussen subdomeinen.

---

## levendportret.nl (marketing)

### 1) Home
- **Pad**: `/`
- **Doel**: Welkomstpagina, propositie, prijs tonen, doorsturen naar aanmelding/club.
- **Primaire CTA**: “Meld je aan” → `/aanmelden` (formulier) of naar club-login.
- **Secundaire CTA’s**: “Geef een Levend Portret”, “Word lid van de Club”.
- **Wireframe-secties**:
  - Hero: kop “Levend Portret, het eerlijke verhaal”, subheader, hero-beeld (mix van nieuwste clips), CTA’s.
  - Uitleg Coach (belofte, hoe werkt het).
  - Clips teaser (carrousel of grid met laatste 3–6 korte clips, link naar Club).
  - Club: wat is het, voordelen, community-aspect.
  - Cadeau: inhoud pakket, prijsweergave (\€ 2.450 excl. btw), CTA naar aanmelden/contact.
  - Werkwijze (stappen 1–9 uit intake) als horizontale stappenlijn.
  - Footer: privacy, voorwaarden, e-mail contact.
- **SEO/OG**: `Organization`, OG-image (collage), duidelijke meta title/description.

### 2) Over ons (Even voorstellen)
- **Pad**: `/even-voorstellen`
- **Doel**: Missie/visie/verhaal en teamoverzicht.
- **Secties**: verhaal, teamkaarten (coach Bert Kranendonk, coach Henk van Schilt, accountmanager Herma Holtland, filmmaker Barry Annes, filmmaker Frank van Eijk), contactblok.
- **CTA**: “Meld je aan”.

### 3) Communicatie (artikelen)
- **Index**: `/communicatie`
- **Detail**: `/communicatie/[slug]`
- **Doel**: Nieuws/educatie/SEO (MVP: placeholder; later MDX of headless CMS).
- **Template**: cover, intro, body, video-embed (Vimeo), CTA blok.

### 4) Aanmelden / Contact
- **Pad**: `/aanmelden` (contact/aanmeldingsformulier volgens intake)
- **Velden**: naam, e-mail, tel, bedrijf, bericht, toestemmingen.
- **Afhandeling**: MVP = server action / mail; later CRM.

### 5) Juridisch en technisch
- **Privacy**: `/privacy`
- **Voorwaarden**: `/voorwaarden`
- **Sitemap/robots**: `/sitemap.xml`, `/robots.txt`

---

## club.levendportret.nl (bedrijven & accounts)

### 1) Overzicht bedrijven
- **Pad**: `/` (alias `/bedrijven`)
- **Doel**: Vindbaarheid bedrijven, social share van 30s clip, community-gevoel.
- **Wireframe**: grid met kaarten: logo, naam, korte pitch; on click: 30s clip in modal, link naar detail.
- **Filters v2**: sector, locatie; kaartweergave v2 (Leaflet + OSM).

### 2) Bedrijfsdetail
- **Pad**: `/bedrijf/[slug]`
- **Velden**: naam, tagline, beschrijving, sector, locatie, website, socials, clip(s) (Vimeo), gallery (R2), contactopties.
- **Wireframe**:
  - Hero met logo/naam/tagline.
  - Lange clip (5 min) embed (Vimeo) + beschrijving.
  - Bedrijfsinfo en links.
  - Gallery (foto’s via R2), social links.
  - Lidmaatschap-badge (duur lid), optionele fund-teaser.
- **CTA**: “Neem contact op” (website/social), “Bekijk meer clips”.

### 3) Authenticatie en account
- **Login**: `/auth/login`
- **Registratie**: `/auth/register`
- **Wachtwoord vergeten**: `/auth/forgot`
- **Account**: `/mijn/account`
- **Bedrijf beheren**: `/mijn/bedrijf`
- **Moderatie**: publicatie-status zichtbaar (Ingediend/Goedgekeurd/Gepubliceerd).

### 4) Optioneel (v2)
- **Kaart**: `/kaart` met pin op vestigingsplaats.
- **Embeds**: `/embed/clip/[id]` voor deelbare player.

---

## fund.levendportret.nl (funds & doneren — v2 voor betalingen)

### 1) Overzicht funds
- **Pad**: `/` (alias `/funds`)
- **Doel**: Lijst van (optioneel) openbare funds, visueel aangeven “openbaar/privé” (bv. groen randje bij openbaar).
- **Filters/Sortering**: MVP simpel; later sorteren (bijna doelbedrag, trending).

### 2) Fund detail
- **Pad**: `/f/[slug]`
- **Velden**: bedrijf, naam/persoon + foto, verhaal, video (Vimeo), doelbedrag (vast), deadline, voortgang, updates, donor wall (anoniem mogelijk).
- **CTA**: “Doneer nu” (v2 via Mollie), “Deel deze actie”.
- **Transparantie**: fees niet tonen (volgens intake).

### 3) Eigen fund beheren (1 per bedrijf)
- **Aanmaken**: `/aanmaken` (check: maximaal 1 per bedrijf; daarna redirect naar bewerken)
- **Beheer**: `/mijn/fund` (status, public/privé toggle, updates)
- **Donatie-flow (v2)**: detail → bedragkeuze (50/100/250/500/1000/hele bedrag) → Mollie → terug naar `/f/[slug]?status=success` → `/bedankt`.
- **Bewijs per e-mail**: v2 met e-mailtemplate (ook geschikt als cadeaukaartje).

---

## admin.levendportret.nl (beheer & analytics)

### 1) Toegang en rollen
- **Login**: `/login` (e-mail + wachtwoord; 2FA v2)
- **Rollen**: `superadmin`, `editor`, `finance` (minimale set)

### 2) Secties
- **Dashboard**: `/dashboard` met statuskaarten (MVP basic).
- **Gebruikers**: `/gebruikers`
- **Bedrijven**: `/bedrijven` (overzicht, bewerken, eigenaar)
- **Clips**: `/clips` (koppeling aan bedrijf, type long/short)
- **Funds**: `/funds` (beheren, public status)
- **Donaties**: `/donaties` (refund registratie, chargebacks notities)
- **Webinars**: `/webinars` (zoals intake)
- **Moderatie**: `/moderatie` (goedkeuren/afkeuren met notitie)
- **Exports**: `/exports/donateurs` (CSV bij mislukte fundraising)

---

## SEO, OG en structured data (korte richtlijn)
- **levendportret.nl**: `Organization` schema, OG-image per pagina, voor pakket een `Product/Offer` (prijs excl. btw) op Home.
- **club**: `VideoObject` voor clips, `BreadcrumbList` op detail.
- **fund**: `Organization` + `CreativeWork`/`Event`-achtig voor fund; later uitbreiden met `DonateAction` waar passend.

## Componenten en assets
- **Video**: Vimeo-embeds (ID’s opslaan), thumbnails aangeleverd.
- **Foto’s**: Cloudflare R2 (S3-compatibel) met signed URLs.
- **Iconen**: Lucide.

## Navigatie en footer (samenvatting)
- **Hoofdmenu web**: Home, Communicatie, Even voorstellen, Aanmelden.
- **Hoofdmenu club**: Overzicht, Inloggen/Account, (v2) Kaart.
- **Hoofdmenu fund**: Overzicht, (v2) Mijn fund.
- **Footer**: Privacy, Voorwaarden, e-mail contact, socials.

## Redirects & tech
- `www` → apex; `http` → `https`.
- `robots.txt`, `sitemap.xml` per app.
- Canonical URLs op detailpagina’s.

## CTA’s per hoofdpagina (samenvatting)
- **Home**: Meld je aan.
- **Even voorstellen**: Meld je aan.
- **Club overzicht/detail**: Bekijk clip, Neem contact op, Word lid.
- **Fund detail**: Doneer nu (v2), Deel deze actie.
- **Admin**: Publiceer/Afkeuren, Exporteer donateurs.
