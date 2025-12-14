# Rampart: Architecture on Rails

An Architecture-as-Code toolkit designed to bring disciplined, maintainable architecture to Rails applications—without abandoning the productivity of the monolith.

## Overview

As AI-assisted development becomes ubiquitous, teams face a growing challenge: AI tools can accelerate coding but often introduce structural inconsistencies that erode architectural integrity over time. Meanwhile, teams want the rapid development Rails enables, but struggle to maintain clean boundaries as applications scale.

Rampart addresses both needs by providing:

- **Declarative architecture blueprints** that serve as the single source of truth for system structure
- **Nine curated architectural patterns**—centered on Domain-Driven Design and Hexagonal Architecture—that maximize both team autonomy and code clarity
- **AI-native design** with machine-readable formats that enable AI agents to understand and respect architectural boundaries
- **A Terraform-like workflow** for designing, scaffolding, validating, and evolving architecture over time

Rampart supports greenfield development and legacy migration alike, positioning it as the preferred path for Rails teams seeking modern architectural discipline.

### Core Goals

**Goal 1 — Bounded Context & Stream-Aligned Team Effectiveness**

Teams should be able to deliver end-to-end features *within a single bounded context* with minimal coordination across contexts.

**Goal 2 — Human & AI Code Clarity**

Code should be predictable, structured, and easy for both humans and AIs to understand, navigate, and maintain.

Only approaches that score **High** on at least one of these goals are included in Rampart.

---

## Guiding Principles & Architectural Opinions

Like Rails, Rampart is an **opinionated framework**—but its opinions are focused squarely on architecture, not tooling. It provides "one right way" to structure bounded contexts, define domain models, and organize application layers, while remaining deliberately agnostic about testing frameworks, linters, ORMs, and other peripheral concerns.

### Core Principles

- **Bounded Context Autonomy**: Architecture should maximize team independence by enabling end-to-end feature delivery within a single bounded context.
- **Human & AI Clarity**: All structures, patterns, and blueprints should be predictable and easily understood by both humans and AI agents.
- **Architecture as Code**: Architecture defined in structured files rather than ephemeral diagrams or docs.
- **AI-Friendly Structures**: Use strictly valid, machine-safe formats for interoperability with AI agents.
- **Minimal Scaffolding, Maximal Guidance**: The tool should not implement business logic, only create structure and plans.
- **Maintain Sync Between Code and Architecture**: Support workflows where changes in one must be reflected in the other.
- **Rails-Friendly, Not Rails-Dependent**: The design supports Rails engines but keeps the core principles framework-agnostic.

### Where Rampart Is Opinionated

Rampart enforces specific architectural choices where clarity and consistency are essential:

- **The Nine Architecture Patterns** (see below): These are not optional. DDD bounded contexts, Hexagonal Architecture layering, use case modeling, and event-driven patterns represent the canonical way to structure Rampart applications.
- **Monorepo Structure**: All bounded contexts must reside in a single monorepo for centralized architecture governance and consistent tooling.
- **Rails Engine Implementation**: Bounded contexts must be implemented as Rails engines for clear module boundaries and namespace isolation.
- **JSON for Architecture Blueprints**: Blueprints use JSON (not YAML) for AI-safety and deterministic parsing.
- **Dry-rb Foundation**: Rampart builds on the dry-rb ecosystem (dry-types, dry-struct, dry-monads, dry-container) for type safety, immutability, and functional patterns.
- **Fitness Function Enforcement**: Architecture boundaries are validated programmatically—this is non-negotiable for maintaining integrity over time.

### Where Rampart Is Deliberately Unopinionated

Teams bring their own preferences for:

- **Testing frameworks** (RSpec, Minitest, etc.)
- **Code formatters and linters** (StandardRB, RuboCop, etc.)
- **ORMs and databases** (ActiveRecord, ROM, Sequel)
- **Web frameworks** (Rails, Hanami, Sinatra)
- **Background job processors** (Sidekiq, GoodJob, etc.)

### What Rampart Is Not

- Rampart is not a Rails rewrite.
- It is not a code generator for business logic; scaffolding stays minimal and structural.
- It is not a linter or code formatter—it validates architecture, not syntax.
- It does not prescribe specific ORMs, controllers, or background job frameworks.

