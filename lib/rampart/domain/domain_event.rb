require "dry-struct"
require "securerandom"

module Rampart
  module Domain
    # Domain events record meaningful business changes that already happened.
    # Aggregates remain immutable and side-effect free; application services publish events
    # after persisting new aggregate state. Events are past-tense, immutable Dry::Structs
    # with versioning baked in.
    class DomainEvent < Dry::Struct
      # Schema version enables event evolution without breaking consumers.
      # Increment when adding/removing/renaming attributes.
      SCHEMA_VERSION = 1

      attribute :event_id, Types::String.default { SecureRandom.uuid }
      attribute :occurred_at, Types::Time.default { Time.now }
      attribute :schema_version, Types::Integer.default { self::SCHEMA_VERSION }

      def event_type
        self.class.name
      end
    end
  end
end
