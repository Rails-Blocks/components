# frozen_string_literal: true

module Skeleton
  class Component < ViewComponent::Base
    VARIANTS = %i[text circle rectangle image button input].freeze
    ROUNDED_OPTIONS = %i[none sm md lg xl 2xl full].freeze

    # @param variant [Symbol] Shape variant: :text, :circle, :rectangle, :image, :button, :input
    # @param width [String] Width classes (e.g., "w-full", "w-1/2", "w-32") or custom value
    # @param height [String] Height classes (e.g., "h-4", "h-10", "h-48") or custom value
    # @param rounded [Symbol] Border radius: :none, :sm, :md, :lg, :xl, :"2xl", :full
    # @param animated [Boolean] Whether to show pulse animation (default: true)
    # @param count [Integer] Number of skeleton elements to render (default: 1)
    # @param classes [String] Additional CSS classes
    def initialize(
      variant: :text,
      width: nil,
      height: nil,
      rounded: nil,
      animated: true,
      count: 1,
      classes: nil
    )
      super()
      @variant = VARIANTS.include?(variant) ? variant : :text
      @width = width
      @height = height
      @rounded = rounded
      @animated = animated
      @count = [count.to_i, 1].max
      @classes = classes
    end

    def skeleton_classes
      [
        base_classes,
        animation_classes,
        dimension_classes,
        rounded_classes,
        @classes
      ].compact.reject(&:empty?).join(" ")
    end

    def render_multiple?
      @count > 1
    end

    attr_reader :count

    private

    def base_classes
      "bg-neutral-200 dark:bg-neutral-700"
    end

    def animation_classes
      @animated ? "animate-pulse" : ""
    end

    def dimension_classes
      width_class = @width || default_width
      height_class = @height || default_height
      "#{width_class} #{height_class}".strip
    end

    def default_width
      case @variant
      when :circle then "w-10"
      when :text then "w-full"
      when :rectangle then "w-full"
      when :image then "w-full"
      when :button then "w-24"
      when :input then "w-full"
      else "w-full"
      end
    end

    def default_height
      case @variant
      when :circle then "h-10"
      when :text then "h-4"
      when :rectangle then "h-20"
      when :image then "h-48"
      when :button then "h-10"
      when :input then "h-10"
      else "h-4"
      end
    end

    def rounded_classes
      radius = @rounded || default_rounded
      case radius.to_sym
      when :none then "rounded-none"
      when :sm then "rounded-sm"
      when :md then "rounded-md"
      when :lg then "rounded-lg"
      when :xl then "rounded-xl"
      when :'2xl' then "rounded-2xl"
      when :full then "rounded-full"
      else "rounded"
      end
    end

    def default_rounded
      case @variant
      when :circle then :full
      when :text then :md
      when :rectangle then :lg
      when :image then :lg
      when :button then :md
      when :input then :md
      else :md
      end
    end
  end
end
