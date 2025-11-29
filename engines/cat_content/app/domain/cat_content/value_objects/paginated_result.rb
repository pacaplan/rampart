# frozen_string_literal: true

module CatContent
  module ValueObjects
    class PaginatedResult < HexDDD::Domain::ValueObject
      attribute :items, HexDDD::Types::Array
      attribute :total_count, HexDDD::Types::Integer
      attribute :page, HexDDD::Types::Integer
      attribute :per_page, HexDDD::Types::Integer

      def total_pages
        (total_count.to_f / per_page).ceil
      end

      def has_next_page?
        page < total_pages
      end

      def has_previous_page?
        page > 1
      end

      def to_meta
        {
          page: page,
          per_page: per_page,
          total: total_count
        }
      end
    end
  end
end

