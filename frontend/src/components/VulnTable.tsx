import { useState } from 'react';
import type { Vulnerability } from '../types';

interface Props {
  vulnerabilities: Vulnerability[];
  onUpdateRemediation: (id: string, data: any) => void;
  selectedVulns: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
}

const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNSPECIFIED: 4 };
const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  accepted_risk: 'bg-yellow-100 text-yellow-800',
  fixed: 'bg-green-100 text-green-800',
  false_positive: 'bg-gray-100 text-gray-800',
};

export function VulnTable({ vulnerabilities, onUpdateRemediation, selectedVulns, onToggleSelect, onSelectAll }: Props) {
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...vulnerabilities].sort(
    (a, b) => (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99) || (b.cvssScore || 0) - (a.cvssScore || 0)
  );

  const filtered = filter
    ? sorted.filter(
        (v) =>
          v.summary.toLowerCase().includes(filter.toLowerCase()) ||
          v.osvId.toLowerCase().includes(filter.toLowerCase()) ||
          v.dependency.name.toLowerCase().includes(filter.toLowerCase()) ||
          (v.aliases && v.aliases.toLowerCase().includes(filter.toLowerCase()))
      )
    : sorted;

  const severityBadge = (sev: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-600',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-yellow-400 text-gray-900',
      LOW: 'bg-blue-400',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white ${colors[sev] || 'bg-gray-400'}`}>
        {sev}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Vulnerabilities</h2>
        <input
          type="text"
          placeholder="Filter by keyword, CVE, or package..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 max-w-md px-3 py-1.5 border border-gray-300 rounded-md text-sm"
        />
        <span className="text-sm text-gray-500">{filtered.length} of {vulnerabilities.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedVulns.size === vulnerabilities.length && vulnerabilities.length > 0}
                  onChange={onSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">OSV ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fixed In</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedVulns.has(v.remediation?.id || v.id)}
                    onChange={() => onToggleSelect(v.remediation?.id || v.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-3 py-3">{severityBadge(v.severity)}</td>
                <td className="px-3 py-3 text-sm font-mono text-indigo-600">{v.osvId}</td>
                <td className="px-3 py-3 text-sm">
                  <div className="font-medium">{v.dependency.name}</div>
                  <div className="text-xs text-gray-500">{v.dependency.version} · {v.dependency.ecosystem}</div>
                </td>
                <td className="px-3 py-3 text-sm text-gray-700 max-w-xs truncate">{v.summary}</td>
                <td className="px-3 py-3 text-sm">{v.fixedVersion || <span className="text-gray-400">—</span>}</td>
                <td className="px-3 py-3">
                  {editingId === v.remediation?.id ? (
                    <select
                      value={v.remediation?.status || 'open'}
                      onChange={(e) => {
                        onUpdateRemediation(v.remediation!.id, { status: e.target.value });
                        setEditingId(null);
                      }}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      className="text-xs border rounded px-1 py-0.5"
                    >
                      <option value="open">open</option>
                      <option value="accepted_risk">accepted risk</option>
                      <option value="fixed">fixed</option>
                      <option value="false_positive">false positive</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${statusColors[v.remediation?.status || 'open'] || ''}`}
                      onClick={() => v.remediation && setEditingId(v.remediation.id)}
                    >
                      {v.remediation?.status?.replace('_', ' ') || 'open'}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-sm">
                  <input
                    type="text"
                    value={v.remediation?.owner || ''}
                    onChange={(e) => v.remediation && onUpdateRemediation(v.remediation.id, { owner: e.target.value || null })}
                    className="w-24 px-1 py-0.5 text-sm border border-transparent hover:border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                    placeholder="—"
                  />
                </td>
                <td className="px-3 py-3 text-sm">
                  <input
                    type="date"
                    value={v.remediation?.dueDate ? v.remediation.dueDate.split('T')[0] : ''}
                    onChange={(e) => v.remediation && onUpdateRemediation(v.remediation.id, { dueDate: e.target.value || null })}
                    className="w-28 px-1 py-0.5 text-sm border border-transparent hover:border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                  {vulnerabilities.length === 0 ? 'No vulnerabilities found. Run a scan to get started.' : 'No matching vulnerabilities.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
