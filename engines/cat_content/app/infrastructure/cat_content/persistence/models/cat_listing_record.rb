# frozen_string_literal: true

module CatContent
  module Infrastructure
    module Persistence
      module Models
        class CatListingRecord < BaseRecord
          self.table_name = "cat_content.cat_listings"
          
          # Validations
          validates :name, presence: true
          validates :slug, presence: true, uniqueness: true
          validates :visibility, presence: true, inclusion: { in: %w[public private archived] }
        end
      end
    end
  end
end

