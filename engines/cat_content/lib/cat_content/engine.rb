module CatContent
  class Engine < ::Rails::Engine
    isolate_namespace CatContent

    # Configure generators to use UUID primary keys and skip certain files
    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
      g.test_framework :rspec
      g.fixture_replacement :factory_bot
      g.factory_bot dir: "spec/factories"
    end

    # Add lib directories to autoload paths for domain and application layers
    config.autoload_paths << root.join("app/domain")
    config.autoload_paths << root.join("app/application")
    config.autoload_paths << root.join("app/infrastructure")

    # Eager load domain and application layers in production
    config.eager_load_paths << root.join("app/domain")
    config.eager_load_paths << root.join("app/application")
    config.eager_load_paths << root.join("app/infrastructure")

    # Explicitly load infrastructure persistence models since autoloading doesn't work
    # due to directory structure mismatch (app/infrastructure/cat_content/* vs CatContent::Infrastructure::*)
    config.to_prepare do
      # Load hexddd first
      require "hexddd"

      # Domain Layer - Value Objects
      require_dependency Engine.root.join("app/domain/cat_content/value_objects/cat_id")
      require_dependency Engine.root.join("app/domain/cat_content/value_objects/cat_name")
      require_dependency Engine.root.join("app/domain/cat_content/value_objects/slug")
      require_dependency Engine.root.join("app/domain/cat_content/value_objects/money")
      require_dependency Engine.root.join("app/domain/cat_content/value_objects/tag_list")
      require_dependency Engine.root.join("app/domain/cat_content/value_objects/visibility")
      require_dependency Engine.root.join("app/domain/cat_content/value_objects/content_block")
      require_dependency Engine.root.join("app/domain/cat_content/value_objects/cat_media")
      require_dependency Engine.root.join("app/domain/cat_content/value_objects/trait_set")

      # Domain Layer - Entities
      require_dependency Engine.root.join("app/domain/cat_content/entities/cat_profile")

      # Domain Layer - Aggregates
      require_dependency Engine.root.join("app/domain/cat_content/aggregates/cat_listing")

      # Domain Layer - Ports
      require_dependency Engine.root.join("app/domain/cat_content/ports/cat_listing_repository")

      # Application Layer - Queries
      require_dependency Engine.root.join("app/application/cat_content/queries/list_cat_listings_query")

      # Application Layer - Services
      require_dependency Engine.root.join("app/application/cat_content/services/cat_listing_service")

      # Infrastructure Layer - Persistence
      require_dependency Engine.root.join("app/infrastructure/cat_content/persistence/base_record")
      require_dependency Engine.root.join("app/infrastructure/cat_content/persistence/models/cat_listing_record")
      require_dependency Engine.root.join("app/infrastructure/cat_content/persistence/mappers/cat_listing_mapper")
      require_dependency Engine.root.join("app/infrastructure/cat_content/persistence/repositories/sql_cat_listing_repository")

      # Infrastructure Layer - HTTP
      require_dependency Engine.root.join("app/infrastructure/cat_content/http/controllers/health_controller")
      require_dependency Engine.root.join("app/infrastructure/cat_content/http/controllers/catalog_controller")
      require_dependency Engine.root.join("app/infrastructure/cat_content/http/serializers/cat_listing_serializer")

      # Infrastructure Layer - Wiring
      require_dependency Engine.root.join("app/infrastructure/cat_content/wiring/container")
    end
  end
end
