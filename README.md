# Rampart: Architecture on Rails

An Architecture-as-Code toolkit designed to bring disciplined, maintainable architecture to Rails applications—without abandoning the productivity of the monolith.

---

## Overview

### What problem does Rampart solve?

Organizations choose Rails because it's fast. A small team can ship features at remarkable speed, and the monolith keeps things simple.

Then the organization grows. A handful of developers become a hundred. Many teams work across many parts of the codebase. The original architects leave—and even those who stay can no longer keep the whole picture in their heads. Without explicit boundaries, entropy takes hold. The codebase becomes a big ball of mud: tangled dependencies, unclear ownership, and changes that ripple unpredictably across the system.

The company adopts AI-assisted development hoping to accelerate delivery, only to discover it makes everything worse. AI tools generate code quickly but don't understand architectural intent. They hallucinate dependencies, flatten carefully designed layers, and ignore boundaries—introducing structural inconsistencies faster than teams can catch them.

Rampart addresses both the scaling challenge and the AI challenge by providing:

- **Declarative architecture blueprints** that serve as the single source of truth for system structure
- **Nine curated architectural patterns**—centered on Domain-Driven Design and Hexagonal Architecture—that maximize both team autonomy and code clarity
- **AI-native design** with machine-readable formats that enable AI agents to understand and respect architectural boundaries
- **A Terraform-like workflow** for designing, scaffolding, validating, and evolving architecture over time

### What are the core goals of Rampart?

**Goal 1 — Bounded Context & Stream-Aligned Team Effectiveness**

Teams should be able to deliver end-to-end features *within a single bounded context* with minimal coordination across contexts.

**Goal 2 — Human & AI Code Clarity**

Code should be predictable, structured, and easy for both humans and AIs to understand, navigate, and maintain.

### Does Rampart replace Rails?

No. Rampart is not a Rails rewrite or alternative. It works *with* Rails, not against it.

Rampart provides architectural discipline on top of Rails. It enforces structure for bounded contexts, domain models, and application layers while remaining deliberately agnostic about testing frameworks, linters, ORMs, and other peripheral concerns.

### Is there another tool that already does this?

No. While several tools address pieces of this problem, none provide the full Architecture-as-Code lifecycle that Rampart offers.

Below are important capability gaps that current tools do not fill, along with examples of tools that come closest but still fall short:

| Missing Capability                                                            | Most Similar Tools                                       | Why They Fall Short                                                                                                                                                         |
| ----------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A single authoritative, version-controlled architecture blueprint**         | Structurizr, PlantUML, C4 model tools                    | These generate diagrams or model visualizations, but do not serve as living, enforced architectural specifications or a system of record.                                   |
| **Planning + structural change workflow (similar to Terraform plan)**         | OpenAPI/AsyncAPI (for API planning), Backstage templates | OpenAPI only covers API layers; Backstage handles service metadata, not domain structure or architectural decisions. No tool plans architectural scaffolding or migrations. |
| **Sync between architecture and code, including drift detection**             | ArchUnit, dependency-analysis tools, SonarQube           | These can detect certain code smells or dependency violations but cannot compare code to a declarative architecture model or enforce layered/domain boundaries.             |
| **DDD-native domain modeling (bounded contexts, aggregates, ports/adapters)** | ContextMapper (academic), Structurizr DSL                | These express relationships conceptually but lack Rails integration, scaffolding, JSON blueprints, or synchronization with real codebases.                                  |
| **Architecture-guided scaffolding without generating business logic**         | Rails generators, JHipster                               | Generators scaffold code quickly but do not encode or enforce architectural boundaries; they cannot evolve designs over time or keep architecture synchronized.             |
| **Migration planning from legacy codebases into modern architecture**         | vFunction (for Java), monolith decomposition tools       | Focused on technical decomposition or microservices extraction, not DDD-based restructuring, JSON blueprints, or Rails codebases.                                           |
| **AI-native architecture understanding and enforcement**                      | None                                                     | No current tool provides machine-parseable architecture blueprints designed specifically for LLM agents to use while writing or modifying code.                             |

**The gap**: While certain tools overlap partially with Rampart's goals, none provide a full Architecture-as-Code lifecycle with DDD semantics, scaffolding, drift detection, and AI-native integration.

