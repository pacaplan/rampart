# Plan: Evaluate Domain Events & Event-Driven Modeling (3.6)

## Context

Following the pattern from 3.5 CQRS evaluation, we now assess **approach 3.6 "Domain Events & Event-Driven Modeling"** from rampart_vision.md:

> Events model meaningful business changes.
> - **Goal 1 — HIGH**: Encourages decoupling.
> - **Goal 2 — MEDIUM**: Depends on disciplined naming and documentation.

**User's explicit goal:** Use cat_content as a playground to evaluate what Domain Event features should be included in Rampart - either implement now or include in future plans.

---

## Research Summary

### What Are Domain Events?

Domain Events represent **meaningful business occurrences** that have happened in the past. They:
- Are immutable facts (past tense naming: `OrderShipped`, `CatListingPublished`)
- Capture state changes within aggregates
- Enable loose coupling between bounded contexts
- Provide audit trails and temporal queries

### Event-Driven Patterns

1. **Event Sourcing** - Store events as the source of truth, rebuild state by replaying
2. **Event Publishing** - Publish events for other parts of the system to react to
3. **Event Notification** - Lightweight events that signal something happened (listeners fetch details)
4. **Event-Carried State Transfer** - Events carry full state needed by consumers

Rampart takes a **pragmatic middle ground**: events are tracked in aggregates and can be published, but event sourcing is NOT required.

---

## Current Implementation Analysis

### Already Implemented ✅

**Rampart gem (`gems/rampart/`):**

1. **DomainEvent base class** ([domain_event.rb](gems/rampart/lib/rampart/domain/domain_event.rb))
   ```ruby
   class DomainEvent < Dry::Struct
     SCHEMA_VERSION = 1
     attribute :event_id, Types::String.default { SecureRandom.uuid }
     attribute :occurred_at, Types::Time.default { Time.now }
     attribute :schema_version, Types::Integer.default { self::SCHEMA_VERSION }
     def event_type
       self.class.name
     end
   end
   ```
   - Automatic UUID generation
   - Timestamp tracking
   - Schema versioning for event evolution
   - Immutable via Dry::Struct

2. **AggregateRoot event tracking** ([aggregate_root.rb](gems/rampart/lib/rampart/domain/aggregate_root.rb))
   ```ruby
   class AggregateRoot < Entity
     attr_reader :unpublished_events

     def clear_events!
       @unpublished_events.clear
     end

     private
     def apply(event)
       @unpublished_events << event
       handler = "on_#{snake_case(event.class.name)}"
       send(handler, event) if respond_to?(handler, true)
     end
   end
   ```
   - `unpublished_events` array for event accumulation
   - `apply(event)` raises events and delegates to handlers
   - `on_*` naming convention for event handlers
   - `clear_events!` for post-publish cleanup

3. **Documentation in rampart_features.md** - Lists DomainEvent features

### NOT Implemented ❌

**cat_content engine:**
- ❌ No `events/` directory or event classes
- ❌ `CatListing` aggregate uses immutable return pattern instead of `apply()`
- ❌ No event bus port defined
- ❌ No event publishing in `CatListingService`
- ❌ No event handlers/subscribers

**Implementation spec (cat_content_implementation.md) DOES define:**
- 5 domain events: `CatListingPublished`, `CatListingArchived`, `CustomCatCreated`, `CustomCatArchived`, `CatDescriptionRegenerated`
- Event publishing pattern in services via `publish_events(aggregate)`
- Event bus dependency injection via `include Import[:event_bus]`

**Gap:** The spec defines these but they're not implemented in the actual code.

---

## What Should Be in Rampart?

### Already Included ✅ (Keep)

1. **DomainEvent base class** - Well designed with UUID, timestamp, versioning
2. **AggregateRoot event infrastructure** - `apply()`, `unpublished_events`, handler convention
3. **Immutability via Dry::Struct** - Events are value objects

### Should Be Added 📋

#### 1. Event Bus Port (Medium Priority)

**What:** Abstract port for event publishing

**Why:**
- Services need to publish events after persisting aggregates
- Allows different implementations (in-memory, ActiveSupport::Notifications, message queue)
- Already referenced in implementation spec: `event_bus.publish(event)`

**Proposed implementation:**
```ruby
# gems/rampart/lib/rampart/ports/event_bus_port.rb
module Rampart
  module Ports
    class EventBusPort < SecondaryPort
      abstract_method :publish  # publish(event) or publish(events)
    end
  end
end
```

**Decision:** Include in Rampart gem - core infrastructure needed for event publishing

#### 2. Documentation for Section 3.6 (High Priority)

**What:** Add "Domain Events & Event-Driven Modeling" section to `rampart_architecture_philosophy.md`

**Content to cover:**
- What domain events are and why they matter
- Event naming conventions (past tense, business language)
- When to use events vs direct method calls
- Event versioning strategy
- Integration with aggregates
- Anti-patterns to avoid

**Decision:** ✅ INCLUDE - Critical for Goal 2 (AI/Human clarity)

