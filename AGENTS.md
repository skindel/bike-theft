# BikeWatch — team and coding-agent guide

## Purpose and scope

BikeWatch helps Maastricht residents, students, and visitors choose bike parking, document theft, and connect with local cyclists. This file applies to the entire repository and to all four teammates and their coding assistants.

Team preference: React and TypeScript. Names and hackathon duration are not yet set; use the four roles below until names are assigned. This is an implementation plan, not a claim that the app or integrations already exist.

## Starter status (built before assigning roles)

The user requested a shared frontend MVP before splitting tasks. That request authorizes this initial scaffold across all feature paths. Future feature work follows the ownership rules below once roles are assigned.

The repository now has a runnable Next.js demo with `/map`, `/reports`, and `/community`, shared design tokens and a shadcn-compatible Button. The map uses MapLibre with OpenFreeMap; zones and parking records are illustrative. Reports and community posts live only in the root in-memory DemoProvider and disappear on refresh. There is no authentication, Supabase connection, upload handling, official dataset import, or police submission yet. Public posting and server persistence requirements below are targets for the next phase, not features to claim as complete. See README.md for setup, a code tour, and each role's first task.

The starter deliberately uses client-side demo validation only. Before enabling server writes, add server-side validation, identity checks, RLS, and abuse controls. Adding Supabase environment variables alone does not enable persistence. The demo provider is the temporary composition point for feature fixtures, not a production database abstraction.

## Architecture decisions

Build one Next.js application, deployed on Vercel, backed by Supabase. Avoid a separate backend service for the hackathon.

| Layer           | Choice                                                                   | Reason                                                                                              |
| --------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Application     | Next.js App Router, React, strict TypeScript                             | One frontend/server project and straightforward Vercel deployment                                   |
| UI              | Tailwind CSS and shadcn/ui                                               | Fast, consistent, accessible components                                                             |
| Mapping         | MapLibre GL JS, loaded in a client component                             | GeoJSON zones, heat layers, parking markers, and interactive map controls                           |
| Basemap         | Configurable hosted style/tile provider using OpenStreetMap-derived data | Keep provider choice independent of map logic; verify usage terms and attribution before deployment |
| Database        | Supabase PostgreSQL with PostGIS                                         | Spatial queries and shared persistent data                                                          |
| Authentication  | Supabase Auth, email sign-in                                             | Shared identity for reports and community; public map needs no login                                |
| Uploads         | Supabase Storage, private report bucket                                  | Owner-controlled bike photos and evidence                                                           |
| Validation      | Zod; React Hook Form for the report form                                 | Shared validation and usable multi-field forms                                                      |
| Data access     | Supabase JS and SQL migrations; generated database types                 | Avoid adding an ORM alongside PostGIS for this MVP                                                  |
| Checks          | ESLint, TypeScript, Vitest, a small Playwright smoke suite               | Cover risk logic, permissions, and critical user journeys                                           |
| Package manager | npm with one committed package-lock.json                                 | Simple shared setup                                                                                 |

Use current stable compatible package versions when scaffolding and commit exact resolved versions in the lockfile. Do not independently upgrade dependencies in feature branches.

Browser → Next.js UI → server actions/route handlers for validated writes and sensitive reads → Supabase. Public map data comes from a deliberately limited aggregate API. Server components are the default; map rendering, forms, and browser interactions are client components. Use cookie-aware Supabase server clients, verify identity on the server, and retain RLS as the authorization boundary. Privileged keys must never reach browser code.

## Delivery order

1. Platform owner scaffolds the app, navigation, authentication, contracts, migrations, and a Vercel preview. All feature owners then develop against agreed fixtures.
2. Deliver the core journey: open Maastricht map → inspect a zone → find nearby parking → submit a private theft report → see a confirmation and downloadable/printable summary.
3. Add a simple community feed with posts and bike-meet announcements.
4. Add bike-value-aware parking guidance after the map and data limitations are clear.
5. Stretch only: comments, RSVPs, richer moderation, dedicated PDF generation, automated data refresh, and any official police integration.

Prefer a working mobile demo over extra features. Use visibly labeled synthetic fixtures if a source is unavailable; never present demo incidents as real thefts.

## Four-person ownership

All paths below are relative to this repository root. Each owner implements their feature UI and server handlers within their allocated directories.

