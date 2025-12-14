require "dry-struct"

module Rampart
  module Application
    # Base DTO for CQRS command objects.
    # Commands represent task-based, intent-revealing write operations
    # (e.g., ShipOrder, ArchiveCustomCat) and should wrap all inputs needed
    # to perform a single business action. Dry::Struct gives immutability
    # and coarse type validation so command handlers receive predictable data.
    class Command < Dry::Struct
      transform_keys(&:to_sym)
    end
  end
end

