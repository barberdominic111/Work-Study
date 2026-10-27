# Work Study data exchange contract (schemaVersion 1.0)

Work Study stays the system of record for work definitions, standard times and process/VSM models.
The Improvement Tracker (and any workbook) reads **immutable JSON snapshots** exported from
Settings > Open data exchange. Nothing needs a server, database or login.

## Envelope (every export)

```json
{
  "schemaVersion": "1.0",
  "sourceApp": "WorkStudy",
  "sourceRecordId": "PR-0001",
  "recordType": "process | sequence | element | vsm | export-all",
  "exportedAt": "ISO-8601 timestamp",
  "revision": 3,
  "recordStatus": "draft | active | approved | retired",
  "units": { "time": "seconds", "normalizedTime": "seconds per unit", "volume": "units per year unless stated" },
  "timeProvenance": "text describing how time values are stored",
  "manifest": { "counts": { "process": 1, "sequence": 2, "element": 7 },
                "contents": [ { "recordType": "element", "id": "WE-0001", "revision": 1, "recordStatus": "active" } ] },
  "record": { }
}
```

Records are joined only by permanent IDs (WE-, WS-, PR-, PF-, VSM-, TSE-), never by name or position.
Unknown values are `null`, never 0.

## Record contents

- **process**: `process`, `sequences[]` (with `elementIds` and `totals`), `elements[]` (each with a `standardTime` block),
  `relationships`, `timeStudyEvidence[]` summaries, `vsmReferences[]`, `portfolioReferences[]`.
- **sequence**: `sequence`, `process` reference, `elements[]`, `relationships`, `timeStudyEvidence[]`.
- **element**: `element` (with `standardTime`), `usedInSequences[]`, `improvementIds[]`, `timeStudyEvidence[]`.
- **vsm**: `vsm` (all states, nodes, connections, scenario overrides, captured snapshot), `states[]`,
  `snapshot` (capturedAt, per-sequence captured and current revisions), `processReferences[]`,
  `changeDetection.differences[]` (the same check the VSM tab shows), `results[]`.
- **export-all**: `records[]`, each `{ recordType, sourceRecordId, revision, recordStatus, createdAt, updatedAt, record }`.

### standardTime block (per element)
`seconds` (selected standard), `selectedSource` (MOST, Time Study, Estimate, Historical Observed or Manual),
`normalizedSecondsPerUnit`, `frequency`, `unitsPerOccurrence`, `sources{}` (all five stored values or null),
`provenance` (study ID and import date if a reviewed TimeStudy value was applied, otherwise null).

## Metadata fields
`createdAt`, `updatedAt`, `revision`, `recordStatus` on elements, sequences, processes, portfolios and value streams.
`revision` increases when content that defines a standard or process changes (not for notes, keywords or
descriptions on elements). Records created before this update show `createdAt: null` (unknown).
`improvementIds[]` (optional, many per record) on elements, sequences and processes is set only by the user.

## TimeStudy evidence import (what Work Study expects)

Work Study reads TimeStudy JSON in the same envelope shape:

```json
{
  "schemaVersion": "1.x",
  "sourceApp": "TimeStudy",
  "sourceRecordId": "study id",
  "recordType": "timeStudy",
  "exportedAt": "ISO-8601",
  "record": {
    "name": "...", "units": "seconds",
    "samples": [4.8, 5.2, 5.0],
    "statistics": { "mean": 5.0, "median": 5.0, "min": 4.8, "max": 5.2, "stdDev": 0.2, "count": 3 },
    "target": 5.0,
    "updatedAt": "ISO-8601",
    "process": { "id": "PR-0001", "name": "..." },
    "sequence": { "id": "WS-0001", "name": "..." },
    "element": { "id": "WE-0002", "name": "..." }
  }
}
```

The parser is tolerant of common alternative field names (for example `observations`, `stats`, `targetTime`).
It needs `schemaVersion` 1.x, `sourceApp` TimeStudy, a study ID, and samples or statistics. If your real
TimeStudy export differs, send a sample file and the field mapping can be adjusted.

Import rules: the study is stored as **evidence** (TSE-xxxx) with its source ID and import time, linked only to
the element, sequence or process you choose. Importing never changes a standard time, an element, or a VSM
snapshot. A candidate time can be proposed from the evidence; applying it is a separate, two-tap review that
writes only the element's Time Study field, never the selected source, and is blocked for approved elements.
