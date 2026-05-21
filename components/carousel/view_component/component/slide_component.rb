# frozen_string_literal: true

module Carousel
  class Component
    class SlideComponent < ViewComponent::Base
      SLIDE_SIZE_CLASSES = {
        full: "basis-full",
        three_quarters: "basis-full sm:basis-3/4",
        two_thirds: "basis-full sm:basis-3/4 md:basis-2/3",
        half: "basis-full sm:basis-3/4 md:basis-2/3 lg:basis-1/2",
        third: "basis-full sm:basis-1/2 md:basis-1/3",
        quarter: "basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
      }.freeze

      # @param classes [String] Additional CSS classes for the slide
      # @param slide_size [Symbol] Slide width inherited from parent
      # @param axis [String] Carousel axis inherited from parent
      def initialize(classes: nil, slide_size: :half, axis: "x")
        super()
        @classes = classes
        @slide_size = slide_size
        @axis = axis
      end

      def slide_classes
        base = "flex-shrink-0 flex-grow-0 min-w-0 relative select-none"
        size = SLIDE_SIZE_CLASSES[@slide_size] || SLIDE_SIZE_CLASSES[:half]
        spacing = @axis == "y" ? "mb-2 sm:mb-3 md:mb-4" : "mr-2 sm:mr-3 md:mr-4"
        [base, size, spacing, @classes].compact.reject(&:empty?).join(" ")
      end
    end
  end
end
