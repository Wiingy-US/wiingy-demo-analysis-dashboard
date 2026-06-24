import type { Outcome } from "./constants";

/** Status of a single tracked event on a demo. */
export type EventStatus = "observed" | "not_observed" | "not_assessable";

/** A map of event name -> its observed status for one demo. */
export type EventStatusMap = Record<string, EventStatus>;

/**
 * One row of the "Demo Analysis" sheet, parsed by header name.
 *
 * Raw cell text is kept as-is for string fields; `failure_tags` is exploded
 * into an array, the `*_present` flags are coerced to booleans, and each event
 * is normalized into an {@link EventStatus}.
 */
export interface DemoRow {
  // Identifiers
  demo_id: string;
  date: string;
  advisor: string;
  tutor: string;
  subject: string;
  learner_type: string;
  source: string;

  // Outcome (raw cell; expected to be one of Outcome, but not guaranteed)
  outcome: Outcome | string;

  // Coverage of the 5 demo phases
  coverage_advisor_open: string;
  coverage_tutor_section: string;
  coverage_future_plan: string;
  coverage_advisor_feedback: string;
  coverage_enrollment_discussion: string;

  // Failure classification
  failure_tags: string[];
  coachable_present: boolean;
  structural_present: boolean;
  classification_confidence: string;
  failure_summary: string;

  // Per-event observed status
  events: EventStatusMap;
}

/** Response shape of GET /api/sheet-data. */
export interface SheetDataResponse {
  source: "live" | "mock";
  rowCount: number;
  missingHeaders: string[];
  rows: DemoRow[];
}
