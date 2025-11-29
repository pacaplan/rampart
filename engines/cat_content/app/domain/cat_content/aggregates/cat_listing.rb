# frozen_string_literal: true

module CatContent
  module Aggregates
    class CatListing < HexDDD::Domain::AggregateRoot
      attribute :id, ValueObjects::CatId
      attribute :name, ValueObjects::CatName
      attribute :description, ValueObjects::ContentBlock
      attribute :price, ValueObjects::Money
      attribute :slug, ValueObjects::Slug
      attribute :visibility, ValueObjects::Visibility
      attribute :tags, ValueObjects::TagList
      attribute :profile, Entities::CatProfile.optional.default(nil)
      attribute :media, ValueObjects::CatMedia.optional.default(nil)

      delegate :public?, :private?, :archived?, to: :visibility

      def self.create(id:, name:, description:, price:, slug:, tags: nil)
        new(
          id: id,
          name: name,
          description: description,
          price: price,
          slug: slug,
          visibility: ValueObjects::Visibility.new(value: :private),
          tags: tags || ValueObjects::TagList.new(values: [])
        )
      end
    end
  end
end

