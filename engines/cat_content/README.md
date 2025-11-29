# Cat & Content Bounded Context Engine

Rails engine implementing the Cat & Content bounded context using HexDDD patterns with schema isolation.

## Overview

This engine manages:
- **Cat Listings** - Premade, curated cats in the catalog
- **Custom Cats** - User-generated, AI-created cat records

The engine follows strict Hexagonal Architecture + DDD principles with complete schema isolation.

## Architecture

### Layer Separation

```
app/
├── domain/cat_content/           # Pure Ruby - No Rails
│   ├── aggregates/              # CatListing, CustomCat
│   ├── entities/                # CatProfile
│   ├── value_objects/           # CatId, CatName, Slug, Visibility, Money, etc.
│   ├── events/                  # Domain events
│   ├── services/                # Domain services
│   └── ports/                   # Repository interfaces
│
├── application/cat_content/      # Pure Ruby - No Rails
│   ├── services/                # Application services (use cases)
│   ├── commands/                # Command DTOs
│   └── queries/                 # Query DTOs
│
└── infrastructure/cat_content/   # Rails-specific code
    ├── persistence/
    │   ├── models/              # ActiveRecord models
    │   ├── mappers/             # Domain ↔ ActiveRecord mapping
    │   └── repositories/        # Repository implementations
    ├── adapters/                # External service adapters
    ├── http/
    │   ├── controllers/         # REST controllers
    │   └── serializers/         # JSON serializers
    └── wiring/                  # Dependency injection container
```

### Schema Isolation

This engine uses its own PostgreSQL schema (`cat_content`) completely isolated from other engines:

- **Database Connection**: Dedicated connection with `search_path: "cat_content"`
- **BaseRecord**: All models inherit from `CatContent::Infrastructure::Persistence::BaseRecord`
- **Migrations**: Stored in `db/migrate/` within this engine
- **Tables**: Only visible to this engine's connection

```ruby
# All models inherit from this
class BaseRecord < ActiveRecord::Base
  self.abstract_class = true
  connects_to database: { writing: :cat_content, reading: :cat_content }
end
```

## Database Tables

### cat_listings
Premade, curated cats for the catalog.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | string | Cat name |
| description | text | Description |
| slug | string | URL-friendly identifier |
| price_cents | integer | Price in cents |
| currency | string | Currency code (default: USD) |
| visibility | string | public/private/archived |
| image_url | string | Main image URL |
| image_alt | string | Image alt text |
| tags | jsonb | Category tags array |

### custom_cats
User-generated custom cats created via AI.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | string | Owner user ID |
| name | string | Cat name |
| prompt_text | text | Original user prompt |
| quiz_results | jsonb | Quiz results used for generation |
| story_text | text | AI-generated story |
| visibility | string | private/archived |
| image_url | string | Generated image URL |

## Setup

This engine is automatically set up when you run `rake db:setup:all` from the host application (`apps/api`).

### Manual Setup

If you need to set up the engine separately:

1. **Create the schema:**
   ```bash
   cd apps/api
   rake db:cat_content:create
   ```

2. **Run migrations:**
   ```bash
   rake db:cat_content:migrate
   ```

3. **Verify isolation:**
   ```bash
   rake db:test:isolation
   ```

## Development

### Running Migrations

```bash
# From host app (apps/api)
rake db:cat_content:migrate
rake db:cat_content:rollback
```

### Testing Schema Isolation

```bash
rake db:test:isolation
```

This verifies that:
1. Primary database cannot see cat_content tables
2. Cat_content database can see its own tables
3. Search paths are correctly configured

## API Endpoints

Mounted at `/catalog` in the host application:

- `GET /catalog/listings` - Browse public cat listings
- `GET /catalog/listings/:id` - Get cat details
- `GET /catalog/custom-cats` - User's custom cats
- `POST /catalog/custom-cats` - Generate new custom cat

See [API Documentation](../../docs/cat_app/cat_content_api.md) for complete endpoint reference.

## Domain Model

### Aggregates
- **CatListing** - Root for catalog browsing
- **CustomCat** - Root for user's created cats

### Key Value Objects
- **CatId** / **CustomCatId** - Unique identifiers
- **CatName** - Validated cat name (1-100 chars)
- **Slug** - URL-friendly identifier
- **Visibility** - Enum: public, private, archived
- **Money** - Price with currency
- **CatPrompt** - Original prompt text
- **CatStory** - AI-generated description

### Domain Events
- `CatListingPublished` - Cat made publicly visible
- `CatListingArchived` - Cat removed from public view
- `CustomCatCreated` - User's custom cat generated
- `CustomCatArchived` - User archived their cat
- `CatDescriptionRegenerated` - AI regenerated description

## Next Steps

1. **Implement Domain Layer**
   - Complete value object implementations
   - Implement aggregates with business logic
   - Define domain events

2. **Implement Application Layer**
   - CatListingService (create, publish, archive)
   - CustomCatService (generate, regenerate, archive)
   - Command/Query DTOs

3. **Implement Infrastructure Layer**
   - ActiveRecord models (CatListingRecord, CustomCatRecord)
   - Mappers (domain ↔ persistence translation)
   - Repositories (SqlCatListingRepository, SqlCustomCatRepository)
   - Controllers (REST endpoints)
   - LLM adapter (OpenAI/Claude for cat generation)

4. **Add Tests**
   - Domain specs (pure Ruby, no Rails)
   - Application specs (pure Ruby, no Rails)
   - Integration specs (with test database)

## References

- [Architecture Documentation](../../docs/cat_app/cat_content_architecture.md)
- [Implementation Spec](../../docs/cat_app/cat_content_implementation.md)
- [API Documentation](../../docs/cat_app/cat_content_api.md)
