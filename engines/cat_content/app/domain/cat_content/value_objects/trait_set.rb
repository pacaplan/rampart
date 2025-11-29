# frozen_string_literal: true

module CatContent
  module ValueObjects
    class TraitSet < HexDDD::Domain::ValueObject
      # Allow any string traits for flexibility
      attribute :values, HexDDD::Types::Array.of(HexDDD::Types::String)

      def include?(trait)
        values.include?(trait.to_s)
      end

      def to_a = values
    end
  end
end

