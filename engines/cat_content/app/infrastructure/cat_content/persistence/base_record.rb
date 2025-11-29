module CatContent
  module Infrastructure
    module Persistence
      class BaseRecord < ActiveRecord::Base
        self.abstract_class = true
      end
    end
  end
end

