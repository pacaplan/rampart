require "dry-container"
require "dry-auto_inject"

module HexDDD
  # Base container for dependency registration.
  # Each bounded context should create its own container extending this.
  #
  # Example:
  #   module CatContent
  #     class Container
  #       extend Dry::Container::Mixin
  #
  #       register(:cat_listing_repo) { Infrastructure::CatListingRepository.new }
  #       register(:id_generator) { Infrastructure::UuidGenerator.new }
  #       register(:clock) { Infrastructure::SystemClock.new }
  #       register(:transaction) { Infrastructure::ActiveRecordTransaction.new }
  #       register(:event_bus) { Infrastructure::EventBus.new }
  #     end
  #
  #     Import = Dry::AutoInject(Container)
  #   end
  module Container
    def self.included(base)
      base.extend(Dry::Container::Mixin)
    end
  end
end