#### 3. Event Naming Guidelines in Best Practices (Medium Priority)

**What:** Add event naming section to `rampart_best_practices.md`

**Content:**
- Past tense naming (`OrderShipped` not `ShipOrder`)
- Include aggregate identity in event
- Schema versioning guidance

**Decision:** ✅ INCLUDE - Helps maintain consistency

---

## What We Are NOT Doing

1. **Not implementing Event Sourcing** - Overkill for most use cases; events are for notification/audit
2. **Not implementing event handlers/subscribers** - YAGNI until cross-BC communication needed
3. **Not implementing event store** - No event replay needed yet
4. **Not creating domain event classes in cat_content** - That's implementation work, not evaluation
5. **Not modifying CatListing aggregate** - Keep current immutable pattern; spec shows event pattern for reference

---

## Recommendation: Documentation + Event Bus Port

The Rampart gem already has solid event infrastructure. The main gaps are:
1. Missing `EventBusPort` abstract class
2. Missing documentation in architecture philosophy
3. Missing event naming guidance in best practices

### Files to Modify

1. **`gems/rampart/lib/rampart/ports/event_bus_port.rb`** (NEW)
   - Create abstract event bus port

2. **`gems/rampart/lib/rampart.rb`**
   - Add require for event_bus_port

3. **`docs/rampart/rampart_architecture_philosophy.md`**
   - Add section 3.6 Domain Events & Event-Driven Modeling

4. **`docs/rampart/rampart_best_practices.md`**
   - Add event naming guidelines section

5. **`gems/rampart/README.md`**
   - Add 3.6 Domain Events to Architecture Patterns section

6. **`engines/cat_content/README.md`**
   - Add 3.6 to Architecture Patterns table

7. **`gems/rampart/lib/rampart/domain/domain_event.rb`**
   - Add class-level documentation explaining event patterns

---

## Detailed Changes

### 1. Create EventBusPort

**File:** `gems/rampart/lib/rampart/ports/event_bus_port.rb`

```ruby
module Rampart
  module Ports
    # Abstract port for publishing domain events.
    # Implementations may use in-memory dispatching, Rails notifications,
    # message queues, or other event distribution mechanisms.
    #
    # Example implementation:
    #   class RailsEventBus < Rampart::Ports::EventBusPort
    #     def publish(event)
    #       ActiveSupport::Notifications.instrument(event.event_type, event: event)
    #     end
    #   end
    class EventBusPort < SecondaryPort
      abstract_method :publish
    end
  end
end
```

### 2. Update rampart_architecture_philosophy.md

Add after section 3.5:

```markdown
---

## 3.6 Domain Events & Event-Driven Modeling

### What Are Domain Events?

Domain Events represent meaningful business occurrences that have already happened. They are immutable facts expressed in past tense using ubiquitous language:
- `OrderShipped` (not `ShipOrder` — that's a command)
- `CatListingPublished` (not `PublishCatListing`)
- `PaymentReceived` (not `ReceivePayment`)

Events capture **what happened**, commands capture **what we want to happen**.

### Why Use Domain Events?

1. **Decoupling** — Aggregates don't need to know who reacts to their state changes
2. **Audit Trail** — Events provide a historical record of business activity
3. **Cross-BC Communication** — Other bounded contexts can subscribe to events without tight coupling
4. **Temporal Queries** — Answer questions like "what happened to this order last week?"

### Event Infrastructure in Rampart

Rampart provides lightweight event support without mandating Event Sourcing:

**AggregateRoot** tracks events via:
- `apply(event)` — Raises an event and optionally delegates to an `on_*` handler
- `unpublished_events` — Array of events raised but not yet published
- `clear_events!` — Clears the array after publishing

**DomainEvent** base class provides:
- Automatic `event_id` (UUID)
- `occurred_at` timestamp
- `schema_version` for event evolution
- Immutability via Dry::Struct

**EventBusPort** defines the interface for event publishing.

### Typical Flow

1. Command arrives at Application Service
2. Service loads aggregate from repository
3. Aggregate method calls `apply(SomeEvent.new(...))`
4. Event stored in `unpublished_events`, handler updates state
5. Service persists aggregate
6. Service publishes events via event bus
7. Service calls `aggregate.clear_events!`

### Alignment with Rampart Goals

- **Goal 1 — BC Autonomy (HIGH)**: Events allow bounded contexts to communicate without direct dependencies. A context publishes events; interested contexts subscribe.
- **Goal 2 — AI/Human Clarity (MEDIUM)**: Well-named events are self-documenting, but requires discipline. Poorly named or undocumented events add confusion.

### Integration with Other Patterns

- **CQRS**: Commands trigger state changes; events record what changed
- **Hexagonal Architecture**: Event bus is a secondary port; implementations are adapters
- **Aggregates**: Events originate from aggregate methods and respect consistency boundaries

### Anti-Patterns to Avoid

- **Event Sourcing Everything**: Don't store events as the source of truth unless you have specific needs (audit, temporal queries, CQRS read models). Start with traditional persistence.
- **Anemic Events**: Events with just an ID and timestamp provide little value. Include relevant context.
- **Command-Named Events**: `CreateOrder` is a command, not an event. Use `OrderCreated`.
- **Cross-Aggregate Events**: Events should originate from a single aggregate. If you need to coordinate multiple aggregates, use a saga or process manager.
- **Forgetting Schema Versioning**: Always define `SCHEMA_VERSION`. When event structure changes, increment the version.

### References

- Martin Fowler — ["Domain Event"](https://martinfowler.com/eaaDev/DomainEvent.html)
- Vaughn Vernon — "Implementing Domain-Driven Design" (Chapter 8: Domain Events)
- Microsoft Learn — ["Domain events: Design and implementation"](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation)
```

