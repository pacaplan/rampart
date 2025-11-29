module CatContent
  module Infrastructure
    module Persistence
      class BaseRecord < ActiveRecord::Base
        self.abstract_class = true
        
        # Connect to the cat_content database configuration
        # This enforces schema isolation by using the cat_content search_path
        connects_to database: { writing: :cat_content, reading: :cat_content }
      end
    end
  end
end

