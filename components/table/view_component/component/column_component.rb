# frozen_string_literal: true

module Table
  class Component
    class ColumnComponent < ViewComponent::Base
      ALIGNS = %i[left center right].freeze

      def initialize(label:, align: :left, classes: nil)
        super()
        @label = label
        @align = ALIGNS.include?(align) ? align : :left
        @classes = classes
      end

      def th_classes
        base = "text-sm font-semibold text-neutral-900 dark:text-neutral-50"
        align_class = alignment_class
        padding = "px-3 first:pl-6 last:pr-6"
        [@classes, base, align_class, padding].compact.reject(&:empty?).join(" ")
      end

      attr_reader :label, :align

      private

      def alignment_class
        case @align
        when :center then "text-center"
        when :right then "text-right"
        else "text-left"
        end
      end
    end
  end
end
