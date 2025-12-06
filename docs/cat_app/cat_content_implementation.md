# Rampart Framework + Catalog Bounded Context

This document describes the full technical specification for:

1. **Rampart** — a pure-Ruby framework implementing Domain‑Driven Design + Hexagonal Architecture using dry‑rb gems.
2. **Catalog Bounded Context Implementation** inside a Rails app — using Rampart for domain and application layers, and Rails only inside the infrastructure layer.

It includes:
- Directory structure
- Component architecture
- Example implementations
- Rails integration details

---

## 1. Rampart GEM — Architecture and Design

Rampart is a pure-Ruby gem that provides foundational building blocks for creating bounded contexts.

### 1.1 Principles
- **No Rails dependency**
- Built on **dry-types**, **dry-struct**, **dry-container**, **dry-auto_inject**, **dry-monads**
- Provides abstractions for Domain, Application, Ports, Adapters
- Follows Hexagonal Architecture conventions

### 1.2 Directory Structure
```
rampart/
  lib/
    rampart.rb
    rampart/
      domain/
        aggregate_root.rb
        entity.rb
        value_object.rb
        domain_event.rb
        domain_exception.rb
        domain_service.rb
        repository.rb
      application/
        command.rb
        query.rb
        handler.rb
        service.rb
        transaction.rb
      ports/
        primary_port.rb
        secondary_port.rb
      adapters/
        persistence/
          repository_base.rb
      support/
        result.rb
        id.rb
    rampart/version.rb
```

### 1.3 Example Implementations

#### AggregateRoot
```ruby
module Rampart
  module Domain
    class AggregateRoot
      attr_reader :id, :unpublished_events

      def initialize(id:)
        @id = id
        @unpublished_events = []
      end

      private

      def apply(event)
        @unpublished_events << event
        handler = "on_#{event.class.name.split('::').last.underscore}"
        send(handler, event) if respond_to?(handler, true)
      end

      def clear_events!
        @unpublished_events.clear
      end
    end
  end
end
```

#### Repository Interface
```ruby
module Rampart
  module Domain
    class Repository
      def add(_)  = raise NotImplementedError
      def find(_) = raise NotImplementedError
      def remove(_) = raise NotImplementedError
    end
  end
end
```

#### Domain Exception
```ruby
module Rampart
  module Domain
    class DomainException < StandardError
      attr_reader :code, :context

      def initialize(message, code: nil, context: {})
        @code = code
        @context = context
        super(message)
      end
    end
  end
end
```

Example domain-specific exceptions:
```ruby
module Catalog
  module Exceptions
    class CatAlreadyListedError < Rampart::Domain::DomainException
      def initialize(cat_id)
        super(
          "Cat #{cat_id} is already listed",
          code: :cat_already_listed,
          context: { cat_id: cat_id }
        )
      end
    end

    class InvalidSlugError < Rampart::Domain::DomainException
      def initialize(slug, reason:)
        super(
          "Invalid slug '#{slug}': #{reason}",
          code: :invalid_slug,
          context: { slug: slug, reason: reason }
        )
      end
    end
  end
end
```

#### Command / Query
```ruby
module Rampart
  module Application
    class Command
      def initialize(**attrs)
        attrs.each { |k, v| instance_variable_set("@#{k}", v) }
      end
    end

    class Query
      def initialize(**attrs)
        attrs.each { |k, v| instance_variable_set("@#{k}", v) }
      end
    end
  end
end
```

#### Transaction Boundary
```ruby
module Rampart
  module Application
    class Transaction
      def initialize(adapter)
        @adapter = adapter
      end

      def call(&block)
        @adapter.call(&block)
      end
    end
  end
end
```

#### Domain Event (with Versioning)
```ruby
require "dry-struct"
require "securerandom"

module Rampart
  module Domain
    class DomainEvent < Dry::Struct
      # Schema version enables event evolution without breaking consumers.
      # Increment when adding/removing/renaming attributes.
      SCHEMA_VERSION = 1

      attribute :event_id, Types::String.default { SecureRandom.uuid }
      attribute :occurred_at, Types::Time.default { Time.now }
      attribute :schema_version, Types::Integer.default { self::SCHEMA_VERSION }

      def event_type
        self.class.name
      end
    end
  end
end
```

