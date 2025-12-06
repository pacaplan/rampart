module Rampart
  module Domain
    class AggregateRoot < Entity
      attr_reader :unpublished_events

      def initialize(...)
        super
        @unpublished_events = []
      end

      def clear_events!
        @unpublished_events.clear
      end

      private

      def apply(event)
        @unpublished_events << event
        handler = "on_#{event.class.name.split('::').last.gsub(/([A-Z])/) { "_#{$1.downcase}" }.sub(/^_/, '')}"
        send(handler, event) if respond_to?(handler, true)
      end
    end
  end
end
