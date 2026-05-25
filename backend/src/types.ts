export interface PackageInfo {
  name: string;
  version: string;
  ecosystem: string;
}

export interface EcosystemDetector {
  name: string;
  lockfilePatterns: string[];
  parser: (content: string, filePath: string) => PackageInfo[];
}

export interface OSVVulnerability {
  id: string;
  summary: string;
  details: string;
  aliases: string[];
  severity: string;
  cvssScore?: number;
  fixed?: string;
  affected?: string;
  publishedAt?: string;
  databaseSpecific?: {
    severity?: string;
  };
  severity_raw?: string;
}

export interface ScanResult {
  scanId: string;
  dependencies: PackageInfo[];
  vulnerabilities: Array<{
    vulnerability: OSVVulnerability;
    package: PackageInfo;
  }>;
}

export interface ExportOptions {
  includeFullPaths: boolean;
  status?: string;
  severity?: string;
  ecosystem?: string;
}
