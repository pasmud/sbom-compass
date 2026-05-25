# SBOM Compass

> Dependency vulnerability dashboard for local repositories.

SBOM Compass scans your local project's lockfiles, queries the [OSV](https://osv.dev) database for known vulnerabilities, and provides a remediation tracking dashboard.

## Features

- **Local scanning** — Enter a project path, detect lockfiles automatically
- **Ecosystem support** — npm, pnpm, yarn, Python (pip), Go
- **OSV integration** — Uses the free [OSV API](https://api.osv.dev) (no API key needed)
- **OSV-Scanner support** — If `osv-scanner` CLI is installed, it's used for richer results
- **Dashboard** — Severity breakdown, dependency counts, per-vuln details
- **Remediation workflow** — Track status (open, accepted risk, fixed, false positive), owner, due dates
- **Export** — Markdown report, GitHub issue markdown
- **Demo mode** — Sample data for testing without real scanning

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Install & Run

```bash
# Clone and install
git clone https://github.com/<your-org>/sbom-compass.git
cd sbom-compass

# Backend
cd backend
npm install
npx prisma generate
npx prisma db push

# Seed demo data (optional)
npm run db:seed

# Start backend
npm run dev

# In another terminal - frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:42002 in your browser.

### Docker

```bash
docker compose up --build
```

Then open http://localhost:42001.

A `HOST_PROJECT_PATH` env var can be set to mount a local directory for scanning inside the container:

```bash
HOST_PROJECT_PATH=/path/to/project docker compose up
```

## Usage

1. Enter the absolute path to a local project directory
2. Click **Scan**
3. View the dashboard with severity counts
4. Click on status badges to change remediation status
5. Edit owner and due date inline
6. Export a Markdown report or GitHub issue

## OSV-Scanner Integration

SBOM Compass works without any external dependencies by querying the OSV REST API directly.

For enhanced scanning (including transitive dependency analysis), install [osv-scanner](https://github.com/google/osv-scanner):

```bash
go install github.com/google/osv-scanner/cmd/osv-scanner@v1
```

The app will auto-detect `osv-scanner` in PATH and use it when available.

## Project Structure

```
sbom-compass/
├── backend/           # Express + TypeScript + Prisma + SQLite
│   ├── src/
│   │   ├── index.ts          # App entry point
│   │   ├── scanner.ts        # Lockfile parsing
│   │   ├── osv.ts            # OSV API client
│   │   ├── db.ts             # Prisma client
│   │   └── routes/           # API routes
│   └── prisma/               # Schema + SQLite DB
├── frontend/          # React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── App.tsx           # Main app
│       └── components/       # React components
├── fixtures/          # Test fixtures with known vulns
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Supported Lockfiles

| Ecosystem | Lockfiles |
|-----------|-----------|
| npm       | `package-lock.json` |
| pnpm      | `pnpm-lock.yaml` |
| yarn      | `yarn.lock` |
| Python    | `requirements.txt`, `Pipfile.lock` |
| Go        | `go.sum`, `go.mod` |

## Security

- All scanning is done locally — no code is uploaded anywhere
- Uses the free, public OSV API — no paid third-party APIs
- Filesystem paths are redacted in exported reports unless explicitly enabled
- Only scan systems and code you own or are authorized to test

## License

MIT
