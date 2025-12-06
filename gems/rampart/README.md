# Rampart

A pure-Ruby framework for building Domain-Driven Design applications with Hexagonal Architecture and Clean Architecture principles.

## Overview

Rampart provides building blocks for implementing DDD patterns in Ruby applications. It enforces clean architecture by separating domain logic from infrastructure concerns.

## Architecture Patterns

Rampart implements three complementary architectural approaches from the [Rampart Vision](../../docs/rampart/rampart_vision.md):

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
  def initialize(id:)
    super(id: id)
    @items = []
  end
  
  def add_item(product, quantity)
    apply ItemAdded.new(order_id: id, product: product, quantity: quantity)
  end
  
  private
  
  def on_item_added(event)
    @items << LineItem.new(product: event.product, quantity: event.quantity)
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
class ItemAdded < Rampart::Domain::DomainEvent
  attribute :order_id, Types::String
  attribute :product, Types::String
  attribute :quantity, Types::Integer
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
  
  def initialize(order_repo:, id_generator:)
    @order_repo = order_repo
    @id_generator = id_generator
  end
  
  def call(command)
    order = Order.create(
      id: @id_generator.generate,
      customer_id: command.customer_id
    )
    
    command.items.each { |item| order.add_item(item) }
    
    @order_repo.save(order)
    Success(order)
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
    order.add_item("product-1", 2)
    
    expect(order.items.count).to eq(1)
    expect(order.unpublished_events).to contain_exactly(
      an_instance_of(ItemAdded)
    )
  end
end
```

## License

The gem is available as open source under the terms of the Apache License 2.0.

