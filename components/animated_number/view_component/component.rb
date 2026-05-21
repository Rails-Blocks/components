# frozen_string_literal: true

module AnimatedNumber
  class Component < ViewComponent::Base
    TRIGGERS = %w[viewport load manual].freeze
    EASINGS = %w[linear ease ease-in ease-out ease-in-out].freeze

    # @param end_value [Numeric] The ending value for the animation (required)
    # @param start_value [Numeric] The starting value for the animation
    # @param duration [Integer] Animation duration in milliseconds
    # @param trigger [String] When to trigger: "viewport", "load", or "manual"
    # @param prefix [String] Text to display before the number
    # @param suffix [String] Text to display after the number
    # @param format_options [Hash] Intl.NumberFormat options (style, currency, notation, etc.)
    # @param trend [Integer] Direction trend for continuous animation (-1, 0, 1)
    # @param realtime [Boolean] Use real-time ticking instead of smooth animation
    # @param update_interval [Integer] Interval in ms for realtime updates
    # @param continuous [Boolean] Enable continuous plugin for smooth transitions
    # @param spin_easing [String] Easing function for digit spin animations
    # @param transform_easing [String] Easing function for layout transforms
    # @param opacity_easing [String] Easing function for fade effects
    # @param classes [String] Additional CSS classes for the wrapper span
    def initialize(
      end_value:,
      start_value: 0,
      duration: 700,
      trigger: "viewport",
      prefix: nil,
      suffix: nil,
      format_options: nil,
      trend: nil,
      realtime: false,
      update_interval: 1000,
      continuous: true,
      spin_easing: nil,
      transform_easing: nil,
      opacity_easing: nil,
      classes: nil
    )
      super()
      @end_value = end_value
      @start_value = start_value
      @duration = duration
      @trigger = TRIGGERS.include?(trigger.to_s) ? trigger.to_s : "viewport"
      @prefix = prefix
      @suffix = suffix
      @format_options = format_options
      @trend = trend
      @realtime = realtime
      @update_interval = update_interval
      @continuous = continuous
      @spin_easing = spin_easing
      @transform_easing = transform_easing
      @opacity_easing = opacity_easing
      @classes = classes
    end

    def data_attributes
      attrs = {
        controller: "animated-number",
        'animated-number-start-value': @start_value,
        'animated-number-end-value': @end_value,
        'animated-number-duration-value': @duration,
        'animated-number-trigger-value': @trigger
      }

      attrs["animated-number-prefix-value"] = @prefix if @prefix.present?
      attrs["animated-number-suffix-value"] = @suffix if @suffix.present?
      attrs["animated-number-format-options-value"] = @format_options.to_json if @format_options.present?
      attrs["animated-number-trend-value"] = @trend if @trend.present?
      attrs["animated-number-realtime-value"] = @realtime if @realtime
      attrs["animated-number-update-interval-value"] = @update_interval if @realtime && @update_interval != 1000
      attrs["animated-number-continuous-value"] = @continuous unless @continuous
      attrs["animated-number-spin-easing-value"] = @spin_easing if @spin_easing.present?
      attrs["animated-number-transform-easing-value"] = @transform_easing if @transform_easing.present?
      attrs["animated-number-opacity-easing-value"] = @opacity_easing if @opacity_easing.present?

      attrs
    end

    def wrapper_classes
      @classes
    end
  end
end
