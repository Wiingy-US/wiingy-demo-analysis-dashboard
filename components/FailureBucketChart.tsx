"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COLORS } from "@/lib/constants";
import type { FailureBucketCount } from "@/lib/aggregations";

/** advisor_execution_gap -> "Advisor execution gap" */
function humanize(bucket: string): string {
  const spaced = bucket.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

interface FailureBucketChartProps {
  data: FailureBucketCount[];
}

export default function FailureBucketChart({ data }: FailureBucketChartProps) {
  // The aggregation returns every known bucket (including zero counts); only
  // chart the ones that actually occurred.
  const bars = data
    .filter((d) => d.count > 0)
    .map((d) => ({ ...d, label: humanize(d.bucket) }));

  if (bars.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-200 bg-white p-6 text-sm text-neutral-500">
        No failure tags yet — there are no lost or in-progress demos to break
        down.
      </p>
    );
  }

  const height = bars.length * 44 + 24;

  return (
    <div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={bars}
            margin={{ top: 4, right: 32, bottom: 4, left: 8 }}
          >
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              stroke="#e5e5e5"
            />
            <YAxis
              type="category"
              dataKey="label"
              width={180}
              tick={{ fontSize: 12, fill: "#404040" }}
              stroke="#e5e5e5"
            />
            <Tooltip cursor={{ fill: "#f5f5f5" }} />
            <Bar
              dataKey="count"
              name="Demos"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            >
              {bars.map((entry) => (
                <Cell
                  key={entry.bucket}
                  fill={entry.kind === "coachable" ? COLORS.coachable : COLORS.structural}
                />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fontSize: 12, fill: "#404040" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-neutral-400">
        Bars don&apos;t sum to the total — a single demo can carry multiple
        failure tags.
      </p>
    </div>
  );
}
