# Fund – Vooraf Vragenlijst

Deze vragenlijst specificeert wat we nodig hebben om de Fund-dashboard en aanmaken/bewerken pagina(’s) in de fund-app te bouwen. Ik heb de bestaande README geanalyseerd en hieronder focussen we op beslissingen die nog gemaakt moeten worden.

## 1) Basis en Toegang
- Wie mag een Fund starten? Alleen `ACTIVE` gebruikers met een eigen bedrijf?
Alleen Active Mensen met Fund membership mogen een fund starten
- Mag een gebruiker met `CLUB/COACH` (betaald) ooit een Fund starten? (Volgens exclusiviteit: nee.)
NEE voor nu nog niet misschien later als er andere plans bij komen.
- Mag er per bedrijf meer dan één Fund tegelijk bestaan? Of precies één (lopende/afgeronde) campagne tegelijk?
Nee 1 fund campagne tegelijk
- Moet Admin Fund-acties kunnen forceren (overriden) in uitzonderingsgevallen?
JA ook moeten funds eerst via het dashboard worden geaccepteerd/ gepublished de admins houden altijd het laatste "woord"

## 2) Start- en Einddatum (3 maanden)
- `startDate` voor FUND wordt ingesteld op de Fund aanmaken/bewerken pagina. 
  - Mag de gebruiker de startdatum kiezen (bijv. vanaf vandaag of een datum in de toekomst)?
  Maak een knop zo snel mogelijk en plannen "later" waar ze een datum kunnen kiezen. als de datum ingesteld is en hij word geaccepteerd gaat hij alsnog pas live op die datum.
  - Na start: mag `startDate` nog aangepast worden?
  alleen door Admins, die kunnen eventueel meer tijd toevoegen, in het admin panel. (funds beheren)
- “3 maanden” exacte definitie:
  - 90 dagen of kalendermaanden (bv. 7 jan → 7 apr)
  Doe maar 90 dagen
  - Tijdstip cutoff (bijv. 23:59:59 lokale tijd)? Welke tijdzone gebruiken we?
  Doe maar 23:59:59 nederlandse tijd
- Wat tonen we als “Resterende tijd”? (dagen/uren, afronding)
  Doe maar dagen

## 3) Doelbedrag & Voortgang
- Doelbedrag is vast € 2.450 excl. btw (zoals README)? Mag dit ooit per bedrijf afwijken?
nee het doelbedrag is vast € 2.450 excl. btw
  - Alleen donaties (v2 met Mollie), of nu een handmatige admin-invoer?
  Alleen Donaties, Maar admins kunnen wel handmatig inleg van het bedrijf zelf toevoegen. dus stel in het begin legt het bedrijf al 1000 euro in dan word dit toegevoegd aan de voortgang van de fund
  - Telt een latere “bijbetaling” mee in de voortgang of is dat een aparte flow?
  nee dit is een keuze aan het einde van het fund proces, dus na de 90 dagen heeft het bedrijf 1 week om te bepalen of hij gaat bij betalen of dat het geld word teruggestort naar de donateurs.
- Willen we aantal donateurs tonen (v2)? Voor nu eventueel placeholder?
ja, ik dacht een lijst met naam en bedrag van de donateurs. voor de donateurs ook een optie om anoniem te blijven.

## 4) Success & Failure Flows
- Succes: bij behalen doel → `FUND` beëindigen en `CLUB` + `COACH` activeren.
  - Gebeurt dit meteen (knop/actie) of automatisch (job) zodra doel >= € 2.450?
  Ja dit mag automatisch zodra het doel behaald is. en alle donateurs krijgen een mail met dat het doel behaald is.
- Niet gehaald binnen 3 maanden:
  - Optie A (bijbetalen) → daarna `CLUB/COACH` activeren en `FUND` beëindigen. het bijbetalen gaat via een factuur, dan word de membership met de hand overgezet en moet de fund worden afgesloten.
  - Optie B (refund) → `FUND` beëindigen; geen `CLUB/COACH`.
  - Optie C verlengen → Weer met 3 maanden verlengen. (dus geen nieuwe fund maar startdatum word vanaf dat moment verlengd)
