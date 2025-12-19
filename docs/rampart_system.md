# Rampart `system.json` — Specification (Rails App + N Engines)

This document defines the **authoritative specification** for `system.json` in a Rampart‑managed project that consists of **one Rails application and N Rails engines (bounded contexts)**.

The intent is to:
- keep bounded‑context architecture local and independent
- make system‑level discovery deterministic
- avoid duplicating framework or BC‑level concerns

---

## 1. Purpose of `system.json`

`system.json` is a **root‑level manifest** that tells Rampart:

1. Where the Rails app lives
2. Where engines live (and which are in scope)
3. Where to find each engine's architecture definition (in `architecture/` directory)
4. Which architecture profile(s) apply
5. Which rules apply **across** bounded contexts

It is **not** a replacement for per‑engine architecture files, but it consolidates their location in the `architecture/` directory.

---

## 2. File Location

- Required location: **architecture directory under project root**

```
./architecture/system.json
```

This centralizes all architecture definitions and allows Rampart to run with zero configuration flags.

---

## 3. High‑Level Structure

```jsonc
{
  "schema_version": "1.0",
  "system": { ... },
  "rails_app": { ... },
  "engines": { ... },
  "profiles": { ... },
  "discovery": { ... },
  "system_constraints": { ... },
  "diagram_defaults": { ... }
}
```

---

## 4. Top‑Level Fields

### 4.1 `schema_version`

```json
"schema_version": "1.0"
```

Version of the `system.json` schema. Used for backward compatibility and migrations.

---

### 4.2 `system`

```jsonc
"system": {
  "id": "cat_alog",
  "name": "Cat‑alog",
  "description": "Optional human‑readable description"
}
```

- `id`: stable, machine‑readable system identifier
- `name`: human‑readable system name
- `description`: optional

---

### 4.3 `rails_app`

```jsonc
"rails_app": {
  "root": "apps/web",
  "env": "RAILS_ENV"
}
```

- `root` (required): path to the Rails application root (where `config/` lives)
- `env` (optional): environment variable Rampart should respect

---

### 4.4 `engines`

```jsonc
"engines": {
  "base_dir": "engines",
  "items": [ ... ]
}
```

#### Engine item schema

```jsonc
{
  "id": "cat_content",
  "engine_name": "cat_content",
  "path": "engines/cat_content",
  "architecture_file": "architecture/cat_content.json",
  "enabled": true
}
```

**Field meanings:**

- `id` (required): stable bounded‑context identifier (should not change)
- `engine_name`: folder / Rails engine name (often same as id)
- `path` (required): explicit path to the engine root
- `architecture_file`: path to BC architecture file in `architecture/` directory (named by BC id: `architecture/{id}.json`)
- `enabled`: whether Rampart should include this engine

**Why explicit paths?**
To avoid guesswork and make tooling deterministic.

---

## 5. Profiles

```jsonc
"profiles": {
  "default": "rampart_hexddd_v1",
  "overrides": [
    { "bounded_context": "cat_content", "profile": "rampart_hexddd_v1" }
  ]
}
```

Profiles define **framework‑level rules** (layering, dependencies, invariants).

- `default`: applied to all engines unless overridden
- `overrides`: per‑BC profile selection

Profiles live outside BC `architecture.json` files to avoid duplication.

---

## 6. Discovery Rules

```jsonc
"discovery": {
  "architecture_filename": "cat_content.json",
  "strict_engine_list": true,
  "ignore": [
    "vendor/**",
    "tmp/**",
    "node_modules/**",
    ".git/**",
    "worktrees/**"
  ]
}
```

- `architecture_filename`: expected BC architecture file naming pattern (BC id-based: `{id}.json`)
- `strict_engine_list`: if true, only engines listed in `system.json` are validated
- `ignore`: glob patterns to skip during scanning

---

## 7. System‑Level Constraints

```jsonc
"system_constraints": {
  "integration": [],
  "shared_kernel": [],
  "global_rules": []
}
```

These apply **across bounded contexts** only.

### 7.1 Integration rules

```jsonc
{
  "from": "cat_content",
  "to": "billing",
  "style": "events_only",
  "notes": "No synchronous calls allowed"
}
```

### 7.2 Shared kernel declarations (rare)

```jsonc
{
  "id": "money",
  "owned_by": "shared",
  "used_by": ["cat_content", "billing"],
  "notes": "Types only; no domain logic"
}
```

### 7.3 Global rules

```jsonc
{
  "id": "no_cross_engine_domain_imports",
  "statement": "Engines must not import each other’s Domain layer; integrate via ports or events."
}
```

---

## 8. Diagram Defaults

```jsonc
"diagram_defaults": {
  "levels": ["L1_context", "L2_layers", "L3_components"]
}
```

Provides sensible defaults for diagram generation.

---

## 9. Minimal Example

```json
{
  "schema_version": "1.0",
  "system": { "id": "cat_alog", "name": "Cat‑alog" },
  "rails_app": { "root": "apps/web" },
  "engines": {
    "base_dir": "engines",
    "items": [
      { "id": "cat_content", "engine_name": "cat_content", "path": "engines/cat_content", "architecture_file": "architecture/cat_content.json", "enabled": true },
      { "id": "billing", "engine_name": "billing", "path": "engines/billing", "architecture_file": "architecture/billing.json", "enabled": true }
    ]
  },
  "profiles": { "default": "rampart_hexddd_v1" },
  "discovery": { "architecture_filename": "cat_content.json", "strict_engine_list": true },
  "system_constraints": { "integration": [], "shared_kernel": [], "global_rules": [] }
}
```

---

## 10. Design Principles Recap

- One architecture file per bounded context (in `architecture/` directory, named `{id}.json`)
- `system.json` is thin, declarative, and deterministic
- All architecture definitions centralized in `architecture/` directory
- No duplication of framework or BC‑level rules
- Optimized for tooling, CI, and AI agents

### Directory Structure

```
project-root/
├── architecture/
│   ├── system.json           # System-level manifest
│   ├── cat_content.json      # Cat & Content BC architecture
│   └── billing.json          # Billing BC architecture (example)
├── prompts/
│   ├── architecture.prompt   # Guides architecture.json design
│   └── planning.prompt       # Guides spec completion
├── engines/
│   ├── cat_content/          # Engine implementation
│   │   ├── specs/            # Capability specs
│   │   │   ├── browse_catalog.spec.md
│   │   │   ├── generate_custom_cat.spec.md
│   │   │   ├── manage_catalog.spec.md
│   │   │   └── moderate_custom_cats.spec.md
│   │   └── app/              # Domain/Application/Infrastructure
│   └── billing/              # Engine implementation
│       ├── specs/            # Capability specs
│       └── app/              # Domain/Application/Infrastructure
└── apps/
    └── web/                  # Rails app
```

This document is the canonical reference for `system.json` in Rampart.

