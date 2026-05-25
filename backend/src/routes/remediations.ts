import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

router.patch('/:id', async (req: Request, res: Response) => {
  const { status, owner, dueDate, notes } = req.body;

  const data: any = {};
  if (status) data.status = status;
  if (owner !== undefined) data.owner = owner;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (notes !== undefined) data.notes = notes;

  try {
    const remediation = await prisma.remediation.update({
      where: { id: req.params.id },
      data,
      include: { vulnerability: { include: { dependency: true } } },
    });
    return res.json(remediation);
  } catch {
    return res.status(404).json({ error: 'Remediation not found' });
  }
});

router.post('/bulk', async (req: Request, res: Response) => {
  const { ids, status, owner } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array is required' });
  }

  const data: any = {};
  if (status) data.status = status;
  if (owner !== undefined) data.owner = owner;

  await prisma.remediation.updateMany({
    where: { id: { in: ids } },
    data,
  });

  return res.json({ updated: ids.length });
});

export default router;
