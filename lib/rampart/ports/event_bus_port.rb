# frozen_string_literal: true

module Rampart
  module Ports
    class EventBusPort < SecondaryPort
      # Publish one or many domain events to downstream subscribers or transports.
      abstract_method :publish
    end
  end
end