Example versioned domain event:
```ruby
module Catalog
  module Events
    class CatListed < Rampart::Domain::DomainEvent
      SCHEMA_VERSION = 1

      attribute :cat_id, Types::String
      attribute :name, Types::String
      attribute :listed_at, Types::Time.default { Time.now }
    end

    # Example: V2 adds a new field without breaking existing consumers
    class CatListedV2 < Rampart::Domain::DomainEvent
      SCHEMA_VERSION = 2

      attribute :cat_id, Types::String
      attribute :name, Types::String
      attribute :slug, Types::String          # New in V2
      attribute :listed_by, Types::String.optional  # New in V2
      attribute :listed_at, Types::Time.default { Time.now }
    end
  end
end
```

#### Primary & Secondary Ports
```ruby
module Rampart
  module Ports
    module PrimaryPort; end
    module SecondaryPort; end
  end
end
```

---

# 2. Rails App — Catalog Bounded Context

The Rails app uses `app/domain`, `app/application`, `app/infrastructure`.

Rails is **only allowed in infrastructure**.

## 2.1 Final Directory Layout
```
app/
  domain/
    catalog/
      aggregates/
      entities/
      value_objects/
      events/
      services/
      repositories/

  application/
    catalog/
      commands/
      queries/
      handlers/
      dto/

  infrastructure/
    catalog/
      persistence/
        models/
        mappers/
        repositories/
      http/
        controllers/
        serializers/
      messaging/
      wiring/
```

---

# 3. Catalog Domain Layer (Pure Ruby)

## Example: Value Objects

### Money
```ruby
require "dry-struct"
require "dry-types"

module Catalog
  module ValueObjects
    module Types
      include Dry.Types()
    end

    class Money < Dry::Struct
      attribute :amount_cents, Types::Integer
      attribute :currency, Types::String.default("USD")

      def formatted
        "$#{format('%.2f', amount_cents / 100.0)} #{currency}"
      end
    end
  end
end
```

### CatId
```ruby
class Catalog::ValueObjects::CatId < Dry::Struct
  attribute :value, Catalog::ValueObjects::Types::String
  def to_s = value
end
```

### CatType
```ruby
class Catalog::ValueObjects::CatType < Dry::Struct
  attribute :value, Types::Symbol.enum(:pre_made, :custom)
end
```

### Slug
```ruby
class Catalog::ValueObjects::Slug < Dry::Struct
  VALID_SLUG_PATTERN = /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/
  MAX_LENGTH = 100

  attribute :value, Catalog::ValueObjects::Types::String.constrained(
    format: VALID_SLUG_PATTERN,
    max_size: MAX_LENGTH
  )

  def self.generate_from(name)
    normalized = name
      .downcase
      .gsub(/[^a-z0-9\s-]/, '')  # Remove special chars
      .gsub(/\s+/, '-')          # Spaces to hyphens
      .gsub(/-+/, '-')           # Collapse multiple hyphens
      .gsub(/\A-|-\z/, '')       # Trim leading/trailing hyphens
      .slice(0, MAX_LENGTH)

    new(value: normalized)
  end

  def to_s = value

  def ==(other)
    other.is_a?(Slug) && other.value == value
  end
end
```

---

## Aggregate: CatListing
```ruby
module Catalog
  module Aggregates
    class CatListing < Rampart::Domain::AggregateRoot
      STATUS_LISTED = "listed"
      STATUS_UNLISTED = "unlisted"

      attr_reader :name, :price, :status, :slug, :cat_type

      def self.list_new(id:, name:, price:, slug:, cat_type:)
        listing = new(
          id: id,
          name: name,
          price: price,
          status: STATUS_UNLISTED,
          slug: slug,
          cat_type: cat_type
        )
        listing.list!
        listing
      end

      def list!
        return if listed?
        apply Catalog::Events::CatListed.new(cat_id: id)
      end

      def listed?
        status == STATUS_LISTED
      end

      private

      def on_cat_listed(_event)
        @status = STATUS_LISTED
      end
    end
  end
end
```

---

# 4. Catalog Application Layer (Pure Ruby)

## Command Example
```ruby
class Catalog::Application::Commands::ListCat < Rampart::Application::Command
  include Rampart::Ports::PrimaryPort

  attr_reader :id, :name, :price_cents, :currency, :slug, :cat_type
end
```

