# frozen_string_literal: true

module CatContent
  module ValueObjects
    class TagList < HexDDD::Domain::ValueObject
      attribute :values, HexDDD::Types::Array.of(HexDDD::Types::String)

      def include?(tag)
        values.include?(tag)
      end

      def to_a = values
    end
  end
end

