# frozen_string_literal: true

module Rampart
  # Generic loader for Rails engines using hexagonal architecture
  #
  # This loader configures Zeitwerk to properly handle the mismatch between
  # hexagonal architecture directory structure (app/{layer}/{context}/{subdirs}/)
  # and flat Ruby namespace conventions (Context::ClassName instead of
  # Context::Subdirs::ClassName).
  #
  # It collapses ALL subdirectories within the context namespace so that
  # Zeitwerk expects files to define constants directly under the context
  # namespace (e.g., CatContent::CatListing, not CatContent::Aggregates::CatListing).
  #
  # Usage in your engine:
  #   module YourContext
  #     class Engine < ::Rails::Engine
  #       Rampart::EngineLoader.setup(self)
  #     end
  #   end
  class EngineLoader
    # Hexagonal architecture layers in load order
    LAYERS = %w[domain application infrastructure].freeze
    class << self
      # Set up hexagonal architecture loading for an engine
      #
      # This configures:
      # 1. Autoload paths for domain, application, and infrastructure layers
      # 2. Eager load paths for CI/production
      # 3. Zeitwerk collapse for flat namespaces (before eager loading)
      # 4. File loading in correct dependency order (via config.to_prepare)
      #
      # @param engine_class [Class] The Rails::Engine class (e.g., YourContext::Engine)
      def setup(engine_class)
        # Infer context_name from engine module (e.g., CatContent::Engine -> "cat_content")
        context_name = engine_class.module_parent.name.underscore
        root = engine_class.root

        # Add hexagonal layer directories to autoload and eager_load paths
        layer_paths = LAYERS.map { |layer| root.join("app/#{layer}") }
        engine_class.config.autoload_paths += layer_paths
        engine_class.config.eager_load_paths += layer_paths

        # Register initializer to configure Zeitwerk collapse before autoload paths are set
        engine_class.initializer "#{context_name}.zeitwerk", before: :set_autoload_paths do
          Rampart::EngineLoader.configure_autoloading(
            engine_root: root,
            context_name: context_name
          )
        end

        # Register config.to_prepare to load files in correct order
        engine_class.config.to_prepare do
          Rampart::EngineLoader.load_all(
            engine_root: root,
            context_name: context_name
          )
        end
      end

      # Configure Zeitwerk to collapse all subdirectories within hexagonal layers
      #
      # @param engine_root [Pathname] Root path of the Rails engine
      # @param context_name [String] Snake-case name of the bounded context
      def configure_autoloading(engine_root:, context_name:)
        return unless defined?(Rails) && Rails.respond_to?(:autoloaders)

        loader = Rails.autoloaders.main

        # Configure collapse for each hexagonal layer
        LAYERS.each do |layer|
          layer_path = engine_root.join("app/#{layer}/#{context_name}")
          next unless layer_path.exist?

          # Recursively collapse ALL subdirectories within the context path
          collapse_all_subdirectories(loader, layer_path)
        end
      end

      # Load all hexagonal architecture components for an engine
      #
      # @param engine_root [Pathname] Root path of the Rails engine
      # @param context_name [String] Snake-case name of the bounded context
      def load_all(engine_root:, context_name:)
        LAYERS.each do |layer|
          send("load_#{layer}_layer", engine_root, context_name)
        end
      end

      private

      # Recursively collapse all subdirectories
      def collapse_all_subdirectories(loader, path)
        return unless path.exist?

        Dir.glob(path.join("*/")).each do |subdir|
          subdir_path = Pathname.new(subdir)
          loader.collapse(subdir_path.to_s)
          # Recursively collapse nested subdirectories
          collapse_all_subdirectories(loader, subdir_path)
        end
      end

      def load_domain_layer(root, context_name)
        domain = root.join("app/domain/#{context_name}")
        return unless domain.exist?

        # Load errors/exceptions first (they have no dependencies)
        load_directory(domain, pattern: "*_error.rb")
        load_directory(domain, pattern: "*_exception.rb")

        # Load all subdirectories
        load_all_subdirectories(domain)

        # Load any remaining files at domain root
        load_directory(domain, pattern: "*.rb")
      end

      def load_application_layer(root, context_name)
        app = root.join("app/application/#{context_name}")
        return unless app.exist?

        # Load all subdirectories and root files
        load_all_subdirectories(app)
        load_directory(app, pattern: "*.rb")
      end

      def load_infrastructure_layer(root, context_name)
        infra = root.join("app/infrastructure/#{context_name}")
        return unless infra.exist?

        # Load base_record.rb first (models depend on it)
        persistence = infra.join("persistence")
        load_directory(persistence, pattern: "base_record.rb") if persistence.exist?

        # Load all subdirectories
        load_all_subdirectories(infra)

        # Load any remaining files at infrastructure root
        load_directory(infra, pattern: "*.rb")
      end

      def load_all_subdirectories(dir)
        return unless dir.exist?

        Dir.glob(dir.join("*/")).sort.each do |subdir|
          load_directory(Pathname.new(subdir))
        end
      end

      def load_directory(dir, pattern: "**/*.rb")
        return unless dir.exist?

        Dir.glob(dir.join(pattern)).sort.each do |file|
          next if File.directory?(file)
          # With Zeitwerk collapse configured, Zeitwerk manages autoloading and hot-reloading.
          # Use require to ensure files are loaded in correct dependency order without
          # re-executing already-loaded files. Zeitwerk handles reloading on code changes.
          require file.to_s
        end
      end
    end
  end
end


