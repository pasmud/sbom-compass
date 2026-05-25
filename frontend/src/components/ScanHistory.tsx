import type { Scan } from '../types';

interface Props {
  scans: Scan[];
  onSelect: (id: string) => void;
}

export function ScanHistory({ scans, onSelect }: Props) {
  if (scans.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Scan History</h2>
      <div className="space-y-2">
        {scans.map((scan) => (
          <button
            key={scan.id}
            onClick={() => onSelect(scan.id)}
            className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 border border-gray-200 text-sm flex items-center justify-between"
          >
            <span className="font-mono text-xs text-gray-500 truncate max-w-md">{scan.projectPath}</span>
            <span className="flex items-center gap-3">
              <span className="text-gray-600">{scan.totalDeps} deps</span>
              {scan.criticalCount > 0 && <span className="text-red-600 font-medium">{scan.criticalCount} critical</span>}
              {scan.highCount > 0 && <span className="text-orange-500 font-medium">{scan.highCount} high</span>}
              <span className="text-xs text-gray-400">{new Date(scan.createdAt).toLocaleString()}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
