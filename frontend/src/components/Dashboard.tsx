import type { Scan } from '../types';

interface Props {
  scan: Scan;
}

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-400 text-gray-900',
  LOW: 'bg-blue-400 text-white',
};

export function Dashboard({ scan }: Props) {
  const items = [
    { label: 'Total Dependencies', value: scan.totalDeps, color: 'bg-gray-100 text-gray-900' },
    { label: 'CRITICAL', value: scan.criticalCount, color: severityColors.CRITICAL },
    { label: 'HIGH', value: scan.highCount, color: severityColors.HIGH },
    { label: 'MEDIUM', value: scan.mediumCount, color: severityColors.MEDIUM },
    { label: 'LOW', value: scan.lowCount, color: severityColors.LOW },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Dashboard</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.label} className={`rounded-lg shadow-sm p-4 ${item.color}`}>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-sm opacity-80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
