import { useState } from 'react';

interface Props {
  onScan: (path: string) => void;
  loading: boolean;
  error: string;
}

export function ScanForm({ onScan, loading, error }: Props) {
  const [path, setPath] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (path.trim()) onScan(path.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Scan Project</h2>
      <div className="flex gap-3">
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="Enter local project path (e.g., C:\\projects\\my-app)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !path.trim()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Only scan systems, code, APIs, and infrastructure you own or are authorized to test.
      </p>
    </form>
  );
}