### 3. Update rampart_best_practices.md

Add after the command naming section:

```markdown
## Event Naming: Past Tense & Business Language

Domain events describe what has already happened. Use past tense and ubiquitous language.

### Good Examples
- `OrderShipped` - Clear business occurrence
- `CatListingPublished` - States what happened to the aggregate
- `PaymentReceived` - Past tense, domain-specific
- `UserRegistered` - Captures the completed action

### Avoid
- `ShipOrder` - This is a command, not an event
- `OrderUpdated` - Too generic; what was updated?
- `OrderEvent` - Meaningless; events should be specific

### Event Attribute Guidelines

1. **Include aggregate identity** - `order_id`, `cat_listing_id`
2. **Include relevant context** - Data needed by subscribers without fetching
3. **Avoid sensitive data** - Events may be logged or sent to external systems
4. **Use schema versioning** - Define `SCHEMA_VERSION` in every event class

### Example

```ruby
class CatListingPublished < Rampart::Domain::DomainEvent
  SCHEMA_VERSION = 1

  attribute :cat_listing_id, Types::String
  attribute :name, Types::String
  attribute :published_at, Types::Time.default { Time.now }
end
```
```

### 4. Update gems/rampart/README.md

In the Architecture Patterns section, after 3.5, add:

```markdown
### 3.6 Domain Events & Event-Driven Modeling

Domain events record meaningful business occurrences:
- **DomainEvent** - Immutable event with ID, timestamp, and schema version
- **AggregateRoot** - Tracks `unpublished_events` via `apply()` method
- **EventBusPort** - Abstract interface for event publishing
- **Handler Convention** - `on_event_name` methods for event-driven state changes

Events enable decoupling between bounded contexts while maintaining a clear audit trail of business activity.
```

### 5. Update engines/cat_content/README.md

In the Architecture Patterns table, add row:

```markdown
| **3.6 Domain Events** | `DomainEvent` base class, `apply()` in aggregates, event publishing pattern |
```

Update count from "four" to "five" architectural approaches.

### 6. Update domain_event.rb documentation

Add comprehensive class-level comment:

```ruby
# Domain events represent meaningful business occurrences that have happened.
# They are immutable facts expressed in past tense (e.g., OrderShipped, CatListingPublished).
#
# Events are raised within aggregates via `apply(event)` and accumulated in
# `unpublished_events` until published by application services.
#
# Key attributes (auto-generated):
# - event_id: Unique identifier (UUID)
# - occurred_at: When the event happened
# - schema_version: For event evolution compatibility
#
# Example:
#   class CatListingPublished < Rampart::Domain::DomainEvent
#     SCHEMA_VERSION = 1
#     attribute :cat_listing_id, Types::String
#     attribute :name, Types::String
#   end
#
# Naming convention: Use past tense describing what happened, not what to do.
# - Good: OrderShipped, PaymentReceived, UserRegistered
# - Bad: ShipOrder (command), OrderUpdated (too generic)
```

---

## Key Insights for Rampart

### What Works Well (Keep)
1. **DomainEvent base class** - UUID, timestamp, versioning are solid
2. **AggregateRoot event tracking** - `apply()` and `unpublished_events` pattern is clean
3. **Handler convention** - `on_*` naming is discoverable and testable

### What Could Improve (Future)
1. **Event handler registration** - Currently just naming convention; could add explicit registry
2. **Async event publishing** - For background job integration
3. **Event store adapter** - If event sourcing becomes needed

### Anti-Patterns to Avoid
1. **Don't event source everything** - Use traditional persistence by default
2. **Don't skip schema versioning** - Always define SCHEMA_VERSION
3. **Don't use command naming** - Events are past tense facts
4. **Don't publish before persisting** - Events should reflect committed state

---

## Sources

- Martin Fowler — ["Domain Event"](https://martinfowler.com/eaaDev/DomainEvent.html)
- Vaughn Vernon — "Implementing Domain-Driven Design" (Chapter 8)
- Microsoft Learn — ["Domain events"](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation)
- Udi Dahan — ["Domain Events – Salvation"](https://udidahan.com/2009/06/14/domain-events-salvation/)
