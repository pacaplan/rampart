# Rampart

A pure-Ruby framework for building Domain-Driven Design applications with Hexagonal Architecture and Clean Architecture principles.

## Overview

Rampart provides building blocks for implementing DDD patterns in Ruby applications. It enforces clean architecture by separating domain logic from infrastructure concerns.

## Architecture Patterns

Rampart implements five complementary architectural approaches from the [Rampart Vision](../../docs/rampart/rampart_vision.md):

### 3.1 Domain-Driven Design (DDD)

Strategic and tactical patterns for aligning software with business domains:
- **Aggregates** - Consistency boundaries with `AggregateRoot`
- **Entities** - Objects with identity via `Entity`
- **Value Objects** - Immutable objects compared by value via `ValueObject`
- **Domain Events** - Business-meaningful occurrences via `DomainEvent`
- **Domain Services** - Logic that doesn't belong to entities via `DomainService`

### 3.2 Hexagonal Architecture (Ports & Adapters)

Domain and application logic in the center, infrastructure as adapters:
- **Secondary Ports** - Outbound interfaces defined in domain layer (`SecondaryPort`)
- **Adapters** - Infrastructure implementations of ports
- **Dependency Inversion** - Domain depends on abstractions, not implementations

### 3.3 Clean Architecture Alignment

Rampart's patterns align with Uncle Bob's Clean Architecture principles:
- **Dependency Rule** - Domain and Application layers have no outward dependencies
- **Framework Independence** - Domain layer is pure Ruby with no Rails dependencies
- **Use Cases** - Application Services orchestrate domain logic (equivalent to Clean Architecture "use cases")
- **Testability** - Business rules can be tested without UI, database, or external systems

The layer-first directory structure (`domain/`, `application/`, `infrastructure/`) provides predictable navigation and AI-friendly conventions across all bounded contexts.

### 3.4 Modular Monolith Support

Rampart patterns are designed for use within Rails Engines, supporting the Modular Monolith architecture:
- **Engine Isolation** - Each bounded context is a separate Rails Engine with `isolate_namespace`
- **Schema Isolation** - Dedicated database schema per bounded context
- **Vertical Slice at BC Level** - Engine contains all layers for one domain
- **Extractability** - Engine structure enables future extraction to standalone service

### 3.5 Lightweight CQRS & Task-Based Interfaces

Rampart separates reads from writes with immutable Command and Query objects:
- **Command DTOs** - Task-based, intent-revealing objects (e.g., `ShipOrder`, `GenerateCustomCat`) for state changes
- **Query DTOs** - Read-focused objects optimized for listing, filtering, or projections without touching domain aggregates
- **Application Services** - Coordinate commands and queries, enforcing business rules at clear boundaries
- **Result Monads** - Commands return `Success(value)` or `Failure(error)` so adapters can render deterministic responses
This lightweight CQRS approach keeps a single data store but enforces explicit interfaces that clarify bounded-context ownership and make code easier for humans and AI tools to follow.

### 3.6 Domain Events & Event-Driven Modeling

Domain events capture business facts in past tense and enable decoupled reactions:
- **Immutable Events** - `DomainEvent` value objects include `event_id`, `occurred_at`, and `schema_version`
- **Application Integration** - Application services publish events after persistence; aggregates remain pure and immutable
- **Event Bus Port** - `EventBusPort` abstraction lets applications publish events to any transport
- **Pragmatic Scope** - Event publishing without mandating full event sourcing or an event store

### 3.7 Architecture Fitness Functions / Architecture-as-Code

Executable checks keep bounded contexts aligned with their intended shape:
- **Rampart::Testing::ArchitectureMatchers** - RSpec helpers for inheritance checks, immutability, port implementation coverage, and Rails dependency bans
- **Per-Engine Architecture Specs** - Use matchers to assert aggregates/value objects/ports/CQRS DTOs inherit from Rampart base classes and repositories return domain objects
- **Blueprint JSON** - Optional machine-readable description of layers and allowed dependencies for future CLI verification
- **Packwerk Deferred** - Static layer enforcement is noted but postponed until multiple bounded contexts exist

### 3.8 Functional Core / Imperative Shell

Rampart keeps the domain layer pure and immutable (Functional Core) while concentrating I/O in the application and infrastructure layers (Imperative Shell):
- **Immutable Aggregates** - Domain methods return new instances rather than mutating state or buffering events
- **Side-Effect Free Domain** - No persistence, logging, or HTTP calls inside domain classes
- **Application Services as Shell** - Coordinate repositories, publish events, and invoke adapters after persisting new aggregate state
- **Clarity** - Predictable behavior for humans and AI tools with no hidden mutations

## Features

- **Pure Ruby** - No Rails dependencies, works in any Ruby application
- **DDD Building Blocks** - Aggregates, Entities, Value Objects, Domain Events, Domain Services
- **Hexagonal Architecture** - Clear port/adapter separation with primary and secondary ports
- **Type Safety** - Built on dry-types for runtime type checking
- **Monadic Results** - Uses dry-monads for error handling without exceptions
- **Container Support** - Dependency injection with dry-container
- **Auto-Injection** - Automatic dependency resolution with dry-auto_inject

