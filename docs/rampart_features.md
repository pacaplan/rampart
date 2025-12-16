# Rampart Framework & Tooling Features

Implementation details and roadmap for Rampart framework classes and CLI tools.

**Related**: [Philosophy](rampart_architecture_philosophy.md) | [User Guide](rampart_user_guide.md)

---

## Architecture Blueprint Structure

Rampart-powered projects store architecture definitions in JSON files:

```
architecture/
  system.json      # System-wide config and engine list
  catalog.json     # Per-bounded-context blueprint
  payments.json
  shipping.json
```

These JSON files act as the architectural source of truth.

---

## Framework Classes ✅

### Domain Layer Classes
- [x] **AggregateRoot** - Consistency boundaries with immutable state
  - Domain methods return new instances; no in-place mutation or event accumulation
  - Event publishing handled by Application Services (imperative shell)
- [x] **Entity** - Objects with unique identity
- [x] **ValueObject** - Immutable value types with type safety
  - Attribute validation via dry-types
  - Equality comparison by value
  - Factory methods and constrained attributes
- [x] **DomainEvent** - Business-meaningful occurrences
  - Automatic event ID generation (UUID)
  - Schema versioning for event evolution
  - Timestamp tracking with `occurred_at`
- [x] **DomainService** - Domain logic not belonging to entities
- [x] **DomainException** - Domain-specific errors with context
  - Error codes and context metadata

### Application Layer Classes
- [x] **Command** - Data transfer object for write operations
  - Type-safe attribute validation
- [x] **Query** - Data transfer object for read operations
  - Pagination parameters and filtering
- [x] **Service** - Application services (use cases)
  - Orchestrates domain logic and repositories
  - Constructor-based dependency injection
- [x] **Transaction** - Transaction boundary abstraction
  - Adapter pattern for different transaction backends

### Infrastructure Layer Classes
- [x] **SecondaryPort** - Abstract interface for outbound dependencies
  - Method signature enforcement via `abstract_method`

### Support Classes
- [x] **Types** - Enumeration of dry-types for schema definition
  - String, Integer, Float, Boolean, Array, Hash, Symbol, etc.
  - Constrained types (min/max, format, enum)
  - Optional and default values
- [x] **Container** - Dependency injection container
  - Based on dry-container
- [x] **Result** - Monadic error handling
  - Success/Failure pattern (dry-monads integration)

---

## CLI Tools ❌

