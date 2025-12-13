# Rampart Framework & Tooling Features

Implementation details and roadmap for Rampart framework classes and CLI tools.

**Related**: [Vision](rampart_vision.md) | [Philosophy](rampart_architecture_philosophy.md) | [Best Practices](rampart_best_practices.md)

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

> For full capability descriptions, see [Vision: High-Level Capabilities](rampart_vision.md#4-high-level-capabilities) and [CLI Vision](rampart_vision.md#6-cli-vision).

### Initialization
- [ ] **rampart init** - Bootstrap Rampart in a project
  - Create `architecture/` directory with empty JSON blueprint templates
  - Generate generic architecture validation spec files
  - Set up initializer/configuration files for Rampart
  - Generate agent instruction files for AI-assisted development

- [ ] **rampart init [context_name]** - Generate a new bounded context engine
  - **Generate the Rails engine:**
    ```bash
    rails plugin new engines/context_name --mountable --skip-test
    ```

  - **Create directory structure:**
    ```bash
    cd engines/context_name
    mkdir -p app/controllers
    mkdir -p app/models
    mkdir -p app/domain/context_name/{aggregates,entities,value_objects,events,services,ports}
    mkdir -p app/application/context_name/{services,commands,queries}
    mkdir -p app/infrastructure/context_name/{persistence/{mappers,repositories},adapters,wiring}
    ```

  - **Create BaseRecord for schema isolation:**
    ```ruby
    # app/models/base_record.rb
    module ContextName
      class BaseRecord < ActiveRecord::Base
        self.abstract_class = true
        connects_to database: { writing: :context_name, reading: :context_name }
      end
    end
    ```

  - **Add to main app Gemfile:**
    ```ruby
    gem "context_name", path: "engines/context_name"
    ```

  - **Mount in main app routes:**
    ```ruby
    mount ContextName::Engine => "/path"
    ```

  - **Note:** Database migrations are project-specific (e.g., Supabase) and handled separately

### Design
- [ ] **rampart design** - Interactive architecture design
  - Guide bounded context identification via interactive prompts
  - Define domain models (aggregates, entities, value objects, domain services)
  - Specify use cases, commands, queries, domain events, ports, and adapters
  - Future: AI chatbot assistance for domain modeling decisions
- [ ] **rampart visualize** - Generate architecture diagrams
  - Context maps (inter-BC relationships)
  - Use-case maps (command/query flows)
  - C4 component diagrams (internal structure)

### Implementation Planning
- [ ] **rampart plan** - Generate implementation plan from architecture JSON
  - Compare blueprint against current codebase state
  - Output markdown document showing files to create/modify/delete
  - Support greenfield and incremental (sync new elements) modes

### Validation & Synchronization
- [ ] **rampart verify** - Run architecture fitness checks
  - Validate layer boundaries and dependency rules
  - Check inheritance and immutability constraints
  - Report violations with actionable guidance
- [ ] **rampart sync** - Detect drift and update architecture JSON
  - Scan codebase for added/modified/deleted elements
  - Require confirmation before updating architecture blueprint
  - Generate drift report for review and audit trail

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
