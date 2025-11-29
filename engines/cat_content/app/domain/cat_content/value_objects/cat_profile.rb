# frozen_string_literal: true

module CatContent
  module ValueObjects
    # CatProfile represents the cat's characteristics.
    # It's a value object because it doesn't have independent identity -
    # it's always part of a CatListing aggregate.
    class CatProfile < HexDDD::Domain::ValueObject
      attribute :age_months, HexDDD::Types::Integer.optional
      attribute :traits, TraitSet
      attribute :temperament, HexDDD::Types::String.optional

      def adult?
        age_months && age_months >= 12
      end

      def kitten?
        age_months && age_months < 12
      end
    end
  end
end

