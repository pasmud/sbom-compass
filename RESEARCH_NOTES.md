# Research Notes: SBOM Compass

## OSV (Open Source Vulnerability) Database

- Public API at https://api.osv.dev
- Query by package+ecosystem, commit hash, or package URL
- `POST /v1/query` - query vulnerabilities for a package/version
- `POST /v1/querybatch` - batch query (up to 1000 at once)
- `GET /v1/vulns/{id}` - get vulnerability details by OSV ID
- Ecosystems supported: npm, PyPI, Go, RubyGems, Maven, crates.io, NuGet, etc.
- Pagination via `next_page_token` when >1000 results or >20s query time
- No API key required (free, public API)

## OSV-Scanner

- CLI tool by Google: https://github.com/google/osv-scanner
- Scans lockfiles: package-lock.json, yarn.lock, pnpm-lock.yaml, go.sum, requirements.txt, Pipfile.lock, pom.xml, etc.
- Outputs JSON with `--json` flag
- Can also scan SBOM files (SPDX, CycloneDX)
- Reports vulnerabilities with severity, fixed versions, ecosystem info
- Install: `go install github.com/google/osv-scanner/cmd/osv-scanner@v1`

## SBOM-Based Vulnerability Management

- SBOM = Software Bill of Materials (list of all dependencies)
- Standards: SPDX, CycloneDX
- Key workflow: Identify dependencies → Match against vulnerability DB → Prioritize by severity → Remediate
- Remediation prioritisation factors: CVSS score, exploitability, reachability, affected version range, fix availability
- Local repo scanning avoids sending code to third parties

## Lockfile Ecosystem Detection

- `package-lock.json` → npm
- `yarn.lock` → yarn
- `pnpm-lock.yaml` → pnpm
- `go.sum` / `go.mod` → Go
- `requirements.txt` / `Pipfile.lock` / `poetry.lock` → Python
- `Cargo.lock` → Rust
- `Gemfile.lock` → Ruby
- `pom.xml` → Maven/Java

## Technical Approach

- Backend: Node.js/Express with TypeScript
  - Parse lockfiles locally, extract package+version tuples
  - Query OSV API for vulnerabilities (batch when possible)
  - Store results in SQLite via Prisma/Drizzle
  - Expose REST API for frontend
- Frontend: React/Vite/TypeScript/Tailwind
  - Dashboard with dependency counts, vuln severity breakdown
  - Remediation workflow (status, owner, due date, notes)
  - Export to Markdown, GitHub issue template
- Demo mode: ship sample vuln data for testing without OSV-Scanner
- Docker Compose for easy local deployment
