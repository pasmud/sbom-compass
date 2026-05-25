import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PackageInfo } from './types';

interface LockfileParser {
  name: string;
  lockfiles: string[];
  parse: (content: string, dir: string) => PackageInfo[];
}

const parsers: LockfileParser[] = [
  {
    name: 'npm',
    lockfiles: ['package-lock.json'],
    parse: (content) => {
      const pkgs: PackageInfo[] = [];
      try {
        const json = JSON.parse(content);
        if (json.packages) {
          for (const [key, val] of Object.entries(json.packages) as [string, any][]) {
            if (key === '') continue;
            const name = key.startsWith('node_modules/') ? key.slice('node_modules/'.length) : key;
            if (val.dev) continue;
            pkgs.push({ name, version: val.version || '', ecosystem: 'npm' });
          }
        }
        if (json.dependencies) {
          for (const [name, val] of Object.entries(json.dependencies) as [string, any][]) {
            const existing = pkgs.find((p) => p.name === name);
            if (!existing) {
              pkgs.push({ name, version: val.version || '', ecosystem: 'npm' });
            }
          }
        }
      } catch {}
      return pkgs;
    },
  },
  {
    name: 'pnpm',
    lockfiles: ['pnpm-lock.yaml'],
    parse: () => {
      return [];
    },
  },
  {
    name: 'yarn',
    lockfiles: ['yarn.lock'],
    parse: () => {
      return [];
    },
  },
  {
    name: 'python',
    lockfiles: ['requirements.txt', 'Pipfile.lock'],
    parse: (content, dir) => {
      const pkgs: PackageInfo[] = [];
      if (dir.endsWith('Pipfile.lock')) {
        try {
          const json = JSON.parse(content);
          for (const [name, val] of Object.entries(json.default || {}) as [string, any][]) {
            pkgs.push({ name, version: val.version || '', ecosystem: 'PyPI' });
          }
        } catch {}
      } else {
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;
          const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\s*[=~><]+\s*([a-zA-Z0-9.*_-]+)/);
          if (match) {
            pkgs.push({ name: match[1].toLowerCase(), version: match[2], ecosystem: 'PyPI' });
          } else if (!trimmed.includes('=') && !trimmed.includes('>') && !trimmed.includes('<')) {
            pkgs.push({ name: trimmed.toLowerCase(), version: '*', ecosystem: 'PyPI' });
          }
        }
      }
      return pkgs;
    },
  },
  {
    name: 'go',
    lockfiles: ['go.sum', 'go.mod'],
    parse: (content, dir) => {
      const pkgs: PackageInfo[] = [];
      if (dir.endsWith('go.sum')) {
        for (const line of content.split('\n')) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            pkgs.push({ name: parts[0], version: parts[1], ecosystem: 'Go' });
          }
        }
      } else {
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('require ') || trimmed.startsWith('\t')) {
            const parts = trimmed.replace(/\t+/g, ' ').split(' ');
            for (let i = 0; i < parts.length; i++) {
              if (parts[i] && parts[i + 1] && !parts[i].startsWith('//')) {
                const name = parts[i].replace(/"/g, '');
                const ver = parts[i + 1].replace(/\/\/.*/, '').trim();
                if (name && ver && !name.startsWith('require') && !name.startsWith('module')) {
                  pkgs.push({ name, version: ver, ecosystem: 'Go' });
                }
              }
            }
          }
        }
      }
      return pkgs;
    },
  },
];

export function detectEcosystems(projectPath: string): string[] {
  const found: string[] = [];
  for (const parser of parsers) {
    for (const lf of parser.lockfiles) {
      if (existsSync(join(projectPath, lf))) {
        found.push(parser.name);
        break;
      }
    }
  }
  return found;
}

export function parseDependencies(projectPath: string): PackageInfo[] {
  const allPkgs: PackageInfo[] = [];
  for (const parser of parsers) {
    for (const lf of parser.lockfiles) {
      const fullPath = join(projectPath, lf);
      if (existsSync(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const pkgs = parser.parse(content, lf);
          allPkgs.push(...pkgs);
        } catch {}
      }
    }
  }
  const seen = new Set<string>();
  return allPkgs.filter((p) => {
    const key = `${p.name}@${p.version}@${p.ecosystem}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
