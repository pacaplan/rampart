# Cat & Content Bounded Context – HexDDD Component Map

## 0. Scope of this BC

**In scope**
- Premade cat catalog (Cat‑alog)
- View premade cats
- View user-specific custom cats
- Delete/archive custom cats
- AI-authored descriptions & prompt templates

**Out of scope** (other BCs)
- Orders, payments, carts, pricing
- Order update emails & unsubscribe flows
- Authentication & user accounts

---

## 1. Domain Layer (DDD Core)

### 1.1 Aggregates
- **CatListing** — Premade, curated, globally visible cat in the Cat‑alog.
- **CustomCat** — User-specific, AI-generated cat record.
- **ContentPage** (optional) — Small structured pages (e.g., About page).

### 1.2 Entities
- **CatProfile** — Core attributes: age, traits, temperament.
- **CatMedia** — Photo/video refs, alt text.
- **CustomCatPrompt** — Prompt that created a CustomCat.
- **CustomCatStory** — Generated long-form description.

### 1.3 Value Objects
- **CatId**, **CustomCatId**
- **CatName** — validated
- **Slug**
- **TagList**, **TraitSet**
- **SeoMetadata**
- **Visibility** (public/private/archived)
- **ContentBlock**

### 1.4 Domain Services
- **CatDescriptionPolicy** — Rules for tone, length, allowed content.
- **CatCopyGenerationService** — Pure-domain orchestration for copy generation via LLM port.
- **CatSearchSpecificationFactory** — Builds filters/specifications.
- **VisibilityPolicy** — Rules for publishing/archiving.

### 1.5 Domain Events
- `CatListingPublished`
- `CatListingArchived`
- `CustomCatCreated`
- `CustomCatArchived`
- `CatDescriptionRegenerated`

### 1.6 Repository Interfaces
- `CatListingRepository`
- `CustomCatRepository`
- `ContentPageRepository`
- `PromptTemplateRepository`

---

## 2. Application Layer (Use Cases)

### 2.1 Application Services
- **ListCatListingsService** — Browse/filter Cat‑alog.
- **GetCatDetailsService**
- **CreateOrUpdateCatListingService**
- **PublishCatListingService**
- **ArchiveCatListingService**
- **ListCustomCatsService** — User’s custom cats.
- **GetCustomCatDetailsService**
- **ArchiveCustomCatService**
- **GenerateCustomCatFromPromptService** — LLM-based creation.
- **RegenerateCatDescriptionService**
- **List/GetContentPageService** (optional)

### 2.2 Commands / Queries
Examples:
- Commands: `CreateCatListingCommand`, `GenerateCustomCatCommand`, `ArchiveCustomCatCommand`, `RegenerateCatDescriptionCommand`
- Queries: `ListCatListingsQuery`, `GetCatDetailsQuery`, `ListCustomCatsQuery`

### 2.3 Primary Ports (Inbound Interfaces)
- `CatCatalogUseCasePort`
- `CustomCatUseCasePort`
- `ContentPageUseCasePort` (optional)

---

## 3. Infrastructure Layer (Ports & Adapters)

### 3.1 Secondary Ports (Outbound)
- `LanguageModelPort` — LLM interface.
- `SearchIndexPort`
- `MediaStoragePort`
- `SlugGeneratorPort`
- `ClockPort`
- `IdGeneratorPort`
- `TransactionPort`

### 3.2 Secondary Adapters (Implementations)
- `SqlCatListingRepository`
- `SqlCustomCatRepository`
- `SqlContentPageRepository`
- `DbPromptTemplateRepository`
- `OpenAIApiLanguageModelAdapter` / `ClaudeApiLanguageModelAdapter`
- `SearchIndexAdapter` (Algolia/OpenSearch/etc.)
- `S3MediaStorageAdapter`
- `SlugifyAdapter`
- `SystemClockAdapter`
- `UuidIdGeneratorAdapter`
- `DatabaseTransactionAdapter`

### 3.3 Primary Adapters (Inbound)
- HTTP/REST controllers (e.g., `/cat-alog`, `/custom-cats`)
- GraphQL resolvers
- Background job handlers

---

## 4. Summary Structure

### Domain
- Aggregates: `CatListing`, `CustomCat`, `ContentPage`
- Entities: `CatProfile`, `CatMedia`, `CustomCatPrompt`, `CustomCatStory`
- Value Objects: `CatId`, `CustomCatId`, `Slug`, `TagList`, `TraitSet`, `SeoMetadata`, etc.
- Domain Services: Copy generation policies, description rules, search specs.
- Events: publish/archive/create/regenerate events.
- Repositories: interfaces only.

### Application
- Use cases for browsing, generating, archiving, and managing cats.
- DTO Commands/Queries.
- Primary Ports for inbound adapters.

### Infrastructure
- Secondary Ports & Adapters for DB, LLM, media, search, ID/clock.
- Primary Adapters: REST/GraphQL/UI integration.

---

This is the complete HexDDD component map for the **Cat & Content bounded context only**, derived from all three project documents (bounded context diagram, HexDDD table, and functional spec).

