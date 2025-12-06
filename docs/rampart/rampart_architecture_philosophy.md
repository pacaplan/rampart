# Rampart Architecture Philosophy

This document captures the architectural principles that guide Rampart. For the strategic vision see `docs/rampart/rampart_vision.md`. For implementation tips see `docs/rampart/rampart_best_practices.md`.

---

## 3.5 Lightweight CQRS & Task-Based Interfaces

### What Is Lightweight CQRS?

Command Query Responsibility Segregation separates write models (commands) from read models (queries). A lightweight implementation:
- Uses the same underlying database for reads and writes
- Updates read models synchronously (no eventual consistency requirement)
- Avoids mandatory Event Sourcing; events are optional, not implied
- Encourages different DTOs for reads versus writes so the intent of each use case is explicit

Full CQRS layers in separate data stores and asynchronous projections. Rampart intentionally stays on the lightweight end so bounded contexts gain clarity without incurring distributed systems overhead.

### What Are Task-Based Interfaces?

Traditional CRUD UIs expose Create/Read/Update/Delete verbs and force handlers to infer user intent. Task-based interfaces expose domain actions such as "Ship Order" or "Generate Custom Cat":
- Users are presented with valid actions for the current aggregate state
- Each action maps cleanly to a command object and handler
- Business rules are localized to the action instead of scattered across generic update flows

### Alignment with Rampart Goals

- **Goal 1 — Bounded Context Autonomy**: Commands stay within the owning context, and read models can be shared safely because they are explicitly read-only projections.
- **Goal 2 — AI/Human Clarity**: Task-based names and separate DTOs make it obvious what a piece of code is trying to accomplish, allowing code readers (human or AI) to reason about intent quickly.

### Integration with Other Patterns

Lightweight CQRS complements the DDD + Hexagonal stack:
- Aggregates encapsulate invariants while commands orchestrate state transitions
- Ports/Adapters expose command and query handlers through HTTP, jobs, or other primary adapters
- Application Services provide a single place for transactional boundaries and result handling

### Anti-Patterns to Avoid

- **Event Sourcing Everything**: CQRS does not require event sourcing; keep the simpler model until events add value
- **Premature Read-Store Splitting**: Start with a single database. Introduce separate read stores only when real scalability needs appear
- **Generic CRUD Naming**: `UpdateOrder` hides intent and leads to anemic validation. Prefer `ApproveOrder`, `ArchiveOrder`, etc.
- **Command Handler Explosion**: Introduce dedicated handler classes only when services become unwieldy (YAGNI)

### References

