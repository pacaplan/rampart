# frozen_string_literal: true

module CatContent
  module Services
    class CatListingService < HexDDD::Application::Service
      def initialize(cat_listing_repo:)
        @cat_listing_repo = cat_listing_repo
      end

      # Browse/filter Cat-alog
      def list(query)
        @cat_listing_repo.list_public(
          tags: query.tags,
          page: query.page,
          per_page: query.per_page
        )
      end

      # Retrieve single cat details by slug
      def get_by_slug(slug)
        @cat_listing_repo.find_by_slug(slug)
      end
    end
  end
end

