# frozen_string_literal: true

module CatContent
  module Entities
    class CatProfile < HexDDD::Domain::Entity
      attribute :id, HexDDD::Types::String
      attribute :age_months, HexDDD::Types::Integer.optional
      attribute :traits, ValueObjects::TraitSet
      attribute :temperament, HexDDD::Types::String.optional
    end
  end
end

