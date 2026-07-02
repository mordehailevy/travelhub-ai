import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchLikesReport, downloadLikesCsv } from "../api/reports";
import type { LikesReportRow } from "../types";

export function ReportPage() {
  const [rows, setRows] = useState<LikesReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchLikesReport()
      .then(setRows)
      .catch(() => setError("Could not load the report."))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadLikesCsv();
    } catch {
      setError("Could not download the CSV file.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Vacations Report</h1>
        <p className="page-subtitle">Number of likes per destination.</p>
      </div>

      <div className="report-toolbar">
        <button className="btn btn-secondary" onClick={handleDownload} disabled={downloading || rows.length === 0}>
          {downloading ? "Preparing…" : "Download CSV"}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && <p className="spinner-text">Loading report…</p>}

      {!loading && rows.length > 0 && (
        <div className="report-card">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe1dc" vertical={false} />
              <XAxis
                dataKey="destination"
                angle={-35}
                textAnchor="end"
                interval={0}
                height={90}
                tick={{ fontSize: 12, fill: "#4b564f" }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#4b564f" }} />
              <Tooltip />
              <Bar dataKey="likes" fill="#2f6f62" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && rows.length === 0 && <p className="empty-state">No data to report yet.</p>}
    </div>
  );
}
