# frozen_string_literal: true

module CatContent
  module ValueObjects
    class CatMedia < HexDDD::Domain::ValueObject
      attribute :url, HexDDD::Types::String
      attribute :alt_text, HexDDD::Types::String.optional.default(nil)
      attribute :content_type, HexDDD::Types::String.optional.default(nil)
    end
  end
end

