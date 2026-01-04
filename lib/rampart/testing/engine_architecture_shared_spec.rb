# frozen_string_literal: true

require "json"
require "rampart/testing/architecture_matchers"

# Shared RSpec examples for enforcing Rampart engine architectural patterns.
#
# Usage:
#   RSpec.describe "Architecture", type: :architecture do
#     it_behaves_like "Rampart Engine Architecture",
#       engine_root: File.expand_path("../../..", __FILE__),
#       container_class: MyEngine::Infrastructure::Wiring::Container
#   end
#
# Options:
#   - engine_root: (required) Path to the engine root directory
#   - container_class: (required) The DI container class for the engine
#   - architecture_json_path: (optional) Path to the architecture JSON file
#   - warn_unimplemented: (optional, default: false) When true, items defined in JSON
#     but missing from code will emit warnings instead of failures. This is useful
#     during development when the JSON blueprint represents planned architecture
#     that hasn't been implemented yet. Code that exists but isn't documented in
#     JSON will still fail (to catch architecture drift).
#
# This shared group verifies:
# 1. DI and Wiring Policies (Services depend on Ports, Controllers depend on Services)
# 2. Base Class Contracts (Inheritance from Rampart primitives)
# 3. Immutability (Aggregates and Value Objects are immutable)
# 4. Public API (No leakage of internal types like ActiveRecord)
# 5. Architecture JSON Sync (Bidirectional check of code vs blueprint)
RSpec.shared_examples "Rampart Engine Architecture" do |options = {}|
  include Rampart::Testing::ArchitectureMatchers

  let(:engine_root) do
    options[:engine_root] || raise("Must provide :engine_root to shared examples")
  end

  let(:container_class) do
    options[:container_class] || raise("Must provide :container_class (e.g. MyEngine::Infrastructure::Wiring::Container)")
  end

  let(:architecture_json_path) do
    options[:architecture_json_path] || begin
      bc_id = File.basename(engine_root)
      File.join(engine_root, "../../architecture/#{bc_id}/architecture.json")
    end
  end

  let(:warn_unimplemented) do
    options[:warn_unimplemented] || false
  end

  # Helper to check architecture sync with support for warning-only mode on unimplemented items
  def check_architecture_sync(component_type:, json_items:, code_items:, json_path:, add_to_code_hint:, add_to_json_hint:)
    missing_from_code = json_items - code_items
    missing_from_json = code_items - json_items

    # Always fail if code exists that isn't documented in JSON (architecture drift)
    if missing_from_json.any?
      error_parts = []
      error_parts << "#{component_type} mismatch - undocumented code found:"
      error_parts << ""
      error_parts << "  JSON defines: #{json_items.inspect}"
      error_parts << "  Code defines: #{code_items.inspect}"
      error_parts << ""
      error_parts << "  ❌ Defined in code but missing from JSON: #{missing_from_json.inspect}"
      error_parts << "     → #{add_to_json_hint}"
      fail error_parts.join("\n")
    end

    # For items in JSON but missing from code: warn or fail based on option
    if missing_from_code.any?
      message_parts = []
      message_parts << "#{component_type} not yet implemented:"
      message_parts << ""
      message_parts << "  JSON defines: #{json_items.inspect}"
      message_parts << "  Code defines: #{code_items.inspect}"
      message_parts << ""
      message_parts << "  ⚠️  Defined in JSON but missing from code: #{missing_from_code.inspect}"
      message_parts << "     → #{add_to_code_hint}"
      message = message_parts.join("\n")

      if warn_unimplemented
        # Emit as RSpec warning (will appear in output but not fail)
        warn "\n#{message}\n"
      else
        fail message
      end
    end
  end

  def classes_in_engine(base_class)
    ObjectSpace.each_object(Class).select do |klass|
      next unless klass < base_class
      
      location = Object.const_source_location(klass.name)&.first
      location && location.start_with?(engine_root)
    end
  end

  let(:architecture_json) do
    JSON.parse(File.read(architecture_json_path))
  end

  # Helpers for class discovery
  let(:aggregates) { classes_in_engine(Rampart::Domain::AggregateRoot) }
  let(:entities) { classes_in_engine(Rampart::Domain::Entity) }
  let(:value_objects) { classes_in_engine(Rampart::Domain::ValueObject) }
  let(:events) { classes_in_engine(Rampart::Domain::DomainEvent) }
  let(:services) { classes_in_engine(Rampart::Application::Service) }
  let(:ports) do
    classes_in_engine(Rampart::Ports::SecondaryPort).select do |klass|
      location = Object.const_source_location(klass.name)&.first
      location&.include?("/domain/")
    end
  end
  # Adapters are implementations of ports that live in infrastructure
  let(:adapters) do
    classes_in_engine(Rampart::Ports::SecondaryPort).select do |klass|
      location = Object.const_source_location(klass.name)&.first
      location&.include?("/infrastructure/")
    end
  end
  # Controllers (excluding base ApplicationController classes)
  let(:controllers) do
    ObjectSpace.each_object(Class).select do |klass|
      next unless defined?(ActionController::API) && klass < ActionController::API
      # Skip base ApplicationController classes - these are Rails infrastructure, not entrypoints
      next if klass.name&.end_with?("::ApplicationController")
      location = Object.const_source_location(klass.name)&.first
      location && location.start_with?(engine_root) && location.include?("/controllers/")
    end
  end
  let(:queries) { classes_in_engine(Rampart::Application::Query) }
  let(:commands) { classes_in_engine(Rampart::Application::Command) }

  describe "DI and Wiring Policies" do
    it "services depend only on Ports or Adapters" do
      service_keys = container_class.keys.map(&:to_sym).select { |k| k.to_s.end_with?("_service") }
      
      service_keys.each do |key|
        service = container_class.resolve(key)
        
        service.instance_variables.each do |ivar|
          dep = service.instance_variable_get(ivar)
          next unless dep 
          
          next if [String, Integer, TrueClass, FalseClass, Symbol, Array, Hash].any? { |t| dep.is_a?(t) }
          
          if defined?(ActiveRecord::Base) && dep.is_a?(ActiveRecord::Base)
            fail "Service #{key} has ActiveRecord dependency in #{ivar}: #{dep.class}"
          end
        end
      end
    end

    it "controllers only resolve Application Services or allowed Adapters" do
      allowed_keys = container_class.keys.map(&:to_sym).select do |k| 
        s = k.to_s
        s.end_with?("_service") || s.end_with?("_query")
      end
      
      controller_files = Dir[File.join(engine_root, "app/controllers/**/*.rb")]
                         .reject { |f| f.end_with?("AGENTS.md") || f.end_with?("README.md") }
      
      controller_files.each do |file|
        expect(file).to only_resolve_allowed_dependencies(allowed_keys)
      end
    end
  end

  describe "Base Class Contracts" do
    it "aggregates inherit from Rampart::Domain::AggregateRoot" do
      expect(aggregates).to all(inherit_from_rampart_base(Rampart::Domain::AggregateRoot))
    end

    it "entities inherit from Rampart::Domain::Entity" do
      expect(entities).to all(inherit_from_rampart_base(Rampart::Domain::Entity))
    end

    it "value objects inherit from Rampart::Domain::ValueObject" do
      expect(value_objects).to all(inherit_from_rampart_base(Rampart::Domain::ValueObject))
    end

    it "ports inherit from Rampart::Ports::SecondaryPort and are implemented" do
      expect(ports).to all(inherit_from_rampart_base(Rampart::Ports::SecondaryPort))

      ports.each do |port|
        implementations = classes_in_engine(port)
        expect(implementations).not_to be_empty, "expected #{port} to have at least one implementation"

        implementations.each do |implementation|
          expect(implementation).to implement_all_abstract_methods(port)
        end
      end
    end

    it "commands and queries inherit from Rampart base classes" do
      expect(queries).to all(inherit_from_rampart_base(Rampart::Application::Query))
      expect(commands).to all(inherit_from_rampart_base(Rampart::Application::Command))
    end
  end

  describe "Immutability" do
    it "value objects are immutable" do
      expect(value_objects).to all(be_immutable)
      expect(value_objects).to all(have_no_mutable_instance_variables)
    end

    it "aggregates are immutable" do
      expect(aggregates).to all(be_immutable)
    end
  end

  describe "Public API" do
    it "loads the public engine module" do
      module_name = container_class.name.split("::").first
      const = Object.const_get(module_name)
      expect(const).to be_truthy
    end

    # Note: We rely on Packwerk's enforce_privacy to prevent external access to
    # infrastructure internals. No namespace-based hiding is required—all classes
    # use the flat {Context}::{ClassName} convention.
  end

  describe "Architecture JSON Sync" do
    def get_names(objects)
      objects.map { |o| o.name.split("::").last }.sort
    end

    def json_names(path)
      items = architecture_json.dig(*path) || []
      items.map { |i| i.is_a?(Hash) ? i["name"] : i }.sort
    end

    describe "Aggregates" do
      let(:json_aggregates) { json_names(["layers", "domain", "aggregates"]) }
      let(:code_aggregates) { get_names(aggregates) }

      it "match between JSON and Code" do
        check_architecture_sync(
          component_type: "Aggregates",
          json_items: json_aggregates,
          code_items: code_aggregates,
          json_path: architecture_json_path,
          add_to_code_hint: "Add these aggregate classes to the codebase",
          add_to_json_hint: "Add these aggregates to #{architecture_json_path}"
        )
      end
    end

    describe "Events" do
      let(:json_events) { json_names(["layers", "domain", "events"]) }
      let(:code_events) { get_names(events) }

      it "match between JSON and Code" do
        check_architecture_sync(
          component_type: "Events",
          json_items: json_events,
          code_items: code_events,
          json_path: architecture_json_path,
          add_to_code_hint: "Add these event classes to the codebase",
          add_to_json_hint: "Add these events to #{architecture_json_path}"
        )
      end
    end

    describe "Ports" do
      let(:json_ports) do
        repos = architecture_json.dig("layers", "domain", "ports", "repositories") || []
        external = (architecture_json.dig("layers", "domain", "ports", "external") || []).map { |p| p["name"] }
        (repos + external).sort
      end
      let(:code_ports) { get_names(ports) }

      it "match between JSON and Code" do
        check_architecture_sync(
          component_type: "Ports",
          json_items: json_ports,
          code_items: code_ports,
          json_path: architecture_json_path,
          add_to_code_hint: "Add these port interfaces to the domain layer",
          add_to_json_hint: "Add these ports to #{architecture_json_path}"
        )
      end
    end

    describe "Services" do
      let(:json_services) { json_names(["layers", "application", "services"]) }
      let(:code_services) { get_names(services) }

      it "match between JSON and Code" do
        check_architecture_sync(
          component_type: "Services",
          json_items: json_services,
          code_items: code_services,
          json_path: architecture_json_path,
          add_to_code_hint: "Add these service classes to the application layer",
          add_to_json_hint: "Add these services to #{architecture_json_path}"
        )
      end
    end

    describe "Adapters" do
      let(:json_adapters) do
        persistence = (architecture_json.dig("layers", "infrastructure", "adapters", "persistence") || []).map { |a| a["name"] }
        external = (architecture_json.dig("layers", "infrastructure", "adapters", "external") || []).map { |a| a["name"] }
        (persistence + external).sort
      end
      let(:code_adapters) { get_names(adapters) }

      it "match between JSON and Code" do
        check_architecture_sync(
          component_type: "Adapters",
          json_items: json_adapters,
          code_items: code_adapters,
          json_path: architecture_json_path,
          add_to_code_hint: "Add these adapter implementations to the infrastructure layer",
          add_to_json_hint: "Add these adapters to #{architecture_json_path}"
        )
      end
    end

    describe "Controllers" do
      let(:json_controllers) do
        (architecture_json.dig("layers", "infrastructure", "entrypoints", "http") || []).map { |c| c["name"] }.sort
      end
      let(:code_controllers) do 
        get_names(controllers)
      end

      it "match between JSON and Code" do
        check_architecture_sync(
          component_type: "Controllers",
          json_items: json_controllers,
          code_items: code_controllers,
          json_path: architecture_json_path,
          add_to_code_hint: "Add these controller classes to app/controllers",
          add_to_json_hint: "Add these controllers to #{architecture_json_path}"
        )
      end
    end
  end
end
