import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { ScanForm } from './components/ScanForm';
import { VulnTable } from './components/VulnTable';
import { ExportBar } from './components/ExportBar';
import { ScanHistory } from './components/ScanHistory';
import type { Scan, Vulnerability } from './types';

const API = '/api';

function App() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVulns, setSelectedVulns] = useState<Set<string>>(new Set());

  const loadScans = useCallback(async () => {
    try {
      const res = await fetch(`${API}/scans`);
      if (res.ok) setScans(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const handleScan = async (projectPath: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Scan failed');
      }
      const scan = await res.json();
      setCurrentScan(scan);
      setVulnerabilities(scan.vulnerabilities || []);
      setSelectedVulns(new Set());
      await loadScans();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadScan = async (id: string) => {
    setLoading(true);
    try {
      const [scanRes, vulnRes] = await Promise.all([
        fetch(`${API}/scans/${id}`),
        fetch(`${API}/vulnerabilities?scanId=${id}`),
      ]);
      if (scanRes.ok) setCurrentScan(await scanRes.json());
      if (vulnRes.ok) setVulnerabilities(await vulnRes.json());
    } catch {} finally {
      setLoading(false);
    }
  };

  const updateRemediation = async (id: string, data: any) => {
    try {
      const res = await fetch(`${API}/remediations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setVulnerabilities((prev) =>
          prev.map((v) =>
            v.remediation?.id === id ? { ...v, remediation: updated } : v
          )
        );
      }
    } catch {}
  };

  const toggleSelectVuln = (id: string) => {
    setSelectedVulns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedVulns.size === vulnerabilities.length) {
      setSelectedVulns(new Set());
    } else {
      setSelectedVulns(new Set(vulnerabilities.map((v) => v.remediation?.id || v.id)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">SBOM Compass</h1>
          <span className="text-indigo-200 text-sm">Dependency Vulnerability Dashboard</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <ScanForm onScan={handleScan} loading={loading} error={error} />

        {currentScan && <Dashboard scan={currentScan} />}

        {vulnerabilities.length > 0 && (
          <>
            <ExportBar
              scanId={currentScan?.id}
              selectedIds={selectedVulns}
            />
            <VulnTable
              vulnerabilities={vulnerabilities}
              onUpdateRemediation={updateRemediation}
              selectedVulns={selectedVulns}
              onToggleSelect={toggleSelectVuln}
              onSelectAll={selectAll}
            />
          </>
        )}

        <ScanHistory scans={scans} onSelect={loadScan} />
      </main>
    </div>
  );
}

export default App;
