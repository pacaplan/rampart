# frozen_string_literal: true

require "rails_helper"
require "rampart/testing/engine_architecture_shared_spec"

RSpec.describe "{{CONTEXT_NAME_PASCAL}} Engine Architecture", type: :architecture do
  it_behaves_like "Rampart Engine Architecture",
    engine_root: File.expand_path("..", __dir__),
    container_class: {{CONTEXT_NAME_PASCAL}}::Infrastructure::Wiring::Container
end
