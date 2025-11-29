module HexDDD
  module Application
    class Transaction
      def initialize(adapter)
        @adapter = adapter
      end

      def call(&block)
        @adapter.call(&block)
      end
    end
  end
end