---

## Architecture Patterns

Rampart provides nine enforceable, AI-friendly architecture patterns. Each is rated against the two core goals.

> For detailed explanations, anti-patterns, and implementation guidance, see [Architecture Philosophy](docs/rampart_architecture_philosophy.md).

| Pattern | Goal 1 (BC Autonomy) | Goal 2 (Clarity) |
|---------|---------------------|------------------|
| **Domain-Driven Design** | HIGH | HIGH |
| **Hexagonal Architecture** | HIGH | HIGH |
| **Clean Architecture / Onion** | HIGH | HIGH |
| **Modular Monolith / Vertical Slices** | HIGH | MEDIUM–HIGH |
| **Lightweight CQRS & Task-Based Interfaces** | MEDIUM–HIGH | HIGH |
| **Domain Events & Event-Driven Modeling** | HIGH | MEDIUM |
| **Architecture Fitness Functions** | HIGH | VERY HIGH |
| **Functional Core / Imperative Shell** | MEDIUM | HIGH |
| **C4 Model (Inside-the-Box)** | MEDIUM | HIGH |

### High Impact Summary

**Bounded context autonomy**: DDD, Hexagonal, Clean Architecture, Modular Monolith, Domain Events, Fitness Functions

**Human + AI clarity**: Hexagonal, Clean Architecture, CQRS, Functional Core, Fitness Functions, C4 Diagrams

---

## Framework Features

Rampart provides building blocks for implementing DDD patterns in Ruby applications:

- **DDD Tactical Patterns** - Aggregates, Entities, Value Objects, Domain Events, Domain Services
- **Hexagonal Architecture** - Clear port/adapter separation with dependency inversion
- **Clean Architecture** - Framework-independent domain layer with testable business rules
- **Type Safety** - Built on dry-types for runtime type checking
- **Monadic Results** - Error handling without exceptions using dry-monads

## Installation

```ruby
gem 'rampart', path: '../rampart'  # For local development
```

Or from a gem server (when published):

```ruby
gem 'rampart'
```

## Quick Example

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

## Documentation

- **[Architecture Philosophy](docs/rampart_architecture_philosophy.md)** - Core principles, patterns, and anti-patterns
- **[User Guide](docs/rampart_user_guide.md)** - Day-to-day usage and best practices
- **[Features](docs/rampart_features.md)** - Complete feature list, CLI tools, and implementation details
- **[System Overview](docs/rampart_system.md)** - System architecture and component relationships

## Demo Application

**[Cats-as-a-Service](https://github.com/pcaplan/cats-as-a-service)** - A complete Rails + Next.js e-commerce application demonstrating Rampart patterns in practice with bounded context engines, clean architecture, and DDD tactical patterns.

## Core Classes

### Domain Layer
- `AggregateRoot` - Consistency boundaries with event tracking
- `Entity` - Objects with identity
- `ValueObject` - Immutable value objects
- `DomainEvent` - Business events with versioning
- `DomainService` - Domain logic services
- `DomainException` - Domain-specific errors

### Application Layer
- `Command` - Write operation DTOs
- `Query` - Read operation DTOs
- `Service` - Application services / use cases
- `Transaction` - Transaction boundaries

### Ports
- `SecondaryPort` - Outbound interface abstractions
- `EventBusPort` - Event publishing interface

## Project Structure

```
rampart/
├── lib/rampart/          # Framework source code
│   ├── domain/           # Domain layer base classes
│   ├── application/      # Application layer base classes
│   ├── ports/            # Port abstractions
│   └── support/          # Utilities (Container, Result, Types)
├── cli/                  # CLI tools for architecture management
├── docs/                 # Documentation
└── rampart.gemspec       # Gem specification
```

## Dependencies

- `dry-types ~> 1.7` - Type system
- `dry-struct ~> 1.6` - Immutable structs
- `dry-container ~> 0.11` - Dependency injection
- `dry-auto_inject ~> 1.0` - Auto-injection
- `dry-monads ~> 1.6` - Monadic error handling
- `dry-initializer ~> 3.1` - Object initialization

## License

Apache License 2.0
