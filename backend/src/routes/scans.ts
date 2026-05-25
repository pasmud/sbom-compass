import { Router, Request, Response } from 'express';
import { existsSync } from 'fs';
import prisma from '../db';
import { detectEcosystems, parseDependencies } from '../scanner';
import { queryBatchOSV } from '../osv';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectPath } = req.body;
    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ error: 'projectPath is required' });
    }
    if (!existsSync(projectPath)) {
      return res.status(400).json({ error: 'Path does not exist' });
    }

    const ecosystems = detectEcosystems(projectPath);
    if (ecosystems.length === 0) {
      return res.status(400).json({ error: 'No supported lockfiles found in the specified path' });
    }

    const scan = await prisma.scan.create({
      data: {
        projectPath,
        status: 'scanning',
      },
    });

    const packages = parseDependencies(projectPath);

    await prisma.scan.update({
      where: { id: scan.id },
      data: { totalDeps: packages.length },
    });

    const depRecords = await Promise.all(
      packages.map((p) =>
        prisma.dependency.create({
          data: {
            scanId: scan.id,
            name: p.name,
            version: p.version,
            ecosystem: p.ecosystem,
          },
        })
      )
    );

    const vulnMap = await queryBatchOSV(packages);

    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (let i = 0; i < packages.length; i++) {
      const key = `${packages[i].name}@${packages[i].version}`;
      const vulns = vulnMap.get(key);
      if (!vulns) continue;

      for (const v of vulns) {
        const vulnRecord = await prisma.vulnerability.create({
          data: {
            scanId: scan.id,
            dependencyId: depRecords[i].id,
            osvId: v.id,
            severity: v.severity,
            cvssScore: v.cvssScore,
            summary: v.summary,
            details: v.details,
            fixedVersion: v.fixed,
            affectedVersions: v.affected || '',
            aliases: v.aliases.join(', '),
            publishedAt: v.publishedAt ? new Date(v.publishedAt) : null,
          },
        });

        if (v.severity === 'CRITICAL') criticalCount++;
        else if (v.severity === 'HIGH') highCount++;
        else if (v.severity === 'MEDIUM') mediumCount++;
        else if (v.severity === 'LOW') lowCount++;

        await prisma.remediation.create({
          data: { vulnerabilityId: vulnRecord.id },
        });
      }
    }

    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
      },
    });

    const result = await prisma.scan.findUnique({
      where: { id: scan.id },
      include: {
        dependencies: true,
        vulnerabilities: {
          include: { dependency: true, remediation: true },
        },
      },
    });

    return res.json(result);
  } catch (err) {
    console.error('Scan error:', err);
    return res.status(500).json({ error: 'Scan failed' });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { vulnerabilities: true, dependencies: true } } },
  });
  return res.json(scans);
});

router.get('/:id', async (req: Request, res: Response) => {
  const scan = await prisma.scan.findUnique({
    where: { id: req.params.id },
    include: {
      dependencies: true,
      vulnerabilities: {
        include: { dependency: true, remediation: true },
        orderBy: [{ severity: 'desc' }, { cvssScore: 'desc' }],
      },
    },
  });
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  return res.json(scan);
});

export default router;
