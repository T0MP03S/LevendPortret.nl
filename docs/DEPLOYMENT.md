# Levend Portret — Deploy Handleiding (Cloudflare + PM2 + Caddy)

Deze handleiding beschrijft stap-voor-stap hoe je de apps online zet op een VPS achter Cloudflare, met Caddy als reverse proxy (TLS) en PM2 om de Node-processen te beheren. Onderaan staat een korte update-workflow na livegang.

Inbegrepen:
- Cloudflare DNS/SSL (Full strict) en Origin Certificates
- Caddy reverse proxy configuratie
- PM2 procesbeheer
- .env voorbeelden per app
- Build, migratie en update stappen
- Troubleshooting en tips

## 1) Vereisten
- VPS met Debian 12 (Bookworm) of Ubuntu 22.04 LTS
- Domeinen/subdomeinen in Cloudflare (Proxy = aan/oranje wolk)
- Toegang tot SMTP, Postgres (DATABASE_URL), R2 (Cloudflare R2) en (optioneel) Upstash Redis

Origin IP (VPS): 54.37.227.173

## 2) Server voorbereiden (eenmalig)
```
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential

# Node LTS + pnpm
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
corepack enable
corepack prepare pnpm@latest --activate

# PM2
sudo npm i -g pm2

# Caddy (zie officiële docs als dit niet werkt op jouw distro)
# https://caddyserver.com/docs/install
```

Firewall (optioneel maar aanbevolen):
```
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

## 3) Cloudflare instellen
- DNS: maak A-records met Proxy aan (oranje wolk) die naar je VPS IP (54.37.227.173) wijzen voor:
  - levendportret.nl (web)
  - admin.levendportret.nl
  - club.levendportret.nl
  - clips.levendportret.nl

Voorbeeld DNS entries (Cloudflare → DNS):
- Type A  | Naam: @           | Inhoud: 54.37.227.173 | Proxy: Aan
- Type A  | Naam: admin       | Inhoud: 54.37.227.173 | Proxy: Aan
- Type A  | Naam: club        | Inhoud: 54.37.227.173 | Proxy: Aan
- Type A  | Naam: clips       | Inhoud: 54.37.227.173 | Proxy: Aan
- SSL/TLS: zet op Full (strict)
- Origin Certificates (aanrader bij Proxy aan):
  1. Cloudflare Dashboard → SSL/TLS → Origin Server → Create Certificate
  2. Voeg je hosts toe en download PEM + private key
  3. Zet op de VPS bijv. in `/etc/ssl/cf-origin/` en beperk permissies op de key (chmod 600)

Voorbeeld paden:
```
/etc/ssl/cf-origin/levendportret.nl.pem
/etc/ssl/cf-origin/levendportret.nl-key.pem
/etc/ssl/cf-origin/admin.levendportret.nl.pem
/etc/ssl/cf-origin/admin.levendportret.nl-key.pem
... (idem voor club/clips)
```

## 4) Caddy configureren (reverse proxy + TLS)
Open of maak `/etc/caddy/Caddyfile` en voeg het volgende toe (pas domeinen en paden aan):
```
levendportret.nl {
  tls /etc/ssl/cf-origin/levendportret.nl.pem /etc/ssl/cf-origin/levendportret.nl-key.pem
  reverse_proxy 127.0.0.1:3000
}

admin.levendportret.nl {
  tls /etc/ssl/cf-origin/admin.levendportret.nl.pem /etc/ssl/cf-origin/admin.levendportret.nl-key.pem
  reverse_proxy 127.0.0.1:3003
}

club.levendportret.nl {
  tls /etc/ssl/cf-origin/club.levendportret.nl.pem /etc/ssl/cf-origin/club.levendportret.nl-key.pem
  reverse_proxy 127.0.0.1:3001
}

