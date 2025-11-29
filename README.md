# HexDDD Project Summary

## Overview
The HexDDD project is a cohesive portfolio piece designed to showcase a complete spectrum of software engineering skills across product ideation, user interface design, architecture, and implementation.

At its core, it combines:
- **A playful product concept** (a fictional cat e-commerce platform)
- **A strong architectural foundation** (Domain-Driven Design + Hexagonal Architecture)
- **A custom Ruby framework** (HexDDD) that formalizes these patterns
- **A real Rails implementation** of the Catalog bounded context using the HexDDD library

This project demonstrates creativity, engineering rigor, and practical coding ability.

---

## Getting Started

### Quick Setup

1. **Install Prerequisites**
   - Ruby 3.3.6: `asdf install ruby 3.3.6`
   - Docker Desktop (for Supabase)
   - Supabase CLI: `brew install supabase/tap/supabase`

2. **Start Supabase**
   ```bash
   supabase start
   ```

3. **Set up Rails API**
   ```bash
   cd apps/api
   bundle install
   rake db:setup:all
   ```

4. **Verify Setup**
   ```bash
   rake db:test:isolation
   rails server
   ```

For detailed setup instructions, see:
- [Rails API Setup](apps/api/README.md#setup)
- [Cat & Content Engine](engines/cat_content/README.md#development)
- [HexDDD Gem](gems/hexddd/README.md#installation)

---

## 1. Product Concept: The Cat E‑commerce App
The fictional application gives you room to be creative while still modeling realistic business logic. Key components include:
- A **Cat-alog** for browsing pre-made cats
- Support for **custom cat listings**
- Guest checkout for pre-made cats
- Order update emails with unsubscribe flow
- Hard-coded FAQs to keep scope manageable
- Future-ready hooks for LLM-driven content (details out of scope for now)

This creates a fun but meaningful environment for demonstrating domain modeling and system design.

📄 [Functional Specification](docs/cat_app/functional_spec.md)

---

## 2. Architecture: Hexagonal + DDD (HexDDD)
The HexDDD framework encapsulates:
- Aggregates, entities, value objects, and domain events
- Repository interfaces and implementations
- Domain and application services
- Ports and adapters (primary and secondary)
- A rigid **domain/application/infrastructure** separation

Additionally, the project includes:
- A full component map for DDD + hex concepts
- Clearly defined bounded contexts (Catalog, Commerce, Auth)
- ASCII diagrams illustrating context boundaries and responsibilities

This portion of the project showcases architectural thinking at a senior/staff level.

📄 [DDD & Hex Component Reference](docs/framework/hexdd_architecture.md) · [Bounded Contexts Overview](docs/cat_app/all_bounded_contexts.md) · [Cat & Content BC Architecture](docs/cat_app/cat_content_architecture.md)

---

## 3. Reference Implementation: Catalog BC in Rails
A Rails application provides a concrete example of using the HexDDD framework in practice. It:
- Places `domain`, `application`, and `infrastructure` directories directly under `app/`
- Uses *only* the infrastructure layer for Rails specifics (controllers, ActiveRecord)
- Keeps domain and application layers pure Ruby
- Implements the Catalog bounded context end-to-end

This serves as a living demonstration of how to structure a Rails app following DDD and hexagonal patterns.

📄 [Full Implementation Spec](docs/cat_app/cat_content_implementation.md)

---

## 4. Portfolio Goal
This entire effort forms a single, polished portfolio narrative:
- **Product creativity** through the Cat-alog concept
- **UI skill** through the planned frontend design
- **Architecture expertise** through DDD + hex modeling and documentation
- **Software craftsmanship** through the HexDDD Ruby library and Rails reference implementation

**In short: the goal of the HexDDD cat e-commerce project is to build a playful but serious end-to-end showcase of your design, architecture, and coding skills, suitable for recruiters, hiring managers, and engineering leaders.**

---

## 5. Monorepo Structure

```
hexddd/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/
│   │   ├── components/
│   │   ├── package.json
│   │   └── ...
│   │
│   └── api/                          # Rails backend (mounts engines)
│       ├── app/
│       ├── config/
│       ├── Gemfile
│       └── ...
│
├── engines/
│   └── cat_content/                  # Cat & Content bounded context engine
│       ├── app/
│       │   ├── domain/
│       │   ├── application/
│       │   └── infrastructure/
│       ├── lib/
│       ├── cat_content.gemspec
│       └── ...
│
├── gems/
│   └── hexddd/                       # HexDDD framework gem
│       ├── lib/
│       │   └── hexddd/
│       ├── hexddd.gemspec
│       └── ...
│
└── docs/
    ├── cat_app/
    └── framework/
```

### Directory Overview

| Directory | Purpose |
|-----------|---------|
| `apps/web` | Next.js application serving the cat e-commerce UI |
| `apps/api` | Rails application that mounts bounded context engines and exposes the API |
| `engines/cat_content` | Rails engine implementing the Cat & Content bounded context using HexDDD patterns |
| `gems/hexddd` | Pure-Ruby gem providing DDD + Hexagonal Architecture building blocks |
| `docs/` | Architecture documentation, specs, and bounded context definitions |

### Engine Mounting

Each bounded context lives in its own Rails engine under `engines/`. The main Rails app (`apps/api`) mounts these engines:

```ruby
# apps/api/config/routes.rb
Rails.application.routes.draw do
  mount CatContent::Engine, at: "/catalog"
  # Future: mount Commerce::Engine, at: "/commerce"
  # Future: mount Auth::Engine, at: "/auth"
end
```

### Dependency Flow

```
┌─────────────┐
│   apps/web  │  (Next.js)
└──────┬──────┘
       │ HTTP/JSON
       ▼
┌─────────────┐
│   apps/api  │  (Rails)
└──────┬──────┘
       │ mounts
       ▼
┌──────────────────────────────────────────┐
│            engines/*                     │
│  ┌────────────┐  ┌─────────┐  ┌─────┐   │
│  │cat_content │  │commerce │  │auth │   │
│  └─────┬──────┘  └────┬────┘  └──┬──┘   │
└────────┼─────────────┼──────────┼────────┘
        │            │          │
        └────────────┼──────────┘
                     │ depends on
                     ▼
              ┌─────────────┐
              │ gems/hexddd │  (pure Ruby)
              └─────────────┘
```

