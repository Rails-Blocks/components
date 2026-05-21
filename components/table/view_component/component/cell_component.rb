# frozen_string_literal: true

module Table
  class Component
    class CellComponent < ViewComponent::Base
      ALIGNS = %i[left center right].freeze

      def initialize(align: :left, primary: false, density: :default, classes: nil)
        super()
        @align = ALIGNS.include?(align) ? align : :left
        @primary = primary
        @density = density
        @classes = classes
      end

      def td_classes
        base = "text-sm"
        color = @primary ? "font-medium text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"
        align_class = alignment_class
        padding = "px-3 first:pl-6 last:pr-6"
        [@classes, base, color, align_class, padding].compact.reject(&:empty?).join(" ")
      end

      private

      def alignment_class
        case @align
        when :center then "text-center"
        when :right then "text-right"
        else ""
        end
      end

      attr_reader :align, :primary
    end
  end
end
