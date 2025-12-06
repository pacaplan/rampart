# Rampart Framework & Tooling Features

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

- [ ] **rampart init** - Initialize project structure and JSON blueprints
- [ ] **rampart design** - Interactive design of bounded contexts and architecture
- [ ] **rampart visualize** - Generate diagrams (context maps, use-case maps, C4 diagrams)
- [ ] **rampart scaffold** - Generate minimal scaffolding from architecture blueprints
- [ ] **rampart plan** - Create migration plan for legacy codebases
- [ ] **rampart verify** - Run architecture fitness checks and validation
- [ ] **rampart sync** - Detect architecture/code drift 
- [ ] **rampart extract** - Extract domain/use-case models from legacy code

---

## 3.7 Architecture Fitness Functions / Enforcement Tools ⚠️

- [ ] **Packwerk** - Static analysis for layer boundaries (deferred)
  - Layer rules:
    - `domain/` package: No dependencies on application or infrastructure
    - `application/` package: Can depend on domain, not infrastructure
    - `infrastructure/` package: Can depend on domain and application
  - Cross-BC boundary enforcement (when multiple engines exist)
  - CI integration via `packwerk check`
  - *Status: Deferred until multiple bounded contexts exist*

- [x] **RSpec Pattern Verification** - Rules Packwerk can't enforce
  - Class inheritance validation (aggregates, value objects, ports, CQRS DTOs)
  - Immutability checks (no setter methods on value objects)
  - Port implementation coverage and repository return-type assertions

- [x] **Rampart::Testing::ArchitectureMatchers** - Reusable matchers
  - `have_no_rails_dependencies`, `inherit_from_rampart_base`, `implement_all_abstract_methods`
  - Designed for reuse across bounded contexts and engines
  - `be_immutable` and `have_no_mutable_instance_variables` enforce Functional Core immutability

- [x] **Architecture Blueprint JSON** - Documentation artifact
  - Machine-readable representation of layers, boundaries, and components
