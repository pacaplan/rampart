import type { Architecture, ArchitectureContext } from "./architecture-parser.ts";
import { bcIdToModuleName } from "./architecture-parser.ts";

const RAMPART_PRINCIPLES = `
## Rampart Architecture Principles (Non-Negotiable)

Rampart is a guardrail and reviewer: **assume AI will make architectural mistakes** and therefore produce plans that are easy to verify with fitness functions.

### Domain-Driven Design (DDD)
- **Bounded context autonomy**: keep all domain/application/infra code scoped to this bounded context; avoid cross-engine imports.
- **Aggregate boundaries first**: all state transitions flow through aggregates; avoid "transaction scripts".
- **Immutability (FC/IS)**: aggregates and value objects are immutable; domain methods return **new instances** (no in-place mutation, no hidden buffers).
- **Ubiquitous language**: names should "scream the domain" (avoid generic CRUD naming unless truly unavoidable).
- **Explicit domain errors**: use domain-specific exceptions/codes (not generic \`StandardError\`) when modeling domain failures.

### Hexagonal Architecture
- **Primary adapters call use cases**: controllers/jobs/CLI entrypoints invoke **application services**, not repositories or domain objects directly.
- **Ports before adapters**: define outbound interfaces as ports; implement concrete adapters in infrastructure.
- **Repository boundary**: repositories return **domain objects**, not ActiveRecord records; keep ActiveRecord isolated to infrastructure/Rails model namespaces.
- **Side effects only in the shell**: no I/O (HTTP/DB/logging) in domain classes; application coordinates ports; infrastructure does I/O.

### Layer Dependencies (strict direction)
- **Domain**: depends on nothing (no Rails/framework deps).
- **Application**: depends only on domain.
- **Infrastructure**: depends inward (domain + application), implements ports/adapters.

### Naming Rules (Task-Based Interfaces)
- **Commands**: task-based, intent-revealing (\`ApproveOrder\`, \`ShipOrder\`, \`GenerateCustomCat\`) over generic CRUD (\`UpdateOrder\`).
- **Domain events**: past tense business facts (\`CatListingPublished\`), not commands (\`PublishCatListing\`), and avoid generic events like \`EntityUpdated\`.
- **Event versioning**: include and evolve \`schema_version\` (favor additive changes).

### Rampart Base Classes (inheritance must be explicit)
- Aggregates: \`Rampart::Domain::AggregateRoot\`
- Entities: \`Rampart::Domain::Entity\`
- Value objects: \`Rampart::Domain::ValueObject\`
- Domain events: \`Rampart::Domain::DomainEvent\` (event_id / occurred_at / schema_version conventions)
- Domain services: \`Rampart::Domain::DomainService\`
- Domain exceptions: \`Rampart::Domain::DomainException\`
- Ports: \`Rampart::Ports::SecondaryPort\` (use abstract methods)
- Event bus port (when present): \`Rampart::Ports::EventBusPort\`
- Application services: \`Rampart::Application::Service\`
- Commands: \`Rampart::Application::Command\`
- Queries: \`Rampart::Application::Query\`
- Transaction boundaries: \`Rampart::Application::Transaction\`

### Directory Structure Convention (engine-relative)
- Domain: \`app/domain/{bc_name}/aggregates/\`, \`entities/\`, \`value_objects/\`, \`events/\`, \`ports/\`, \`services/\`
- Application: \`app/application/{bc_name}/services/\`, \`commands/\`, \`queries/\`
- Infrastructure: \`app/infrastructure/{bc_name}/persistence/\`, \`adapters/\`, \`http/\`, \`wiring/\`

### Anti-Patterns (explicitly avoid)
- Domain importing Rails/ActiveRecord, callbacks, concerns, or framework helpers
- Fat controllers/jobs with business logic
- Application services that become adapter logic (HTTP/persistence mapping belongs in adapters)
- Shared "common utils" or cross-engine adapter dumps that erode boundaries
- Generic CRUD naming that hides intent
`;

