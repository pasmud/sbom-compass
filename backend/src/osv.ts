import { PackageInfo, OSVVulnerability } from './types';

const OSV_API = 'https://api.osv.dev/v1';

export async function queryOSV(pkg: PackageInfo): Promise<OSVVulnerability[]> {
  try {
    const body = {
      package: { name: pkg.name, ecosystem: pkg.ecosystem },
      version: pkg.version,
    };
    const res = await fetch(`${OSV_API}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return parseOSVResponse(data);
  } catch {
    return [];
  }
}

export async function queryBatchOSV(packages: PackageInfo[]): Promise<Map<string, OSVVulnerability[]>> {
  const results = new Map<string, OSVVulnerability[]>();
  const chunks = chunkArray(packages, 50);

  for (const chunk of chunks) {
    const queries = chunk.map((p) => ({
      package: { name: p.name, ecosystem: p.ecosystem },
      version: p.version,
    }));

    try {
      const res = await fetch(`${OSV_API}/querybatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.results) {
        for (let i = 0; i < chunk.length; i++) {
          const vulns = parseOSVResponse(data.results[i] || {});
          if (vulns.length > 0) {
            const key = `${chunk[i].name}@${chunk[i].version}`;
            results.set(key, vulns);
          }
        }
      }
    } catch {
      continue;
    }
  }

  return results;
}

function parseOSVResponse(data: any): OSVVulnerability[] {
  if (!data.vulns || !Array.isArray(data.vulns)) return [];
  return data.vulns.map((v: any) => ({
    id: v.id || 'UNKNOWN',
    summary: v.summary || '',
    details: v.details || '',
    aliases: v.aliases || [],
    severity: extractSeverity(v),
    cvssScore: extractCVSS(v),
    fixed: extractFixedVersion(v),
    affected: extractAffectedRange(v),
    publishedAt: v.published,
  }));
}

function extractSeverity(vuln: any): string {
  const dbSpecific = vuln.database_specific;
  if (dbSpecific?.severity) return dbSpecific.severity.toUpperCase();
  if (vuln.severity && vuln.severity.length > 0) {
    const sev = vuln.severity[0];
    if (sev.type === 'CVSS_V3' && sev.score) {
      const s = parseFloat(sev.score);
      if (s >= 9.0) return 'CRITICAL';
      if (s >= 7.0) return 'HIGH';
      if (s >= 4.0) return 'MEDIUM';
      return 'LOW';
    }
  }
  return 'UNSPECIFIED';
}

function extractCVSS(vuln: any): number | undefined {
  if (vuln.severity && vuln.severity.length > 0) {
    for (const s of vuln.severity) {
      if (s.type === 'CVSS_V3' && s.score) return parseFloat(s.score);
    }
  }
  return undefined;
}

function extractFixedVersion(vuln: any): string | undefined {
  if (!vuln.affected) return undefined;
  for (const aff of vuln.affected) {
    if (aff.ranges) {
      for (const range of aff.ranges) {
        if (range.events) {
          for (const event of range.events) {
            if (event.fixed) return event.fixed;
          }
        }
      }
    }
  }
  return undefined;
}

function extractAffectedRange(vuln: any): string {
  if (!vuln.affected) return '';
  const parts: string[] = [];
  for (const aff of vuln.affected) {
    if (aff.ranges) {
      for (const range of aff.ranges) {
        if (range.events) {
          const intro = range.events.find((e: any) => e.introduce)?.introduce || '0';
          const fixed = range.events.find((e: any) => e.fixed)?.fixed || '';
          parts.push(`>= ${intro}${fixed ? `, < ${fixed}` : ''}`);
        }
      }
    }
  }
  return parts.join('; ');
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
