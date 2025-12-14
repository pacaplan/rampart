module Rampart
  module Domain
    class AggregateRoot < Entity
      # Aggregates are immutable. Domain methods return new instances instead of mutating state.
      # Application services publish events after persistence rather than accumulating them here.
      #
      # Example:
      #   def publish
      #     self.class.new(**attributes.merge(visibility: Visibility.public))
      #   end
    end
  end
end