| Teammate                 | Owns                                                             | Exclusive paths                                                                                                                                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A — Platform & data lead | Scaffold, auth, schema/RLS, imports, deployment, integration     | `supabase/**`, `scripts/**`, `src/lib/**`, `src/contracts/**`, `src/components/ui/**`, `src/components/layout/**`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/auth/**`, root configuration and dependency files, `.github/**` |
| B — Map & risk           | Maastricht map, zones, parking, risk methodology, value guidance | `src/features/map/**`, `src/app/map/**`, `src/app/api/map/**`                                                                                                                                                                                                |
| C — Theft reporting      | Report form, private report detail, uploads, report summary      | `src/features/reports/**`, `src/app/reports/**`, `src/app/api/reports/**`                                                                                                                                                                                    |
| D — Community            | Feed, post creation, bike meets, content controls                | `src/features/community/**`, `src/app/community/**`, `src/app/api/community/**`                                                                                                                                                                              |

Colocate feature tests and fixtures with the owning feature. A owns shared test configuration and cross-feature smoke tests. A maintains this file and shared docs; feature owners maintain documentation inside their feature folder. New shared paths must be assigned before use.

### Rules that prevent collisions

- Each person uses a separate clone or Git worktree and a branch named `feat/<role>-<task>`. Never run multiple developers or agents on different branches inside the same working directory.
- Before starting, announce the task, owned paths, and required contract changes in the team channel or issue. One active editor per file. Coding assistants should report coordination needs to their user, not message teammates without authorization.
- Stay within your assigned paths. If another area needs a change, describe the required interface/change to its owner. Agree a temporary ownership handoff before editing it.
- Only A edits `package.json`, `package-lock.json`, shared UI, global styles, root layout, environment setup, migrations, or generated database types. Feature owners request dependencies in a batch.
- Freeze initial contracts together before feature implementation. A merges additive contract changes first; consumers then update. Do not silently change field names or API responses.
- No direct pushes to `main`. Open small PRs into `main`, request one teammate review, and have A coordinate merges after checks. Protect `main` if repository settings permit it.
- Integrate at milestones throughout the hackathon. Sync with `main` before opening a PR; resolve conflicts with the affected owner. Do not force-push shared branches or discard another person's work.
- Apply schema changes through committed, uniquely timestamped migrations. Never rewrite an applied migration or make undocumented dashboard schema changes. A applies migrations once in merge order.
- Use a separate development database from the final demo/production database. Vercel preview deployments must use development credentials. Do not let arbitrary previews mutate production data.
- A PR handoff states: behavior changed, routes/files touched, contract/migration/dependency changes, checks run, and any missing configuration.

## Shared contracts and database boundaries

A creates `src/contracts/index.ts` with Zod schemas and inferred types, then `src/lib/database.types.ts` from the actual schema. Features import contracts rather than importing each other's internals. Keep mock and live adapters interchangeable.

Conventions: UUID identifiers; ISO 8601 UTC timestamps; display times in `Europe/Amsterdam`; money as integer euro cents; GeoJSON coordinates in `[longitude, latitude]` order, WGS84/EPSG:4326. Keep query bounds and pagination bounded. API errors use `{ error: { code, message, fieldErrors? } }`; no raw database errors in the UI.

Initial models to agree before migration:

- `profiles`: user ID and public display name; never expose auth emails.
- `theft_reports`: owner ID, theft time range, precise private location, bike details, narrative, optional value and private attachment paths, separate aggregate-sharing consent, server-controlled moderation status, timestamps.
- `theft_statistics`: source ID, geographic area ID, reporting period, count, source URL, retrieval date, and geographic resolution. Aggregate official statistics are not individual incident rows.
- `risk_zones`: area ID, GeoJSON geometry, official count, separately labeled eligible self-report count, period, activity band (`low | medium | high | unknown`), method version, and source metadata. This may be a computed result rather than a stored table.
- `parking_locations`: name, point, address, indoor/covered/enclosed/guarded/access-controlled attributes, opening hours, fee notes, source URL, and last verified date. Distinguish unknown from false.
- `community_posts`: author, kind (`post | meetup`), title, body, optional public meeting location/start time, server-controlled visibility/moderation fields, timestamps.

Planned interfaces:

- `GET /api/map/zones?bbox=...`: GeoJSON FeatureCollection of approved public zone aggregates and methodology metadata.
- `GET /api/map/parking?bbox=...`: parking features and source/verification metadata.
- Report creation/detail/export: authenticated, validated, owner-scoped; never serve a public report listing with private details.
- Community read: paginated published posts; create/update/delete require an authenticated author or an explicitly authorized moderator.

The first integration milestone is a schema/type agreement and working fixtures, not every endpoint implemented.

## Map, theft data, and honest risk communication

- Begin with the official police data portal and Maastricht municipal parking information. Confirm dataset availability, geographic resolution, period, license, and update cadence before promising a live feed or street-level coverage.
- Use source polygons at their actual resolution. Never invent exact theft coordinates from neighborhood totals or interpolate them into a falsely precise street heatmap.
- MVP red/yellow/green means higher/medium/lower **recorded theft activity**, not a calibrated probability of theft or a guarantee of safety. Gray means missing or insufficient data. Show a text legend and source period; color alone is insufficient.
- B documents reproducible thresholds in `src/features/map/RISK_METHOD.md` before implementing the bands. Compare like periods and geographic units; explain exposure/reporting biases. Zero recorded incidents is not proof of safety.
- Keep official counts and user reports distinguishable. Do not blindly add them: the same theft may appear in both. Private reports affect public aggregates only after opt-in and the agreed eligibility/moderation rules, with suppression of small counts where they could reveal individuals.
- Do not let raw unreviewed submissions immediately alter public zones. Validate locations and dates, rate-limit writes, and flag potential duplicates without silently deleting legitimate reports.
- Do not claim guarded, covered, enclosed, and access-controlled parking are equivalent. Show verified attributes, opening-hour limitations, and source links. Do not invent live availability.
- For bike-value guidance, accept an optional value or value band and recommend parking based on value, recorded activity, distance, and verified parking attributes. Keep value local unless the user chooses to save it. Explain the rule. Do not show a monetary expected loss or a “risk/value ratio” as scientific fact without a calibrated probability and time horizon. A labeled heuristic is enough for the hackathon.

## Theft report experience

Use these as a useful preparation checklist, not a claim that every police requirement is covered:

- Theft location and map pin; when last seen and when discovered missing.
- Bike brand, model/type, color, frame/serial number if known, distinctive marks, optional estimated value, purchase details/proof, and photos.
- Lock details, circumstances, and optional witness/evidence notes. Explicitly allow “unknown” for details the user may not have.
- Validate time ordering, field lengths, positive optional value, supported uploads, and Maastricht-area map selection with a clear out-of-area message.
- Clearly distinguish saving a BikeWatch report from filing an official police report. Ask separately before using a report in public aggregates.
- Provide an owner-only printable/downloadable summary and a link to the official police reporting instructions. The user reviews the summary and submits through the official channel.
- Automatic police submission is out of MVP scope unless an authorized supported integration is verified. Never collect DigiD credentials or claim that generating a summary files an official report.

## Security, privacy, and community behavior

- Enable RLS on every exposed application table. Test anonymous, owner, and other-user access. Owners alone read/change their private reports; public readers see only explicit aggregates and published content.
- RLS row ownership is insufficient for moderation fields: prevent users from assigning approved/published moderation states or moderator roles through column privileges, constrained server writes, or database enforcement.
- Keep photos/evidence in private Storage with owner-scoped policies and short-lived signed URLs. Validate upload type and size. Strip location metadata before any future public photo publishing.
- Collect only data needed for the feature. No public names/contact information, exact theft coordinates, serial numbers, evidence, or witnesses from private reports. Provide a way to delete a user's own report and associated uploads.
- Validate writes on the server, check auth on every sensitive operation, and apply persistent rate limits to submission endpoints. Do not render user-provided HTML directly.
- Community users can edit/delete their own posts. Provide a basic flag/hide workflow before opening posting to the public; do not allow accusations identifying alleged thieves or publication of private report data.
- Commit `.env.example` with placeholders only. A documents `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the chosen map style setting. Add server secrets only if a concrete server task requires them. Never expose service-role/secret keys using `NEXT_PUBLIC_`.

## UX and definition of done

Mobile first. Public map and parking are available without login; posting and saved reports require login. Use clear English initially and keep text easy to translate into Dutch. Ask for location access only when the user taps “locate me”; retain manual navigation and location entry.

Every feature needs useful loading, empty, validation-error, and service-unavailable states. Forms need labels and keyboard support. Provide an accessible list alternative to essential parking/map information. Preserve user input after recoverable failures.

A defines these scripts during scaffolding: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build`. Until the app exists, do not claim these commands have run.

Before merging:

- Run lint, typecheck, relevant tests, and production build using the committed lockfile.
- Test meaningful risk cases: no data, band thresholds, period mismatch, and coordinate ordering.
- For data changes, verify RLS/Storage ownership and that anonymous/public responses exclude private fields.
- Smoke-test the touched journey on a small mobile viewport. Core acceptance: map loads, parking opens, report saves privately, summary is accessible only to its owner, and a signed-in user can create a community post.
- Confirm migrations, environment requirements, data provenance, and demo limitations are documented. No fake statistics or invented successful integrations.

## Reference starting points

These references inform the architecture; a working dataset import and police integration have not been verified.

- Next.js App Router: https://nextjs.org/docs/app
- Supabase PostGIS: https://supabase.com/docs/guides/database/extensions/postgis
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/
- Police data introduction: https://www.politie.nl/informatie/compleet-dashboard-misdrijven-data.politie.nl.html
- Maastricht bike parking: https://www.gemeentemaastricht.nl/parkeren-en-verkeer/fiets-parkeren
- Official bicycle theft reporting guidance: https://www.politie.nl/informatie/fiets-gestolen-doe-aangifte.html

## Decisions still open

Assign names to A/B/C/D; confirm hackathon deadline; select and inspect the theft dataset; choose the basemap provider; agree risk thresholds and aggregate suppression; verify parking records; and decide whether Dutch translation fits the deadline. Until then, follow the defaults above and label unverified assumptions.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
