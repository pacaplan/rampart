import type { Architecture } from "./architecture-parser.ts";

const RAMPART_PRINCIPLES = `
## Rampart Architecture Principles

### Domain-Driven Design
- Aggregates are immutable - domain methods return new instances, no mutation
- Value objects are immutable with type-safe validation via dry-types
- Domain events record business facts in past tense (e.g., CatListingPublished)
- Domain layer has NO Rails/framework dependencies

### Hexagonal Architecture
- Ports define interfaces (abstract methods)
- Adapters implement ports in infrastructure layer
- Repositories return domain objects, not ActiveRecord models
- Application services orchestrate domain logic and publish events

### Layer Dependencies (strict direction)
- Domain: No dependencies on application or infrastructure
- Application: Depends on domain only
- Infrastructure: Depends on domain and application, implements ports

### Rampart Base Classes
- Aggregates inherit from Rampart::Domain::AggregateRoot
- Entities inherit from Rampart::Domain::Entity
- Value objects inherit from Rampart::Domain::ValueObject
- Domain events inherit from Rampart::Domain::DomainEvent
- Ports inherit from Rampart::Ports::SecondaryPort
- Application services inherit from Rampart::Application::Service
- Commands inherit from Rampart::Application::Command
- Queries inherit from Rampart::Application::Query

### Directory Structure Convention
- Domain: app/domain/{bc_name}/aggregates/, entities/, value_objects/, events/, ports/, services/
- Application: app/application/{bc_name}/services/, commands/, queries/
- Infrastructure: app/infrastructure/{bc_name}/persistence/, adapters/, http/, wiring/
`;

export function buildPrompt(architecture: Architecture): string {
  return `# Task: Generate Rampart Implementation Plan

You are analyzing a bounded context that follows the Rampart framework for DDD/Hexagonal Architecture in Ruby.

${RAMPART_PRINCIPLES}

## Architecture Blueprint

\`\`\`json
${JSON.stringify(architecture, null, 2)}
\`\`\`

## Your Task

1. **Analyze the codebase** at the working directory to understand:
   - The directory structure and where files should be placed
   - What files already exist (to avoid duplicating work)
   - What components from the architecture.json are already implemented

2. **Generate an implementation plan** that:
   - Lists ONLY components that are MISSING or need modification
   - Follows Rampart principles (use base classes, layer separation, immutability)
   - Uses the directory structure discovered in the codebase
   - Specifies which Rampart base class each component should inherit from

3. **Output Format**: Return a Markdown document structured as:

\`\`\`markdown
# Implementation Plan: {Bounded Context Name}

Generated: {date}
Architecture: {path to architecture.json}

## Summary

### Already Implemented
- List of existing components with file paths

### Missing Components
- List of components to create

## Implementation Plan

### Phase 1: Domain Layer

#### 1.1 {Component Name}
**File**: \`app/domain/{bc}/path/to/file.rb\`
**Inherits**: \`Rampart::Domain::AggregateRoot\`
**Responsibilities**:
- Responsibility 1
- Responsibility 2
**Attributes**:
- attribute_name: ValueObjectType

[Continue for each missing component...]

### Phase 2: Application Layer
[...]

### Phase 3: Infrastructure Layer
[...]

## Implementation Order
1. First create these (no dependencies)
2. Then create these (depend on #1)
[...]
\`\`\`

## Important Notes
- This is INCREMENTAL mode: only plan what's missing
- Do NOT duplicate existing implementations
- Follow Rampart principles strictly
- Include file paths relative to the engine root
`;
}
