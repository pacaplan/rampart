# Rampart User Guide

Day-to-day usage rules and guidance for keeping Rampart implementations intention-revealing and predictable.

**Related**: [Philosophy](rampart_architecture_philosophy.md) | [Features](rampart_features.md)

---

## Glossary

- **Bounded Context** — A logical boundary within which a domain model is defined and consistent; typically maps to a Rails engine.
- **Capability** — A cohesive unit of functionality exposed to an actor; groups related entrypoints and becomes the unit of planning and implementation.
- **Spec** — A version-controlled document capturing functional requirements, technical requirements, and implementation details for a capability.
- **Aggregate** — A cluster of domain objects with a root entity that enforces invariants and acts as the consistency boundary.
- **Entity** — An object with a unique identity that persists over time.
- **Value Object** — An immutable object defined by its attributes, with no identity.
- **Application Service (Use Case)** — Orchestrates domain logic, repositories, and ports to fulfill a single business operation.
- **Command** — A DTO representing intent to change state; named for the task, not the data.
- **Query** — A DTO representing a request to read data.
- **Domain Event** — A record of something meaningful that happened in the domain, named in past tense.
- **Repository** — A port that abstracts persistence, returning domain objects instead of ORM models.
- **Port** — An interface defining how the application interacts with external systems.
- **Adapter** — A concrete implementation of a port for a specific technology.
- **Architecture Blueprint** — A JSON file describing bounded context structure, used by Rampart CLI tools.

---

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

## Layer Responsibilities

| Layer | Responsibility | Dependencies | I/O Allowed | Transactions | Events |
|-------|---------------|--------------|-------------|--------------|--------|
| **Domain** | Business rules, invariants, domain logic | None (pure) | No | No | Defines events |
| **Application** | Use case orchestration, workflow coordination | Domain | Via ports only | Wraps at edge | Publishes after persistence |
| **Infrastructure** | Concrete implementations of ports | Application, Domain | Yes | Implements | Dispatches |

- **Domain layer**: Contains aggregates, entities, value objects, domain services, domain events, and exceptions. Has zero external dependencies—no Rails, no I/O, no framework code.
- **Application layer**: Contains commands, queries, and application services. Orchestrates domain logic through ports. Transactions wrap use case execution at this layer's edge.
- **Infrastructure layer**: Contains adapters (repositories, external service clients, event bus implementations). All I/O lives here. Adapters depend inward only.

## Slash Commands

Running `rampart init` installs two slash commands for use in Cursor and Claude Code:

| Command | Purpose |
|---------|---------|
| `/rampart.architect` | Design or modify bounded context architecture, producing `architecture/{bc_id}.json` |
| `/rampart.plan` | Complete capability specs with functional requirements, data models, and contracts |

The commands are installed as symlinks pointing to canonical files in `prompts/`:

```
prompts/
├── architecture.prompt.md    # Source for /rampart.architect
└── planning.prompt.md        # Source for /rampart.plan
```

To use a command, type `/rampart.architect` or `/rampart.plan` in your AI assistant's chat, then follow the guided workflow.

---

## Rampart Change Lifecycle

A Terraform-like workflow for evolving architecture through prompt-driven collaboration.

### Adding a New Bounded Context

1. **Design the bounded context** — Use `/rampart.architect` to collaboratively define the BC, producing `architecture/{bc_id}.json`

2. **Create Rails engine** (if new) — Run `rails plugin new engines/{bc_name} --mountable` and `rampart init {bc_name}` to scaffold DDD structure

3. **Generate spec templates** — Run `rampart spec` to generate one spec file per capability in `engines/{bc_name}/specs/`

4. **Complete specs** — For each capability, use `/rampart.plan` with the spec file to collaboratively fill in:
   - Functional requirements (inputs, outputs, scenarios, validation)
   - Technical requirements (performance, security, observability)
   - Data model (schema, relationships, indexes)
   - Request/response contracts
   - Domain logic and integration details

5. **Implement** — Write domain logic, use cases, and adapter code per the completed specs

6. **Verify** — Run `packwerk check` and RSpec architecture specs to ensure fitness

7. **Commit** — Check in code, specs, and architecture JSON together

### Adding a Capability to Existing Bounded Context

1. **Update architecture blueprint** — Use `/rampart.architect` to add the capability to `architecture/{bc_id}.json`

2. **Generate spec template** — Run `rampart spec` to generate the new capability's spec file

3. **Complete spec** — Use `/rampart.plan` to fill in the spec

4. **Implement** — Write code per the spec

5. **Verify** — Run fitness checks

6. **Commit** — Check in code, spec, and updated architecture JSON

### Detecting Drift

Run `rampart sync` to scan the codebase and detect differences between code and architecture JSON, then review the drift report before updating blueprints
