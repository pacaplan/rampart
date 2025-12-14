# frozen_string_literal: true
require "ripper"

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

      matcher :be_immutable do
        match do |klass|
          @setter_methods = klass.instance_methods(false).grep(/=$/).reject { |name| name == :== }
          @setter_methods.empty?
        end

        failure_message do |klass|
          "expected #{klass} to be immutable, found setter methods: #{@setter_methods.join(', ')}"
        end
      end

      matcher :have_no_mutable_instance_variables do
        match do |klass|
          source_file = source_file_for(klass)
          return true unless source_file

          @mutation_locations = mutable_instance_var_locations(source_file)
          @mutation_locations.empty?
        end

        failure_message do |klass|
          "expected #{klass} to avoid instance variable mutation outside initialize, found assignments at: #{@mutation_locations.join(', ')}"
        end
      end

      private

      def source_file_for(klass)
        Object.const_source_location(klass.name)&.first
      end

      def mutable_instance_var_locations(source_file)
        sexp = Ripper.sexp(File.read(source_file))
        return [] unless sexp

        collect_ivasgn(sexp, nil, [], source_file).uniq
      end

      def collect_ivasgn(node, current_method, mutations, source_file)
        return mutations unless node.is_a?(Array)

        case node[0]
        when :def
          method_name = node[1][1]
          body = node[3]
          collect_ivasgn(body, method_name, mutations, source_file)
        when :defs
          method_name = node[2][1]
          body = node[4]
          collect_ivasgn(body, method_name, mutations, source_file)
        when :ivasgn
          token = node[1]
          line = token[2][0] if token.is_a?(Array)
          mutations << "#{source_file}:#{line}" if current_method != "initialize"
        else
          node.each do |child|
            collect_ivasgn(child, current_method, mutations, source_file)
          end
        end

        mutations
      end
    end
  end
end
