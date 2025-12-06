# frozen_string_literal: true

require "rspec"

module Rampart
  module Testing
  end
end

require_relative "testing/architecture_matchers"

RSpec.configure do |config|
  config.include Rampart::Testing::ArchitectureMatchers
end
