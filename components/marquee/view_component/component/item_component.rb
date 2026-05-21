# frozen_string_literal: true

module Marquee
  class Component
    class ItemComponent < ViewComponent::Base
      # @param classes [String] Additional CSS classes for the item
      # @param gap [String] Gap class inherited from parent (not used directly, for consistency)
      def initialize(classes: nil, gap: "gap-8")
        super()
        @classes = classes
        @gap = gap
      end

      def item_classes
        base = "flex items-center shrink-0"
        [base, @classes].compact.reject(&:empty?).join(" ")
      end
    end
  end
end