### Where is Rampart opinionated?

Rampart enforces specific architectural choices where clarity and consistency are essential:

- **The Nine Architecture Patterns**: DDD bounded contexts, Hexagonal Architecture layering, use case modeling, and event-driven patterns represent the canonical way to structure Rampart applications
- **Monorepo Structure**: All bounded contexts must reside in a single monorepo for centralized architecture governance
- **Rails Engine Implementation**: Bounded contexts must be implemented as Rails engines for clear module boundaries. (In the future, it will support microservices)
- **JSON for Architecture Blueprints**: Blueprints use JSON (not YAML) for AI-safety and deterministic parsing
- **Dry-rb Foundation**: Built on the dry-rb ecosystem for type safety, immutability, and functional patterns
- **Packwerk Static Analysis**: Enforces layer boundaries (domain/application/infrastructure) and cross-context dependencies
- **Rspec Fitness Function Enforcement**: RSpec shared specs verify runtime dependency boundaries, base class contracts, immutability, and JSON blueprint synchronization

### Where is Rampart unopinionated?

Teams bring their own preferences for:

- Code formatters and linters (StandardRB, RuboCop, etc.)
- ORMs and databases (ActiveRecord, ROM, Sequel)
- Web frameworks (Rails, Hanami, Sinatra)
- Background job processors (Sidekiq, GoodJob, etc.)

---

## Architecture & Design

### What architecture patterns does Rampart use?

Rampart provides nine enforceable, AI-friendly architecture patterns:

1. **Domain-Driven Design** — Align software models with business domains using bounded contexts and tactical patterns
2. **Hexagonal Architecture** — Isolate domain logic from infrastructure through ports and adapters
3. **Clean Architecture / Onion** — Enforce strict dependency direction with framework-independent core
4. **Modular Monolith / Vertical Slices** — Organize code into autonomous vertical slices within a single deployable
5. **Lightweight CQRS & Task-Based Interfaces** — Separate read/write models with intent-revealing commands
6. **Domain Events & Event-Driven Modeling** — Decouple bounded contexts through immutable business facts
7. **Architecture Fitness Functions** — Validate architectural rules programmatically in CI/CD
8. **Functional Core / Imperative Shell** — Keep domain logic pure and side-effect-free
9. **C4 Model (Inside-the-Box)** — Visualize system structure at multiple levels of abstraction

For detailed explanations, anti-patterns, and implementation guidance, see [Architecture Philosophy](docs/rampart_architecture_philosophy.md).

### How does Rampart work with AI tools?

Current LLMs do not reliably follow architectural instructions. They hallucinate dependencies, flatten layers, and ignore boundaries. Rampart does not assume AI agents will behave perfectly. Instead, it positions itself as a **guardrail and reviewer**:

- **Detect, don't prevent** — AI agents will make structural mistakes. Rampart catches them via drift detection and fitness validation (Packwerk + RSpec)
- **Post-hoc verification** — After any AI-assisted code change, Packwerk and RSpec architecture specs confirm the architecture remains intact
- **Blame-free feedback loops** — When violations are detected, Rampart provides actionable guidance for correction
- **Future-proofed** — As LLMs improve, Rampart's JSON blueprints become more effective

### How is Rampart like Terraform?

Rampart can be viewed as a "Terraform for application architecture":

| Terraform Concept    | Rampart Equivalent                                 |
| -------------------- | -------------------------------------------------- |
| Resource definitions | Use cases, events, domain objects, adapters        |
| Dependency graph     | Event flows, inter-BC relationships, C4 components |
| Validate             | Fitness functions (Packwerk + RSpec)               |
| Plan                 | Architectural plan (`rampart plan`)                |
| Apply                | Scaffolding + agent-guided implementation          |
| State file           | Rampart architecture JSON blueprints               |
| Import               | Legacy extraction (`rampart extract`)              |

