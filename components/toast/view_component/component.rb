# frozen_string_literal: true

module Toast
  class Component < ViewComponent::Base
    TYPES = %i[default success error info warning danger loading].freeze
    POSITIONS = %w[top-left top-center top-right bottom-left bottom-center bottom-right].freeze
    LAYOUTS = %w[default expanded].freeze

    # @param position [String] Toast container position: "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"
    # @param layout [String] Layout mode: "default" (stacked) or "expanded" (all visible)
    # @param auto_dismiss_duration [Integer] Duration in milliseconds before auto-dismiss (default: 4000)
    # @param limit [Integer] Maximum number of visible toasts (default: 3)
    # @param gap [Integer] Gap between toasts in expanded mode (default: 14)
    # @param classes [String] Additional CSS classes for the container
    def initialize(
      position: "top-center",
      layout: "default",
      auto_dismiss_duration: 4000,
      limit: 3,
      gap: 14,
      classes: nil
    )
      super()
      @position = POSITIONS.include?(position) ? position : "top-center"
      @layout = LAYOUTS.include?(layout) ? layout : "default"
      @auto_dismiss_duration = auto_dismiss_duration
      @limit = limit
      @gap = gap
      @classes = classes
    end

    def container_classes
      base = "fixed z-[99999] w-full px-4 sm:px-0 sm:w-auto pointer-events-none transition-all duration-300 ease-in-out"
      [base, position_classes, @classes].compact.reject(&:empty?).join(" ")
    end

    def data_attributes
      {
        controller: "toast",
        toast_position_value: @position,
        toast_layout_value: @layout,
        toast_auto_dismiss_duration_value: @auto_dismiss_duration,
        toast_limit_value: @limit,
        toast_gap_value: @gap,
        action: "mouseenter->toast#handleMouseEnter mouseleave->toast#handleMouseLeave"
      }
    end

    private

    def position_classes
      case @position
      when "top-right"
        "right-0 top-0 mt-4 mr-4 sm:mt-6 sm:mr-6"
      when "top-left"
        "left-0 top-0 mt-4 ml-4 sm:mt-6 sm:ml-6"
      when "top-center"
        "left-1/2 -translate-x-1/2 top-0 mt-4 sm:mt-6"
      when "bottom-right"
        "right-0 bottom-0 mb-4 mr-4 sm:mr-6 sm:mb-6"
      when "bottom-left"
        "left-0 bottom-0 mb-4 ml-4 sm:ml-6 sm:mb-6"
      when "bottom-center"
        "left-1/2 -translate-x-1/2 bottom-0 mb-4 sm:mb-6"
      else
        "left-1/2 -translate-x-1/2 top-0 mt-4 sm:mt-6"
      end
    end
  end
end
