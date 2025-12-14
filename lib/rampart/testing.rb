# frozen_string_literal: true

module Rampart
  module Testing
  end
end

if defined?(RSpec)
  require_relative "testing/architecture_matchers"

  RSpec.configure do |config|
    config.include Rampart::Testing::ArchitectureMatchers
  end
end
