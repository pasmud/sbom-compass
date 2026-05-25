import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { severity, ecosystem, scanId, search } = req.query;

  const where: any = {};
  if (severity) where.severity = severity;
  if (scanId) where.scanId = scanId;
  if (ecosystem) {
    where.dependency = { ecosystem: ecosystem as string };
  }
  if (search) {
    where.OR = [
      { summary: { contains: search as string } },
      { osvId: { contains: search as string } },
      { aliases: { contains: search as string } },
    ];
  }

  const vulns = await prisma.vulnerability.findMany({
    where,
    include: { dependency: true, remediation: true },
    orderBy: [{ severity: 'desc' }, { cvssScore: 'desc' }],
  });

  return res.json(vulns);
});

router.get('/stats', async (_req: Request, res: Response) => {
  const [critical, high, medium, low, total] = await Promise.all([
    prisma.vulnerability.count({ where: { severity: 'CRITICAL' } }),
    prisma.vulnerability.count({ where: { severity: 'HIGH' } }),
    prisma.vulnerability.count({ where: { severity: 'MEDIUM' } }),
    prisma.vulnerability.count({ where: { severity: 'LOW' } }),
    prisma.vulnerability.count(),
  ]);

  return res.json({ critical, high, medium, low, total });
});

export default router;
