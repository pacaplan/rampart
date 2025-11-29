module HexDDD
  module Domain
    class AggregateRoot
      attr_reader :id, :unpublished_events

      def initialize(id:)
        @id = id
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