clips.levendportret.nl {
  tls /etc/ssl/cf-origin/clips.levendportret.nl.pem /etc/ssl/cf-origin/clips.levendportret.nl-key.pem
  reverse_proxy 127.0.0.1:3002
}
```
Herlaad Caddy:
```
sudo systemctl reload caddy
```

## 5) Code ophalen
Kies een projectpad, bv. `/srv/levend-portret`:
```
sudo mkdir -p /srv/levend-portret
sudo chown $USER:$USER /srv/levend-portret
cd /srv/levend-portret
git clone <JOUW_REPO_URL> .
```

## 6) .env bestanden per app
Maak per app een `.env` met productievariabelen:
- `apps/web/.env`
- `apps/admin/.env`
- `apps/club/.env`
- `apps/fund/.env`

Voorbeeld (pas aan per app/domein):
```
# Database
DATABASE_URL=postgres://user:pass@host:5432/dbname

# NextAuth
NEXTAUTH_URL=https://levendportret.nl
NEXTAUTH_SECRET=GENERATE_THIS (openssl rand -base64 32)

# SMTP / e-mail
EMAIL_FROM="Levend Portret <no-reply@levendportret.nl>"
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_REPLY_TO=info@levendportret.nl

# R2 (Cloudflare R2)
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_BUCKET=<bucket-name>
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...

# Upstash (optioneel)
UPSTASH_REDIS_REST_URL=https://<region>-<id>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
```
- Voor admin/club/fund: zet `NEXTAUTH_URL` naar hun eigen domein (bijv. https://admin.levendportret.nl).

## 7) Installeren, builden en migreren
```
# In de repo root
pnpm i
pnpm --filter web build
pnpm --filter admin build
pnpm --filter club build
pnpm --filter fund build

