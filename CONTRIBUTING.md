# Contributing to CycloScope

## Pull requests are closed to human contributions

**Please do not contribute code to this repository. Pull requests opened by anyone other than a bot will be closed without review.**

CycloScope is maintained by [Sachin Shankar](https://github.com/shankar-sachin). Its source is available under the [MIT License](LICENSE), but upstream development is managed by the owner. You are welcome to inspect the implementation, report problems, discuss ideas, or maintain a fork under that license.

This policy applies to fixes, documentation, tests, UI changes, dependency upgrades, build configuration, and tropical cyclone data updates. Please report the problem instead of submitting a patch.

Automated maintenance pull requests from bots configured or approved by the owner may be reviewed. That exception does not extend to a person routing a contribution through a bot or coding agent. Bot submissions can also be closed.

## Reports and questions belong in Discussions

Use [GitHub Discussions](https://github.com/shankar-sachin/cycloscope/discussions) for bug reports, data discrepancies, feature suggestions, and questions. Search existing discussions before starting another one.

CycloScope combines several independent systems. Identify which part is affected:

| Area | Relevant implementation | What to include |
| --- | --- | --- |
| Search, cyclone pages, maps, timeline, intensity charts, and CSV export | `src/app.html` | Page URL, browser, steps, selected wind unit, and expected versus actual behavior |
| Active advisories, observed tracks, and forecast parsing | `src/server.js` | ATCF ID, advisory number or issuance time, and official NHC source |
| Satellite archive selection and image timestamps | `src/satellite.js` | Selected track time in UTC, position, Auto/infrared/true-color selection, and displayed image timestamp |
| Historical and preliminary records | `data/archive.gz.b64`, `data/recent.json`, and `data/recent/` | Cyclone name, year, ATCF ID, affected observation, and source supporting the correction |
| Embedded ChatGPT interface | `src/app.html` and `POST /mcp` in `src/server.js` | Whether the standalone page works, the tool used, and the visible connection or rendering error |
| Building or hosting | `scripts/build.mjs`, `scripts/build.sh`, and `worker/index.js` | Commit, Node version, hosting platform, command, and relevant error output |

For example, “Melissa's satellite view is wrong” is difficult to investigate. A useful report identifies **Melissa 2025 (`AL132025`)**, the selected UTC observation, the imagery product, the timestamp shown under the image, and what appears incorrect.

Remove tokens, cookies, account details, and other private information from screenshots and logs. For security concerns, follow [SECURITY.md](SECURITY.md).

## Check the source and time before reporting a data error

CycloScope currently covers the Atlantic and eastern/central North Pacific. Its data has different meanings and update schedules:

- **Active information:** NHC/CPHC advisories and NHC ATCF observed tracks. Observed positions and forecast positions are separate. The dashboard checks for updates every five minutes while visible; the active feed is cached for one minute.
- **Historical tracks:** a bundled HURDAT2 snapshot through 2025.
- **Recent tracks:** preliminary 2026 ATCF records bundled separately from finalized historical data. These records can change after post-season review. The bundled snapshot does not automatically become a continuously updated archive.
- **Infrared imagery:** GOES-East/West ABI Band 13 from NASA GIBS. Availability depends on the retained archive; the selector permits a nearest available frame within 30 minutes.
- **True-color imagery:** NOAA-20 VIIRS or Terra MODIS daily composites. A daily composite does not represent every individual observation hour. Coverage gaps can occur.

An unavailable upstream feed, an older date outside retained infrared coverage, and a daily composite displaying a date rather than an exact hour are different from a parsing or playback defect. Include the source response or official reference when it helps distinguish them. If CycloScope hides a failure or labels historical information as current, report that behavior.

Please do not submit invented track positions, inferred central pressures, manually altered source records, or current satellite images as replacements for missing historical imagery.

## Reproducing a problem locally

The project uses JavaScript ES modules, a self-contained Worker, the MCP Apps SDK, esbuild, and locally embedded Geist fonts. Use **Node.js 24 or later**.

From the repository root:

```sh
npm ci
npm run build
npm test
npm run validate
npm run dev
```

The build runs before the tests because the tests import the generated `worker/index.js`. The development server defaults to port `4173`.

`scripts/build.mjs` bundles the UI, fonts, coastline, satellite module, and cyclone snapshots into `worker/index.js`. `scripts/build.sh` then packages the Worker and the Sites hosting manifest into `dist/`. The generated Worker is intentionally tracked; editing it directly is not a durable source change.

When reporting a build failure, say whether it occurred while generating the Worker or packaging it for hosting. Include the failing command and error rather than uploading `node_modules/`, credentials, or an entire machine log.

These commands are for investigation and independently maintained forks. They do not change the pull-request policy.

## Forks, attribution, and project direction

The MIT License permits modification and redistribution subject to its terms, including retaining the required copyright and permission notice. The contribution policy does not restrict those rights. Keep third-party notices, including `data/Geist-LICENSE.txt`, with the applicable material.

Maintain your own changes in your fork and identify it clearly as a separate project or distribution. Decisions about CycloScope's supported basins, imagery products, interface, data imports, and releases remain with the owner. Discussions are welcome; implementation, review, and response times are not promised.
