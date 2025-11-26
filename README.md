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

## 1. Product Concept: The Cat E‑commerce App
The fictional application gives you room to be creative while still modeling realistic business logic. Key components include:
- A **Cat-alog** for browsing pre-made cats
- Support for **custom cat listings**
- Guest checkout for pre-made cats
- Order update emails with unsubscribe flow
- Hard-coded FAQs to keep scope manageable
- Future-ready hooks for LLM-driven content (details out of scope for now)

This creates a fun but meaningful environment for demonstrating domain modeling and system design.

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

---

## 3. Reference Implementation: Catalog BC in Rails
A Rails application provides a concrete example of using the HexDDD framework in practice. It:
- Places `domain`, `application`, and `infrastructure` directories directly under `app/`
- Uses *only* the infrastructure layer for Rails specifics (controllers, ActiveRecord)
- Keeps domain and application layers pure Ruby
- Implements the Catalog bounded context end-to-end

This serves as a living demonstration of how to structure a Rails app following DDD and hexagonal patterns.

---

## 4. Portfolio Goal
This entire effort forms a single, polished portfolio narrative:
- **Product creativity** through the Cat-alog concept
- **UI skill** through the planned frontend design
- **Architecture expertise** through DDD + hex modeling and documentation
- **Software craftsmanship** through the HexDDD Ruby library and Rails reference implementation

**In short: the goal of the HexDDD cat e-commerce project is to build a playful but serious end-to-end showcase of your design, architecture, and coding skills, suitable for recruiters, hiring managers, and engineering leaders.**

