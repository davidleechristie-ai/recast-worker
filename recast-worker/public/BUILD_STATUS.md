# Recast V38.1 — AI Copilot Structured Output Fix

Built from V38.

OpenAI Structured Outputs rejected V38 because the workflow step `params` schema allowed arbitrary properties.

V38.1:
- sets `additionalProperties: false` on every strict-schema object;
- explicitly defines all supported Recast step parameters;
- uses nullable fields for parameters that do not apply to a particular step;
- keeps every object property required, as expected by strict Structured Outputs;
- preserves server-side allow-listing and normalisation;
- adds a regression test that recursively checks strict-schema object closure.

No OpenAI key change is required.
