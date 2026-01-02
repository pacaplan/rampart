# frozen_string_literal: true

require "rails_helper"
require "rampart/testing/engine_architecture_shared_spec"

RSpec.describe "{{CONTEXT_NAME_PASCAL}} Engine Architecture", type: :architecture do
  it_behaves_like "Rampart Engine Architecture",
    engine_root: File.expand_path("..", __dir__),
    container_class: {{CONTEXT_NAME_PASCAL}}::Infrastructure::Wiring::Container,
    # Set to true during development to warn (not fail) on planned but unimplemented features.
    # Set to false (or remove) for strict mode where all JSON-defined components must exist.
    warn_unimplemented: true
end
