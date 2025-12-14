# Agent Guidelines for Rampart Framework

## Project Overview

Rampart is a pure-Ruby framework for building Domain-Driven Design applications with Hexagonal Architecture patterns.

### Key Directories

| Path | Technology | Purpose |
|------|------------|---------|
| `lib/` | Pure Ruby | Framework gem source code with DDD building blocks |
| `cli/` | TypeScript/Bun | CLI tools for architecture management |
| `docs/` | Markdown | Framework documentation and guides |

---

## Code Quality

### Before Committing

1. Ensure all tests pass
2. Check for linting errors
3. Verify gem builds correctly: `gem build rampart.gemspec`

### Documentation

- Update relevant docs in `docs/` when changing architecture or patterns
- Keep README.md current with framework usage examples
- Document public APIs and important design decisions

---

## Framework Structure

### Core Components

- **Domain Layer** (`lib/rampart/domain/`) - Base classes for aggregates, entities, value objects, domain events
- **Application Layer** (`lib/rampart/application/`) - Base classes for commands, queries, services, transactions
- **Ports** (`lib/rampart/ports/`) - Port abstractions for hexagonal architecture
- **Support** (`lib/rampart/support/`) - Utilities like container, result types

### CLI Tools

- **Architecture Parser** (`cli/src/lib/architecture-parser.ts`) - Parses architecture blueprints
- **Prompt Builder** (`cli/src/lib/prompt-builder.ts`) - Builds prompts for AI tools
- **Plan Command** (`cli/src/commands/plan.ts`) - Generates implementation plans

---

## Demo Application

Rampart patterns are demonstrated through a reference application:

**Cats-as-a-Service** - A Rails + Next.js e-commerce demo
- Repository: https://github.com/pcaplan/cats-as-a-service
- Shows Rampart patterns in practice with bounded contexts, engines, and clean architecture

---

## Common Tasks

### Adding a New Base Class

1. Add the class to the appropriate layer (`lib/rampart/domain/`, `lib/rampart/application/`, etc.)
2. Update `lib/rampart.rb` to require the new file
3. Add documentation to `docs/`
4. Update README.md with usage examples
5. Add tests if applicable

### Updating Documentation

- Framework philosophy: `docs/rampart_architecture_philosophy.md`
- User guide: `docs/rampart_user_guide.md`
- Features: `docs/rampart_features.md`
- System overview: `docs/rampart_system.md`
