export interface Scan {
  id: string;
  projectPath: string;
  status: string;
  totalDeps: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  dependencies?: Dependency[];
  vulnerabilities?: Vulnerability[];
  _count?: { vulnerabilities: number; dependencies: number };
}

export interface Dependency {
  id: string;
  scanId: string;
  name: string;
  version: string;
  ecosystem: string;
  type: string;
}

export interface Vulnerability {
  id: string;
  scanId: string;
  dependencyId: string;
  osvId: string;
  severity: string;
  cvssScore: number | null;
  summary: string;
  details: string;
  fixedVersion: string | null;
  affectedVersions: string;
  aliases: string;
  publishedAt: string | null;
  createdAt: string;
  dependency: Dependency;
  remediation: Remediation | null;
}

export interface Remediation {
  id: string;
  vulnerabilityId: string;
  status: string;
  owner: string | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
