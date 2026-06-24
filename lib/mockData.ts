import { EVENT_NAMES } from "./constants";
import type { DemoRow, EventStatus, EventStatusMap } from "./types";

/**
 * Build a full event map, defaulting every event to "observed" and applying
 * any per-event overrides. Keeps the mock rows below readable.
 */
function events(overrides: Record<string, EventStatus> = {}): EventStatusMap {
  const map: EventStatusMap = {};
  for (const name of EVENT_NAMES) {
    map[name] = overrides[name] ?? "observed";
  }
  return map;
}

/**
 * Mock fixtures used when the live Google Sheet is unavailable or empty.
 * Covers WON / LOST / WIP, multiple multi-tag failure rows, and several
 * events marked not_assessable.
 */
export const mockRows: DemoRow[] = [
  {
    demo_id: "DEMO-1001",
    date: "2026-06-01",
    advisor: "Priya",
    tutor: "Marcus",
    subject: "Math",
    learner_type: "adult",
    source: "website",
    outcome: "WON",
    coverage_advisor_open: "covered",
    coverage_tutor_section: "covered",
    coverage_future_plan: "covered",
    coverage_advisor_feedback: "covered",
    coverage_enrollment_discussion: "covered",
    failure_tags: [],
    coachable_present: false,
    structural_present: false,
    classification_confidence: "high",
    failure_summary: "",
    // adult learner: guardian event does not apply
    events: events({ guardian_present_for_minor: "not_assessable" }),
  },
  {
    demo_id: "DEMO-1002",
    date: "2026-06-02",
    advisor: "Priya",
    tutor: "Lena",
    subject: "Physics",
    learner_type: "teen",
    source: "referral",
    outcome: "LOST",
    coverage_advisor_open: "covered",
    coverage_tutor_section: "partial",
    coverage_future_plan: "missing",
    coverage_advisor_feedback: "covered",
    coverage_enrollment_discussion: "partial",
    // multi-tag (structural)
    failure_tags: ["affordability", "low_intent"],
    coachable_present: false,
    structural_present: true,
    classification_confidence: "high",
    failure_summary: "Family flagged price; learner showed limited interest.",
    events: events({
      offered_cheaper_tutor_after_affordability: "not_observed",
      proposed_next_class_date: "not_observed",
      set_tangible_followup_for_wip: "not_assessable",
    }),
  },
  {
    demo_id: "DEMO-1003",
    date: "2026-06-03",
    advisor: "Sam",
    tutor: "Marcus",
    subject: "English",
    learner_type: "teen",
    source: "ads",
    outcome: "LOST",
    coverage_advisor_open: "partial",
    coverage_tutor_section: "covered",
    coverage_future_plan: "missing",
    coverage_advisor_feedback: "missing",
    coverage_enrollment_discussion: "missing",
    // multi-tag (coachable)
    failure_tags: ["advisor_execution_gap", "tutor_execution_gap"],
    coachable_present: true,
    structural_present: false,
    classification_confidence: "medium",
    failure_summary: "Advisor skipped feedback step; tutor ran a flat session.",
    events: events({
      collected_feedback_after_tutor_exit: "not_observed",
      kept_session_interactive: "not_observed",
      recommended_specific_lesson_count: "not_observed",
    }),
  },
  {
    demo_id: "DEMO-1004",
    date: "2026-06-04",
    advisor: "Sam",
    tutor: "Ravi",
    subject: "Chemistry",
    learner_type: "minor",
    source: "website",
    outcome: "WIP",
    coverage_advisor_open: "covered",
    coverage_tutor_section: "covered",
    coverage_future_plan: "partial",
    coverage_advisor_feedback: "covered",
    coverage_enrollment_discussion: "partial",
    failure_tags: ["operational_blocker"],
    coachable_present: false,
    structural_present: true,
    classification_confidence: "medium",
    failure_summary: "Scheduling conflict blocked enrollment this week.",
    events: events({
      proposed_next_class_date: "not_observed",
    }),
  },
  {
    demo_id: "DEMO-1005",
    date: "2026-06-05",
    advisor: "Priya",
    tutor: "Lena",
    subject: "Math",
    learner_type: "adult",
    source: "referral",
    outcome: "WON",
    coverage_advisor_open: "covered",
    coverage_tutor_section: "covered",
    coverage_future_plan: "covered",
    coverage_advisor_feedback: "covered",
    coverage_enrollment_discussion: "covered",
    failure_tags: [],
    coachable_present: false,
    structural_present: false,
    classification_confidence: "high",
    failure_summary: "",
    events: events({
      guardian_present_for_minor: "not_assessable",
      offered_sub_after_package_resistance: "not_assessable",
    }),
  },
  {
    demo_id: "DEMO-1006",
    date: "2026-06-06",
    advisor: "Sam",
    tutor: "Marcus",
    subject: "Biology",
    learner_type: "teen",
    source: "ads",
    outcome: "LOST",
    coverage_advisor_open: "covered",
    coverage_tutor_section: "partial",
    coverage_future_plan: "missing",
    coverage_advisor_feedback: "partial",
    coverage_enrollment_discussion: "missing",
    // multi-tag (mixed: one coachable + one structural)
    failure_tags: ["tutor_mismatch", "trust_brand"],
    coachable_present: true,
    structural_present: true,
    classification_confidence: "medium",
    failure_summary: "Subject mismatch with tutor; family unsure about brand.",
    events: events({
      kept_session_interactive: "not_observed",
      original_tutor_showed_up: "not_observed",
      proposed_future_lesson_plan: "not_observed",
    }),
  },
  {
    demo_id: "DEMO-1007",
    date: "2026-06-07",
    advisor: "Priya",
    tutor: "Ravi",
    subject: "Math",
    learner_type: "minor",
    source: "website",
    outcome: "WIP",
    coverage_advisor_open: "covered",
    coverage_tutor_section: "covered",
    coverage_future_plan: "covered",
    coverage_advisor_feedback: "partial",
    coverage_enrollment_discussion: "partial",
    failure_tags: ["decision_maker_absent"],
    coachable_present: false,
    structural_present: true,
    classification_confidence: "low",
    failure_summary: "Decision-making parent could not attend the demo.",
    events: events({
      offered_sub_after_package_resistance: "not_assessable",
      offered_cheaper_tutor_after_affordability: "not_assessable",
    }),
  },
];
