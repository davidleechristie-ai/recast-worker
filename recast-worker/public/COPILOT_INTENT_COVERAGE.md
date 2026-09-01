# Recast Copilot intent coverage — V24

The homepage Copilot is a local deterministic intent layer. It does not call a hosted LLM. V24 expands its coverage so natural-language requests either produce a supported workflow or route to the correct Recast tool instead of returning an empty pipeline.

## Workflow intents covered
- JSON ↔ CSV
- JSON ↔ XML
- JSON ↔ YAML
- JSON ↔ Markdown
- Flatten / unflatten nested data
- Select / remove / rename fields
- Filter records: equals, not-equals, contains, starts-with, ends-with, greater-than, less-than, exists, null/missing
- Sort records / sort JSON object keys
- Convert field types: string, number, integer, boolean, date
- Add/default fields
- Combine fields
- JSONPath extraction
- JSON validation
- XML validation
- JSON formatting / pretty-printing
- CSV / JSON / XML comparison
- API request step when an explicit HTTPS URL is supplied
- Automation wording (daily, weekly, hourly, every day, each morning) layered onto supported workflows

## Dedicated-tool intents covered
- Generate JSON Schema
- Validate JSON against JSON Schema
- JSON → TypeScript
- JSON → Zod
- JSON → Pydantic
- JSON → Python
- JSON → Go
- JSON → Swift
- JSON → Kotlin
- JSON → Rust
- JSON → Java
- JSON → C#
- JSON → SQL
- JSON minify / compact
- Inspect / explore JSON or API responses

## No-empty-response rule
If a request cannot be translated confidently into a supported workflow and does not map to a dedicated tool, Copilot routes to the Recast Choose-a-Tool guide with an explicit explanation. It does not invent a destructive workflow and does not show a zero-step dead end.

## Automated coverage
`src/workflow-copilot.test.mjs` includes:
- hand-written real-world prompts,
- synonym and phrase-variation matrices,
- comparison format safety checks,
- automation-intent checks,
- direct-tool routing checks,
- unknown-request no-nil checks,
- regression coverage for the original `compare two csv then output differences only` failure.

Current V24 coverage: 196 Copilot request variants, 0 failures before the full product test suite is run.
