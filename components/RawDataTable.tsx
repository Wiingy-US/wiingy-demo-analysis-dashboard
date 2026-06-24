import { EVENTS } from "@/lib/constants";
import type { DemoRow, EventStatus } from "@/lib/types";

/** Tint for the outcome cell — reuses the semantic green / red / amber. */
function outcomeTint(outcome: string): string {
  switch (outcome.trim().toUpperCase()) {
    case "WON":
      return "bg-green-50 text-green-700";
    case "LOST":
      return "bg-red-50 text-red-700";
    case "WIP":
      return "bg-amber-50 text-amber-700";
    default:
      return "text-neutral-600";
  }
}

/** Light tint for an event-status cell. */
function statusTint(status: EventStatus | undefined): string {
  switch (status) {
    case "observed":
      return "bg-green-50 text-green-700";
    case "not_observed":
      return "text-neutral-500";
    case "not_assessable":
    default:
      return "text-neutral-300"; // muted
  }
}

const TH =
  "sticky top-0 z-10 whitespace-nowrap border-b border-neutral-200 bg-neutral-100 px-3 py-2 text-left font-medium text-neutral-600";
const TD = "whitespace-nowrap border-b border-neutral-100 px-3 py-1.5";

interface RawDataTableProps {
  rows: DemoRow[];
  source: "live" | "mock";
}

export default function RawDataTable({ rows, source }: RawDataTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-200 bg-white p-6 text-sm text-neutral-500">
        No demos to show yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-neutral-500">
        {rows.length} demos · <span className="capitalize">{source}</span> data
      </p>

      <div className="max-h-[70vh] overflow-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>demo_id</th>
              <th className={TH}>date</th>
              <th className={TH}>advisor</th>
              <th className={TH}>tutor</th>
              <th className={TH}>subject</th>
              <th className={TH}>learner_type</th>
              <th className={TH}>source</th>
              <th className={TH}>outcome</th>
              <th className={TH}>failure_tags</th>
              <th className={TH}>confidence</th>
              {EVENTS.map((event) => (
                <th key={event.name} className={TH}>
                  {event.label}
                </th>
              ))}
              <th className={TH}>student_intent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.demo_id || i} className="hover:bg-neutral-50">
                <td className={`${TD} font-mono tabular-nums text-neutral-700`}>
                  {row.demo_id}
                </td>
                <td className={`${TD} font-mono tabular-nums text-neutral-700`}>
                  {row.date}
                </td>
                <td className={`${TD} text-neutral-700`}>{row.advisor}</td>
                <td className={`${TD} text-neutral-700`}>{row.tutor}</td>
                <td className={`${TD} text-neutral-700`}>{row.subject}</td>
                <td className={`${TD} text-neutral-700`}>{row.learner_type}</td>
                <td className={`${TD} text-neutral-700`}>{row.source}</td>
                <td
                  className={`${TD} font-medium ${outcomeTint(String(row.outcome))}`}
                >
                  {row.outcome}
                </td>
                <td className={`${TD} text-neutral-700`}>
                  {row.failure_tags.join(", ")}
                </td>
                <td className={`${TD} text-neutral-700`}>
                  {row.classification_confidence}
                </td>
                {EVENTS.map((event) => {
                  const status = row.events[event.name];
                  return (
                    <td
                      key={event.name}
                      className={`${TD} ${statusTint(status)}`}
                    >
                      {status ?? "—"}
                    </td>
                  );
                })}
                <td className={`${TD} text-neutral-700`}>
                  {row.student_intent ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
