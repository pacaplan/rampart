# frozen_string_literal: true

module Rampart
  module Testing
    module ArchitectureMatchers
      extend RSpec::Matchers::DSL

      matcher :have_no_rails_dependencies do
        match do |klass|
          @rails_ancestors = rails_ancestors_for(klass)
          @rails_ancestors.empty?
        end

        failure_message do |klass|
          "expected #{klass} to avoid Rails dependencies, found #{@rails_ancestors.map(&:name).join(', ')}"
        end

        def rails_ancestors_for(klass)
          rails_prefixes = %w[ActiveRecord ActionDispatch ActionController ActiveSupport Rails]
          shared = Object.ancestors
          klass.ancestors.compact.reject { |ancestor| shared.include?(ancestor) }.select do |ancestor|
            rails_prefixes.any? { |prefix| ancestor.name&.start_with?(prefix) }
          end
        end
      end

      matcher :inherit_from_rampart_base do |base_class|
        match do |klass|
          klass < base_class
        end

        failure_message do |klass|
          "expected #{klass} to inherit from #{base_class}, but ancestors are: #{klass.ancestors.take(5).map(&:name).join(' -> ')}"
        end
      end

      matcher :implement_all_abstract_methods do |port_class|
        match do |implementation_class|
          @abstract_methods = port_class.instance_methods(false)
          @missing_methods = @abstract_methods.reject do |method_name|
            implementation_class.instance_methods.include?(method_name) &&
              implementation_class.instance_method(method_name).owner != port_class
          end
          @missing_methods.empty?
        end

        failure_message do |implementation_class|
          "expected #{implementation_class} to implement #{port_class} abstract methods: #{@missing_methods.join(', ')}"
        end
      end
    end
  end
end
