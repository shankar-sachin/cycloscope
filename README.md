<div align="center">
  <img src="assets/logo.png" alt="Banner" width="80%">
  <h1>CycloScope</h1>
</div>

A public, Site-hosted tropical cyclone tracker and private MCP App for ChatGPT. Includes a standalone dashboard, four read-only tools, and an interactive view delivered through `resources/read`.

## Coverage and sources

- Active advisories: NHC/CPHC Atlantic, eastern and central North Pacific via `https://www.nhc.noaa.gov/CurrentStorms.json`.
- Observed active tracks: NHC ATCF BEST decks; forecast track and gusts: official forecast/advisory text. Each supplemental source can fail independently; unavailable data is omitted with a warning.
- Historical archive: 3,266 storms / 87,631 observations, from the NHC HURDAT2 files linked in `src/server.js`, through 2025. Downloaded 2026-10-20. Archive snapshot is bundled, so archived queries do not depend on live upstream availability.
- Coastline: Natural Earth 1:110m land, public domain; simplified precision only, no invented geography.
- NOAA/NHC data is public domain. The exact NOAA sample JSON in `test/nhc-sample.json` is used only to validate source field compatibility.

The archive is a fixed snapshot, not an automatically updating database. It also contains 32 preliminary 2026 NHC ATCF tracks downloaded on 20 October 2026, including Isaias (AL092026). These are explicitly distinguished from finalized HURDAT2 data. Regenerate `data/recent.json` from the official files in `data/recent/` with `node scripts/import-recent.mjs`. Other basins remain outside this version's coverage. NOAA/NHC branding does not imply endorsement.

## Interaction

Search by name, optional year, or ATCF ID. Reused names return candidates. A storm has observed and forecast positions stored separately, issuance timestamps, a pan/zoom map, a timeline, wind/pressure charts, CSV export (always explicit knots in the exported data), and a data table. Archive playback begins at peak wind. No interpolation is presented as an observation. Active dashboards poll every five minutes while visible; the source feed is cached for at most one minute. Advisories over twelve hours old are flagged.

## Chat integration

`POST /mcp` supports `server/discover` (2026-07-28), legacy `initialize`, `ping`, `tools/list`, `tools/call`, `resources/list`, and `resources/read`. The `track_cyclone` tool references `ui://cycloscope/tracker-v3`, a `text/html;profile=mcp-app` resource supporting inline and fullscreen modes. The view uses the official MCP Apps SDK for initialization, tool results, and host tool calls. Satellite images are loaded from the explicitly allowlisted NASA GIBS origin; no remote scripts are used. Host context updates apply theme variables and safe-area insets.

Tools:

- `track_cyclone({query?, year?})`: opens overview, candidates, or selected storm.
- `list_active_cyclones({})`: fetches current official feed; source errors remain errors.
- `search_cyclones({query, year?})`: offline historical search, up to sixty matches.
- `get_satellite_frame({time, lat, lon, product?})`: app-visible dated image metadata, validated against NASA GIBS temporal coverage.

The dashboard is public. Sites separately authenticates the private chat plugin. No external satellite accounts, API keys, write actions, or storage bindings are needed. An unresolved ChatGPT authorization callback failure is separate from standalone public access.

## Development

Requires Node 24+. Build dependencies: official MCP Apps SDK, esbuild, and Geist. The production Worker is self-contained.

```sh
npm run dev
npm test
npm run build
npm run validate
```

`src/app.html` and `src/server.js` are the source. `scripts/build.mjs` embeds coastline and archive data into `worker/index.js`. `scripts/build.sh` packages the generated Worker for Sites. The dev adapter uses the environment's network proxy and system trust store without disabling certificate checks. Production runs the standard Worker fetch implementation.

The generated `worker/index.js` is committed intentionally for reproducible dependency-free deployment. `data/archive.gz.b64` is the compressed, normalized source snapshot. `scripts/prepare-data.py` documents parsing of the two downloaded official datasets; use verified download paths before regenerating it.

## Version 1.0.1

Geist Sans and Geist Mono are embedded locally in the app, including canvas labels. Source font license is in `node_modules/geist/LICENSE.txt` (SIL Open Font License); a copy is retained in `data/Geist-LICENSE.txt`. The chat bridge uses the official MCP Apps SDK rather than a custom RPC transport. Tool resource metadata includes standard nested and legacy flat MCP Apps URI fields; the obsolete OpenAI output-template hint is removed. The old v1 UI URI remains readable for cached clients. Development-only `/__qa/embedded` simulates a host to exercise initialization, tool-result delivery, and proxy tool calls. It is not included in the production Worker.

## Version 1.0.2

Completed MCP 2026-07-28 result envelopes for discovery, resource operations, and tools. Legacy initialize keeps its legacy result shape. Cached v1 and v2 UI URIs remain readable. Diagnostic Worker logs contain only method names and requested resource URI, never tool arguments or user identifiers.

## Version 1.1.0

Public website: https://cycloscope-sachin.starlancer3.chatgpt.site . Individual pages use `/cyclone/<ATCF ID>`, including `/cyclone/AL092026` (Isaias 2026) and `/cyclone/AL132025` (Melissa 2025). The Track map / Satellite archive toggle retains metrics, intensity history, CSV export, and the shared playback timeline. A moving geographic crop follows the selected NHC observation, with a track overlay and selected-position marker.

Satellite source: NASA GIBS EPSG:4326 WMS. Auto selects GOES-East/West ABI Band 13 infrared when retained (10-minute frames, at most 30-minute timestamp difference), otherwise NOAA-20 VIIRS daily true color, then Terra MODIS daily true color. Daily imagery is explicitly labeled as a composite, not an exact-hour observation. Temporal gaps and dates before satellite coverage display unavailable; current imagery is never substituted for historical dates. Forecast fixes have no satellite image. Remote source/image failures show an explicit error. Metadata is cached for one hour. Infrared brightness is not a wind measurement. Imagery acknowledgement: NASA Worldview / GIBS, part of NASA ESDIS, with NOAA observations.
