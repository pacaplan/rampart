require "dry-struct"

module Rampart
  module Application
    class Query < Dry::Struct
      transform_keys(&:to_sym)
    end
  end
end