## Dependencies

- `dry-types ~> 1.7` - Type system and coercion
- `dry-struct ~> 1.6` - Immutable struct with type checking
- `dry-container ~> 0.11` - Dependency injection container
- `dry-auto_inject ~> 1.0` - Automatic dependency injection
- `dry-monads ~> 1.6` - Monadic error handling

## Architecture

### Domain Layer

Pure business logic with no framework dependencies.

```ruby
# Aggregate Root
class Order < Rampart::Domain::AggregateRoot
  attribute :id, Types::String
  attribute :customer_id, Types::String
  attribute :items, Types::Array.default([].freeze)
  attribute :status, Types::String

  def self.create(id:, customer_id:)
    new(id: id, customer_id: customer_id, items: [], status: "draft")
  end

  def add_item(product, quantity)
    updated_items = items + [LineItem.new(product: product, quantity: quantity)]
    self.class.new(**attributes.merge(items: updated_items))
  end

  def submit
    self.class.new(**attributes.merge(status: "submitted"))
  end
end

# Value Object
class Money < Rampart::Domain::ValueObject
  attribute :amount_cents, Types::Integer
  attribute :currency, Types::String.default("USD")
  
  def +(other)
    raise ArgumentError unless currency == other.currency
    self.class.new(amount_cents: amount_cents + other.amount_cents, currency: currency)
  end
end

# Domain Event
class OrderSubmitted < Rampart::Domain::DomainEvent
  attribute :order_id, Types::String
  attribute :submitted_by, Types::String
end

# Repository Interface (Port)
class OrderRepository < Rampart::Ports::SecondaryPort
  abstract_method :find, :save
end
```

### Application Layer

Use cases and application logic.

```ruby
# Command
class CreateOrderCommand < Rampart::Application::Command
  attribute :customer_id, Types::String
  attribute :items, Types::Array
end

# Application Service
class CreateOrderService < Rampart::Application::Service
  include Dry::Monads[:result]
  
  def initialize(order_repo:, id_generator:, event_bus:)
    @order_repo = order_repo
    @id_generator = id_generator
    @event_bus = event_bus
  end
  
  def call(command)
    order = Order.create(
      id: @id_generator.generate,
      customer_id: command.customer_id
    )
    
    order_with_items = command.items.reduce(order) { |agg, item| agg.add_item(item) }

    persisted = @order_repo.save(order_with_items)
    @event_bus.publish(OrderSubmitted.new(order_id: persisted.id, submitted_by: command.customer_id))

    Success(persisted)
  rescue => e
    Failure([:error, e.message])
  end
end
```

### Infrastructure Layer

Framework-specific implementations (adapters).

```ruby
# Repository Implementation (Secondary Adapter)
class SqlOrderRepository < OrderRepository
  def find(id)
    record = OrderRecord.find_by(id: id)
    return nil unless record
    OrderMapper.to_domain(record)
  end
  
  def save(order)
    record = OrderMapper.to_record(order)
    record.save!
    order.clear_events!
    order
  end
end

# REST Controller (Primary Adapter)
class OrdersController < ApplicationController
  def create
    command = CreateOrderCommand.new(params.permit(:customer_id, items: []))
    result = create_order_service.call(command)
    
    case result
    in Success(order)
      render json: OrderSerializer.new(order).as_json, status: :created
    in Failure([:error, message])
      render json: { error: message }, status: :unprocessable_entity
    end
  end
  
  private
  
  def create_order_service
    Container.resolve(:create_order_service)
  end
end
```

## Core Classes

### Domain

- **AggregateRoot** - Base class for aggregate roots with event tracking
- **Entity** - Base class for entities with identity
- **ValueObject** - Base class for immutable value objects
- **DomainEvent** - Base class for domain events with versioning
- **DomainException** - Base exception with context
- **DomainService** - Base class for domain services

### Application

- **Command** - Base class for commands (write operations)
- **Query** - Base class for queries (read operations)
- **Service** - Base class for application services
- **Transaction** - Transaction boundary abstraction

### Ports

- **SecondaryPort** - Base class for secondary ports (outbound interfaces)

## Installation

Add to your Gemfile:

```ruby
gem 'rampart', path: 'gems/rampart'
```

Or install from a gem server (when published):

```ruby
gem 'rampart'
```

## Examples

See the engines in this repository for complete examples:
- `engines/cat_content` - Cat & Content bounded context

## Testing

Domain and application layers should be tested without any infrastructure:

```ruby
RSpec.describe Order do
  it "adds items to order" do
    order = Order.create(id: "123", customer_id: "456")
    updated = order.add_item("product-1", 2)
    
    expect(updated.items.count).to eq(1)
    expect(order.items.count).to eq(0) # immutability: original instance untouched
  end
end
```

## License

The gem is available as open source under the terms of the Apache License 2.0.
