# Rampart Best Practices

Guidance for keeping Rampart implementations intention-revealing and predictable.

## Domain-Driven Design

- **Model per bounded context**: Keep aggregates, entities, value objects, and domain services scoped to their context (usually an engine). Avoid "shared" domain classes unless they are truly ubiquitous.
- **Ubiquitous language everywhere**: Module names, directory names, and public APIs should read like the domain (e.g., `Catalog::CatListings::AggregateRoot`), not generic Rails terminology.
- **Aggregate boundaries first**: Route all mutations through aggregates; domain services coordinate multiple aggregates but should not bypass invariants.
- **Explicit domain errors**: Raise `DomainException` with codes/context rather than generic errors so callers (and AI tools) understand failure modes.
- **Document the model**: Until CLI design tools ship, capture bounded contexts and context maps in the architecture blueprint JSON and docs alongside the code.

## Hexagonal Architecture

- **Primary adapters call use cases**: Controllers/jobs/CLI commands should invoke application services, not domain objects or repositories directly.
- **Ports before adapters**: Define outbound contracts as `SecondaryPort` subclasses; keep concrete adapters in `infrastructure/` and per bounded context.
- **Repository returns domain**: Repositories translate persistence to domain objects (aggregates/entities/value objects) instead of leaking ActiveRecord models.
- **Inward-only dependencies**: Domain has zero framework dependencies; application depends only on domain; adapters depend on application/domain.
- **Swap-friendly seams**: Keep serialization, HTTP clients, and background job APIs inside adapters so infrastructure can change without touching use cases.

## Clean Architecture / Use Case Discipline

- **One use case, one service method**: Application services should express a single business operation and orchestrate ports, repositories, and transactions for it.
- **DTO boundaries**: Commands/queries carry validated input; avoid sprinkling params hashes across layers.
- **Transactions at the edge**: Wrap use case execution in `Transaction` adapters; do not start transactions inside the domain.
- **Screaming modules**: Organize files so directory/module names announce the bounded context and subdomain rather than Rails defaults.
- **Guard layer direction**: Architecture specs should assert domain stays free of Rails and that adapters depend inward only.

## Modular Monolith / Bounded Context Safety

- **Engines own their contracts**: Each engine should encapsulate domain/app/infra code and its ports. Avoid cross-engine constants, adapters, or models.
- **Cross-context via events or ACLs**: Share intent through domain events or explicit anti-corruption layers, not direct table access or model reuse.
- **Minimal Shared Kernel**: Only place truly ubiquitous primitives in shared areas; everything else lives inside the owning context.
- **Migration readiness**: Keep boundaries crisp (separate migrations, dependency checks) so future extraction to services remains viable.
- **Trace boundaries in docs**: Update architecture blueprints/context maps when adding a new bounded context or significant cross-context relation.

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
