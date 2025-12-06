# Rampart Project Summary

## Overview
The Rampart project is a cohesive portfolio piece designed to showcase a complete spectrum of software engineering skills across product ideation, user interface design, architecture, and implementation.

At its core, it combines:
- **A playful product concept** (a fictional cat e-commerce platform)
- **A strong architectural foundation** (Domain-Driven Design + Hexagonal Architecture)
- **A custom Ruby framework** (Rampart) that formalizes these patterns
- **A real Rails implementation** of the Catalog bounded context using the Rampart library

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
   ```

4. **Set up Web App**
   ```bash
   cd apps/web
   npm install
   ```

5. **Start both servers**
   ```bash
   # From the project root
   scripts/start_dev.sh
   ```
   
   This will start:
   - Web app on http://localhost:3000
   - API on http://localhost:8000
   
   Or start them individually:
   ```bash
   # API only
   cd apps/api && rails server
   
   # Web app only
   cd apps/web && npm run dev
   ```

> **Note**: Supabase handles all database schema creation via its migrations.
> Rails just connects to what Supabase created - no Rails migrations needed.

For detailed setup instructions, see:
- [Rails API Setup](apps/api/README.md#setup)
- [Cat & Content Engine](engines/cat_content/README.md#development)
- [Rampart Gem](gems/rampart/README.md#installation)

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

## 2. Architecture: Hexagonal + DDD (Rampart)
The Rampart framework encapsulates:
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
A Rails application provides a concrete example of using the Rampart framework in practice. It:
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
- **Software craftsmanship** through the Rampart Ruby library and Rails reference implementation

**In short: the goal of the Rampart cat e-commerce project is to build a playful but serious end-to-end showcase of your design, architecture, and coding skills, suitable for recruiters, hiring managers, and engineering leaders.**

---

## 5. Monorepo Structure

```
rampart/
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
│   └── rampart/                       # Rampart framework gem
│       ├── lib/
│       │   └── rampart/
│       ├── rampart.gemspec
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
| `engines/cat_content` | Rails engine implementing the Cat & Content bounded context using Rampart patterns |
| `gems/rampart` | Pure-Ruby gem providing DDD + Hexagonal Architecture building blocks |
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
              │ gems/rampart │  (pure Ruby)
              └─────────────┘
```

