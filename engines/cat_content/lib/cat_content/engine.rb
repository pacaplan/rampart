module CatContent
  class Engine < ::Rails::Engine
    isolate_namespace CatContent

    # Configure generators to use UUID primary keys and skip certain files
    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
      g.test_framework :rspec
      g.fixture_replacement :factory_bot
      g.factory_bot dir: 'spec/factories'
    end

    # Add lib directories to autoload paths for domain and application layers
    config.autoload_paths << root.join('app/domain')
    config.autoload_paths << root.join('app/application')
    config.autoload_paths << root.join('app/infrastructure')
    
    # Eager load domain and application layers in production
    config.eager_load_paths << root.join('app/domain')
    config.eager_load_paths << root.join('app/application')
    
    # Explicitly load infrastructure persistence models since autoloading doesn't work
    # due to directory structure mismatch (app/infrastructure/cat_content/* vs CatContent::Infrastructure::*)
    config.to_prepare do
      require_dependency Engine.root.join('app/infrastructure/cat_content/persistence/base_record')
      require_dependency Engine.root.join('app/infrastructure/cat_content/persistence/models/cat_listing_record')
    end
  end
end
