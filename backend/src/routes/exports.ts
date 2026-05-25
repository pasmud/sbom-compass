import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

router.get('/markdown', async (req: Request, res: Response) => {
  const { includeFullPaths, scanId } = req.query;
  const includePaths = includeFullPaths === 'true';

  const where: any = {};
  if (scanId) where.scanId = scanId;

  const vulns = await prisma.vulnerability.findMany({
    where,
    include: { dependency: true, remediation: true, scan: true },
    orderBy: [{ severity: 'desc' }, { cvssScore: 'desc' }],
  });

  let md = `# SBOM Compass - Vulnerability Report\n\n`;
  md += `*Generated: ${new Date().toISOString()}*\n\n`;

  if (vulns.length > 0) {
    md += `**Project Path:** ${includePaths ? vulns[0].scan.projectPath : '[redacted]'}\n\n`;
  }

  md += `## Summary\n\n`;
  md += `| Severity | Count |\n`;
  md += `|----------|-------|\n`;
  md += `| CRITICAL | ${vulns.filter((v) => v.severity === 'CRITICAL').length} |\n`;
  md += `| HIGH     | ${vulns.filter((v) => v.severity === 'HIGH').length} |\n`;
  md += `| MEDIUM   | ${vulns.filter((v) => v.severity === 'MEDIUM').length} |\n`;
  md += `| LOW      | ${vulns.filter((v) => v.severity === 'LOW').length} |\n`;
  md += `| **Total** | **${vulns.length}** |\n\n`;

  md += `## Vulnerability Details\n\n`;
  for (const v of vulns) {
    md += `### ${v.osvId} - ${v.summary}\n\n`;
    md += `- **Severity:** ${v.severity}\n`;
    if (v.cvssScore) md += `- **CVSS Score:** ${v.cvssScore}\n`;
    md += `- **Package:** ${v.dependency.name}@${v.dependency.version}\n`;
    md += `- **Ecosystem:** ${v.dependency.ecosystem}\n`;
    if (v.fixedVersion) md += `- **Fixed Version:** ${v.fixedVersion}\n`;
    if (v.aliases) md += `- **Aliases:** ${v.aliases}\n`;
    if (v.remediation) {
      md += `- **Remediation Status:** ${v.remediation.status}\n`;
      if (v.remediation.owner) md += `- **Owner:** ${v.remediation.owner}\n`;
      if (v.remediation.dueDate) md += `- **Due Date:** ${v.remediation.dueDate.toISOString().split('T')[0]}\n`;
    }
    md += `\n`;
  }

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', 'attachment; filename="vulnerability-report.md"');
  return res.send(md);
});

router.get('/github-issue', async (req: Request, res: Response) => {
  const { ids } = req.query;
  const vulnIds = ids ? (ids as string).split(',') : [];

  const where: any = {};
  if (vulnIds.length > 0) where.id = { in: vulnIds };

  const vulns = await prisma.vulnerability.findMany({
    where,
    include: { dependency: true, remediation: true },
  });

  let issue = `## Vulnerability Report\n\n`;
  issue += `### Summary\n\n`;
  issue += `${vulns.length} vulnerability(ies) found.\n\n`;

  issue += `### Details\n\n`;
  issue += `| OSV ID | Package | Severity | CVSS | Fixed In |\n`;
  issue += `|--------|---------|----------|------|----------|\n`;

  for (const v of vulns) {
    const dep = `${v.dependency.name}@${v.dependency.version}`;
    const cvss = v.cvssScore?.toString() || '-';
    const fixed = v.fixedVersion || '-';
    issue += `| ${v.osvId} | ${dep} | ${v.severity} | ${cvss} | ${fixed} |\n`;
  }

  issue += `\n### Recommended Actions\n\n`;
  for (const v of vulns) {
    if (v.fixedVersion) {
      issue += `- Update \`${v.dependency.name}\` from \`${v.dependency.version}\` to \`${v.fixedVersion}\` to fix ${v.osvId}\n`;
    }
  }

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', 'attachment; filename="github-issue.md"');
  return res.send(issue);
});

export default router;
