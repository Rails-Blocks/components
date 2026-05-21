# frozen_string_literal: true

module ScrollArea
  class Component < ViewComponent::Base
    ORIENTATIONS = %i[vertical horizontal both].freeze
    SCROLLBAR_STYLES = %i[default minimal overlay].freeze
    SCROLL_FADES = %i[none y x both].freeze

    # @param height [String] Fixed height (e.g., "h-64", "h-80", "300px")
    # @param max_height [String] Maximum height (e.g., "max-h-96", "max-h-[400px]")
    # @param width [String] Fixed width (e.g., "w-full", "w-96")
    # @param max_width [String] Maximum width (e.g., "max-w-md", "max-w-2xl")
    # @param orientation [Symbol] Scroll direction: :vertical, :horizontal, :both
    # @param scrollbar_style [Symbol] Scrollbar appearance: :default, :minimal, :overlay
    # @param scroll_fade [Symbol] Fade effect direction: :none, :y, :x, :both
    # @param hide_delay [Integer] Delay in ms before hiding scrollbars (default: 600)
    # @param rounded [String] Border radius class (e.g., "rounded-lg", "rounded-xl")
    # @param border [Boolean] Show border
    # @param background [Boolean] Add background color
    # @param padding [String] Padding class (e.g., "p-4", "px-4 py-2")
    # @param classes [String] Additional CSS classes for wrapper
    # @param viewport_classes [String] Additional CSS classes for viewport
    def initialize(
      height: nil,
      max_height: nil,
      width: nil,
      max_width: nil,
      orientation: :vertical,
      scrollbar_style: :default,
      scroll_fade: :none,
      hide_delay: 600,
      rounded: "rounded-lg",
      border: false,
      background: false,
      padding: nil,
      classes: nil,
      viewport_classes: nil
    )
      super()
      @height = height
      @max_height = max_height
      @width = width
      @max_width = max_width
      @orientation = ORIENTATIONS.include?(orientation) ? orientation : :vertical
      @scrollbar_style = SCROLLBAR_STYLES.include?(scrollbar_style) ? scrollbar_style : :default
      @scroll_fade = SCROLL_FADES.include?(scroll_fade) ? scroll_fade : :none
      @hide_delay = hide_delay
      @rounded = rounded
      @border = border
      @background = background
      @padding = padding
      @classes = classes
      @viewport_classes = viewport_classes
    end

    def wrapper_classes
      [
        "relative",
        @height,
        @max_height,
        @width,
        @max_width,
        @rounded,
        border_classes,
        background_classes,
        @classes
      ].compact.reject(&:empty?).join(" ")
    end

    def viewport_classes
      [
        "h-full",
        overflow_classes,
        "scrollbar-hide",
        scroll_fade_classes,
        viewport_padding_classes,
        @viewport_classes
      ].compact.reject(&:empty?).join(" ")
    end

    def controller_data
      data = {
        controller: "scroll-area",
        scroll_area_target: "root",
        action: "mouseenter->scroll-area#onRootMouseEnter mouseleave->scroll-area#onRootMouseLeave"
      }
      data[:scroll_area_hide_delay_value] = @hide_delay if @hide_delay != 600
      { data: data }
    end

    def viewport_data
      {
        data: {
          scroll_area_target: "viewport",
          action: "scroll->scroll-area#onViewportScroll"
        }
      }
    end

    def show_vertical_scrollbar?
      @orientation == :vertical || @orientation == :both
    end

    def show_horizontal_scrollbar?
      @orientation == :horizontal || @orientation == :both
    end

    def scrollbar_track_classes(orientation)
      base = [
        "absolute",
        "rounded-full",
        "opacity-0",
        "transition-opacity",
        "duration-150",
        "delay-300",
        "pointer-events-none",
        # Hover state
        "data-[hovering]:opacity-100",
        "data-[hovering]:duration-100",
        "data-[hovering]:delay-0",
        "data-[hovering]:pointer-events-auto",
        # Scrolling state
        "data-[scrolling]:opacity-100",
        "data-[scrolling]:duration-100",
        "data-[scrolling]:delay-0",
        "data-[scrolling]:pointer-events-auto",
        # Hidden when no overflow
        "data-[visible=false]:hidden"
      ]

      base += track_style_classes
      base += orientation == :vertical ? vertical_track_position_classes : horizontal_track_position_classes

      base.join(" ")
    end

    def thumb_classes
      [
        "relative",
        "rounded-full",
        "transition-opacity",
        "duration-100",
        thumb_color_classes
      ].join(" ")
    end

    private

    def border_classes
      return "" unless @border

      "border border-neutral-200 dark:border-neutral-700"
    end

    def background_classes
      return "" unless @background

      "bg-white dark:bg-neutral-800"
    end

    def overflow_classes
      case @orientation
      when :vertical
        "overflow-y-auto overflow-x-hidden"
      when :horizontal
        "overflow-x-auto overflow-y-hidden"
      when :both
        "overflow-auto"
      else
        "overflow-y-auto"
      end
    end

    def scroll_fade_classes
      case @scroll_fade
      when :y then "scroll-fade-y"
      when :x then "scroll-fade-x"
      when :both then "scroll-fade-both"
      else ""
      end
    end

    def viewport_padding_classes
      return "" if @padding.nil?

      # Add right padding for vertical scrollbar
      if show_vertical_scrollbar? && !@padding.include?("pr-")
        @padding.to_s
      else
        @padding
      end
    end

    def track_style_classes
      case @scrollbar_style
      when :minimal
        ["bg-transparent"]
      when :overlay
        ["bg-black/5", "backdrop-blur-sm", "dark:bg-white/10"]
      else # :default
        ["bg-black/5", "backdrop-blur-sm", "dark:bg-white/10"]
      end
    end

    def vertical_track_position_classes
      return both_orientation_vertical_track_position_classes if @orientation == :both

      [
        "right-2",
        "top-2",
        "bottom-2",
        "flex",
        "w-1.5",
        "justify-center"
      ]
    end

    def horizontal_track_position_classes
      return both_orientation_horizontal_track_position_classes if @orientation == :both

      [
        "left-2",
        "right-2",
        "bottom-2",
        "flex",
        "h-1.5",
        "items-center"
      ]
    end

    def thumb_color_classes
      case @scrollbar_style
      when :minimal
        "bg-neutral-400 dark:bg-neutral-500"
      else
        "bg-neutral-500 dark:bg-neutral-400"
      end
    end

    def both_orientation_vertical_track_position_classes
      [
        "right-2",
        "top-12",
        "bottom-4",
        "flex",
        "w-1.5",
        "justify-center"
      ]
    end

    def both_orientation_horizontal_track_position_classes
      [
        "left-2",
        "right-4",
        "bottom-2",
        "flex",
        "h-1.5",
        "items-center"
      ]
    end

    attr_reader :orientation, :scrollbar_style, :scroll_fade, :hide_delay, :rounded, :border, :background, :padding
  end
end
