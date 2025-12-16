# frozen_string_literal: true
require "ripper"

module Rampart
  module Testing
    # RSpec matchers for enforcing architectural rules in Rampart applications.
    # These matchers verify layer boundaries, dependency injection policies,
    # immutability, and structural contracts.
    module ArchitectureMatchers
      extend RSpec::Matchers::DSL

      # Helper methods for AST analysis using Ripper.
      # Encapsulates the complexity of parsing Ruby code to finding method calls,
      # constant references (legacy), and variable mutations.
      class MatcherHelpers
        # Returns the source file path for a given class.
        def self.source_file_for(klass)
          Object.const_source_location(klass.name)&.first
        end

        # Returns an array of file:line locations where instance variables are mutated
        # (assigned to) outside of the initialize method.
        def self.mutable_instance_var_locations(source_file)
          sexp = Ripper.sexp(File.read(source_file))
          return [] unless sexp

          collect_ivasgn(sexp, nil, [], source_file).uniq
        end

        # Recursively collects instance variable assignments (:ivasgn) from the AST.
        # Ignores assignments within the 'initialize' method.
        def self.collect_ivasgn(node, current_method, mutations, source_file)
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

        # Scans ruby content for `resolve(:key)` method calls.
        # Yields the key (symbol/string) and line number for each occurrence.
        # Used to verify DI wiring in controllers/services.
        def self.scan_resolves(content, &block)
          sexp = Ripper.sexp(content)
          return unless sexp

          recursive_scan_resolves(sexp, &block)
        end

        # Recursively traverses AST looking for method calls named "resolve".
        # Supports `resolve(:key)` and `resolve :key`.
        def self.recursive_scan_resolves(node, &block)
          return unless node.is_a?(Array)

          if node[0] == :method_add_arg
            # Case: resolve(:key) -> [:method_add_arg, call_node, args_node]
            call_node = node[1]
            args_node = node[2]
            
            method_name = extract_method_name(call_node)
            if method_name == "resolve"
              key = extract_symbol_from_args(args_node)
              line = extract_line_number(call_node)
              yield(key, line) if key
            end
          elsif node[0] == :command || node[0] == :command_call
             # Case: resolve :key -> [:command, name, args]
             method_name = extract_method_name(node)
             if method_name == "resolve"
                # Args are usually the last element
                args_node = node.last
                key = extract_symbol_from_args(args_node)
                line = extract_line_number(node)
                yield(key, line) if key
             end
          end

          node.each do |child|
            recursive_scan_resolves(child, &block) if child.is_a?(Array)
          end
        end

        # Extracts method name from various call node types (:fcall, :call, :command, etc.)
        def self.extract_method_name(node)
          if node[0] == :fcall || node[0] == :command
            # [:fcall, [:@ident, "resolve", ...]]
            return node[1][1]
          elsif node[0] == :call
            # [:call, receiver, :., [:@ident, "resolve", ...]]
            return node[3][1]
          elsif node[0] == :command_call
            # [:command_call, receiver, :., [:@ident, "resolve", ...], args]
            return node[3][1]
          end
          nil
        end

        # Extracts the first symbol argument from an arguments node list.
        def self.extract_symbol_from_args(node)
          found = nil
          traverse_for_symbol(node) { |s| found = s }
          found
        end

        # Traverses argument nodes to find a symbol literal.
        def self.traverse_for_symbol(node, &block)
          return unless node.is_a?(Array)
          if node[0] == :symbol_literal
             symbol_node = node[1]
             if symbol_node[0] == :symbol
               content = symbol_node[1]
               # Handle :@ident (bare symbol) or :@tstring_content (quoted symbol)
               if content[0] == :@ident || content[0] == :@tstring_content
                  yield content[1]
               end
             end
          end
          node.each { |c| traverse_for_symbol(c, &block) if c.is_a?(Array) }
        end
        
        # Extracts line number from a node or its children.
        def self.extract_line_number(node)
           line = nil
           traverse_for_line(node) { |l| line = l; break }
           line
        end
        
        # Traverses node to find the first token with line number information.
        def self.traverse_for_line(node, &block)
           return unless node.is_a?(Array)
           node.each do |child|
             # Token structure: [type, value, [line, col]]
             if child.is_a?(Array) && child.size >= 2 && child.last.is_a?(Array) && child.last.size == 2 && child.last.first.is_a?(Integer)
               yield child.last.first
             else
               traverse_for_line(child, &block)
             end
           end
        end
        
        # Returns ancestors of a class that are Rails components.
        def self.rails_ancestors_for(klass)
          rails_prefixes = %w[ActiveRecord ActionDispatch ActionController ActiveSupport Rails]
          shared = Object.ancestors
          klass.ancestors.compact.reject { |ancestor| shared.include?(ancestor) }.select do |ancestor|
            rails_prefixes.any? { |prefix| ancestor.name&.start_with?(prefix) }
          end
        end
      end

      # Verifies that a class does not inherit from any Rails classes/modules
      # (ActiveRecord, ActionController, etc.).
      matcher :have_no_rails_dependencies do
        match do |klass|
          @rails_ancestors = MatcherHelpers.rails_ancestors_for(klass)
          @rails_ancestors.empty?
        end

        failure_message do |klass|
          "expected #{klass} to avoid Rails dependencies, found #{@rails_ancestors.map(&:name).join(', ')}"
        end
      end

      # Verifies that a class inherits from a specific Rampart base class.
      matcher :inherit_from_rampart_base do |base_class|
        match do |klass|
          klass < base_class
        end

        failure_message do |klass|
          "expected #{klass} to inherit from #{base_class}, but ancestors are: #{klass.ancestors.take(5).map(&:name).join(' -> ')}"
        end
      end

      # Verifies that a class implements all abstract methods defined in a Port module.
      # Checks that the method is defined on the class itself, not just inherited/mixed in from the port.
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

      # Verifies that a class has no public setter methods (ending in `=`).
      matcher :be_immutable do
        match do |klass|
          @setter_methods = klass.instance_methods(false).grep(/=$/).reject { |name| name == :== }
          @setter_methods.empty?
        end

        failure_message do |klass|
          "expected #{klass} to be immutable, found setter methods: #{@setter_methods.join(', ')}"
        end
      end

      # Verifies that a class does not mutate instance variables outside of `initialize`.
      # Uses static analysis (Ripper) to find assignments.
      matcher :have_no_mutable_instance_variables do
        match do |klass|
          source_file = MatcherHelpers.source_file_for(klass)
          return true unless source_file

          @mutation_locations = MatcherHelpers.mutable_instance_var_locations(source_file)
          @mutation_locations.empty?
        end

        failure_message do |klass|
          "expected #{klass} to avoid instance variable mutation outside initialize, found assignments at: #{@mutation_locations.join(', ')}"
        end
      end

      # Verifies that an object instance has dependencies (instance variables) of expected types.
      # dependency_types: { ivar_name: ExpectedClass }
      matcher :have_dependencies do |dependency_types|
        match do |object|
          @mismatches = []
          dependency_types.each do |ivar_name, expected_type|
            value = object.instance_variable_get("@#{ivar_name}")
            if value.nil?
              @mismatches << "Missing dependency @#{ivar_name}"
            elsif !value.is_a?(expected_type) && !value.class.ancestors.include?(expected_type)
              @mismatches << "Dependency @#{ivar_name} is a #{value.class}, expected #{expected_type}"
            end
          end
          @mismatches.empty?
        end

        failure_message do |object|
          "expected #{object} to have correct dependencies:\n#{@mismatches.join("\n")}"
        end
      end

      # Verifies that a source file only calls `resolve(:key)` for keys in the allowed list.
      # Uses static analysis to find `resolve` calls.
      matcher :only_resolve_allowed_dependencies do |allowed_keys|
        match do |file_path|
          @violations = []
          content = File.read(file_path)
          
          MatcherHelpers.scan_resolves(content) do |key, line|
            unless allowed_keys.include?(key.to_sym)
              @violations << "Line #{line}: resolves :#{key} (not in allowed list)"
            end
          end
          @violations.empty?
        end

        failure_message do |file_path|
          "expected #{file_path} to only resolve allowed dependencies:\n#{@violations.join("\n")}\nAllowed: #{allowed_keys.sort.join(', ')}"
        end
      end
    end
  end
end
