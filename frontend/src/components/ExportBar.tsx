import { useState } from 'react';

interface Props {
  scanId?: string;
  selectedIds: Set<string>;
}

export function ExportBar({ scanId, selectedIds }: Props) {
  const [exporting, setExporting] = useState(false);

  const exportMd = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (scanId) params.set('scanId', scanId);
      const res = await fetch(`/api/exports/markdown?${params}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      downloadBlob(blob, 'vulnerability-report.md');
    } catch (err) {
      alert('Export failed: ' + (err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const exportGitHubIssue = async () => {
    if (selectedIds.size === 0) {
      alert('Select at least one vulnerability to export');
      return;
    }
    setExporting(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await fetch(`/api/exports/github-issue?ids=${ids.join(',')}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      downloadBlob(blob, 'github-issue.md');
    } catch (err) {
      alert('Export failed: ' + (err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-3">
      <h2 className="text-lg font-semibold text-gray-900">Export</h2>
      <button
        onClick={exportMd}
        disabled={exporting}
        className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        Markdown Report
      </button>
      <button
        onClick={exportGitHubIssue}
        disabled={exporting || selectedIds.size === 0}
        className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        GitHub Issue ({selectedIds.size})
      </button>
    </div>
  );
}
