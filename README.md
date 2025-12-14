# Rampart

A pure-Ruby framework for building Domain-Driven Design applications with Hexagonal Architecture and Clean Architecture principles.

## Overview

Rampart provides building blocks for implementing DDD patterns in Ruby applications. It enforces clean architecture by separating domain logic from infrastructure concerns.

## Architecture Patterns

Rampart implements complementary architectural approaches:

### Domain-Driven Design (DDD)

Strategic and tactical patterns for aligning software with business domains:
- **Aggregates** - Consistency boundaries with `AggregateRoot`
- **Entities** - Objects with identity via `Entity`
- **Value Objects** - Immutable objects compared by value via `ValueObject`
- **Domain Events** - Business-meaningful occurrences via `DomainEvent`
- **Domain Services** - Logic that doesn't belong to entities via `DomainService`

### Hexagonal Architecture (Ports & Adapters)

Domain and application logic in the center, infrastructure as adapters:
- **Secondary Ports** - Outbound interfaces defined in domain layer (`SecondaryPort`)
- **Adapters** - Infrastructure implementations of ports
- **Dependency Inversion** - Domain depends on abstractions, not implementations

### Clean Architecture Alignment

Rampart's patterns align with Uncle Bob's Clean Architecture principles:
- **Dependency Rule** - Domain and Application layers have no outward dependencies
- **Framework Independence** - Domain layer is pure Ruby with no Rails dependencies
- **Use Cases** - Application Services orchestrate domain logic
- **Testability** - Business rules can be tested without UI, database, or external systems

## Features

- **Pure Ruby** - No Rails dependencies, works in any Ruby application
- **DDD Building Blocks** - Aggregates, Entities, Value Objects, Domain Events, Domain Services
- **Hexagonal Architecture** - Clear port/adapter separation with primary and secondary ports
- **Type Safety** - Built on dry-types for runtime type checking
- **Monadic Results** - Uses dry-monads for error handling without exceptions
- **Container Support** - Dependency injection with dry-container
- **Auto-Injection** - Automatic dependency resolution with dry-auto_inject

## Installation

Add to your Gemfile:

```ruby
gem 'rampart', path: '../rampart'  # For local development
```

Or install from a gem server (when published):

```ruby
gem 'rampart'
```

## Quick Start

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

## Project Structure

```
rampart/
├── lib/                    # Gem source code
│   └── rampart/
│       ├── domain/         # Domain layer base classes
│       ├── application/    # Application layer base classes
│       ├── ports/          # Port abstractions
│       └── support/        # Supporting utilities
├── cli/                    # CLI tools for architecture management
├── docs/                   # Framework documentation
├── rampart.gemspec         # Gem specification
└── README.md               # This file
```

## Documentation

- [Architecture Philosophy](docs/rampart_architecture_philosophy.md) - Core principles and patterns
- [User Guide](docs/rampart_user_guide.md) - Day-to-day usage guidance
- [Features](docs/rampart_features.md) - Detailed feature documentation
- [System Overview](docs/rampart_system.md) - System-level architecture
- [Vision](docs/rampart_vision.md) - Long-term goals and direction

## Demo Application

Rampart is demonstrated through a real-world Rails + Next.js application:

**Cats-as-a-Service** - A cat e-commerce platform showcasing Rampart patterns in practice.

- Repository: https://github.com/pcaplan/cats-as-a-service
- Features: Rails API with bounded context engines, Next.js frontend, Supabase database
- Documentation: Complete implementation guide and architecture decisions

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

## Dependencies

- `dry-types ~> 1.7` - Type system and coercion
- `dry-struct ~> 1.6` - Immutable struct with type checking
- `dry-container ~> 0.11` - Dependency injection container
- `dry-auto_inject ~> 1.0` - Automatic dependency injection
- `dry-monads ~> 1.6` - Monadic error handling
- `dry-initializer ~> 3.1` - Flexible object initialization

## License

The gem is available as open source under the terms of the Apache License 2.0.
