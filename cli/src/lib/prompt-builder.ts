import type { Architecture, ArchitectureContext } from "./architecture-parser.ts";
import { bcIdToModuleName } from "./architecture-parser.ts";

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

function buildGreenfieldInstructions(ctx: ArchitectureContext): string {
  const moduleName = bcIdToModuleName(ctx.bcId);
  
  return `
## Mode: GREENFIELD (New Bounded Context)

The engine does not exist yet. The plan MUST begin with these bootstrap steps:

### Phase 0: Engine Bootstrap

Before any domain implementation, the following steps are required:

#### 0.1 Create Rails Engine
\`\`\`bash
rails plugin new engines/${ctx.bcId} --mountable --skip-test
\`\`\`

#### 0.2 Add to Main App Gemfile
Add this line to the main app's Gemfile:
\`\`\`ruby
gem "${ctx.bcId}", path: "engines/${ctx.bcId}"
\`\`\`

#### 0.3 Mount in Routes
Add to \`apps/api/config/routes.rb\`:
\`\`\`ruby
mount ${moduleName}::Engine => "/${ctx.bcId.replace(/_/g, "-")}"
\`\`\`

#### 0.4 Initialize Rampart Structure
Run \`rampart init ${ctx.bcId}\` to create the DDD directory structure, or manually create:
- \`app/domain/${ctx.bcId}/\` (aggregates/, entities/, value_objects/, events/, services/, ports/)
- \`app/application/${ctx.bcId}/\` (services/, commands/, queries/)
- \`app/infrastructure/${ctx.bcId}/\` (persistence/mappers/, persistence/repositories/, adapters/, wiring/)

After Phase 0 is complete, proceed with domain implementation.
`;
}

function buildIncrementalInstructions(ctx: ArchitectureContext): string {
  return `
## Mode: INCREMENTAL (Existing Engine)

The engine already exists at: \`engines/${ctx.bcId}/\`

Compare the architecture blueprint against the current engine structure to identify:
1. **Files to create** - Components defined in architecture but not yet implemented
2. **Files to modify** - Existing components that need additional methods, events, or attributes
3. **Missing implementations** - Ports without corresponding adapters
`;
}

export function buildPrompt(ctx: ArchitectureContext): string {
  const modeInstructions = ctx.engineExists
    ? buildIncrementalInstructions(ctx)
    : buildGreenfieldInstructions(ctx);

  const workingDir = ctx.engineExists ? ctx.enginePath : ctx.projectRoot;

  return `# Task: Generate Rampart Implementation Plan

You are analyzing a bounded context that follows the Rampart framework for DDD/Hexagonal Architecture in Ruby.

${RAMPART_PRINCIPLES}
${modeInstructions}

## Architecture Blueprint

\`\`\`json
${JSON.stringify(ctx.architecture, null, 2)}
\`\`\`

## Your Task

1. **Analyze the codebase** at the working directory (\`${workingDir}\`) to understand:
   - The directory structure and where files should be placed
   - What files already exist (to avoid duplicating work)
   - What components from the architecture.json are already implemented

2. **Generate an implementation plan** that:
   - ${ctx.engineExists ? "Lists ONLY components that are MISSING or need modification" : "Includes engine bootstrap steps (Phase 0) first"}
   - Follows Rampart principles (use base classes, layer separation, immutability)
   - Specifies which Rampart base class each component should inherit from
   - Identifies files that need modifications (not just new files)

3. **Output Format**: Return a Markdown document structured as:

\`\`\`markdown
# Implementation Plan: {Bounded Context Name}

Generated: {date}
Architecture: architecture/${ctx.bcId}.json
Mode: ${ctx.engineExists ? "Incremental" : "Greenfield"}

## Summary

### Already Implemented
- List of existing components with file paths

### Files to Create
- List of new files needed

### Files to Modify
- List of existing files that need changes (with what needs to be added)

### Missing Implementations
- Ports without adapters
- Services without all operations

${ctx.engineExists ? "" : `## Phase 0: Engine Bootstrap
[Include bootstrap steps from above]
`}
## Phase 1: Domain Layer

### 1.1 {Component Name}
**File**: \`app/domain/${ctx.bcId}/path/to/file.rb\`
**Status**: Create | Modify
**Inherits**: \`Rampart::Domain::AggregateRoot\`
**Responsibilities**:
- Responsibility 1
- Responsibility 2
**Attributes**:
- attribute_name: ValueObjectType

[Continue for each component...]

## Phase 2: Application Layer
[...]

## Phase 3: Infrastructure Layer
[...]

## Implementation Order
1. First create these (no dependencies)
2. Then create these (depend on #1)
[...]

## TODO Checklist

${ctx.engineExists ? "" : `### Engine Setup
- [ ] Run Rails generator to create engine
- [ ] Add gem to main app Gemfile
- [ ] Mount engine in routes
- [ ] Run bundle install
`}
### Domain Layer
- [ ] Create/update aggregates
- [ ] Create value objects
- [ ] Create domain events
- [ ] Create repository ports

### Application Layer
- [ ] Create application services
- [ ] Create commands
- [ ] Create queries

### Infrastructure Layer
- [ ] Create repository adapters
- [ ] Create external service adapters
- [ ] Create HTTP controllers
- [ ] Configure dependency injection wiring

### Testing
- [ ] Add architecture fitness tests
- [ ] Add unit tests for domain objects
- [ ] Add integration tests for repositories
- [ ] Add request specs for controllers
\`\`\`

## Important Notes
- ${ctx.engineExists ? "This is INCREMENTAL mode: only plan what's missing or needs modification" : "This is GREENFIELD mode: start with engine bootstrap, then implement all components"}
- Do NOT duplicate existing implementations
- Follow Rampart principles strictly
- Include file paths relative to the engine root
- For modifications, clearly state WHAT needs to be added to existing files
`;
}

// Keep backward compatibility
export function buildPromptLegacy(architecture: Architecture): string {
  // Legacy function for backward compatibility - assumes incremental mode
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

3. **Output Format**: Return a Markdown document with implementation phases and a TODO checklist.

## Important Notes
- This is INCREMENTAL mode: only plan what's missing
- Do NOT duplicate existing implementations
- Follow Rampart principles strictly
- Include file paths relative to the engine root
`;
}
