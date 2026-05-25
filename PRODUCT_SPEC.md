# SBOM Compass - Product Specification

## Overview

SBOM Compass is a local-first dependency vulnerability dashboard. Users point it at a local repository, it detects lockfiles, queries the OSV database for vulnerabilities, and presents a remediation dashboard.

## User Personas

1. **Developer** - wants to quickly see vulnerabilities in their project deps
2. **Security Engineer** - wants to track remediation progress across repos
3. **Tech Lead** - wants periodic vulnerability reports and GitHub issues

## Features

### F1: Local Project Scanning
- User enters local filesystem path
- App detects supported lockfiles
- Warns if path doesn't exist or isn't a directory

### F2: Ecosystem Detection
- npm (package-lock.json)
- pnpm (pnpm-lock.yaml)
- yarn (yarn.lock)
- Python (requirements.txt, Pipfile.lock)
- Go (go.sum, go.mod)

### F3: OSV Integration
- If OSV-Scanner is installed: use it (provides richer results)
- If not: use OSV API directly (no extra install needed)
- Fallback: demo mode with sample vulnerability data

### F4: Dashboard
- Total dependency count
- Vulnerabilities by severity (CRITICAL, HIGH, MEDIUM, LOW)
- Per-package vulnerability details
- Affected version, fixed version, ecosystem
- Scan date history

### F5: Remediation Workflow
- Status: open, accepted risk, fixed, false positive
- Assign owner
- Set due date
- Add notes
- Track history

### F6: Export
- Markdown report
- GitHub issue markdown for selected vulns

### F7: Demo Fixture
- Sample project with known vulnerable deps for testing

## Non-Goals
- No code upload to third parties
- No paid API calls
- No CI/CD integration (future)
- No SBOM generation (import only)
