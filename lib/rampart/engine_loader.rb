# frozen_string_literal: true

module Rampart
  # Generic loader for Rails engines using hexagonal architecture
  #
  # This loader handles auto-discovery and loading of domain, application, and
  # infrastructure components in the correct order. It works around the mismatch
  # between directory structure (app/{layer}/{context}/) and Ruby namespace
  # conventions by using explicit eager loading.
  #
  # Usage in your engine:
  #   module YourContext
  #     class Engine < ::Rails::Engine
  #       config.to_prepare do
  #         Rampart::EngineLoader.load_all(
  #           engine_root: YourContext::Engine.root,
  #           context_name: "your_context"
  #         )
  #       end
  #     end
  #   end
  class EngineLoader
    class << self
      # Load all hexagonal architecture components for an engine
      #
      # @param engine_root [Pathname] Root path of the Rails engine
      # @param context_name [String] Snake-case name of the bounded context (e.g., "cat_content")
      def load_all(engine_root:, context_name:)
        load_domain_layer(engine_root, context_name)
        load_application_layer(engine_root, context_name)
        load_infrastructure_layer(engine_root, context_name)
      end

      private

      def load_domain_layer(root, context_name)
        domain = root.join("app/domain/#{context_name}")
        return unless domain.exist?

        # Load files in specific order: errors, value objects, entities, events, aggregates, services, ports
        load_directory(domain, pattern: "*_error.rb")
        load_directory(domain, pattern: "*_exception.rb")
        load_directory(domain.join("value_objects"))
        load_directory(domain.join("entities"))
        load_directory(domain.join("events"))
        load_directory(domain.join("aggregates"))
        load_directory(domain.join("services"))
        load_directory(domain.join("ports"))
        
        # Load any remaining files at domain root
        load_directory(domain, pattern: "*.rb")
      end

      def load_application_layer(root, context_name)
        app = root.join("app/application/#{context_name}")
        return unless app.exist?

        # Load all application layer files
        load_directory(app.join("commands"))
        load_directory(app.join("queries"))
        load_directory(app.join("services"))
        load_directory(app, pattern: "*.rb")
      end

      def load_infrastructure_layer(root, context_name)
        infra = root.join("app/infrastructure/#{context_name}")
        return unless infra.exist?

        # Load persistence layer first (base_record before models)
        persistence = infra.join("persistence")
        if persistence.exist?
          load_directory(persistence, pattern: "base_record.rb")
          load_directory(persistence.join("models"))
          load_directory(persistence.join("mappers"))
          load_directory(persistence.join("repositories"))
        end

        # Load other infrastructure components
        load_directory(infra.join("adapters"))
        load_directory(infra.join("http"))
        load_directory(infra.join("wiring"))
        load_directory(infra, pattern: "*.rb")
      end

      def load_directory(dir, pattern: "**/*.rb")
        return unless dir.exist?

        Dir.glob(dir.join(pattern)).sort.each do |file|
          next if File.directory?(file)
          if Rails.env.development? || Rails.env.test?
            load file.to_s
          else
            require_dependency file
          end
        end
      end
    end
  end
end


