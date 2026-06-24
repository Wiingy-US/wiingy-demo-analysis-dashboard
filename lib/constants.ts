// Vocabulary for the Demo Analysis dashboard.
//
// Everything here is referenced by header NAME, never by column index, so the
// data layer keeps working if columns are reordered in the source sheet.

export const SHEET_TAB = "Demo Analysis";

// --- Identifier + outcome headers ---------------------------------------
export const IDENTIFIER_HEADERS = [
  "demo_id",
  "date",
  "advisor",
  "tutor",
  "subject",
  "learner_type",
  "source",
  "outcome",
] as const;

export const OUTCOMES = ["WON", "LOST", "WIP"] as const;
export type Outcome = (typeof OUTCOMES)[number];

// --- Coverage headers (the 5 demo phases we expect to be covered) -------
export const COVERAGE_HEADERS = [
  "coverage_advisor_open",
  "coverage_tutor_section",
  "coverage_future_plan",
  "coverage_advisor_feedback",
  "coverage_enrollment_discussion",
] as const;
export type CoverageHeader = (typeof COVERAGE_HEADERS)[number];

// --- Failure-classification headers -------------------------------------
export const FAILURE_HEADERS = [
  "failure_tags",
  "coachable_present",
  "structural_present",
  "classification_confidence",
  "failure_summary",
] as const;

// --- Failure buckets -----------------------------------------------------
export const COACHABLE_BUCKETS = [
  "advisor_execution_gap",
  "tutor_execution_gap",
  "tutor_mismatch",
] as const;

export const STRUCTURAL_BUCKETS = [
  "affordability",
  "decision_maker_absent",
  "low_intent",
  "operational_blocker",
  "trust_brand",
] as const;

export type CoachableBucket = (typeof COACHABLE_BUCKETS)[number];
export type StructuralBucket = (typeof STRUCTURAL_BUCKETS)[number];
export type Bucket = CoachableBucket | StructuralBucket;
export type BucketKind = "coachable" | "structural";

/** Look up whether a bucket is coachable or structural (null if unknown). */
export function bucketKind(bucket: string): BucketKind | null {
  if ((COACHABLE_BUCKETS as readonly string[]).includes(bucket)) return "coachable";
  if ((STRUCTURAL_BUCKETS as readonly string[]).includes(bucket)) return "structural";
  return null;
}

// --- Events --------------------------------------------------------------
// Each event has a status column named "<event>_status" in the sheet.
// `group` drives the two-column compliance grid.

export type EventGroup = "advisor" | "tutor_process";

export interface EventDef {
  name: string;
  label: string;
  group: EventGroup;
}

export const EVENTS: readonly EventDef[] = [
  // Advisor-driven sales / follow-up actions
  {
    name: "collected_feedback_after_tutor_exit",
    label: "Collected feedback after tutor exit",
    group: "advisor",
  },
  {
    name: "offered_sub_after_package_resistance",
    label: "Offered substitute after package resistance",
    group: "advisor",
  },
  {
    name: "offered_cheaper_tutor_after_affordability",
    label: "Offered cheaper tutor after affordability concern",
    group: "advisor",
  },
  {
    name: "set_tangible_followup_for_wip",
    label: "Set tangible follow-up for WIP",
    group: "advisor",
  },
  {
    name: "recommended_specific_lesson_count",
    label: "Recommended a specific lesson count",
    group: "advisor",
  },
  {
    name: "proposed_next_class_date",
    label: "Proposed next class date",
    group: "advisor",
  },
  // The demo session itself / logistics
  {
    name: "kept_session_interactive",
    label: "Kept session interactive",
    group: "tutor_process",
  },
  {
    name: "proposed_future_lesson_plan",
    label: "Proposed future lesson plan",
    group: "tutor_process",
  },
  {
    name: "guardian_present_for_minor",
    label: "Guardian present for minor",
    group: "tutor_process",
  },
  {
    name: "original_tutor_showed_up",
    label: "Original tutor showed up",
    group: "tutor_process",
  },
] as const;

export const EVENT_NAMES = EVENTS.map((e) => e.name);

/** The "<event>_status" header for each event. */
export const EVENT_STATUS_HEADERS = EVENT_NAMES.map((name) => `${name}_status`);

export function eventStatusHeader(name: string): string {
  return `${name}_status`;
}

// --- All headers we expect to find in row 1 of the sheet ----------------
export const EXPECTED_HEADERS = [
  ...IDENTIFIER_HEADERS,
  ...COVERAGE_HEADERS,
  ...FAILURE_HEADERS,
  ...EVENT_STATUS_HEADERS,
] as const;

// --- Color tokens --------------------------------------------------------
export const COLORS = {
  coachable: "#16a34a", // green
  structural: "#f59e0b", // amber
} as const;

/** Event-grid compliance thresholds, in percent. */
export const EVENT_GRID_THRESHOLDS = {
  green: 75, // observedPct >= 75
  amber: 40, // 40 <= observedPct < 75  (below 40 is red)
} as const;

export const EVENT_GRID_COLORS = {
  green: "#16a34a",
  amber: "#f59e0b",
  red: "#dc2626",
} as const;

/** Pick the grid color for a compliance percentage (null -> neutral gray). */
export function complianceColor(observedPct: number | null): string {
  if (observedPct === null) return "#9ca3af"; // gray for "not assessable"
  if (observedPct >= EVENT_GRID_THRESHOLDS.green) return EVENT_GRID_COLORS.green;
  if (observedPct >= EVENT_GRID_THRESHOLDS.amber) return EVENT_GRID_COLORS.amber;
  return EVENT_GRID_COLORS.red;
}