> See [User Guide: Rampart Change Lifecycle](rampart_user_guide.md#rampart-change-lifecycle) for the recommended workflow.

### Project Initialization
- [ ] **rampart init** - Bootstrap Rampart in a new project
  - Create `architecture/` directory
  - Generate `architecture/system.json` with empty engines list
  - Set up initializer/configuration files for Rampart
  - Generate agent instruction files for AI-assisted development

### Architecture Design
- [ ] **rampart design** - Interactive architecture design (adds to system.json)
  - **New bounded context flow:**
    - Prompt for BC identifier, name, and description
    - Add entry to `architecture/system.json` under `engines.items`
    - Create `architecture/{bc_id}.json` with initial structure
  - **Existing bounded context flow:**
    - Select BC to modify from `system.json` engines list
    - Guide through adding/modifying domain elements
    - Update `architecture/{bc_id}.json`
  - **Domain modeling prompts:**
    - Define aggregates, entities, value objects, domain services
    - Specify commands, queries, domain events
    - Define ports (repositories, external services) and adapters
  - Future: AI chatbot assistance for domain modeling decisions

- [ ] **rampart visualize** - Generate architecture diagrams from blueprints
  - Context maps (inter-BC relationships from `system.json`)
  - Use-case maps (command/query flows)
  - C4 component diagrams (internal structure)

### Bounded Context Initialization
- [ ] **rampart init [context_name]** - Initialize Rampart structure in an existing Rails engine
  - **Prerequisites:**
    - Engine must already exist (created via `rails plugin new engines/{name} --mountable`)
    - BC must be defined in `architecture/system.json`
  - **Creates DDD directory structure:**
    ```
    engines/{context_name}/
    ├── app/
    │   ├── domain/{context_name}/
    │   │   ├── aggregates/
    │   │   ├── entities/
    │   │   ├── value_objects/
    │   │   ├── events/
    │   │   ├── services/
    │   │   └── ports/
    │   ├── application/{context_name}/
    │   │   ├── services/
    │   │   ├── commands/
    │   │   └── queries/
    │   └── infrastructure/{context_name}/
    │       ├── persistence/
    │       │   ├── mappers/
    │       │   └── repositories/
    │       ├── adapters/
    │       └── wiring/
    ```
  - **Creates BaseRecord for schema isolation:**
    ```ruby
    # app/models/{context_name}/base_record.rb
    module ContextName
      class BaseRecord < ActiveRecord::Base
        self.abstract_class = true
        connects_to database: { writing: :context_name, reading: :context_name }
      end
    end
    ```
  - **Generates architecture spec files** for fitness function testing
  - **Generates agent instruction files** for AI-assisted development
  - **Note:** Adding gem to Gemfile and mounting routes are manual steps (project-specific)

### Implementation Planning
- [ ] **rampart plan** - Generate implementation plan from architecture JSON
  - **If engine does not exist,** Include the following steps inthe plan:
    - Run standard Rails generator: `rails plugin new engines/{bc_name} --mountable --skip-test`
    - Add gem to main app Gemfile: `gem "{bc_name}", path: "engines/{bc_name}"`
    - Mount in routes: `mount {BcName}::Engine => "/path"`
    - Run `rampart init` (see above)
  - **If engine exists:**
    - Compare `architecture/{bc_id}.json` against current engine structure
  - **Output markdown document showing:**
    - Files to create (new aggregates, services, ports, etc.)
    - Files to modify (adding methods, events, etc.)
    - Missing implementations (ports without adapters, etc.)
  - Support greenfield (new BC) and incremental (sync new elements) modes
  - Generate TODO list for implementation

### Validation & Synchronization
- [ ] **rampart verify** - Run architecture fitness checks
  - Validate layer boundaries and dependency rules
  - Check inheritance constraints (aggregates, value objects, ports inherit from Rampart bases)
  - Check immutability constraints (no setters on value objects)
  - Verify ports have adapter implementations
  - Report violations with actionable guidance

- [ ] **rampart sync** - Detect drift between code and architecture JSON
  - Scan codebase for:
    - Architectural classes or methods not defined in blueprint
    - Blueprint elements without corresponding code
    - Structural differences (renamed classes, moved files)
  - Generate drift report for review
  - If needed, update architecture JSON (with confirmation)

### Legacy Migration
- [ ] **rampart extract** - Extract domain models from legacy code
  - Analyze codebase to identify candidate domain concepts
  - Generate preliminary BC and aggregate suggestions
  - Create legacy-to-DDD mapping inventory

- [ ] **rampart migrate** - Create phased migration plan for legacy codebases
  - Map legacy code to target Rampart architecture
  - Identify anti-corruption layers and extraction order
  - Generate step-by-step migration playbook

---

## Architecture Fitness Functions / Enforcement Tools ⚠️

- [x] **Packwerk** - Static analysis for layer boundaries
  - **Layer dependency rules:**
    - `domain/` package: No dependencies on application or infrastructure
    - `application/` package: Can depend on domain, not infrastructure
    - `infrastructure/` package: Can depend on domain and application
  - **Primary adapter rules (controllers):**
    - Controllers CANNOT import from `domain/` (aggregates, entities, ports)
    - Controllers CANNOT import from `infrastructure/persistence/` (repositories)
    - **Rationale:** Prevents controllers from bypassing application services and calling repositories/aggregates directly, which breaks transaction boundaries and event publishing
  - **Cross-BC boundary enforcement** (when multiple engines exist)
  - CI integration via `packwerk check`

- [x] **RSpec Architecture Verification** - Enforced by `Rampart Engine Architecture` shared spec
  - **1. DI and Wiring Policies**: Services depend on Ports/Adapters; Controllers resolve only Services.
  - **2. Base Class Contracts**: Aggregates, Entities, ValueObjects, Ports, Commands inherit from Rampart bases.
  - **3. Immutability**: Value Objects and Aggregates are immutable (no setters, no instance var mutation).
  - **4. Public API Safety**: Public modules load correctly and do not leak infrastructure types (ActiveRecord).
  - **5. Architecture JSON Sync**: Bidirectional verification that code matches the JSON blueprint (Aggregates, Ports, Events, Services, Adapters, Controllers).

- [x] **Architecture Blueprint JSON** - Documentation artifact
  - Machine-readable representation of layers, boundaries, and components

### Default Fitness Rules & Progressive Adoption

Writing good architecture fitness functions is difficult. Overly strict rules slow teams down; overly permissive rules are security theater. Rampart addresses this by:

- **Shipping sensible defaults** — Core rules like "domain layer cannot import infrastructure" and "bounded contexts cannot directly reference each other's internals" are provided out of the box.
- **Progressive rule adoption** — Teams start with foundational rules and add custom constraints as their architectural maturity grows.
- **Clear violation feedback** — When rules are violated, Rampart explains *why* the rule exists and *how* to fix the violation, not just that it failed.
- **Rule templates** — Common patterns (e.g., "only application layer can call external APIs") are available as one-line additions rather than requiring teams to author from scratch.

The goal is to make the first fitness function free—teams get value immediately without needing to become architecture experts first.

---

## Architecture-Aware Agent Integration

Rampart generates instruction files used by AI agents to:

- Follow layering constraints
- Respect BC boundaries
- Maintain fitness rules
- Update architecture JSON (use cases, events, domain model) whenever code changes

This enables AI coding assistants to work within architectural boundaries rather than accidentally violating them.
