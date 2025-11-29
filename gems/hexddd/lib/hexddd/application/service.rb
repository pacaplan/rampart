require "dry-monads"

module HexDDD
  module Application
    # Base class for application services (use cases).
    #
    # Services should include their bounded context's Import module for
    # automatic dependency injection via dry-auto_inject.
    #
    # Example:
    #   class CatListingService < HexDDD::Application::Service
    #     include CatContent::Import[:cat_listing_repo, :id_generator, :clock, :transaction, :event_bus]
    #
    #     def create(command)
    #       # Dependencies are automatically injected as @cat_listing_repo, etc.
    #       @transaction.call do
    #         # ...
    #       end
    #     end
    #   end
    class Service
      include Dry::Monads[:result]
    end
  end
end

