# Rampart: Architecture on Rails — High‑Level Vision Document

## 1. Executive Summary

**Rampart** is an Architecture‑as‑Code toolkit designed to bring disciplined, maintainable architecture to Rails applications—without abandoning the productivity of the monolith.

As AI‑assisted development becomes ubiquitous, teams face a growing challenge: AI tools can accelerate coding but often introduce structural inconsistencies that erode architectural integrity over time. Meanwhile, teams want the rapid development Rails enables, but struggle to maintain clean boundaries as applications scale.

Rampart addresses both needs by providing:

- **Declarative architecture blueprints** that serve as the single source of truth for system structure
- **Nine curated architectural patterns**—centered on Domain‑Driven Design and Hexagonal Architecture—that maximize both team autonomy and code clarity
- **AI‑native design** with machine‑readable formats that enable AI agents to understand and respect architectural boundaries
- **A Terraform‑like workflow** for designing, scaffolding, validating, and evolving architecture over time

Rampart supports greenfield development and legacy migration alike, positioning it as the preferred path for Rails teams seeking modern architectural discipline.

### Core Goals

**Goal 1 — Bounded Context & Stream‑Aligned Team Effectiveness**

Teams should be able to deliver end‑to‑end features *within a single bounded context* with minimal coordination across contexts.

**Goal 2 — Human & AI Code Clarity**

Code should be predictable, structured, and easy for both humans and AIs to understand, navigate, and maintain.

Only approaches that score **High** on at least one of these goals are included in Rampart.

---

## 2. Guiding Principles & Opinions

Like Rails, Rampart is an **opinionated framework**. It provides "one right way" to implement features, reducing decision fatigue and ensuring consistency across teams. These opinions are not arbitrary—they emerge from the architecture principals defined in this document and from hard-won lessons in building maintainable, scalable systems.

### Core Principles

- **Bounded Context Autonomy**: Architecture should maximize team independence by enabling end‑to‑end feature delivery within a single bounded context.
- **Human & AI Clarity**: All structures, patterns, and blueprints should be predictable and easily understood by both humans and AI agents.
- **Architecture as Code**: Architecture defined in structured files rather than ephemeral diagrams or docs.
- **AI‑Friendly Structures**: Use strictly valid, machine‑safe formats for interoperability with AI agents.
- **Minimal Scaffolding, Maximal Guidance**: The tool should not implement business logic, only create structure and plans.
- **Maintain Sync Between Code and Architecture**: Support workflows where changes in one must be reflected in the other.
- **Rails‑Friendly, Not Rails‑Dependent**: The design supports Rails engines but keeps the core principles framework‑agnostic.

### Rampart Opinions

Rampart enforces specific choices where the architecture principals demand consistency or where the community has converged on clear best practices:

- **Architecture Patterns**: The nine principals defined in Section 3 are not optional—they represent the canonical way to structure Rampart applications. There is one right way to model bounded contexts, one right way to define use cases, and one right way to structure domain events.
- **Testing with RSpec**: RSpec is the required testing framework. Its expressive syntax aligns with domain-driven design, making tests readable as specifications of business behavior. Rampart includes architecture matchers designed specifically for RSpec.
- **Code Style with StandardRB**: StandardRB is the required code formatter and linter. By eliminating style debates entirely, teams focus on architecture and domain modeling rather than bikeshedding over syntax.
- **JSON for Blueprints**: Architecture blueprints use JSON (not YAML) for AI-safety and deterministic parsing (see Section 8).
- **Dry-rb Ecosystem**: Rampart builds on dry-types, dry-struct, and dry-monads for type safety and functional patterns.

These opinions are examples, not an exhaustive list. As Rampart evolves, additional conventions will be codified where they serve the goals of bounded context autonomy and human + AI clarity.

### What Rampart Is Not

- Rampart is not a Rails rewrite.
- It is not a code generator for business logic; scaffolding stays minimal and structural.
- It is not a static analyzer like RuboCop or StandardRB—though it requires StandardRB for code style.
- It does not prescribe specific ORMs, controllers, or background job frameworks.

---

## 3. Architecture Principals

Rampart provides clear, enforceable, AI‑friendly architecture patterns that maximize bounded context autonomy and code clarity. The following nine approaches form the foundation of the Rampart architectural philosophy.

### 3.1 Domain‑Driven Design (DDD) — Foundational

DDD aligns software models with real business domains using:

- Strategic patterns: bounded contexts, context maps, ubiquitous language
- Tactical patterns: aggregates, entities, value objects, domain services

**Goal 1 — HIGH**: Strongest tool for bounded context definition.

