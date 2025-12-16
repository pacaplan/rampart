# frozen_string_literal: true

module Rampart
  module Testing
  end
end

if defined?(RSpec)
  require_relative "testing/architecture_matchers"
  require_relative "testing/engine_architecture_shared_spec"

  RSpec.configure do |config|
    config.include Rampart::Testing::ArchitectureMatchers
  end
end
