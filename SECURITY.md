# CycloScope Security Policy

## Report concerns through GitHub Discussions

Use [CycloScope's GitHub Discussions](https://github.com/shankar-sachin/cycloscope/discussions) to contact the maintainer about a security concern.

Start a discussion titled `Security: <short description>`. Describe the affected component and potential impact at a high level. Discussions are public: omit credentials, session cookies, personal information, and exploit details that could put a live deployment at risk. If reproduction requires sensitive material, say that in the discussion and ask the maintainer to arrange a private way to receive it.

Do not open a pull request to report or fix a vulnerability. The [contribution policy](CONTRIBUTING.md) applies to security fixes as well.

## What this repository contains

CycloScope serves a standalone tropical cyclone dashboard and an embedded MCP App from a self-contained JavaScript Worker.

| Component | Role |
| --- | --- |
| `src/server.js` | HTTP routing, NHC data fetching and parsing, archive lookup, and MCP requests |
| `src/satellite.js` | NASA GIBS temporal coverage checks and geographically targeted satellite image URLs |
| `src/app.html` | Browser UI, map and chart rendering, CSV export, and the MCP Apps SDK connection |
| `scripts/build.mjs` | Bundles the UI, local fonts, geographic data, and cyclone snapshots |
| `worker/index.js` | Generated deployment artifact, intentionally committed |
| `data/` | Historical HURDAT2 snapshot, preliminary ATCF records, coastline data, and font license |

Public HTTP routes include `/api/lookup`, `/api/satellite`, and `/health`; the MCP transport is `POST /mcp`. Individual cyclone pages use `/cyclone/<ATCF ID>`.

The MCP tools are `track_cyclone`, `list_active_cyclones`, `search_cyclones`, and `get_satellite_frame`. They retrieve or expose data; they are not account-management or repository-write tools.

The application does not require user-supplied NOAA/NASA API keys and does not implement its own user-account system. Authentication and access rules applied by a hosting platform are separate from this Worker. In particular, do not assume that a standalone deployment inherits the original Sites deployment's ChatGPT authentication.

## Security issues to report

Reports are especially useful when they demonstrate:

- **Untrusted content executing in the UI:** for example, source data, advisory text, search input, or tool output causing script execution or unsafe navigation.
- **Unexpected outbound requests:** a way to make the Worker fetch an attacker-selected destination outside the intended NHC and NASA data flows.
- **MCP boundary failures:** a request or embedded-app interaction that exposes protected information, performs an unexpected action, or defeats access controls actually configured on an affected deployment.
- **Sensitive information exposure:** credentials, session material, private deployment configuration, or user information appearing in responses, logs, generated bundles, or committed files.
- **Practical service disruption:** a reproducible input that causes excessive processing, repeated expensive upstream requests, or failures beyond an ordinary rejected request.
- **Compromised data or build output:** unauthorized changes to source records, dependencies, or the generated Worker that could alter what visitors receive.

These are reporting areas, not claims that the implementation has been audited or that every deployment provides the same protections.

## What to include

Provide enough detail to identify the failure without publishing sensitive reproduction material:

1. The affected deployment or local environment and the commit or version, if known.
2. The route, MCP tool, source file, or build step involved.
3. Preconditions, such as whether the problem requires a crafted upstream response, a local modification, or an authenticated hosting session.
4. The observed result and the concrete security impact.
5. Whether you reproduced it locally or against a system you control.

For a data-related report, also provide the cyclone's ATCF ID, the UTC timestamp, and the official source used for comparison. Redact request headers and screenshots before posting.

Use a local checkout or a deployment you control for reproduction. Do not run disruptive scans, load tests, credential attacks, or attempts to access other people's information against public CycloScope deployments.

## Data problems and upstream services

Ordinary track discrepancies, missing advisories, satellite archive gaps, stale data, and third-party outages belong in a regular Discussion. Include the affected source and time so the maintainer can distinguish an upstream limitation from a CycloScope defect.

Deliberate tampering, an injection path, or a reproducible way to misrepresent attacker-controlled content as trusted data may have a security impact and should be described accordingly.

CycloScope displays NHC/CPHC information and NOAA/NASA imagery. Vulnerabilities in those providers, GitHub, Cloudflare, or ChatGPT itself should be reported to the organization responsible for the affected service. Report an integration defect in CycloScope here.

CycloScope is not an emergency alerting service. Use official advisories and local warnings for protective decisions.

## Maintenance and fixes

Security maintenance targets the current `main` branch. Older snapshots and independently maintained forks have no separate backport commitment.

The maintainer evaluates reports, determines whether a fix is needed, and controls publication. There is no guaranteed response time, remediation deadline, or paid bounty under this policy.

A fix affecting `src/` or bundled data must be reflected in the generated `worker/index.js` before release. Relevant checks are the repository's `npm test`, `npm run build`, and `npm run validate` commands; passing them alone is not a security audit.