const PLAN_RULES = `
## Plan Generation Rules (Output Quality Bar)

- **Do not write code. Do not create/modify any files.** Output a single Markdown document: an implementation plan only.
- **No tool use.** Assume you cannot run commands, cannot edit files, and cannot save documents. The caller will write the plan to disk.
- **No preface / narration.** Your response must be ONLY the Markdown plan (no progress notes).
- **Hard output contract**:
  - First line must be: \`# Implementation Plan: {Bounded Context Name}\`
  - Must include these sections: Summary, Already Implemented, Drift / Unmodeled Code, Files to Create, Files to Modify, Missing Implementations, Open Questions, Phase 1: Domain Layer, Phase 2: Application Layer, Phase 3: Infrastructure Layer, Implementation Order, TODO Checklist.
- **Do not invent components.** The architecture blueprint JSON is authoritative.
  - If something exists in code but is missing from the blueprint, list it under **Drift / Unmodeled Code**.
  - If something exists in the blueprint but not in code, list it under **Missing / To Implement**.
- **Be precise and verifiable.** Every planned item must include:
  - file path (engine-relative)
  - status: Create | Modify
  - base class inheritance (Rampart base)
  - responsibilities (short, domain-language bullets)
  - key methods/operations (only the public surface; no implementation details)
- **Incremental mode must be minimal.** Only include deltas: new files and modifications required.
- **Call out open questions.** If the blueprint lacks needed detail (fields, invariants, event payloads), add an **Open Questions** section rather than guessing.

## Critical Constraint: No Event-Sourcing Patterns
- Do NOT propose event sourcing, \`apply\`/\`on_*\` event handlers, or accumulating unpublished events inside aggregates.
- Domain methods should return new instances directly (Functional Core / Imperative Shell).
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

In incremental mode, the plan must include a **Drift / Unmodeled Code** section for anything discovered in code that is not represented in the blueprint JSON.
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
${PLAN_RULES}

## Architecture Blueprint

\`\`\`json
${JSON.stringify(ctx.architecture, null, 2)}
\`\`\`

## Your Task

1. **Analyze the codebase** at the working directory (\`${workingDir}\`) to understand:
   - The directory structure and where files should be placed
   - What files already exist (to avoid duplicating work)
   - What components from the architecture.json are already implemented
   - What exists in code but is missing from the blueprint (**drift**)

2. **Generate an implementation plan** that:
   - ${ctx.engineExists ? "Lists ONLY components that are MISSING or need modification" : "Includes engine bootstrap steps (Phase 0) first"}
   - Follows Rampart principles (use base classes, layer separation, immutability)
   - Specifies which Rampart base class each component should inherit from
   - Identifies files that need modifications (not just new files)
   - Flags anti-pattern risks (e.g., domain layer pulling in Rails, repositories leaking ActiveRecord)

3. **Output Format**: Return a Markdown document structured as:

\`\`\`markdown
# Implementation Plan: {Bounded Context Name}

Generated: {date}
Architecture: architecture/${ctx.bcId}.json
Mode: ${ctx.engineExists ? "Incremental" : "Greenfield"}

## Summary

### Already Implemented
- List of existing components with file paths

### Drift / Unmodeled Code (Blueprint Missing These)
- Anything present in codebase but not represented in the blueprint (potential drift)

### Files to Create
- List of new files needed

### Files to Modify
- List of existing files that need changes (with what needs to be added)

### Missing Implementations
- Ports without adapters
- Services without all operations

### Open Questions
- List unknowns that must be decided (event payloads, invariants, value object constraints, command naming)

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
**Key Methods**:
- method_name(args) -> returns new instance (immutability)

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
- [ ] Add/extend architecture fitness tests (inheritance, immutability, layer boundaries)
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
- When uncertain, prefer **Open Questions** over guessing
`;
}

// Keep backward compatibility
export function buildPromptLegacy(architecture: Architecture): string {
  // Legacy function for backward compatibility - assumes incremental mode
  return `# Task: Generate Rampart Implementation Plan

You are analyzing a bounded context that follows the Rampart framework for DDD/Hexagonal Architecture in Ruby.

${RAMPART_PRINCIPLES}
${PLAN_RULES}

## Architecture Blueprint

\`\`\`json
${JSON.stringify(architecture, null, 2)}
\`\`\`

## Your Task

1. **Analyze the codebase** at the working directory to understand:
   - The directory structure and where files should be placed
   - What files already exist (to avoid duplicating work)
   - What components from the architecture.json are already implemented
   - What exists in code but is missing from the blueprint (**drift**)

2. **Generate an implementation plan** that:
   - Lists ONLY components that are MISSING or need modification
   - Follows Rampart principles (use base classes, layer separation, immutability)
   - Uses the directory structure discovered in the codebase
   - Specifies which Rampart base class each component should inherit from
   - Includes a **Drift / Unmodeled Code** section

3. **Output Format**: Return a Markdown document with implementation phases and a TODO checklist.

## Important Notes
- This is INCREMENTAL mode: only plan what's missing
- Do NOT duplicate existing implementations
- Follow Rampart principles strictly
- Include file paths relative to the engine root
`;
}
