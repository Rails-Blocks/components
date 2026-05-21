# frozen_string_literal: true

module Tooltip
  class Component < ViewComponent::Base
    PLACEMENTS = %w[
      top top-start top-end
      bottom bottom-start bottom-end
      left left-start left-end
      right right-start right-end
    ].freeze
    SIZES = %i[small regular large].freeze
    ANIMATIONS = %w[fade origin none].freeze
    TRIGGERS = %w[mouseenter focus click auto].freeze

    # @param text [String] The tooltip text content (required)
    # @param placement [String] Tooltip placement: top, bottom, left, right (with -start/-end variants)
    # @param offset [Integer] Distance from trigger element in pixels
    # @param max_width [Integer] Maximum width of tooltip in pixels
    # @param delay [Integer] Delay before showing tooltip in milliseconds
    # @param size [Symbol] Text size: :small, :regular, :large
    # @param animation [String] Animation type: "fade", "origin", "fade origin", "none"
    # @param trigger [String] Trigger events: "mouseenter", "focus", "click", "auto" (space-separated)
    # @param kbd [String] Optional keyboard shortcut displayed at the end of the tooltip
    # @param mac_kbd [String] Optional Mac-specific keyboard shortcut
    # @param non_mac_kbd [String] Optional Windows/Linux keyboard shortcut
    # @param arrow [Boolean] Whether to show the arrow
    # @param classes [String] Additional CSS classes for the trigger wrapper
    # @param tag [String] HTML tag for the trigger wrapper
    def initialize(
      text:,
      placement: "top",
      offset: 8,
      max_width: 200,
      delay: 0,
      size: :regular,
      animation: "fade",
      trigger: "auto",
      kbd: nil,
      mac_kbd: nil,
      non_mac_kbd: nil,
      arrow: true,
      classes: nil,
      tag: "span"
    )
      super()
      @text = text
      @placement = validate_placement(placement)
      @offset = offset
      @max_width = max_width
      @delay = delay
      @size = SIZES.include?(size) ? size : :regular
      @animation = animation
      @trigger = trigger
      @kbd = kbd.to_s
      @mac_kbd = mac_kbd.to_s
      @non_mac_kbd = non_mac_kbd.to_s
      @arrow = arrow
      @classes = classes
      @tag = tag.to_s.presence || "span"
    end

    def controller_data
      data = {
        controller: "tooltip",
        tooltip_content: @text
      }

      # Only add non-default values to keep HTML clean
      data[:tooltip_placement_value] = @placement unless @placement == "top"
      data[:tooltip_offset_value] = @offset unless @offset == 8
      data[:tooltip_max_width_value] = @max_width unless @max_width == 200
      data[:tooltip_delay_value] = @delay unless @delay.zero?
      data[:tooltip_size_value] = @size.to_s unless @size == :regular
      data[:tooltip_animation_value] = @animation unless @animation == "fade"
      data[:tooltip_trigger_value] = @trigger unless @trigger == "auto"
      data[:tooltip_kbd_value] = @kbd if @kbd.present?
      data[:tooltip_mac_kbd_value] = @mac_kbd if @mac_kbd.present?
      data[:tooltip_non_mac_kbd_value] = @non_mac_kbd if @non_mac_kbd.present?
      data[:tooltip_arrow] = "false" unless @arrow

      { data: data }
    end

    def wrapper_classes
      [@classes].compact.reject(&:empty?).join(" ")
    end

    def wrapper_tag
      @tag
    end

    def render?
      @text.present? && content.present?
    end

    private

    def validate_placement(placement)
      placement_value = placement.to_s
      PLACEMENTS.include?(placement_value) ? placement_value : "top"
    end
  end
end