For the complete Terraform analogy, see [Architecture Philosophy](docs/rampart_architecture_philosophy.md#311-the-terraform-analogy).

---

## Getting Started

### How do I install the Rampart gem?

```ruby
gem 'rampart', path: '../rampart'  # For local development
```

Or from a gem server (when published):

```ruby
gem 'rampart'
```

### What functionality does the gem provide?

The Rampart gem provides base classes for implementing DDD and Hexagonal Architecture patterns:

- **Domain layer primitives** — Aggregates, entities, value objects, domain events, and domain services with built-in immutability and type safety
- **Application layer patterns** — Commands, queries, and application services for use case orchestration
- **Port abstractions** — Base classes for defining and implementing hexagonal ports and adapters
- **Type system** — Built on dry-types for runtime validation with monadic error handling via dry-monads

### How do I use the Rampart CLI?

Install the CLI (requires [Bun](https://bun.sh)):

```bash
cd rampart/cli && bun install
```

Then run with:

```bash
bun run rampart --help
```

### What features does the Rampart CLI provide?

The Rampart CLI manages the full architecture lifecycle:

- **Design & scaffold** — Initialize projects, create bounded contexts, and generate DDD directory structures
- **Plan & implement** — Generate implementation plans from architecture blueprints for human or AI execution
- **Validate & sync** — Run fitness checks and detect drift between code and architecture definitions
- **Migrate legacy** — Extract domain models and create phased migration plans for existing codebases

For complete CLI documentation, see [Features](docs/rampart_features.md#cli-tools-).


### What does a typical Rampart project look like?

```
project-root/
├── architecture/
│   ├── system.json           # System-level manifest
│   ├── catalog.json          # Per-bounded-context blueprint
│   └── payments.json
├── engines/
│   ├── catalog/              # Bounded context as Rails engine
│   └── payments/
└── apps/
    └── web/                  # Rails app
```

Each engine follows the DDD/Hexagonal structure while respecting Rails conventions:

```
engines/catalog/                 # "Catalog" bounded context
├── app/
│   ├── controllers/catalog      # Controller infrastructure 
│   ├── models/catalog           # ActiveRecord infrastructure
│   │
│   ├── domain/catalog/          # Domain layer
│   │   ├── aggregates/
│   │   ├── entities/
│   │   ├── value_objects/
│   │   ├── events/
│   │   ├── services/
│   │   └── ports/
│   │
│   ├── application/catalog/     # Application layer
│   │   ├── services/
│   │   ├── commands/
│   │   └── queries/
│   │
│   └── infrastructure/catalog/  # Infrastructure layer (except Rails infrastructure as noted above)
│       ├── persistence/
│       │   ├── mappers/
│       │   └── repositories/
│       ├── http/
│       │   └── serializers/
│       ├── adapters/
│       └── wiring/
```

For complete project structure details, see [System Overview](docs/rampart_system.md).

### Can I see some example code snippets?

```ruby
# Domain Layer - Pure Ruby
class Order < Rampart::Domain::AggregateRoot
  attribute :id, Types::String
  attribute :items, Types::Array.default([].freeze)
  
  def add_item(product, quantity)
    updated_items = items + [LineItem.new(product: product, quantity: quantity)]
    self.class.new(**attributes.merge(items: updated_items))
  end
end

# Application Layer - Use Cases
class CreateOrderService < Rampart::Application::Service
  include Dry::Monads[:result]
  
  def call(command)
    order = Order.create(id: generate_id, customer_id: command.customer_id)
    persisted = @order_repo.save(order)
    Success(persisted)
  end
end

# Infrastructure Layer - Adapters
class SqlOrderRepository < Rampart::Ports::SecondaryPort
  def save(order)
    OrderMapper.to_record(order).save!
    order
  end
end
```

---

## Learning More

### Where can I find documentation?

- **[Architecture Philosophy](docs/rampart_architecture_philosophy.md)** - Core principles, patterns, and anti-patterns
- **[User Guide](docs/rampart_user_guide.md)** - Day-to-day usage and best practices
- **[Features](docs/rampart_features.md)** - Complete feature list, CLI tools, and implementation details
- **[System Overview](docs/rampart_system.md)** - System architecture and component relationships

### Is there a demo application?

**[Cats-as-a-Service](https://github.com/pcaplan/cats-as-a-service)** - A complete Rails + Next.js e-commerce application demonstrating Rampart patterns in practice with bounded context engines, clean architecture, and DDD tactical patterns.

---

## License

Apache License 2.0
