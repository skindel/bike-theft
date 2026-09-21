# BikeWatch

A small, runnable frontend MVP for a Maastricht bike-safety hackathon. The point of this starter is to agree on the user experience and code structure before four teammates build independently.

## Run it

Use Node.js 22 LTS or newer (validated here with Node 24) and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No account, API key, or `.env` file is required. The geographic basemap requires internet access and WebGL; the parking list works even when the map cannot load.

## Try the demo

1. On **Explore map**, search “station”, select a parking result, try “Covered only”, and toggle the illustrative activity zones.
2. On **Report a theft**, enter sample bike/location details and past dates. Prepare the report, download its text summary, and delete it when finished.
3. On **Community**, filter local tips/meetups, create a sample post, and delete your own post.
4. Navigate between pages: reports and posts survive client navigation. Refresh: they disappear. There is deliberately no localStorage or server persistence of personal information.

The map is real geography, but the zone boundaries, incident counts, parking coordinates/attributes, and community content are illustrative. Nothing is a live safety assessment. The report summary is not a police submission. Use sample personal data.

## Read the code in this order

```text
src/
  app/
    layout.tsx               Root: shared shell + session demo provider
    globals.css              Design tokens and responsive styles
    page.tsx                 Redirect to /map
    map/page.tsx             Thin route -> MapExplorer
    reports/page.tsx         Thin route -> ReportWorkspace
    community/page.tsx       Thin route -> CommunityFeed
  components/
    layout/app-shell.tsx     Sidebar, mobile navigation, page frame
    ui/button.tsx            Shared shadcn-compatible button primitive
  contracts/index.ts         Shared TypeScript types and Zod input schemas
  lib/
    demo-provider.tsx        In-memory demo operations shared across routes
    utils.ts                 Class-name helper
  features/
    map/                     Map UI, MapLibre lifecycle, fixtures, risk logic
    reports/                 Form, validation tests, summary download
    community/               Feed, compose form, example posts
```

A route file selects the feature. The feature renders the UI. Shared contracts describe the data. The provider handles session state. Only the interactive parts use `use client`. The map is dynamically imported to avoid running WebGL during server rendering.

No backend is implied by this demo. There are no generated database types or fake Supabase migrations to mistake for a working integration.

## The frontend style

The global tokens in `src/app/globals.css` are the source of truth:

| Token          | Value     | Use                           |
| -------------- | --------- | ----------------------------- |
| `--background` | `#f8f9f6` | Warm neutral page background  |
| `--foreground` | `#19352f` | Dark green text               |
| `--sidebar`    | `#143c32` | Dark teal navigation          |
| `--primary`    | `#ed7749` | Orange primary actions        |
| `--border`     | `#e4e9e3` | Subtle card and input borders |

Use the shared `Button`, `.panel`, `.page-heading`, `.eyebrow`, and form styles before introducing new variants. Headings are compact, cards have restrained rounded corners, and illustrations use simple icons. Tailwind is available for local layout work; central tokens and component styles live in CSS. `components.json` supports adding shadcn components later. No external font service is needed.

Responsive navigation becomes a three-tab header on phones. The parking list is also the non-map alternative. Respect visible keyboard focus and reduced-motion preferences.

## Divide the next work

First explore the demo together and agree on anything you want to change. Then assign names to the A/B/C/D roles in AGENTS.md.

| Role             | First task                                                    | Definition of a useful first PR                                                                            |
| ---------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| A: platform/data | Add Supabase schema, auth, RLS, and environment configuration | Sign in; save/read one owner-only report; prove a second user cannot read it                               |
| B: map/risk      | Replace map fixtures with verified sources                    | Document source period and resolution; display trustworthy zone/parking records without invented precision |
| C: reports       | Expand the report flow on top of A's authenticated contract   | Add map pin, lock/value/evidence details and private uploads; handle server errors without losing input    |
| D: community     | Connect the feed to A's schema/auth                           | Paginated posts and meetups with author-only edits/deletes and moderation controls                         |

Use separate clones/worktrees and feature branches. A owns shared contracts, root configuration, migrations and dependency changes. B/C/D own their feature directories. Features should not import one another. The demo provider currently imports community fixtures only to seed the shared session; replace it when real adapters arrive. See AGENTS.md for the full collaboration rules.

### Supabase integration seam

`saveReport`, `deleteReport`, `addPost`, and `deletePost` in `src/lib/demo-provider.tsx` are intentionally simple examples of the operations the UI needs. They are synchronous, session-only functions. The live implementation must become asynchronous, validate on the server with the shared schemas, verify identity, use owner-scoped RLS and private Storage, and add loading/error states. Do not simply persist the entire demo store or treat a browser user ID as authentication.

The report timestamps are currently local wall-clock input for a text summary. In the live contract, explicitly convert Europe/Amsterdam dates (including DST) to UTC. The location is free text in this starter; validate/map it before using it for aggregates. Aggregate consent is only a recorded preference and does not affect demo zones.

Copy `.env.example` to `.env.local` when configuring services. The Supabase variables are reserved placeholders and are **not consumed yet**. Never put a service-role secret in a `NEXT_PUBLIC_` variable.

## Checks

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

The unit tests cover the illustrative risk thresholds, coordinates and report validation. Browser tests cover map search, report creation/download/deletion, navigation state, community filtering/posts and mobile overflow. They don't assert the availability of a third-party basemap or any production authorization behavior.

Optional: `npm run format` formats the repo; `npm run format:check` verifies formatting.

## Vercel handoff

Import this repository as a Next.js project, use the repository root (`bike-theft` if importing its parent directory), and retain the default `npm run build` command. This demo does not require environment variables. No deployment has been created by this scaffold. For the next phase, give preview deployments a separate Supabase development project, never production credentials.

## Basemap and data references

The default style is [OpenFreeMap Positron](https://openfreemap.org/quick_start/), with MapLibre attribution preserved. You can override `NEXT_PUBLIC_MAP_STYLE_URL` with another MapLibre-compatible style URL. OpenFreeMap has no API-key requirement and no availability SLA; the UI keeps a usable parking list when tiles fail. See its [usage and attribution information](https://openfreemap.org/).

Before replacing fixtures, inspect [police open data](https://www.politie.nl/informatie/compleet-dashboard-misdrijven-data.politie.nl.html), [municipal bike parking information](https://www.gemeentemaastricht.nl/parkeren-en-verkeer/fiets-parkeren), and the methodology notes in `src/features/map/RISK_METHOD.md`.

## Deliberately unfinished

Supabase connection and authentication, real theft imports, verified parking attributes, file uploads, location picking, report editing, persistent/public community posting, structured meetup dates/RSVPs, Dutch translation, value-aware guidance, PDF formatting, and police integration. The basic form and text download demonstrate the direction without pretending those services exist.
