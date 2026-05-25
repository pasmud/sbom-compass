import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queryOSV, queryBatchOSV } from '../osv';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('queryOSV', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns vulnerabilities for a vulnerable package', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        vulns: [
          {
            id: 'GHSA-xxxx-xxxx-xxxx',
            summary: 'Test vulnerability',
            details: 'Details here',
            aliases: ['CVE-2023-12345'],
            severity: [{ type: 'CVSS_V3', score: '7.5' }],
            published: '2023-01-01T00:00:00Z',
            affected: [
              {
                ranges: [
                  {
                    events: [{ introduce: '1.0.0' }, { fixed: '1.2.0' }],
                  },
                ],
              },
            ],
          },
        ],
      }),
    });

    const result = await queryOSV({ name: 'test-pkg', version: '1.0.0', ecosystem: 'npm' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('GHSA-xxxx-xxxx-xxxx');
    expect(result[0].severity).toBe('HIGH');
    expect(result[0].fixed).toBe('1.2.0');
  });

  it('returns empty array on API error', async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const result = await queryOSV({ name: 'test-pkg', version: '1.0.0', ecosystem: 'npm' });
    expect(result).toEqual([]);
  });

  it('returns empty array on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const result = await queryOSV({ name: 'test-pkg', version: '1.0.0', ecosystem: 'npm' });
    expect(result).toEqual([]);
  });
});