## Handler Example
```ruby
class Catalog::Application::Handlers::ListCatHandler < Rampart::Application::Handler
  include Dry::Monads[:result]

  def initialize(cat_listing_repo:, transaction:, event_bus:)
    @repo = cat_listing_repo
    @tx   = transaction
    @bus  = event_bus
  end

  def call(cmd)
    @tx.call do
      id = Catalog::ValueObjects::CatId.new(value: cmd.id)
      price = Catalog::ValueObjects::Money.new(
        amount_cents: cmd.price_cents,
        currency: cmd.currency
      )
      slug = Catalog::ValueObjects::Slug.new(value: cmd.slug)
      type = Catalog::ValueObjects::CatType.new(value: cmd.cat_type)

      listing = Catalog::Aggregates::CatListing.list_new(
        id: id,
        name: cmd.name,
        price: price,
        slug: slug,
        cat_type: type
      )

      @repo.add(listing)
      listing.unpublished_events.each { |e| @bus.publish(e) }
      listing.clear_events!

      Success(listing)
    end
  rescue => e
    Failure(e)
  end
end
```

---

# 5. Infrastructure Layer (Rails-Only)

## ActiveRecord Models
```ruby
class CatListingRecord < ApplicationRecord
  self.table_name = "cat_listings"
end
```

## Mapper
```ruby
class Catalog::Infrastructure::Persistence::Mappers::CatListingMapper
  def to_domain(record)
    Catalog::Aggregates::CatListing.new(
      id: Catalog::ValueObjects::CatId.new(value: record.id),
      name: record.name,
      price: Catalog::ValueObjects::Money.new(
        amount_cents: record.price_cents,
        currency: record.currency
      ),
      status: record.status,
      slug: Catalog::ValueObjects::Slug.new(value: record.slug),
      cat_type: Catalog::ValueObjects::CatType.new(value: record.cat_type.to_sym)
    )
  end

  def to_record(aggregate)
    CatListingRecord.find_or_initialize_by(id: aggregate.id.to_s).tap do |r|
      r.name        = aggregate.name
      r.price_cents = aggregate.price.amount_cents
      r.currency    = aggregate.price.currency
      r.status      = aggregate.status
      r.slug        = aggregate.slug.to_s
      r.cat_type    = aggregate.cat_type.value.to_s
    end
  end
end
```

## Repository Implementation
```ruby
class Catalog::Infrastructure::Persistence::Repositories::ARCatListingRepository < Catalog::Repositories::CatListingRepository
  def initialize(mapper: Catalog::Infrastructure::Persistence::Mappers::CatListingMapper.new)
    @mapper = mapper
  end

  def add(agg)
    rec = @mapper.to_record(agg)
    rec.save!
    agg
  end

  def find(id)
    rec = CatListingRecord.find_by(id: id.to_s)
    rec && @mapper.to_domain(rec)
  end

  def list_all_listed
    CatListingRecord.where(status: Catalog::Aggregates::CatListing::STATUS_LISTED)
                     .map { |r| @mapper.to_domain(r) }
  end
end
```

## Rails Controller
```ruby
class Catalog::Infrastructure::HTTP::CatListingsController < ApplicationController
  def index
    result = query_bus.call(Catalog::Application::Queries::ListCatalog.new)
    @cats = result
  end

  def create
    cmd = Catalog::Application::Commands::ListCat.new(
      id: SecureRandom.uuid,
      name: params[:cat][:name],
      price_cents: (params[:cat][:price].to_f * 100).to_i,
      currency: "USD",
      slug: params[:cat][:slug],
      cat_type: :pre_made
    )

    res = command_bus.call(cmd)
    redirect_to cat_alog_listing_path(res.value!.slug.to_s)
  end

  private

  def command_bus
    Catalog::Infrastructure::Wiring::Registry.resolve(:catalog_command_bus)
  end

  def query_bus
    Catalog::Infrastructure::Wiring::Registry.resolve(:catalog_query_bus)
  end
end
```

## Rails Wiring
```ruby
Catalog::Infrastructure::Wiring::Registry.register(:catalog_transaction) do
  Rampart::Application::Transaction.new(->(&block) { ActiveRecord::Base.transaction(&block) })
end

Catalog::Infrastructure::Wiring::Registry.register(:cat_listing_repo) do
  Catalog::Infrastructure::Persistence::Repositories::ARCatListingRepository.new
end
```

---

# END OF TECHNICAL SPEC

