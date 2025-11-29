# frozen_string_literal: true

module CatContent
  module ValueObjects
    class CatId < HexDDD::Domain::ValueObject
      attribute :value, HexDDD::Types::String

      def to_s = value

      def ==(other)
        other.is_a?(CatId) && other.value == value
      end
    end
  end
end

