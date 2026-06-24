import type { OutcomeSnapshot as OutcomeSnapshotData } from "@/lib/aggregations";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-5">
      <span className="text-3xl font-semibold tabular-nums text-neutral-900">
        {value}
      </span>
      <span className="text-sm text-neutral-500">{label}</span>
      {sub ? (
        <span className="text-xs tabular-nums text-neutral-400">{sub}</span>
      ) : (
        // keep card heights aligned when there is no sub line
        <span className="text-xs text-transparent">—</span>
      )}
    </div>
  );
}

export default function OutcomeSnapshot({
  total,
  wonPct,
  lostPct,
  wipPct,
  counts,
}: OutcomeSnapshotData) {
  const ofTotal = (n: number) => `${n} of ${total}`;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Total demos" value={String(total)} />
      <StatCard label="Won" value={`${wonPct}%`} sub={ofTotal(counts.WON)} />
      <StatCard label="Lost" value={`${lostPct}%`} sub={ofTotal(counts.LOST)} />
      <StatCard label="WIP" value={`${wipPct}%`} sub={ofTotal(counts.WIP)} />
    </div>
  );
}
