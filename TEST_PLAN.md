# Test Plan

## Unit Tests (Vitest - Backend)

| Test | Description |
|------|-------------|
| Scanner: detect ecosystems | Verify lockfile detection for each ecosystem |
| Scanner: parse lockfile npm | Parse package-lock.json correctly |
| Scanner: parse lockfile python | Parse requirements.txt correctly |
| OSV: query package | Mock OSV API response, verify parsing |
| OSV: query batch | Verify batch query construction |
| DB: create scan | Verify scan record creation |
| DB: create dependency | Verify dependency with FK constraint |
| DB: vulnerability cascade | Verify cascade on scan delete |
| API: POST /api/scans | End-to-end scan endpoint |
| API: GET /api/vulnerabilities | Filtering, pagination |
| API: PATCH /api/remediations | Status update |

## Frontend (Vitest + jsdom)

| Test | Description |
|------|-------------|
| Dashboard renders | Component mounts with data |
| Scan form submits | Path input triggers API call |
| Vuln table filters | Severity filter works |
| Remediation update | Status change calls API |

## E2E (Manual / Playwright)

| Test | Description |
|------|-------------|
| Full scan flow | Enter path, see results in dashboard |
| Remediation workflow | Change status, add owner, set due date |
| Export to Markdown | Download report |
| Demo mode | Scan without OSV-Scanner installed |
| Docker | App starts, scan works in container |

## Test Fixtures

- `fixtures/sample-node-app/package-lock.json` - known vulnerable deps
- `fixtures/sample-python-app/requirements.txt` - known vuln deps
- `fixtures/osv-mock-response.json` - mock OSV API response
