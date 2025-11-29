require "dry-monads"

module HexDDD
  module Application
    class Service
      include Dry::Monads[:result]

      def initialize(dependencies = {})
        dependencies.each { |k, v| instance_variable_set("@#{k}", v) }
      end
    end
  end
end

