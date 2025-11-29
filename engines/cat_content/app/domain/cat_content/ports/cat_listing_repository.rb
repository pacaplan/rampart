# frozen_string_literal: true

module CatContent
  module Ports
    class CatListingRepository < HexDDD::Ports::SecondaryPort
      abstract_method :add, :find, :find_by_slug, :list_public, :update, :remove
    end
  end
end

