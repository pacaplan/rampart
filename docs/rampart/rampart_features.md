# Rampart Framework & Tooling Features

## Framework Classes ✅

### Domain Layer Classes
- [x] **AggregateRoot** - Consistency boundaries with event tracking
  - Event sourcing support via `apply()` and `unpublished_events`
  - Automatic event handler delegation via `on_*` naming convention
  - `clear_events!()` for post-persistence cleanup
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

- [ ] **rampart init** - Initialize project structure and JSON blueprints
- [ ] **rampart design** - Interactive design of bounded contexts and architecture
- [ ] **rampart visualize** - Generate diagrams (context maps, use-case maps, C4 diagrams)
- [ ] **rampart scaffold** - Generate minimal scaffolding from architecture blueprints
- [ ] **rampart plan** - Create migration plan for legacy codebases
- [ ] **rampart verify** - Run architecture fitness checks and validation
- [ ] **rampart sync** - Detect architecture/code drift (future)
- [ ] **rampart extract** - Extract domain/use-case models from legacy code (future)

---

## 3.7 Architecture Fitness Functions / Enforcement Tools ⚠️

Tools that enforce architectural rules, preventing erosion of boundaries and dependencies:

- [ ] **Packwerk** - Static analysis for enforcing layering and module boundaries
  - Prevent accidental cross-module constant references (between engines)
  - Enforce layering rules within single engine (domain ↔ application ↔ infrastructure)
    - Domain cannot depend on infrastructure
    - Application cannot depend on infrastructure
    - Only infrastructure can depend on Rails/external libraries
  - Visualize dependency graphs between modules/components
  - Integrate with CI/pull request workflows
  - *Status: Not yet integrated; YAGNI for single bounded context, valuable for multiple engines*

- [ ] **Architecture Fitness Rules** - Executable constraints via JSON/YAML configuration
  - Codify architectural decisions as enforceable rules
  - Layer boundary enforcement (layering constraints)
  - Bounded context isolation rules
  - Naming convention validation
  - Forbidden dependency patterns
  - *Status: Future; would be part of `rampart verify` CLI tool*

- [ ] **Drift Detection** - Compare code structure against architecture blueprints
  - Detect missing use cases or domain events
  - Identify violations of fitness rules
  - Compare actual code organization to declared architecture
  - *Status: Future; would be part of `rampart sync` CLI tool*