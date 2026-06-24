import {
  EVENT_NAMES,
  EXPECTED_HEADERS,
  SHEET_TAB,
  eventStatusHeader,
} from "@/lib/constants";
import { mockRows } from "@/lib/mockData";
import type {
  DemoRow,
  EventStatus,
  EventStatusMap,
  SheetDataResponse,
} from "@/lib/types";

// Reads process.env and fetches a live sheet at request time — never cache.
export const dynamic = "force-dynamic";

type HeaderIndex = Record<string, number>;

const TRUE_VALUES = new Set(["true", "1", "yes", "y", "t"]);

function toBool(raw: string): boolean {
  return TRUE_VALUES.has(raw.trim().toLowerCase());
}

function splitTags(raw: string): string[] {
  return raw
    .split("|")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function parseEventStatus(raw: string): EventStatus {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "observed") return "observed";
  if (value === "not_observed") return "not_observed";
  // Unknown / empty cells are treated as not assessable so they don't skew
  // compliance denominators.
  return "not_assessable";
}

function buildHeaderIndex(headerRow: string[]): HeaderIndex {
  const index: HeaderIndex = {};
  headerRow.forEach((header, i) => {
    const key = header.trim();
    // First occurrence wins if a header is duplicated.
    if (key && !(key in index)) index[key] = i;
  });
  return index;
}

function buildRow(index: HeaderIndex, row: string[]): DemoRow {
  const get = (name: string): string => {
    const i = index[name];
    if (i === undefined) return "";
    return (row[i] ?? "").toString();
  };

  const events: EventStatusMap = {};
  for (const name of EVENT_NAMES) {
    events[name] = parseEventStatus(get(eventStatusHeader(name)));
  }

  return {
    demo_id: get("demo_id"),
    date: get("date"),
    advisor: get("advisor"),
    tutor: get("tutor"),
    subject: get("subject"),
    learner_type: get("learner_type"),
    source: get("source"),
    outcome: get("outcome"),

    coverage_advisor_open: get("coverage_advisor_open"),
    coverage_tutor_section: get("coverage_tutor_section"),
    coverage_future_plan: get("coverage_future_plan"),
    coverage_advisor_feedback: get("coverage_advisor_feedback"),
    coverage_enrollment_discussion: get("coverage_enrollment_discussion"),

    failure_tags: splitTags(get("failure_tags")),
    coachable_present: toBool(get("coachable_present")),
    structural_present: toBool(get("structural_present")),
    classification_confidence: get("classification_confidence"),
    failure_summary: get("failure_summary"),

    events,
  };
}

function missingFrom(index: HeaderIndex): string[] {
  return EXPECTED_HEADERS.filter((header) => !(header in index));
}

function mockPayload(missingHeaders: string[] = []): SheetDataResponse {
  return {
    source: "mock",
    rowCount: mockRows.length,
    missingHeaders,
    rows: mockRows,
  };
}

export async function GET() {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.SHEET_ID;

  // No credentials configured -> fall back to mock data instead of crashing.
  if (!apiKey || !sheetId) {
    return Response.json(mockPayload());
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      SHEET_TAB,
    )}?key=${apiKey}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return Response.json(mockPayload());
    }

    const json: { values?: string[][] } = await res.json();
    const values = json.values ?? [];

    // Need at least a header row plus one data row.
    if (values.length < 2) {
      const index = values.length === 1 ? buildHeaderIndex(values[0]) : {};
      return Response.json(mockPayload(missingFrom(index)));
    }

    const index = buildHeaderIndex(values[0]);
    const missingHeaders = missingFrom(index);

    const rows = values
      .slice(1)
      // Drop entirely-empty rows that the Sheets API can return.
      .filter((row) => row.some((cell) => (cell ?? "").toString().trim() !== ""))
      .map((row) => buildRow(index, row));

    if (rows.length === 0) {
      return Response.json(mockPayload(missingHeaders));
    }

    const payload: SheetDataResponse = {
      source: "live",
      rowCount: rows.length,
      missingHeaders,
      rows,
    };
    return Response.json(payload);
  } catch {
    // Any network/parse failure -> mock data, never crash the page.
    return Response.json(mockPayload());
  }
}
