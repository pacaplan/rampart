# DDD & Hexagonal Architecture Components (Simplified)

## 1. Domain Layer Components

| Component | Function | Hex | DDD |
|----------|----------|-----|-----|
| Entity | Identity-based domain object |  | ✔️ |
| Value Object | Immutable value w/ logic |  | ✔️ |
| Aggregate | Consistency boundary |  | ✔️ |
| Aggregate Root | Enforces invariants inside aggregate |  | ✔️ |
| Domain Service | Stateless domain logic |  | ✔️ |
| Domain Event | Represents something that happened |  | ✔️ |
| Domain Policy | Encapsulated business rule |  | ✔️ |
| Specification | Reusable rule/predicate |  | ✔️ |
| Factory | Creates complex aggregates/VOs |  | ✔️ |
| Domain Exception | Signals rule/invariant violation |  | ✔️ |
| ACL (Domain Side) | Protects domain model from external representations | ✔️ | ✔️ |

---

## 2. Application Layer Components

| Component | Function | Hex | DDD |
|----------|----------|-----|-----|
| Application Service | Orchestrates a domain use case | ✔️ | ✔️ |
| Command | Write intention | ✔️ | ✔️ |
| Query | Read request | ✔️ | ✔️ |
| Command Handler | Executes a write use case | ✔️ | ✔️ |
| Query Handler | Executes a read use case | ✔️ | ✔️ |
| Event Handler | Reacts to domain events | ✔️ | ✔️ |
| Port (Inbound) | Entry point for external clients | ✔️ | |
| Port (Outbound) | Required service interfaces | ✔️ | |
| Application Core | Domain + application isolated from infrastructure | ✔️ | ✔️ |

---

## 3. Infrastructure Layer Components

| Component | Function | Hex | DDD |
|----------|----------|-----|-----|
| Repository Implementation | Concrete persistence adapter for aggregates | ✔️ | |
| Inbound Adapter | Controllers, message listeners, CLI, jobs | ✔️ | |
| Outbound Adapter | External API/infra clients | ✔️ | |
| Event Bus / Event Publisher | Mechanism for dispatching events | ✔️ | |
| ACL (Integration Side) | Translates external models → domain models | ✔️ | ✔️ |

