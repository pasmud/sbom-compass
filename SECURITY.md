# Security Policy

## Responsible Use

SBOM Compass is a **defensive cybersecurity tool** designed for auditing your own projects.

- **Only scan** systems, code, APIs, and infrastructure you own or are authorized to test.
- **Do not use** this tool for unauthorized scanning or exploitation.
- **No code is uploaded** — all scanning is performed locally.

## Supported Scope

- Local repository vulnerability scanning
- OSV database queries via the public API
- Remediation tracking and reporting
- No external communication beyond the OSV API

## Vulnerability Reporting

If you discover a security issue in SBOM Compass itself:

1. **Do not** open a public GitHub issue.
2. Report via email to the repository maintainer.
3. Include a description of the issue and steps to reproduce.

## Data Handling

- Scanning data stays on your local machine.
- No data is sent to third parties except OSV API queries (package names and versions only).
- OSV API responses are cached locally in SQLite.
- Filesystem paths are redacted in exported reports unless explicitly enabled.

## Secret Redaction

- The tool does not read, store, or transmit secrets, tokens, or credentials.
- If you suspect a secret was inadvertently exposed, rotate it immediately and report the issue.
