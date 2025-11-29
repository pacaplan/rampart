require "dry-struct"

module HexDDD
  module Domain
    class ValueObject < Dry::Struct
      # Value objects are compared by their attributes
      # Dry::Struct provides immutability and value equality by default
    end
  end
end

