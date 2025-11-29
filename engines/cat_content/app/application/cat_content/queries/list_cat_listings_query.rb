# frozen_string_literal: true

module CatContent
  module Queries
    class ListCatListingsQuery < HexDDD::Application::Query
      attribute :tags, HexDDD::Types::Array.of(HexDDD::Types::String).default([].freeze)
      attribute :page, HexDDD::Types::Integer.default(1)
      attribute :per_page, HexDDD::Types::Integer.default(20)
    end
  end
end

