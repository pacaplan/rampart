# frozen_string_literal: true

module CatContent
  module ValueObjects
    class Visibility < HexDDD::Domain::ValueObject
      STATES = %i[public private archived].freeze

      attribute :value, HexDDD::Types::Symbol.enum(*STATES)

      def public? = value == :public
      def private? = value == :private
      def archived? = value == :archived

      def to_sym = value
    end
  end
end

