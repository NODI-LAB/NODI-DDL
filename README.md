# NODIDDL

NODIDDL is the NODI Lab conference deadline dashboard. It tracks lab-recognized conferences with CCF ratings, NODI scores, suitable submission areas, conference dates, abstract deadlines, paper deadlines, countdowns, and locations.

This is not a general-purpose conference DDL list. The NODI score is an internal planning signal that combines CCF rating, international reputation, flagship status in a field, fit with NODI research directions, representative-paper value, long-term development value, and domestic evaluation context.

## Features

- Next.js App Router static site for GitHub Pages.
- Main dashboard with statistics, filters, keyword search, sorting, and countdown badges.
- Conference detail pages generated at build time with `generateStaticParams()`.
- NODI scoring standard page and project explanation page.
- Manual NODI whitelist in `data/nodi_conferences.json`.
- Separate deadline data in `data/deadlines.json`.
- Conservative automation scripts for ccfddl sync, official page crawling, yearly rollover detection, merging, validation, ICS export, and sync reports.

## Local Development

```bash
npm install
python -m pip install requests beautifulsoup4 pyyaml python-dateutil rapidfuzz pydantic
npm run dev
```

If your local environment does not provide `npm`, use the committed pnpm lockfile:

```bash
pnpm install --ignore-scripts
python -m pip install requests beautifulsoup4 pyyaml python-dateutil rapidfuzz pydantic
pnpm run dev
```

Open the local URL printed by Next.js.

## Build

```bash
npm run build
```

or:

```bash
pnpm run build
```

The static export is written to `out/`.

## Manual Data Commands

```bash
python scripts/merge_deadlines.py
python scripts/validate_conferences.py
python scripts/generate_ics.py
```

## Add a Conference

Edit `data/nodi_conferences.json` and add a new object with:

- `slug`
- `name`
- `website`
- `category`
- `direction`
- `ccf`
- `nodi_score`
- `accepted_topics`
- `note`
- `enabled`

Then add the matching TBD entry to `data/deadlines.json`. Run the merge and validate commands before committing.

## Modify a NODI Score

Change only `nodi_score` in `data/nodi_conferences.json`. NODI scoring fields are manually maintained and must not be overwritten by crawlers or sync scripts.

## Maintain Deadlines

Edit `data/deadlines.json` for verified conference date, abstract deadline, paper deadline, location, source URL, confidence, and status metadata.

Deadline entries use this shape:

```json
{
  "slug": "usenix-security",
  "year": null,
  "conference_date": { "start": null, "end": null, "display": "TBD" },
  "abstract_deadline": { "datetime": null, "display": "TBD", "timezone": null, "mandatory": null },
  "paper_deadline": { "datetime": null, "display": "TBD", "timezone": null, "mandatory": null },
  "location": "TBD"
}
```

The dashboard countdown uses `paper_deadline.datetime`. If it is empty, the site shows `TBD`.

## Automatic Sync Scripts

Run ccfddl sync:

```bash
python scripts/sync_ccfddl.py
python scripts/merge_deadlines.py
python scripts/validate_conferences.py
```

Run the full scheduled workflow locally:

```bash
python scripts/sync_ccfddl.py
python scripts/crawl_official_deadlines.py
python scripts/detect_year_rollover.py
python scripts/merge_deadlines.py
python scripts/validate_conferences.py
python scripts/generate_ics.py
python scripts/generate_report.py
```

Automation rules:

- `category`, `direction`, `ccf`, `nodi_score`, `accepted_topics`, and `note` are never overwritten by sync scripts.
- ccfddl website links are preferred in generated merged data when available.
- Conflicting or low-confidence updates go to `data/pending_updates.json` for review.

## GitHub Pages Deployment

The deploy workflow builds on every push to `main` and publishes `out/` to GitHub Pages.

For the default project site:

```text
https://nodi-lab.github.io/NODI-DDL/
```

the workflow sets:

```text
NEXT_PUBLIC_BASE_PATH=/NODI-DDL
```

`next.config.mjs` uses that value as `basePath` and `assetPrefix`.

## Custom Domain

If the project is later deployed at a custom domain such as `ddl.nodi-lab.org`, set `NEXT_PUBLIC_BASE_PATH` to an empty string in the deployment environment and configure the GitHub Pages custom domain in repository settings.

## Data Confidence

The seed conference list is a curated NODI whitelist. Deadline data can be TBD at first. Automated sources are treated as candidates unless they can be safely merged without overwriting verified manual data. Review `data/pending_updates.json` after scheduled sync PRs.
