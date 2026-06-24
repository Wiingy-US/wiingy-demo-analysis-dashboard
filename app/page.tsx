"use client";

import { useEffect, useState } from "react";
import EventComplianceGrid from "@/components/EventComplianceGrid";
import FailureBucketChart from "@/components/FailureBucketChart";
import OutcomeSnapshot from "@/components/OutcomeSnapshot";
import {
  eventCompliance,
  failureBucketCounts,
  outcomeSnapshot,
} from "@/lib/aggregations";
import type { SheetDataResponse } from "@/lib/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const [data, setData] = useState<SheetDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/sheet-data")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((json: SheetDataResponse) => {
        if (active) setData(json);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Couldn&apos;t load demo data: {error}
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-neutral-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-neutral-400">Loading demo analytics…</p>
        </div>
      </main>
    );
  }

  const snapshot = outcomeSnapshot(data.rows);
  const buckets = failureBucketCounts(data.rows);
  const compliance = eventCompliance(data.rows);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Demo Analytics
          </h1>
          <p className="text-sm text-neutral-500">
            <span className="capitalize">{data.source}</span> data ·{" "}
            {data.rowCount} demos
          </p>
        </header>

        {data.missingHeaders.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <span className="font-medium">Missing expected columns:</span>{" "}
            {data.missingHeaders.join(", ")}
          </div>
        )}

        <Section title="Outcome snapshot">
          <OutcomeSnapshot {...snapshot} />
        </Section>

        <Section title="Failure buckets (lost + in-progress demos)">
          <FailureBucketChart data={buckets} />
        </Section>

        <Section title="Event compliance">
          <EventComplianceGrid data={compliance} />
        </Section>
      </div>
    </main>
  );
}
