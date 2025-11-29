# Rails API Agent Guidelines

## Project Structure

This is the main Rails API application that serves as the host for bounded context engines.

### Key Concepts

1. **Bounded Contexts as Rails Engines** - Each bounded context lives in `engines/` as a mountable Rails engine
2. **Schema Isolation** - Each engine uses its own PostgreSQL schema with restricted search_path
3. **Supabase for Schema Management** - All database schemas/tables are created by Supabase migrations
4. **Pure Domain/Application Layers** - Domain and application code must be pure Ruby (no Rails)
5. **Infrastructure Only in Rails** - Only infrastructure layer (controllers, repos, adapters) uses Rails

## Database Configuration

The app uses local Supabase with PostgreSQL schema isolation:

- **Primary Database**: Uses `public` schema for app-level tables
- **Engine Databases**: Each engine uses its own schema (e.g., `cat_content`)
- **Schema Creation**: Handled by Supabase migrations in `supabase/migrations/`
- **Search Path Restriction**: Each connection only sees its designated schema

### Multi-Database Setup

Each engine has its own database configuration in `config/database.yml`:

```yaml
development:
  primary:
    # Primary app database
    schema_search_path: public
  
  cat_content:
    # Cat & Content engine database
    schema_search_path: cat_content
```

## Working with Engines

### Adding a New Bounded Context Engine

1. **Generate the engine:**
   ```bash
   rails plugin new engines/context_name --mountable --skip-test
   ```

2. **Create HexDDD directory structure:**
   ```bash
   cd engines/context_name
   mkdir -p app/domain/context_name/{aggregates,entities,value_objects,events,services,ports}
   mkdir -p app/application/context_name/{services,commands,queries}
   mkdir -p app/infrastructure/context_name/{persistence/{models,mappers,repositories},adapters,http/{controllers,serializers},wiring}
   ```

3. **Create BaseRecord for schema isolation:**
   ```ruby
   # app/infrastructure/context_name/persistence/base_record.rb
   module ContextName
     class BaseRecord < ActiveRecord::Base
       self.abstract_class = true
       connects_to database: { writing: :context_name, reading: :context_name }
     end
   end
   ```

4. **Add to Gemfile:**
   ```ruby
   gem "context_name", path: "../../engines/context_name"
   ```

5. **Mount in routes:**
   ```ruby
   mount ContextName::Engine => "/path"
   ```

6. **Create Supabase migration** in `supabase/migrations/`:
   ```sql
   CREATE SCHEMA IF NOT EXISTS context_name;
   
   -- Create tables in the schema
   CREATE TABLE context_name.your_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     -- columns...
   );
   
   GRANT USAGE ON SCHEMA context_name TO postgres;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA context_name TO postgres;
   ```

7. **Add database config:**
   ```yaml
   context_name:
     <<: *supabase_local
     schema_search_path: context_name
   ```

## Common Tasks

```bash
# Start Supabase (creates all schemas)
supabase start

# Reset database (recreates from migrations)
supabase db reset

# Start Rails server
rails server
```

## Architecture Rules

1. **Domain Layer** - Pure Ruby, no Rails dependencies
   - Aggregates, Entities, Value Objects
   - Domain Events, Domain Services
   - Repository Interfaces (Ports)

2. **Application Layer** - Pure Ruby, orchestrates domain
   - Application Services (Use Cases)
   - Commands, Queries
   - No Rails, no database, no HTTP

3. **Infrastructure Layer** - Rails-specific implementations
   - Controllers (Primary Adapters)
   - ActiveRecord Models (Secondary Adapters)
   - Repository Implementations
   - External Service Adapters

## Conventions

- Engine models inherit from engine-specific `BaseRecord`
- Database schemas are managed by Supabase (not Rails migrations)
- All domain/application code is pure Ruby
- Infrastructure code can use Rails
- Each engine is completely isolated from others

## Health Check Endpoints

The API provides health check endpoints for troubleshooting connectivity issues:

### Main Health Endpoint

**Route:** `GET /health`

**Purpose:** Comprehensive health check that aggregates status from all components

**Checks:**
- API service status
- Primary database connectivity
- All mounted engine health statuses