**Goal 2 — HIGH**: Clear naming and business alignment improves comprehension.

---

### 3.2 Hexagonal Architecture — Foundational

Domain + application in the center, infrastructure as adapters.

**Goal 1 — HIGH**: Domain insulated from frameworks.

**Goal 2 — HIGH**: Predictable layering aids understanding for humans and AI.

---

### 3.3 Clean Architecture / Onion / Screaming Architecture

Strict layering, explicit use‑case classes, domain‑first organization.

**Goal 1 — HIGH**: Clear boundaries around each BC.

**Goal 2 — HIGH**: Well‑defined folder structures and predictable entry points.

---

### 3.4 Modular Monolith / Vertical Slice Architecture

A monolith subdivided into strong internal slices containing all layers of a BC.

**Goal 1 — HIGH**: Empowers stream‑aligned teams.

**Goal 2 — MEDIUM–HIGH**: Reduces cognitive load, ideal for AI tooling.

---

### 3.5 Lightweight CQRS & Task‑Based Interfaces

Commands for writes, queries for reads.

**Goal 1 — MEDIUM–HIGH**: Clarifies responsibility, discourages cross‑BC leakage.

**Goal 2 — HIGH**: Intention‑revealing patterns easy for AIs.

---

### 3.6 Domain Events & Event‑Driven Modeling

Events model meaningful business changes.

**Goal 1 — HIGH**: Encourages decoupling.

**Goal 2 — MEDIUM**: Depends on disciplined naming and documentation.

---

### 3.7 Architecture Fitness Functions / Architecture‑as‑Code

Executable rules to enforce architecture.

**Goal 1 — HIGH**: Prevents erosion of BC boundaries.

**Goal 2 — VERY HIGH**: AI systems operate best with explicit constraints.

---

### 3.8 Functional Core / Imperative Shell

Pure domain logic, side effects isolated.

**Goal 1 — MEDIUM**: Improves cohesion but not inter‑BC autonomy.

**Goal 2 — HIGH**: Pure functions are easy for humans and AIs.

---

### 3.9 C4 Model (Inside‑the‑Box)

Component‑level diagrams for visual understanding.

**Goal 1 — MEDIUM**: Conveys structure, not enforcement.

**Goal 2 — HIGH**: Visual clarity improves comprehension.

---

### 3.10 Summary of High‑Impact Approaches

#### High impact on bounded context autonomy:

- Domain‑Driven Design
- Hexagonal Architecture
- Clean Architecture
- Modular Monolith
- Domain Events
- Architecture Fitness Functions

#### High impact on human + AI understandability:

- Hexagonal Architecture
- Clean Architecture
- CQRS
- Functional Core
- Architecture Fitness Functions
- C4 Diagrams

---

## 4. High‑Level Capabilities

### 4.1 Architecture Design Support

A CLI experience guiding users through:

- Domain definition
- Subdomains and bounded contexts
- Domain model structures (entities, value objects, aggregates)
- Application layer concepts (commands, queries, use cases)
- Domain events and event flows
- Ports and adapters
- Architecture fitness rules

Designs are saved into structured JSON architecture files.

### 4.2 Architecture Visualization

Multiple levels of generated diagrams:

- **System‑level context maps** showing bounded contexts and relationships
- **Use‑case diagrams** showing commands, queries, and workflows
- **Domain event flow diagrams** across bounded contexts
- **Component‑level C4 diagrams** for internal structure
- **Zoomed‑in bounded context diagrams** showing domain, application, and adapters

### 4.3 Scaffolding

Minimal scaffolding to support architectural structure:

- Domain / application / infrastructure directories
- Empty class shells for entities, value objects, use cases, commands, queries, and events
- README describing BC architecture

### 4.4 Architecture‑Aware Agent Integration

Rampart generates instruction files used by AI agents to:

- Follow layering constraints
- Respect BC boundaries
- Maintain fitness rules
- Update architecture JSON (use cases, events, domain model) whenever code changes

### 4.5 Architecture Synchronization & Drift Detection

Compares code vs architecture JSON and flags:

- Missing or outdated elements
- Incorrect dependencies
- Use cases or events missing in the model
- Violations of fitness rules

### 4.6 Migration Planning

Rampart will:

- Analyze existing Rails codebases
- Extract domain concepts, use cases, and event candidates
- Create a migration plan into Rampart architecture

### 4.7 Default Fitness Rules & Progressive Adoption

Writing good architecture fitness functions is difficult. Overly strict rules slow teams down; overly permissive rules are security theater. Rampart addresses this by:

