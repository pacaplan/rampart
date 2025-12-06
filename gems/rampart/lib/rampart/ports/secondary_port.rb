module Rampart
  module Ports
    class SecondaryPort
      def self.abstract_method(*names)
        names.each do |name|
          define_method(name) { |*| raise NotImplementedError, "#{self.class}##{name}" }
        end
      end
    end
  end
end


