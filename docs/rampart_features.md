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

## Prompt Files ✅

Rampart ships prompt files that guide AI-assisted architecture and planning workflows:

- **architecture.prompt** - Guides collaborative architecture design
  - Helps user define bounded contexts
  - Elicits domain model (aggregates, entities, value objects)
  - Produces/refines `architecture.json`
  - Uses architectural patterns and ubiquitous language

- **planning.prompt** - Guides spec completion for capabilities
  - Gathers functional requirements (inputs, outputs, validation)
  - Gathers technical requirements (performance, security, observability)
  - Fills in data model details (schema, relationships, indexes)
  - Defines request/response contracts
  - Clarifies domain logic and integration details

These prompts are loaded into AI coding assistants (Claude Code, Cursor, etc.) as custom commands or modes.

---

## CLI Tools ❌

> See [User Guide: Rampart Change Lifecycle](rampart_user_guide.md#rampart-change-lifecycle) for the recommended workflow.

### Project Initialization
- [ ] **rampart init** - Bootstrap Rampart in a new project
  - Create `architecture/` directory
  - Generate `architecture/system.json` with empty engines list
  - Create `prompts/` directory
  - Install `architecture.prompt` and `planning.prompt`
  - Set up initializer/configuration files for Rampart

- [x] **rampart diagram** - Generate architecture diagrams from blueprints
  - **L1 System Context** - Actors, BC, Downstream BCs, External Systems
  - **L3 Capability Flows** - Actor -> Controller -> Service -> Ports -> Adapters -> External/DB
  - **Outputs** - Markdown documentation with embedded SVG/PNG images

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

### Spec Generation
- [ ] **rampart spec** - Generate spec templates for capabilities from architecture JSON
  - **If engine does not exist,** generates minimal spec indicating Rails engine setup needed
  - **If engine exists:**
    - Reads `architecture/{bc_id}.json`
    - Identifies all capabilities defined in the BC
    - Generates one spec template file per capability in `engines/{bc_name}/specs/`
  - **Spec template structure:**
    - Functional requirements (placeholder)
    - Technical requirements (placeholder)
    - Application layer section (pre-filled from architecture.json)
    - Domain layer section (pre-filled from architecture.json)
    - Infrastructure layer section (pre-filled from architecture.json)
  - Spec templates are ready for completion via `planning.prompt`

### Validation & Synchronization

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

## Architecture-Aware AI Integration

Rampart provides prompt files that guide AI coding assistants through architectural workflows:

**Architecture Design** (`architecture.prompt`):
- Collaborative elicitation of bounded contexts
- Domain modeling (aggregates, entities, value objects, events)
- Port and adapter identification
- Produces version-controlled `architecture.json`

**Planning** (`planning.prompt`):
- Guides spec completion for capabilities
- Gathers functional and technical requirements
- Fills in data model, contracts, and integration details
- Produces version-controlled spec files

**Validation** (Packwerk + RSpec):
- After implementation, fitness functions verify architectural compliance
- Drift detection catches violations
- Provides actionable feedback for correction

This three-phase approach (design → plan → validate) enables AI assistants to work within architectural boundaries while maintaining human control over key decisions.