- **Shipping sensible defaults** — Core rules like "domain layer cannot import infrastructure" and "bounded contexts cannot directly reference each other's internals" are provided out of the box.
- **Progressive rule adoption** — Teams start with foundational rules and add custom constraints as their architectural maturity grows.
- **Clear violation feedback** — When rules are violated, Rampart explains *why* the rule exists and *how* to fix the violation, not just that it failed.
- **Rule templates** — Common patterns (e.g., "only application layer can call external APIs") are available as one-line additions rather than requiring teams to author from scratch.

The goal is to make the first fitness function free—teams get value immediately without needing to become architecture experts first.

### 4.8 AI as Guardrail, Not Controller

Current LLMs do not reliably follow architectural instructions. They hallucinate dependencies, flatten layers, and ignore boundaries—especially as context windows fill up. Rampart does not assume AI agents will behave perfectly. Instead, it positions itself as a **guardrail and reviewer**:

- **Detect, don't prevent** — AI agents will make structural mistakes. Rampart catches them via drift detection (4.5) and fitness validation, enabling fast correction rather than relying on prevention.
- **Post-hoc verification** — After any AI-assisted code change, `rampart verify` confirms the architecture remains intact. This fits naturally into CI pipelines or pre-commit hooks.
- **Blame-free feedback loops** — When violations are detected, Rampart provides actionable guidance that both humans and AI agents can use to self-correct.
- **Improving over time** — As LLMs improve at following structured constraints, Rampart's JSON blueprints become more effective. The architecture is future-proofed for better AI tooling.

The honest pitch: AI will make mistakes; Rampart catches them.

---

## 5. Example Project Structure

Rampart‑powered projects may include:

```
architecture/
  catalog.json
  payments.json
  shipping.json
```

These JSON files act as the architectural source of truth.

---

## 6. CLI Vision

Rampart's CLI should support the full nine‑pattern architecture through commands such as:

- `rampart init` — initialize structure, JSON files, and agent instructions
- `rampart design` — interactive design of:
  - bounded contexts
  - domain models
  - **use cases (commands, queries)**
  - **domain events**
  - ports and adapters
  - **architecture fitness rules**
- `rampart visualize` — generate diagrams:
  - context maps
  - **use‑case maps**
  - **event‑flow diagrams**
  - **C4 component diagrams**
- `rampart scaffold` — generate minimal scaffolding for the defined architecture
- `rampart plan` — create a plan for a new app or migration
- `rampart verify` — run architecture fitness checks
- `rampart sync` — detect architecture/code drift (future)
- `rampart extract` — extract domain/use‑case/event models from legacy codebases (future)

Detailed behavior to be refined later.

---

## 7. Analogy to Terraform

Rampart can be viewed as a "Terraform for application architecture," and with the expansion to nine architectural approaches, the analogy becomes even stronger and more useful. The following additions refine and expand the Terraform comparison based on the full Rampart pattern stack.

### 7.1 Core Parallels

- Terraform defines **infrastructure as code**; Rampart defines **architecture as code**.
- Terraform uses declarative files and a **plan/apply workflow**; Rampart uses JSON blueprints and a **design/plan/scaffold workflow**.
- Terraform state captures intended infrastructure; Rampart JSON captures intended architecture.
- Terraform modules map to Rampart **bounded contexts and internal components**.

These parallels remain accurate, but Rampart's expanded architecture patterns introduce deeper analogies.

---

### 7.2 Expanded Parallels Based on the Nine Rampart Patterns

#### 1. Declarative Modeling of Use Cases (Clean Architecture + CQRS)

Terraform models infrastructure **resources** declaratively. Rampart does the same for use cases:

- commands
- queries
- workflows / interactors
- associated domain events

These become first‑class architectural "resources" in the blueprint.

#### 2. Declarative Domain Events & Event Graphs (Event‑Driven Modeling)

As Terraform builds a dependency graph of resources, Rampart captures:

- which BC publishes which events
- which BC subscribes
- event-triggered workflows
- cross‑context communication patterns

Event flows serve as the architectural dependency graph, making event-driven systems explicit.

#### 3. Architecture Fitness Validation (Fitness Functions)

Terraform has `terraform validate`. Rampart introduces:

```
rampart verify
```

This executes architecture fitness functions that enforce:

- layering constraints
- BC boundaries
- allowed dependencies
- required use cases / events in the model
- Functional Core purity boundaries (optional)

#### 4. Component‑Level Modeling (C4 Model)

Terraform modules can be nested or composed. Rampart mirrors this by modeling:

- internal components of a BC
- adapters
- domain services
- controllers / handlers

These can be visualized via C4 component diagrams.

#### 5. Expanded Drift Detection (Code ↔ Architecture Synchronization)

