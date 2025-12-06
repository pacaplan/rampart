require "dry-struct"

module Rampart
  module Application
    # Base DTO for CQRS queries.
    # Queries capture read-only concerns such as pagination or filters
    # and can be tailored for optimized projections without touching
    # the domain model. Dry::Struct ensures query parameters are coerced
    # to the expected types before they reach query handlers.
    class Query < Dry::Struct
      transform_keys(&:to_sym)
    end
  end
end

