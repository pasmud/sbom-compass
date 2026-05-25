import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

describe('Dashboard', () => {
  const mockScan = {
    id: 'test-scan',
    projectPath: '/test',
    status: 'completed',
    totalDeps: 42,
    criticalCount: 2,
    highCount: 5,
    mediumCount: 8,
    lowCount: 3,
    startedAt: '2024-01-01T00:00:00Z',
    completedAt: '2024-01-01T01:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  };

  it('renders dependency count', () => {
    render(<Dashboard scan={mockScan} />);
    expect(screen.getByText('42')).toBeDefined();
  });

  it('renders severity counts', () => {
    render(<Dashboard scan={mockScan} />);
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });
});
