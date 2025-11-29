require "dry-struct"

module HexDDD
  module Application
    class Command < Dry::Struct
      transform_keys(&:to_sym)
    end
  end
end

