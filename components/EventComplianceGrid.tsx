import { complianceColor } from "@/lib/constants";
import type { EventCompliance } from "@/lib/aggregations";

function ComplianceCell({ item }: { item: EventCompliance }) {
  const isNa = item.denominator === 0 || item.observedPct === null;
  // complianceColor returns a neutral gray for null, so "n/a" is never red.
  const color = complianceColor(item.observedPct);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-100 py-2 last:border-b-0">
      <span className="text-sm text-neutral-700">{item.label}</span>
      <div className="flex items-baseline gap-2">
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color }}
        >
          {isNa ? "n/a" : `${item.observedPct}%`}
        </span>
        <span className="w-12 text-right text-xs tabular-nums text-neutral-400">
          n = {item.denominator}
        </span>
      </div>
    </div>
  );
}

function Column({
  heading,
  items,
}: {
  heading: string;
  items: EventCompliance[];
}) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
        {heading}
      </h3>
      <div className="rounded-lg border border-neutral-200 bg-white px-4">
        {items.map((item) => (
          <ComplianceCell key={item.event} item={item} />
        ))}
      </div>
    </div>
  );
}

interface EventComplianceGridProps {
  data: EventCompliance[];
}

export default function EventComplianceGrid({ data }: EventComplianceGridProps) {
  const advisor = data.filter((d) => d.group === "advisor");
  const tutorProcess = data.filter((d) => d.group === "tutor_process");

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Column heading="Advisor" items={advisor} />
      <Column heading="Tutor & process" items={tutorProcess} />
    </div>
  );
}
