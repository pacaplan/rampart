# frozen_string_literal: true

module CatContent
  module ValueObjects
    class ContentBlock < HexDDD::Domain::ValueObject
      MAX_LENGTH = 5000

      attribute :text, HexDDD::Types::String.constrained(max_size: MAX_LENGTH)

      def to_s = text
    end
  end
end

