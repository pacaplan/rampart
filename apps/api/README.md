# HexDDD Rails API

Rails 8 API application implementing Hexagonal Architecture with DDD principles, using local Supabase with PostgreSQL schema isolation.

## Architecture

This application uses:
- **Bounded Contexts as Rails Engines** - Each bounded context is a separate Rails engine
- **Schema Isolation** - Each engine uses its own PostgreSQL schema
- **HexDDD Framework** - Pure Ruby DDD building blocks (domain, application, ports/adapters)
- **Local Supabase** - PostgreSQL with separate schemas for each bounded context

## Prerequisites

- Ruby 3.3.6
- Docker Desktop (for local Supabase)
- Supabase CLI

## Setup

1. **Install dependencies:**
   ```bash
   bundle install
   ```

2. **Start local Supabase:**
   ```bash
   # From project root
   supabase start
   ```
   
   This will output connection details:
   - **API URL**: http://localhost:54321
   - **DB URL**: postgresql://postgres:postgres@localhost:54322/postgres
   - **Studio URL**: http://localhost:54323
   - **Anon Key**: (generated key)
   - **Service Role Key**: (generated key)

3. **Set up all database schemas:**
   ```bash
   rake db:setup:all
   ```
   
   This creates:
   - The `public` schema (for primary database)
   - The `cat_content` schema (for Cat & Content bounded context)
   - Runs migrations for all schemas

4. **Verify schema isolation:**
   ```bash
   rake db:test:isolation
   ```
   
   Expected output:
   ```
   🔍 Testing schema isolation...
   1️⃣ Testing primary database (public schema)...
      ✅ PASSED: Primary database isolated from cat_content
   2️⃣ Testing cat_content database (cat_content schema)...
      ✅ PASSED: Cat_content database can see its tables
   3️⃣ Testing search_path configuration...
      ✅ PASSED: Cat_content search_path correctly configured
   ```

5. **Start the Rails server:**
   ```bash
   rails server
   ```
   
   API will be available at http://localhost:3000

### Troubleshooting

**Docker Not Running:**
If you see "Cannot connect to Docker daemon":
1. Open Docker Desktop
2. Wait for it to start
3. Run `supabase start` again

**Database Connection Issues:**
1. Verify Supabase is running: `supabase status`
2. Check the port (should be 54322): `lsof -i :54322`
3. Verify `config/database.yml` has correct host/port

**Schema Not Found:**
1. Run migrations: `supabase db reset`
2. Recreate schemas: `rake db:setup:all`

**Engine Can See Other Engine's Tables:**
If schema isolation is broken:
1. Check BaseRecord uses `connects_to`
2. Verify database.yml has correct `schema_search_path`
3. Run isolation test: `rake db:test:isolation`

## Schema Isolation

Each bounded context engine has its own PostgreSQL schema with isolated `search_path`:

| Engine | Schema | Search Path | Tables |
|--------|--------|-------------|--------|
| Primary App | `public` | `public` | App-level tables |
| Cat & Content | `cat_content` | `cat_content` | `cat_listings`, `custom_cats` |

### Testing Schema Isolation

Run the isolation test to verify schemas are properly isolated:

```bash
rake db:test:isolation
```

This test verifies:
1. Primary database cannot see cat_content tables
2. Cat_content database can see its own tables
3. Search paths are correctly configured

### Database Commands

```bash
# Create cat_content schema
rake db:cat_content:create

# Run cat_content migrations
rake db:cat_content:migrate

# Rollback cat_content migrations
rake db:cat_content:rollback

# Run isolation test
rake db:test:isolation
```

## Bounded Contexts

### Cat & Content (`/catalog`)

Manages the cat catalog and custom cat generation.

- **Engine:** `engines/cat_content`
- **Mount Path:** `/catalog`
- **Schema:** `cat_content`

## Development

```bash
# Start Rails server
rails server

# Access Supabase Studio
open http://localhost:54323

# Run console with cat_content connection
rails console
```

## Directory Structure

```
apps/api/
├── app/              # Primary application code
├── config/
│   └── database.yml  # Multi-schema configuration
└── lib/
    └── tasks/
        └── db_schemas.rake  # Schema management tasks

engines/
└── cat_content/      # Cat & Content bounded context
    ├── app/
    │   ├── domain/            # Pure Ruby domain layer
    │   ├── application/       # Pure Ruby application layer
    │   └── infrastructure/    # Rails-specific infrastructure
    └── db/
        └── migrate/           # Cat_content schema migrations

gems/
└── hexddd/          # DDD framework gem
    └── lib/
        └── hexddd/  # Domain, application, and port abstractions
```

## Testing

(To be added - RSpec configuration)

## Implementation Status

### ✅ Completed
- Rails 8.1.1 API-only application
- Local Supabase with PostgreSQL
- Multi-database configuration with schema isolation
- Cat & Content engine mounted at `/catalog`
- HexDDD gem integration
- Kamal deployment configuration
- Database management rake tasks
- Schema isolation testing

### 🔜 Next Steps
1. Implement domain models (Value Objects, Entities, Aggregates)
2. Implement application services (Use cases)
3. Implement infrastructure adapters (Repositories, Controllers)
4. Add RSpec tests
5. Add remaining bounded contexts (Commerce, Identity)

## Deployment

Deployment is configured using Kamal. See `config/deploy.yml` for configuration.
