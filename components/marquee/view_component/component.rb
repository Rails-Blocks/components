# frozen_string_literal: true

module Marquee
  class Component < ViewComponent::Base
    DIRECTIONS = %w[left right up down].freeze
    FADE_MASK_CLASSES = "[--marquee-fade-size:1.25rem] [mask-image:linear-gradient(to_right,transparent,black_var(--marquee-fade-size),black_calc(100%-var(--marquee-fade-size)),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_var(--marquee-fade-size),black_calc(100%-var(--marquee-fade-size)),transparent)]".freeze

    renders_many :items, lambda { |classes: nil, &block|
      Marquee::Component::ItemComponent.new(
        classes: classes,
        gap: @gap,
        &block
      )
    }

    # @param speed [Integer] Animation duration in seconds (lower = faster)
    # @param hover_speed [Integer] Speed on hover (0 to pause completely)
    # @param direction [String] Scroll direction: "left", "right", "up", or "down"
    # @param clones [Integer] Number of content clones for seamless loop
    # @param gap [String] Gap between items (Tailwind class, e.g., "gap-8")
    # @param pause_on_hover [Boolean] Whether to pause/slow on hover
    # @param show_fade [Boolean] Show edge fade mask on the wrapper
    # @param show_gradients [Boolean, nil] Deprecated alias for show_fade
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      speed: 20,
      hover_speed: 0,
      direction: "left",
      clones: 2,
      gap: "gap-8",
      pause_on_hover: true,
      show_fade: true,
      show_gradients: nil,
      classes: nil
    )
      super()
      @speed = speed
      @hover_speed = hover_speed
      @direction = DIRECTIONS.include?(direction.to_s) ? direction.to_s : "left"
      @clones = clones
      @gap = gap
      @pause_on_hover = pause_on_hover
      @show_fade = show_gradients.nil? ? show_fade : show_gradients
      @classes = classes
    end

    def wrapper_classes
      base = "relative overflow-hidden w-full"
      mask = @show_fade ? FADE_MASK_CLASSES : nil
      [base, mask, @classes].compact.reject(&:empty?).join(" ")
    end

    def controller_data
      data = { controller: "marquee" }
      data[:marquee_speed_value] = @speed
      data[:marquee_hover_speed_value] = @hover_speed
      data[:marquee_direction_value] = @direction if @direction != "left"
      data[:marquee_clones_value] = @clones if @clones != 2

      if @pause_on_hover
        data[:action] = "mouseenter->marquee#pauseAnimation mouseleave->marquee#resumeAnimation"
      end

      { data: data }
    end

    def list_classes
      base = if %w[up down].include?(@direction)
               "flex w-full shrink-0 flex-col items-stretch"
             else
               "flex w-full shrink-0 flex-nowrap items-center justify-around"
             end
      [base, @gap].compact.reject(&:empty?).join(" ")
    end

  end
end
