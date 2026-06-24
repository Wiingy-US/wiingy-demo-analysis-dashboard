// Pure aggregation helpers over DemoRow[]. No I/O, no React — safe on both
// the server and the client.

import {
  COACHABLE_BUCKETS,
  EVENTS,
  OUTCOMES,
  STRUCTURAL_BUCKETS,
  bucketKind,
  type BucketKind,
  type EventGroup,
  type Outcome,
} from "./constants";
import type { DemoRow } from "./types";

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10; // one decimal place
}

function normalizeOutcome(raw: string): Outcome | null {
  const value = raw.trim().toUpperCase();
  return (OUTCOMES as readonly string[]).includes(value) ? (value as Outcome) : null;
}

// --- Outcome snapshot ----------------------------------------------------

export interface OutcomeSnapshot {
  total: number;
  wonPct: number;
  lostPct: number;
  wipPct: number;
  counts: Record<Outcome, number>;
}

export function outcomeSnapshot(rows: DemoRow[]): OutcomeSnapshot {
  const counts: Record<Outcome, number> = { WON: 0, LOST: 0, WIP: 0 };
  for (const row of rows) {
    const outcome = normalizeOutcome(String(row.outcome));
    if (outcome) counts[outcome] += 1;
  }
  const total = rows.length;
  return {
    total,
    wonPct: pct(counts.WON, total),
    lostPct: pct(counts.LOST, total),
    wipPct: pct(counts.WIP, total),
    counts,
  };
}

// --- Failure bucket counts ----------------------------------------------

export interface FailureBucketCount {
  bucket: string;
  count: number;
  kind: BucketKind;
}

/**
 * Count each failure bucket across the exploded tags of LOST + WIP rows.
 * Returns one entry per known bucket (coachable then structural), sorted by
 * count descending.
 */
export function failureBucketCounts(rows: DemoRow[]): FailureBucketCount[] {
  const counts = new Map<string, number>();
  for (const bucket of [...COACHABLE_BUCKETS, ...STRUCTURAL_BUCKETS]) {
    counts.set(bucket, 0);
  }

  for (const row of rows) {
    const outcome = normalizeOutcome(String(row.outcome));
    if (outcome !== "LOST" && outcome !== "WIP") continue;
    for (const tag of row.failure_tags) {
      if (counts.has(tag)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([bucket, count]) => ({
      bucket,
      count,
      kind: bucketKind(bucket) as BucketKind,
    }))
    .sort((a, b) => b.count - a.count);
}

// --- Event compliance ----------------------------------------------------

export interface EventCompliance {
  event: string;
  label: string;
  group: EventGroup;
  observed: number;
  notObserved: number;
  denominator: number; // observed + not_observed (excludes not_assessable)
  observedPct: number | null; // null when denominator is 0
}

/**
 * Per event, the share of assessable demos where the event was observed.
 * not_assessable rows are excluded from both numerator and denominator.
 */
export function eventCompliance(rows: DemoRow[]): EventCompliance[] {
  return EVENTS.map((event) => {
    let observed = 0;
    let notObserved = 0;
    for (const row of rows) {
      const status = row.events[event.name];
      if (status === "observed") observed += 1;
      else if (status === "not_observed") notObserved += 1;
      // "not_assessable" and missing statuses are skipped
    }
    const denominator = observed + notObserved;
    return {
      event: event.name,
      label: event.label,
      group: event.group,
      observed,
      notObserved,
      denominator,
      observedPct: denominator === 0 ? null : pct(observed, denominator),
    };
  });
}
