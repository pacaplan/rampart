module HexDDD
  module Domain
    class DomainException < StandardError
      attr_reader :code, :context

      def initialize(message, code: nil, context: {})
        @code = code
        @context = context
        super(message)
      end
    end
  end
end

