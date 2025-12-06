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
