# frozen_string_literal: true

module Navbar
  class Component
    class DropdownContentComponent < ViewComponent::Base
      # @param id [String] Unique ID for this dropdown content panel
      # @param width [String] Custom width class (e.g., "w-[500px]", "sm:w-[600px]")
      # @param columns [Integer] Number of grid columns (1-4)
      # @param classes [String] Additional CSS classes
      def initialize(id:, width: nil, columns: 1, classes: nil)
        super()
        @id = id
        @width = width
        @columns = columns.to_i.clamp(1, 4)
        @classes = classes
      end

      attr_reader :id

      def wrapper_classes
        "hidden"
      end

      def content_classes
        base = "grid gap-2 p-2"
        width_class = @width || "w-[calc(100vw-2rem)] sm:w-[400px]"
        columns_class = grid_columns_class

        [base, width_class, columns_class, @classes].compact.reject(&:empty?).join(" ")
      end

      private

      def grid_columns_class
        case @columns
        when 1 then "grid-cols-1"
        when 2 then "grid-cols-1 sm:grid-cols-2"
        when 3 then "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        when 4 then "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        else "grid-cols-1"
        end
      end
    end
  end
end
