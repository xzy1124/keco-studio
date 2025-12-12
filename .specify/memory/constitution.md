<!--
Sync Impact Report
- Version change: none -> 1.0.0
- Modified principles: initial draft
- Added sections: Core Principles, Additional Constraints, Development Workflow, Governance
- Templates requiring updates: ⚠ .specify/templates/plan-template.md; ⚠ .specify/templates/spec-template.md; ⚠ .specify/templates/tasks-template.md; ⚠ .cursor/commands/speckit.*.md (review phrasing if needed)
- Follow-up TODOs: none
-->

# Keco Studio Constitution

## Core Principles

### I. Pixel-Perfect Responsive Delivery
Implement UI to match F2C MCP Figma designs with pixel-level fidelity, covering spacing, sizing, typography, and interaction states; ensure responsive behavior across breakpoints without hydration issues.

### II. App Router & Supabase Integrity
Use Next.js App Router with correct client/server boundaries and on-demand imports to avoid hydration errors; all Supabase access must respect RLS with schema managed by migrations and data validated on both client and server.

### III. Typed Minimal & Documented Code
Keep dependencies minimal and pinned in package.json; use TypeScript strict mode with no implicit any; style with .module.css only, sharing CSS variables for colors/spacing/radii; document non-obvious logic.

### IV. Resilient Async & Error Handling
Handle every async path with explicit error states and fallbacks to prevent crashes; surface meaningful Supabase/network errors; degrade gracefully when data is unavailable.

### V. Simplicity & Single Responsibility
Favor small, composable components with clear semantics; reuse styles and logic instead of duplicating; keep control flow straightforward.

## Additional Constraints
- Styling: .module.css only; define reusable CSS variables; prevent global leakage.
- Performance: Import components/data lazily where feasible; avoid unused dependencies.
- Data: Supabase interactions must align with migrations and RLS; never bypass policies.

## Development Workflow
- Manage all schema changes via migrations; verify RLS behavior before release.
- For UI work, validate against Figma (F2C MCP) for pixel fidelity and responsive states.
- Enforce TypeScript strict, lint, and build checks; avoid any; ensure async paths handle errors.
- Use CSS modules with shared variables; prefer reuse over duplication; document intent where needed.

## Governance
- This constitution guides feature and code decisions; conflicting practices must be aligned to it.
- Amendments require rationale and a semantic version bump (MAJOR for breaking governance, MINOR for new principles/sections, PATCH for clarifications).
- Reviews must check compliance with principles, RLS safety, and Figma pixel fidelity.

**Version**: 1.0.0 | **Ratified**: 2025-12-10 | **Last Amended**: 2025-12-10
