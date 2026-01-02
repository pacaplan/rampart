# Backend Agent Guidelines (Rails Engines)

## Architecture Principles

### Hexagonal Architecture (Ports & Adapters)

Maintain strict layer separation in each bounded context engine:

```
Domain Layer (Pure Ruby)
├── Aggregates, Entities, Value Objects
├── Domain Events, Domain Services
└── Repository Interfaces (Ports)

Application Layer (Pure Ruby)
├── Application Services / Use Cases
├── Command/Query DTOs
└── Orchestrates domain logic

Infrastructure Layer (Rails-specific)
├── Controllers (Primary Adapters)
├── ActiveRecord models (Secondary Adapters)
└── Repository Implementations
```

**Rules:**
- Domain and Application layers must be pure Ruby—no Rails dependencies
- Only Infrastructure layer touches Rails, ActiveRecord, HTTP, etc.
- Dependencies point inward: Infrastructure → Application → Domain

### Bounded Contexts

Each bounded context is a self-contained Rails engine:
- Has its own domain model and ubiquitous language
- Communicates with other contexts via events or explicit interfaces
- Never shares ActiveRecord models across context boundaries

## Engine Structure

Each engine under `engines/` follows this layout:

```
engines/{context_name}/
├── app/
│   ├── domain/{context_name}/       # Pure Ruby domain logic
│   │   ├── aggregates/
│   │   ├── entities/
│   │   ├── value_objects/
│   │   ├── events/
│   │   ├── services/
│   │   └── ports/
│   ├── application/{context_name}/  # Pure Ruby use cases
│   │   ├── services/
│   │   ├── commands/
│   │   └── queries/
│   └── infrastructure/{context_name}/ # Rails-specific
│       ├── persistence/
│       ├── adapters/
│       └── wiring/
├── lib/
│   └── {context_name}/
│       └── engine.rb                # Rails engine configuration
├── spec/
└── {context_name}.gemspec
```

## Auto-Loading with Rampart

Each engine uses `Rampart::EngineLoader` to auto-discover and load all hexagonal architecture components. The loader handles the directory structure mismatch between organizational subdirectories and Ruby namespaces.

**Adding new files:** Simply create the file in the appropriate directory - no configuration needed. The loader auto-discovers all `.rb` files.

## Conventions

1. **Pure Domain**: Keep domain logic free of framework code
2. **Repository Pattern**: Access persistence through repository interfaces
3. **Service Objects**: Encapsulate use cases in application services
4. **Events**: Use domain events for cross-context communication
5. **Controllers**: See `app/controllers/AGENTS.md` for controller-specific guidelines
6. **No Manual Requires**: `Rampart::EngineLoader` handles class loading automatically