Terraform highlights drift between infrastructure and state files. Rampart does the same but across many architectural dimensions:

- missing use cases
- new or missing domain events
- changes to aggregates or value objects
- missing or new adapters
- violations of fitness rules
- component-level drift (C4)

Drift detection becomes a core architectural safeguard.

#### 6. Legacy Code Import (Migration Planning)

Terraform includes `terraform import` to bring unmanaged infra into its control. Rampart's eventual equivalent may:

- analyze legacy Rails apps
- extract bounded contexts
- infer use cases and event candidates
- identify anti‑corruption layers
- map current structure into Rampart blueprints

This makes Rampart viable as a modernization tool, not just a greenfield one.

---

### 7.3 Terraform Mapping Summary

| Terraform Concept    | Rampart Equivalent                                 |
| -------------------- | -------------------------------------------------- |
| Resource definitions | Use cases, events, domain objects, adapters        |
| Dependency graph     | Event flows, inter‑BC relationships, C4 components |
| Validate             | Fitness functions (`rampart verify`)               |
| Plan                 | Architectural plan (`rampart plan`)                |
| Apply                | Scaffolding + agent‑guided implementation          |
| State file           | Rampart architecture JSON blueprints               |
| Import               | Legacy extraction (`rampart extract`)              |

---

### 7.4 Narrative Summary

Rampart extends the Terraform analogy beyond simple declarative files. With nine architectural patterns, Rampart creates a comprehensive Architecture‑as‑Code ecosystem that:

- declaratively models domains, use cases, events, and components
- validates architectural integrity via fitness functions
- visualizes architecture at multiple layers
- detects drift between architecture and implementation
- supports migration of legacy systems
- provides a ruleset for both human and AI contributors

This positions Rampart as a powerful architectural planning and enforcement system for Rails and AI‑assisted development teams.

---

### 7.5 What Existing Tools Don't (or Can't) Do — The Missing Pieces

Below are important capability gaps that current tools do not fill, along with examples of tools that come closest but still fall short.

| Missing Capability                                                            | Most Similar Tools                                       | Why They Fall Short                                                                                                                                                         |
| ----------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A single authoritative, version-controlled architecture blueprint**         | Structurizr, PlantUML, C4 model tools                    | These generate diagrams or model visualizations, but do not serve as living, enforced architectural specifications or a system of record.                                   |
| **Planning + structural change workflow (similar to Terraform plan)**         | OpenAPI/AsyncAPI (for API planning), Backstage templates | OpenAPI only covers API layers; Backstage handles service metadata, not domain structure or architectural decisions. No tool plans architectural scaffolding or migrations. |
| **Sync between architecture and code, including drift detection**             | ArchUnit, dependency-analysis tools, SonarQube           | These can detect certain code smells or dependency violations but cannot compare code to a declarative architecture model or enforce layered/domain boundaries.             |
| **DDD-native domain modeling (bounded contexts, aggregates, ports/adapters)** | ContextMapper (academic), Structurizr DSL                | These express relationships conceptually but lack Rails integration, scaffolding, JSON blueprints, or synchronization with real codebases.                                  |
| **Architecture-guided scaffolding without generating business logic**         | Rails generators, JHipster                               | Generators scaffold code quickly but do not encode or enforce architectural boundaries; they cannot evolve designs over time or keep architecture synchronized.             |
| **Migration planning from legacy codebases into modern architecture**         | vFunction (for Java), monolith decomposition tools       | Focused on technical decomposition or microservices extraction, not DDD-based restructuring, JSON blueprints, or Rails codebases.                                           |
| **AI-native architecture understanding and enforcement**                      | None                                                     | No current tool provides machine-parseable architecture blueprints designed specifically for LLM agents to use while writing or modifying code.                             |

This gap analysis highlights that while certain tools overlap partially with Rampart's goals, **none provide a full Architecture-as-Code lifecycle with DDD semantics, scaffolding, drift detection, and AI-native integration.**

---

## 8. Why JSON (Not YAML)

Although YAML is popular in the Rails community, JSON is significantly more reliable for AI‑assisted workflows. Reasons include:

- Deterministic syntax
- No ambiguity in types or indentation
- Easy to validate with schemas
- Safer for incremental edits by LLMs

Rampart will therefore use **JSON as the authoritative format** for all architecture blueprints.

---

## 9. Next Steps for Planning

Future steps may include:

- Defining the JSON schema for bounded contexts
- Identifying MVP features
- Designing the CLI UX
- Determining conventions for storing and naming architecture files
- Mocking initial diagrams
- Planning integration points with AI agents

This document will serve as the foundation for that work.
