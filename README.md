# Rampart

A pure-Ruby framework for building Domain-Driven Design applications with Hexagonal Architecture and Clean Architecture principles.

## Overview

Rampart provides building blocks for implementing DDD patterns in Ruby applications. It enforces clean architecture by separating domain logic from infrastructure concerns through:

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
- **[Features](docs/rampart_features.md)** - Complete feature list and implementation details
- **[System Overview](docs/rampart_system.md)** - System architecture and component relationships
- **[Vision](docs/rampart_vision.md)** - Long-term goals and roadmap

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
