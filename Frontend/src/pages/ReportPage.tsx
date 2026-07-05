import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { fetchLikesReport, downloadLikesCsv } from "../api/reports";
import type { LikesReportRow } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

      <div className="mb-4 flex justify-end">
        <Button variant="secondary" onClick={handleDownload} disabled={downloading || rows.length === 0}>
          <Download /> {downloading ? "Preparing…" : "Download CSV"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && <Skeleton className="h-[420px] w-full rounded-xl" />}

      {!loading && rows.length > 0 && (
        <Card className="p-6">
          <CardContent className="px-0">
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                <defs>
                  <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#bae6fd" vertical={false} />
                <XAxis
                  dataKey="destination"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={90}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip cursor={{ fill: "rgba(14, 165, 233, 0.08)" }} />
                <Bar dataKey="likes" fill="url(#likesGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!loading && rows.length === 0 && (
        <p className="py-10 text-center italic text-muted-foreground">No data to report yet.</p>
      )}
    </div>
  );
}