# Prisma migraties uitvoeren (in de app waar Prisma is geconfigureerd)
pnpm --filter web prisma migrate deploy
```

## 8) Starten met PM2 (production)
```
pm2 start "pnpm --filter web start" --name web
pm2 start "pnpm --filter admin start" --name admin
pm2 start "pnpm --filter club start" --name club
pm2 start "pnpm --filter fund start" --name fund
pm2 save
pm2 startup   # volg de systemd instructie
```
Controleer:
```
pm2 status
pm2 logs web   # of admin/club/fund
sudo journalctl -u caddy -f   # Caddy logs
```

## 9) Cloudflare performance & security
- SSL/TLS: Full (strict)
- HTTP/2, HTTP/3 en Brotli aan; Rocket Loader uit
- Cache Rules: bypass op
  - `*levendportret.nl/api/*`
  - `*admin.levendportret.nl/*`
- Echte client-IP (voor rate limiting/logging): header `CF-Connecting-IP`
- Eventueel cache purge na release als je caching inzet

## 10) Pre‑launch checklist (afvinken)
- [ ] Security headers via Caddy
  - [ ] Strict-Transport-Security: `max-age=31536000; includeSubDomains; preload`
  - [ ] X-Content-Type-Options: `nosniff`
  - [ ] X-Frame-Options: `DENY`
  - [ ] Referrer-Policy: `strict-origin-when-cross-origin`
  - [ ] Permissions-Policy: `camera=(), microphone=(), geolocation=()`
  - [ ] Content-Security-Policy (basic): `default-src 'self'; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'`
- [ ] Redirects actief: www → apex en http → https (Caddy/Cloudflare)
- [ ] E‑mail deliverability: SPF, DKIM, DMARC op levendportret.nl; test magic link in productie
- [ ] Rate limiting gebruikt persistente store
  - [ ] `UPSTASH_REDIS_REST_URL` en `UPSTASH_REDIS_REST_TOKEN` ingesteld in .env per app
  - [ ] (Optioneel) Auth‑rate‑limits niet alleen in‑memory in productie
- [ ] Publiek endpoint `/api/auth/resend` gehardend
  - [ ] Captcha of strengere throttle
  - [ ] Generieke respons (voorkomt e‑mail‑enumeratie/DoS)
- [ ] Registratie: generieke melding bij bestaand e‑mailadres (voorkom enumeratie)
- [ ] Admin endpoint `is-allowed-email` beschermd of uitgeschakeld in productie
- [ ] Wachtwoordwijziging: bcrypt cost ≥ 12 en desgewenst throttle
- [ ] Uploads (R2 presigned) gehardend
  - [ ] MIME‑whitelist (jpg/png/webp/svg waar toegestaan)
  - [ ] Max bestandsgrootte via Content‑Length bij presign
- [ ] Slugs: nette unieke slugs voor bedrijven/pagina’s
- [ ] SEO/OG: titles/descriptions per pagina, OG‑image(s), sitemap.xml, robots.txt
- [ ] Toegankelijkheid: zichtbare focus, alt‑teksten, headings, kleurcontrast, modal keyboard‑trap
- [ ] Performance: Lighthouse (mobiel/desktop); hero‑blur uit op mobiel; lazy‑loading afbeeldingen
- [ ] Error pages: nette 404/500 (App Router not-found/error)
- [ ] Monitoring: Sentry (of alternatief) geconfigureerd
- [ ] Analytics: cookieloos (Plausible/Umami) of cookie‑banner geregeld
- [ ] ENV’s op productie compleet (per app)
  - [ ] NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL, SMTP (EMAIL_FROM/REPLY_TO/host/port/user/pass)
  - [ ] R2_* voor uploads; (optioneel) IMAGE_DOMAINS indien extern
- [ ] Prisma migraties gedeployed op productie
- [ ] Caching headers voor static assets (via Caddy/Cloudflare)
- [ ] Navigatie/CTA’s controleren (wijzen naar `/aanmelden`); header tap‑targets vergroot (~44px)

---

## Updates na livegang (workflow)
1) Lokaal: commit en push naar je git remote
2) Op VPS:
```
cd /srv/levend-portret
git pull
pnpm i --frozen-lockfile
pnpm -r build
# alleen bij schema-wijziging
pnpm --filter web prisma migrate deploy
pm2 reload all
```
3) Bij aangepaste caching: purge cache in Cloudflare

---

## Troubleshooting
- App start niet: `pm2 logs <name>`
- TLS/HTTPS faalt: check Caddy logs en of Origin Certificates paden/permissions kloppen
- 502/504 via Cloudflare: controleer of de app processen draaien en reverse_proxy juist wijst
- E-mail bezorgt niet: check SMTP envs, logs, SPF/DKIM/DMARC in DNS
- Bestanden (R2) werken niet: check R2 keys/endpoint/bucket en permissies
- Rate limiting achter Cloudflare: gebruik `CF-Connecting-IP` in de server code als IP bron

## Beveiligingstips
- Houd `.env` buiten git (secrets manager of password manager)
- Firewalls: laat 80/443 alleen via Cloudflare IP ranges toe (optioneel)
- Backups: plan database backups (provider of `pg_dump` in cron)

---

## Rollback (eenvoudig)
- Ga naar vorige commit:
```
cd /srv/levend-portret
git checkout <vorige-commit>
pnpm i --frozen-lockfile
pnpm -r build
pm2 reload all
```
- Of maak een git tag voor stabiele releases en checkout die bij issues.

---

## Appendix — Minimale Caddyfile voorbeeld
```
levendportret.nl {
  tls /etc/ssl/cf-origin/levendportret.nl.pem /etc/ssl/cf-origin/levendportret.nl-key.pem
  reverse_proxy 127.0.0.1:3000
}
admin.levendportret.nl {
  tls /etc/ssl/cf-origin/admin.levendportret.nl.pem /etc/ssl/cf-origin/admin.levendportret.nl-key.pem
  reverse_proxy 127.0.0.1:3003
}
club.levendportret.nl {
  tls /etc/ssl/cf-origin/club.levendportret.nl.pem /etc/ssl/cf-origin/club.levendportret.nl-key.pem
  reverse_proxy 127.0.0.1:3001
}
clips.levendportret.nl {
  tls /etc/ssl/cf-origin/clips.levendportret.nl.pem /etc/ssl/cf-origin/clips.levendportret.nl-key.pem
  reverse_proxy 127.0.0.1:3002
}
```

Einde.
