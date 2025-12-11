# CI beleid (GitHub Actions)

- CI wordt gebruikt om de codebasis te bewaken (install + lint + script-validatie).
- CI bouwt niet. De build en start gebeuren op de VPS onder systemd met `EnvironmentFile`.

## Wat draait CI precies?
- Installeren van dependencies met pnpm (workspace).
- Lint + script-validatie (`pnpm lint`), inclusief de check op dotenv/bcrypt script policy.

## Waarom geen build in CI?
- In productie laden we env-variabelen uitsluitend via systemd `EnvironmentFile` tijdens runtime. Op GitHub zijn die envs niet aanwezig by design.
- Sommige Next.js builds kunnen (indirect) runtime resources verwachten; door niet te bouwen in CI voorkomen we vals-positieve failures.
- We bouwen op de VPS, exact in dezelfde omgeving als runtime.

## Build in CI (optioneel)
- Wil je tijdelijk een build op PRs/branches, zet dan de build-stap terug in `.github/workflows/ci.yml`:
  ```yaml
  - name: Build
    run: pnpm -w build
  ```

Zodra je terug wil naar VPS-only builds, verwijder je die stap weer.
