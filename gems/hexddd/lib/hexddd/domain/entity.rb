require "dry-struct"

module HexDDD
  module Domain
    class Entity < Dry::Struct
      # Entities have identity and can be compared by id
      def ==(other)
        other.is_a?(self.class) && other.id == id
      end
      
      alias_method :eql?, :==
      
      def hash
        [self.class, id].hash
      end
    end
  end
end