- Voor nu (v1, zonder betalingen): hoe simuleren/registreren we “bedrag opgehaald” en “bijbetaling/terugstorten”? (Admin invoer? Dummy?)
  - We zullen toch betalingen moeten toevoegen voor v1 want dit is toch wel een heel belangrijke functie van de website.


## 5) UI/UX – Fund Dashboard (fund-app)
- Wat tonen we op het Fund-dashboard (voor ingelogde klant):
  - Status: Actief / Niet actief / Afgerond.
  Ja
  - Voortgangsbalk en resterende tijd.
  Ja
  - CTA: “Fund starten” (als nog niet actief) / “Beheer Fund” (als actief).
  Ja, aanpassingen moeten wel weer via een admin gaan
  - Meldingen als `CLUB/COACH` actief is (Fund niet beschikbaar).
  Ja als het behaald is mag er een mail naar de klant dat het behaald is en dat de fund pagina offline gaat.

- Stijl: volgen we dezelfde branding als admin/web (coral primary, Montserrat)? Eventuele afwijkingen/illustraties?
Ja , Bree font wel ook met montserrat weer dus meer de web pagina volgen minder de admin pagina

## 6) UI/UX – Fund Aanmaken/Bewerken
- Velden:
  - `startDate` (verplicht) – date picker.
  - (Optioneel) Titel, korte pitch/omschrijving, banner/cover-afbeelding, video-URL?
- Mag `startDate` wijzigen zolang Fund nog niet is begonnen? En na start?
Alleen zolang de fund nog niet begonnen is. na de start alleen door een admin of wanneer het fund niet behaald is binnen 3 maanden. klant krijgt een melding een week van te voren om een keuze te maken.
- Bevestigingsmodal bij “Fund starten” en “Fund stoppen/beëindigen” gewenst?
Ja ook weer een in site popup, Wanneer de klant zelf de fund beeindigt er ook bij zetten dat het geld automatisch teruggestort word naar de donateurs.

## 7) API Endpoints (fund-app)
- GET `/api/fund` → haalt huidige Fund-status + company voor ingelogde user op. 
- POST `/api/fund/start` → creëert/activeert FUND met aangeleverde `startDate` (en optionele content).
- POST `/api/fund/stop` → zet FUND op `EXPIRED`.
- Validaties:
  - Alleen `ACTIVE` en `FUND` user. Minder gefocust op ACTIVE Meer op FUND want dan kun je later ook nog fund starten als voor nieuwe plans.
  - Blokkeren als `CLUB/COACH` actief is. Ja
  - Eén FUND per (user, company) tegelijk. Ja

## 8) Toegangscontrole & Middleware
- Fund-app middleware: alleen `ACTIVE` gebruikers met `FUND` membership mogen de beheerpagina’s zien.
- Publieke Fund-pagina (fund/[companySlug]) is publiek zichtbaar. Wat tonen we daar in v1?
De publieke pagina word uiteindelijk fund.levendportret.nl/[bedrijfsnaam].

## 9) Publieke Fund-pagina (fund/[bedrijfsnaam])
- Inhoud v1: titel, pitch/omschrijving, cover, voortgangsbalk, “nu nog X nodig”, deadline datum. en bedrijfsinformatie (naam, logo, locatie Kun je aan of uit zetten).
- Donatieknop (v1 met Mollie).
- Deel-knoppen (social) gewenst?
Ja

## 10) Notificaties & E-mail (later)
- Bij succes (doel gehaald): e-mail naar donateurs + klant. Ja en melding in de Admin panel.
- Bij falen (3 maanden niet gehaald): e-mail met opties A/B/C. 1 Week van te voren al de keuze maken. (Keuze maken in Fund panel)
- Templates/teksten en verzender (later invullen).

