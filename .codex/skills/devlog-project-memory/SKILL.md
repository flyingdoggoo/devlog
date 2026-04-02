---
name: devlog-project-memory
description: Persistent context memory for the DevLog repository (React/Vite frontend + NestJS/Prisma backend). Use when starting or continuing any task in this project to quickly recover architecture, existing features, UI/UX patterns, routes, API contracts, and implementation conventions before coding.
---

# Devlog Project Memory

Use this skill as an onboarding primer for the current state of this repository.

## Workflow

1. Read [references/project-context.md](references/project-context.md) at the start of the task.
2. Identify affected scope: `frontend`, `backend`, or both.
3. Apply existing conventions first; avoid introducing a new pattern unless needed.
4. Verify assumptions against real files before editing.
5. After major feature work, update `references/project-context.md` to keep memory current.

## Guardrails

- Treat the reference file as a fast map, not absolute truth.
- Prefer consistency with existing route structure, API response shape, and UI language.
- Keep edits incremental and compatible with current architecture.
- When unsure, inspect real source files in the repository and reconcile drift.

## References

- Project snapshot and conventions: [references/project-context.md](references/project-context.md)
