# frozen_string_literal: true

module Popover
  class Component < ViewComponent::Base
    PLACEMENTS = %w[
      top top-start top-end
      bottom bottom-start bottom-end
      left left-start left-end
      right right-start right-end
    ].freeze
    TRIGGERS = %w[hover click].freeze
    ANIMATIONS = %w[fade origin none].freeze

    renders_one :trigger
    renders_one :panel

    # @param placement [String] Popover position: "top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "left-start", "left-end", "right", "right-start", "right-end"
    # @param trigger_type [String] How to trigger the popover: "hover" (default) or "click"
    # @param interactive [Boolean] Whether the popover can be interacted with (default: false)
    # @param offset [Integer] Distance from trigger element in pixels (default: 10)
    # @param max_width [Integer] Maximum width of the popover in pixels (default: 300)
    # @param arrow [Boolean] Whether to show an arrow pointing to the trigger (default: true)
    # @param animation [String] Animation type: "fade", "origin", "fade origin", or "none" (default: "fade")
    # @param delay [Integer] Delay before showing the popover in milliseconds (default: 0)
    # @param trigger_text [String] Text for the default trigger button (default: "Open Popover")
    # @param trigger_classes [String] Additional classes for the trigger element
    # @param classes [String] Additional CSS classes for the wrapper
    # @param title [String, nil] Optional header title for the popover panel
    def initialize(
      placement: "top",
      trigger_type: "hover",
      interactive: false,
      offset: 10,
      max_width: 300,
      arrow: true,
      animation: "fade",
      delay: 0,
      trigger_text: "Open Popover",
      trigger_classes: nil,
      classes: nil,
      title: nil
    )
      super()
      @placement = PLACEMENTS.include?(placement.to_s) ? placement.to_s : "top"
      @trigger_type = TRIGGERS.include?(trigger_type.to_s) ? trigger_type.to_s : "hover"
      @interactive = interactive
      @offset = offset
      @max_width = max_width
      @arrow = arrow
      @animation = animation.to_s
      @delay = delay
      @trigger_text = trigger_text
      @trigger_classes = trigger_classes
      @classes = classes
      @title = title
    end

    def controller_data
      data = { controller: "popover" }
      data[:popover_placement_value] = @placement unless @placement == "top"
      data[:popover_trigger_value] = trigger_value unless trigger_value == "mouseenter focus"
      data[:popover_interactive_value] = true if @interactive
      data[:popover_offset_value] = @offset unless @offset == 10
      data[:popover_max_width_value] = @max_width unless @max_width == 300
      data[:popover_has_arrow_value] = false unless @arrow
      data[:popover_animation_value] = @animation unless @animation == "fade"
      data[:popover_delay_value] = @delay unless @delay.zero?
      { data: data }
    end

    def wrapper_classes
      base = "inline-block relative"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def trigger_button_classes
      base = "flex items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white/90 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-neutral-800 shadow-xs transition-all duration-100 ease-in-out select-none hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-neutral-700/50 dark:text-neutral-50 dark:hover:bg-neutral-700/75 dark:focus-visible:outline-neutral-200"
      [@trigger_classes, base].compact.reject(&:empty?).join(" ")
    end

    attr_reader :trigger_text, :title

    def panel_wrapper_classes
      return "" unless @title.present?

      "p-3 flex flex-col gap-y-3 text-neutral-500 dark:text-neutral-300 font-normal"
    end

    private

    def trigger_value
      case @trigger_type
      when "click"
        "click"
      when "hover"
        "mouseenter focus"
      else
        "mouseenter focus"
      end
    end
  end
end
