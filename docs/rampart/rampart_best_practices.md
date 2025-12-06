# Rampart Best Practices

Guidance for keeping Rampart implementations intention-revealing and predictable.

## Command Naming: Task-Based vs CRUD

Commands should describe the business task being carried out with ubiquitous language, not generic CRUD verbs.

### Good Examples (Task-Based)
- `ShipOrder` - Signals a domain-specific transition
- `ApproveTimesheet` - Identifies the exact business action
- `TransferMoney` - Explicitly states what the system will attempt
- `GenerateCustomCat` - Mirrors the AI-based workflow in cat_content
- `ArchiveCustomCat` - Clarifies that visibility is changing

### Avoid (CRUD-Based)
- `UpdateOrder` - Ambiguous scope, unclear rules
- `UpdateTimesheet` - Does not convey user intent
- `UpdateAccount` - Offers no hints about allowable changes

### When CRUD Names Are Acceptable
- `CreateX` is fine for introducing a new aggregate when the domain has no richer term yet
- Prefer ubiquitous names when possible: `RegisterUser` over `CreateUser`, `AddCatToCatalog` over `CreateCatListing`

## Why Task-Based Naming?

1. **Explicit Intent** - Humans and AI assistants immediately understand the goal
2. **Single Responsibility** - Each command encapsulates one business operation
3. **Ubiquitous Language** - Names stay aligned with domain experts' phrasing
4. **Better Validation** - Task-specific invariants become obvious and easier to test

Whenever a command wades into generic territory, revisit the workflow and ask, "What is the user actually trying to accomplish?" Rename the command to match that intent before adding new logic.

## Domain Event Naming

- **Past tense facts**: Name events after what happened (`CatListingPublished`, not `PublishCatListing`).
- **Meaningful payloads**: Include identifiers and only the state consumers need; avoid forcing lookups for basics.
- **Schema versioning**: Use `schema_version` to evolve payloads; favor additive changes and keep backward compatibility where possible.
- **Avoid generic verbs**: `EntityUpdated` or `ItemChanged` hide intent and lead to tight coupling.

## Functional Core / Imperative Shell

- **Immutable domain objects**: Aggregate and entity methods should return new instances (often via `self.class.new(**attributes.merge(...))`) rather than mutating instance variables.
- **No hidden buffers**: Do not accumulate unpublished events inside aggregates; application services publish events after persistence.
- **Pure domain services**: Keep domain services free of I/O so they remain part of the Functional Core.
- **Side effects live in the shell**: Application services orchestrate repositories, event buses, and external adapters; domain logic should never trigger HTTP/DB/logging directly.

## Architecture Fitness Functions

- **Add rules when boundaries wobble**: Introduce new matchers/specs in response to real drift (e.g., a domain class pulling in Rails) rather than hypothetical fears.
- **Balance strictness and flow**: Start with high-signal checks (inheritance, immutability, ports with implementations). Avoid noisy dependency bans that slow delivery without clear value.
- **Default Rampart rules**: Ports inherit from `Rampart::Ports::SecondaryPort`, aggregates from `Rampart::Domain::AggregateRoot`, value objects from `Rampart::Domain::ValueObject` with no setters, repositories return domain objects, and CQRS DTOs inherit from Rampart base classes.
- **Customize per bounded context**: Keep shared matchers in `Rampart::Testing`, but write BC-specific specs in each engine to codify local conventions and directory structure.
- **Keep specs executable**: Run architecture specs with the rest of the test suite; failing fast on drift is the whole point.