- Martin Fowler — ["CQRS"](https://martinfowler.com/bliki/CQRS.html)
- Microsoft Learn — ["CQRS pattern"](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- CodeOpinion — ["Decomposing CRUD to a Task-Based UI"](https://codeopinion.com/decomposing-crud-to-a-task-based-ui/)
- Task Based UI | CQRS — ["Task Based UI"](https://cqrs.wordpress.com/documents/task-based-ui/)
- Arkency — ["CQRS example in the Rails app"](https://blog.arkency.com/2015/09/cqrs-example-in-the-rails-app/)

## 3.6 Domain Events & Event-Driven Modeling

### What Are Domain Events?

Domain Events record business facts that already happened, named in past tense (`CatListingPublished`, `OrderShipped`). They are immutable value objects that travel across bounded contexts while preserving the domain language.

### Why Use Them?

- **Goal 1 — Decoupling**: Producers do not need to know about downstream consumers; events flow through an Event Bus port.
- **Goal 2 — Clarity**: Past-tense names make intent explicit to humans and AI tools.
- **Auditability**: Events provide a breadcrumb trail of meaningful changes without full event sourcing.

### How Rampart Uses Events

- Aggregates are immutable and return new instances; they do not accumulate unpublished events or mutate internal state in-place.
- Application services publish events through an `EventBus` port after persistence, keeping infrastructure swappable and side effects centralized.
- Events include `event_id`, `occurred_at`, and `schema_version` for traceability and version evolution.

### When to Prefer Events Over Direct Calls

- Cross-bounded-context notifications (e.g., Catalog informs Commerce of a published listing)
- Integrations that may fan out to multiple subscribers
- Workloads that benefit from asynchronous processing without changing the transactional domain model

Direct method calls remain fine for in-process, single-consumer workflows where indirection adds no value.

### Naming & Versioning Guidelines

- Past tense, domain language (`PaymentCaptured`, not `CapturePayment`)
- Include identifiers needed by consumers; prefer event-carried state only when consumers require it
- Bump `schema_version` when adding/removing/renaming attributes; favor additive changes

### Anti-Patterns to Avoid

- **Event Sourcing by Accident**: Publishing events does not imply persisting every event forever.
- **Chatty or Generic Events**: `EntityUpdated` offers no meaning; emit specific, purposeful facts.
- **Hidden Coupling**: Do not require consumers to reach back into aggregates for missing context that should be in the event payload.

## 3.7 Architecture Fitness Functions / Architecture-as-Code

### What Are Fitness Functions?

Fitness functions are executable constraints that continuously verify architectural decisions: layer boundaries, dependency rules, naming conventions, and invariants that keep the system aligned with its intended shape. They turn "architecture docs" into living checks that fail loudly when drift occurs.

### Rampart's Approach

- **Start with RSpec**: Reusable matchers plus per-engine specs deliver immediate value without new tooling.
- **Blueprints Then CLI**: A JSON blueprint captures layers, dependencies, and key components as machine-readable metadata. A future `rampart verify` CLI can consume it.
- **Use Packwerk**: Packwerk or similar tools will be levearged.

### Integration with DDD + Hexagonal

- **Ports & Adapters**: Specs verify ports inherit from Rampart base classes and have adapter implementations.
- **Layer Discipline**: Tests assert domain remains free of Rails dependencies and that application code only depends inward.
- **Immutability**: Value objects and aggregates remain setter-free to protect invariants and keep domain objects predictable.
- **CQRS Alignment**: Commands/queries stay on the correct base classes, and repositories return domain objects rather than ActiveRecord records.

### Anti-Patterns to Avoid

- **Docs Without Enforcement**: Writing principles without executable checks invites drift.
- **Static Analysis Only**: Relying solely on Packwerk misses behavioral rules (inheritance, immutability) that specs can cover.
- **Overly Broad Rules**: Blanket bans that create friction get ignored; prefer targeted, high-signal checks.
- **CI-Only Enforcement**: Run fitness specs locally to catch issues before pull requests.

### References

- Neal Ford et al. — ["Building Evolutionary Architectures"](https://www.thoughtworks.com/en/insights/articles/building-evolutionary-architectures-fitness-functions)
- Thoughtworks Tech Radar — ["Fitness Functions"](https://www.thoughtworks.com/radar/techniques/architectural-fitness-function)
- Martin Fowler — ["Architecture for Agile Developers"](https://martinfowler.com/ieeeSoftware/fowler.pdf)

## 3.8 Functional Core / Imperative Shell (FC/IS)

### What Is FC/IS?

Functional Core / Imperative Shell separates pure, deterministic logic from side effects. The Functional Core (domain layer) is immutable and side-effect free; the Imperative Shell (application and infrastructure layers) handles I/O, persistence, and event publication.

### Why Rampart Uses Immutable Aggregates

- **Clarity for Humans and AI**: No hidden mutations or implicit event buffers; each domain method returns a new aggregate instance representing the next state.
- **Predictable Testing**: Pure functions are trivial to unit test without stubbing infrastructure or event buses.
- **Composability**: New behaviors compose by transforming data rather than mutating shared objects.

### Mapping to DDD + Hexagonal Layers

- **Functional Core**: Aggregates, entities, value objects, and domain services are pure Ruby with no I/O. Methods return new instances instead of mutating state.
- **Imperative Shell**: Application services coordinate repositories, publish events, and invoke adapters. Side effects live here, not in the domain.

### Anti-Patterns to Avoid

- Mutating instance variables inside domain objects (other than within generated Dry::Struct initialization).
- Accumulating unpublished events inside aggregates via `apply`/`on_*` handlers.
- Triggering I/O (HTTP calls, database writes, logging) from domain classes.
