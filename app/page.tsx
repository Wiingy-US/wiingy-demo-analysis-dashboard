"use client";

// TEMPORARY verification page for the data layer. No styling — it just fetches
// /api/sheet-data, runs the three aggregations, and dumps everything as JSON so
// we can eyeball the pipeline end to end. Replaced by the real dashboard later.

import { useEffect, useState } from "react";
import {
  eventCompliance,
  failureBucketCounts,
  outcomeSnapshot,
} from "@/lib/aggregations";
import type { SheetDataResponse } from "@/lib/types";

export default function Home() {
  const [data, setData] = useState<SheetDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sheet-data")
      .then((res) => res.json())
      .then((json: SheetDataResponse) => setData(json))
      .catch((err) => setError(String(err)));
  }, []);

  if (error) return <pre>Error: {error}</pre>;
  if (!data) return <pre>Loading…</pre>;

  const snapshot = outcomeSnapshot(data.rows);
  const buckets = failureBucketCounts(data.rows);
  const compliance = eventCompliance(data.rows);

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>Data layer verification</h1>

      <p>
        source: <b>{data.source}</b> · rowCount: <b>{data.rowCount}</b>
      </p>

      <h2>missingHeaders</h2>
      <pre>{JSON.stringify(data.missingHeaders, null, 2)}</pre>

      <h2>outcomeSnapshot</h2>
      <pre>{JSON.stringify(snapshot, null, 2)}</pre>

      <h2>failureBucketCounts</h2>
      <pre>{JSON.stringify(buckets, null, 2)}</pre>

      <h2>eventCompliance</h2>
      <pre>{JSON.stringify(compliance, null, 2)}</pre>

      <h2>rows</h2>
      <pre>{JSON.stringify(data.rows, null, 2)}</pre>
    </main>
  );
}
