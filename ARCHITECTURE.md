# Architecture

## System Context

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│  Browser    │────▶│  Express API │────▶│  SQLite   │
│  React SPA  │◀────│  :42001      │◀────│  (Prisma) │
└─────────────┘     └──────┬───────┘     └───────────┘
                           │
                    ┌──────▼───────┐
                    │  OSV API     │
                    │  api.osv.dev │
                    └──────────────┘
```

## Backend (Node.js/Express/TypeScript)

### Modules

1. **Scanner** - `scanner.ts`
   - `detectEcosystems(path)` → detects lockfiles in directory
   - `parseLockfile(path)` → extracts [{name, version, ecosystem}]
   - `scanWithOSVScanner(path)` → uses osv-scanner CLI
   - `scanWithOSVApi(packages)` → queries OSV API batch endpoint

2. **OSV Client** - `osv.ts`
   - `queryPackage(package, ecosystem, version)` → vulnerabilities
   - `queryBatch(packages)` → batch vulnerability lookup
   - `getVulnById(id)` → vulnerability details

3. **Database** - `db.ts`
   - Prisma ORM with SQLite
   - Tables: Scan, Dependency, Vulnerability, Remediation

4. **API Routes** - `routes/`
   - `POST /api/scans` - start a scan
   - `GET /api/scans` - list scans
   - `GET /api/scans/:id` - scan results
   - `GET /api/dependencies` - all dependencies
   - `GET /api/vulnerabilities` - vulns with filters
   - `PATCH /api/remediations/:id` - update remediation status
   - `POST /api/remediations/bulk` - bulk update
   - `GET /api/remediations/export/markdown` - export report
   - `GET /api/remediations/export/github-issue` - GitHub issue markdown

## Frontend (React/Vite/Tailwind)

### Pages/Components

1. **Dashboard** - summary cards, severity breakdown chart
2. **ScanForm** - path input + scan trigger
3. **VulnTable** - sortable/filterable vuln list
4. **RemediationPanel** - inline status/owner/date editing
5. **ExportBar** - markdown + GitHub issue export buttons
6. **ScanHistory** - previous scans list

## Data Flow

1. User enters path → POST /api/scans
2. Backend detects lockfiles, extracts packages
3. Backend queries OSV (scanner or API)
4. Results stored in SQLite
5. Frontend polls/pushes for results
6. User views dashboard, manages remediation
7. Export generates Markdown/GitHub issue text

## Port Management

- Detect free port in range 42000-49999
- Write to .env
- Frontend Vite dev server on another free port
