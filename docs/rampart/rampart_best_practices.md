# Rampart Best Practices

Guidance for keeping Rampart implementations intention-revealing and predictable.

## Command Naming: Task-Based vs CRUD

Commands should describe the business task being carried out with ubiquitous language, not generic CRUD verbs.

### Good Examples (Task-Based)
- `ShipOrder` - Signals a domain-specific transition
- `ApproveTimesheet` - Identifies the exact business action
- `TransferMoney` - Explicitly states what the system will attempt
- `GenerateCustomCat` - Mirrors the AI-based workflow in cat_content
- `ArchiveCustomCat` - Clarifies that visibility is changing

### Avoid (CRUD-Based)
- `UpdateOrder` - Ambiguous scope, unclear rules
- `UpdateTimesheet` - Does not convey user intent
- `UpdateAccount` - Offers no hints about allowable changes

### When CRUD Names Are Acceptable
- `CreateX` is fine for introducing a new aggregate when the domain has no richer term yet
- Prefer ubiquitous names when possible: `RegisterUser` over `CreateUser`, `AddCatToCatalog` over `CreateCatListing`

## Why Task-Based Naming?

1. **Explicit Intent** - Humans and AI assistants immediately understand the goal
2. **Single Responsibility** - Each command encapsulates one business operation
3. **Ubiquitous Language** - Names stay aligned with domain experts' phrasing
4. **Better Validation** - Task-specific invariants become obvious and easier to test

Whenever a command wades into generic territory, revisit the workflow and ask, "What is the user actually trying to accomplish?" Rename the command to match that intent before adding new logic.
