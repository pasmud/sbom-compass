import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import prisma from '../db';

describe('API Endpoints', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/scans returns empty array initially', async () => {
    const res = await request(app).get('/api/scans');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/scans returns 400 without projectPath', async () => {
    const res = await request(app).post('/api/scans').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/scans returns 400 for nonexistent path', async () => {
    const res = await request(app).post('/api/scans').send({ projectPath: 'C:\\nonexistent_path_12345' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Path does not exist');
  });

  it('GET /api/vulnerabilities/stats returns counts', async () => {
    const res = await request(app).get('/api/vulnerabilities/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('critical');
    expect(res.body).toHaveProperty('high');
    expect(res.body).toHaveProperty('medium');
    expect(res.body).toHaveProperty('low');
  });
});