## 11) Data Model (nu en later)
- Nu gebruiken we alleen `Membership(FUND)` voor entitlement. ja? 
- Willen we op korte termijn een `FundCampaign` tabel met velden als `title`, `pitch`, `coverUrl`, `targetAmount`, `startDate`, `endDate`, `status`, `raisedCents`, etc.? ja
- Indien later: wat willen we in v1 minimaal opslaan (zodat migratie eenvoudig blijft)? Alles wat we besproken hebben in deze questionnaire.

## 12) Edge-cases
- Gebruiker start Fund zonder company → blokkeren met duidelijke melding. ja mogelijkheid om op de fund aanmaken pagina te komen afschermen
- Fund begint, maar gebruiker wordt REJECTED → alle actieve memberships EXPIRED (reeds ingebouwd). Hoe reflecteert de fund-app dat? als er is gedoneerd word het bedrag teruggestort naar de donateurs en de fund word afgesloten.
- Wisselen van tijdzone/klok (DST) – is EU/tijdzone NL leidend voor deadlines? nee alleen nederlandse tijd aanhouden

## 13) Roadmap & MVP-afbakening
- Wat is het minimale wat we nu moeten opleveren om te kunnen testen?
 - Fund aanmaken en starten op fund.levendportret.nl/dashboard/fund-aanmaken
 - Fund beheren op fund.levendportret.nl/dashboard/fund-beheren
 - Fund stoppen op fund.levendportret.nl/dashboard/fund-beheren
 - Doneren fund.levendportret.nl/[bedrijfsnaam] en dan een doneren popup met de juiste opties (Doneren onder de 50 euro altijd transactie kosten betalen door de donateur)
 - fund overzicht op fund.levendportret.nl/
 - fund pagina op fund.levendportret.nl/[bedrijfsnaam]
 - fund dashboard op fund.levendportret.nl/dashboard
- Welke onderdelen schuiven we expliciet naar v2 (betalingen, e-mails, publiek design, extra content)?
- Eigenlijk geen want dit is toch wel het belangrijkste van de gehele website.
---

Graag jouw antwoorden/voorkeuren per sectie. Met die input bouw ik direct:
- Fund Dashboard (overzicht + CTA’s)
  Fund dashboard de fund aanmaken, beheren, stoppen toevoegen. alleen acces voor FUND membership
- Fund Aanmaken/Bewerken (met `startDate` en basiscontent)
  fund aanmaken en bewerken toevoegen. alleen acces voor FUND membership startdate kan niet worden aangepast door klant
- Fund API routes (GET/POST start/stop)
- Guards en simpele styling conform merk.

---

## Beslissing (voorstel) – Profiel bewerken vóór Fund

- Aanpak: minimale profiel-editor in het Fund dashboard opnemen vóórdat je een Fund kunt starten.
Profiel editor komt niet op de fund pagina maar op de levendportret.nl/instellingen pagina
- Doel: publieke Fund-pagina toont correcte bedrijfsinfo; completeness-check maakt flow robuust.
ja
- Velden (minimaal):
  - Company: naam, logo, plaats, korte beschrijving 250 tekens (met toggles voor weergave: naam/logo/locatie), optioneel adres/website.
  - Persoonlijk: de zelfde opties als tijdens het aanmaken ook wachtwoord door je oude wachtwoord eerst in te vullen en dan je nieuwe wachtwoord in te vullen. Met toggle knop en een wachtwoord bevestiging (behalve als je met google bent ingelogd dan word het niet mogelijk om je persoonlijke gegevens te wijzigen behalve naam en telefoonnummer)
- Guard: Fund starten blokkeren totdat verplichte velden zijn ingevuld; duidelijke CTA “Profiel aanvullen”.
Ja
- Toekomst: volledige settings-pagina in Web-app; deze minimale editor kan later worden uitgefaseerd.

Dus maak de profiel bewerken pagina maar op levendportret.nl/instellingen zodat we dit later kunnen uitbreiden.
Maar voor nu is die instellingen pagina goed. dit mag altijd in de header als je op je naam klikt in de dropdown komen "alleen voor Active members"


