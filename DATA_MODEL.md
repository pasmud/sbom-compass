# Data Model

## Entities

### Scan
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| projectPath | String | Scanned local path |
| status | Enum | pending, scanning, completed, failed |
| totalDeps | Int | Total dependencies found |
| highCount | Int | HIGH severity count |
| mediumCount | Int | MEDIUM severity count |
| lowCount | Int | LOW severity count |
| criticalCount | Int | CRITICAL severity count |
| startedAt | DateTime | Scan start time |
| completedAt | DateTime? | Scan end time |
| createdAt | DateTime | Record creation time |

### Dependency
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| scanId | String | FK to Scan |
| name | String | Package name |
| version | String | Installed version |
| ecosystem | String | npm, pypi, go, etc. |
| type | String | direct, dev, transitive |

### Vulnerability
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| scanId | String | FK to Scan |
| dependencyId | String | FK to Dependency |
| osvId | String | OSV vulnerability ID (e.g. GHSA-xxxx) |
| severity | String | CRITICAL, HIGH, MEDIUM, LOW |
| cvssScore | Float? | CVSS score if available |
| summary | String | Short description |
| details | String | Full description |
| fixedVersion | String? | Version that fixes the vuln |
| affectedVersions | String | Range of affected versions |
| aliases | String | CVE IDs etc. |
| publishedAt | DateTime? | Disclosure date |

### Remediation
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| vulnerabilityId | String | FK to Vulnerability |
| status | Enum | open, accepted_risk, fixed, false_positive |
| owner | String? | Assigned person |
| dueDate | DateTime? | Target remediation date |
| notes | String? | Notes |
| createdAt | DateTime | Creation time |
| updatedAt | DateTime | Last update time |

## Relationships

- Scan 1──N Dependency
- Scan 1──N Vulnerability
- Dependency 1──N Vulnerability
- Vulnerability 1──1 Remediation
