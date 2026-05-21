# frozen_string_literal: true

module Lightbox
  class Component < ViewComponent::Base
    renders_many :items, lambda { |src:, thumbnail_src: nil, width: nil, height: nil, alt: nil, caption: nil, classes: nil|
      Lightbox::Component::ItemComponent.new(
        src: src,
        thumbnail_src: thumbnail_src,
        width: width,
        height: height,
        alt: alt,
        caption: caption,
        variant: @variant,
        classes: classes
      )
    }

    # @param variant [Symbol] Gallery layout: :grid, :masonry, :inline, :single
    # @param columns [Integer] Number of columns for grid/masonry layouts (2-6)
    # @param gap [Symbol] Gap size between items: :sm, :md, :lg
    # @param show_download_button [Boolean] Show download button in lightbox (default: true)
    # @param show_zoom_indicator [Boolean] Show zoom level indicator (default: true)
    # @param show_dots_indicator [Boolean] Show dots navigation for galleries (default: true)
    # @param rounded [Boolean] Apply rounded corners to thumbnails (default: true)
    # @param hover_effect [Boolean] Apply hover scale effect (default: true)
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      variant: :grid,
      columns: 4,
      gap: :md,
      show_download_button: true,
      show_zoom_indicator: true,
      show_dots_indicator: true,
      rounded: true,
      hover_effect: true,
      classes: nil
    )
      super()
      @variant = variant
      @columns = columns.clamp(2, 6)
      @gap = gap
      @show_download_button = show_download_button
      @show_zoom_indicator = show_zoom_indicator
      @show_dots_indicator = show_dots_indicator
      @rounded = rounded
      @hover_effect = hover_effect
      @classes = classes
    end

    def single_image?
      @variant == :single
    end

    def controller_data
      data = { controller: "lightbox" }
      data[:lightbox_target] = "gallery" unless single_image?
      data[:lightbox_show_download_button_value] = false unless @show_download_button
      data[:lightbox_show_zoom_indicator_value] = false unless @show_zoom_indicator
      data[:lightbox_show_dots_indicator_value] = false unless @show_dots_indicator
      { data: data }
    end

    def wrapper_classes
      base = case @variant
             when :masonry
               masonry_classes
             when :inline
               inline_classes
             when :single
               "inline-block"
             else # :grid
               grid_classes
             end
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def grid_classes
      gap_class = gap_classes
      "grid grid-cols-2 md:grid-cols-#{[@columns - 1, 2].max} lg:grid-cols-#{@columns} #{gap_class}"
    end

    def masonry_classes
      gap_class = gap_classes
      "columns-1 sm:columns-2 lg:columns-#{[@columns - 1, 2].max} xl:columns-#{@columns} #{gap_class} space-y-#{gap_value}"
    end

    def inline_classes
      gap_class = gap_classes
      "flex flex-wrap #{gap_class}"
    end

    def gap_classes
      case @gap
      when :sm
        "gap-2"
      when :lg
        "gap-6"
      else
        "gap-4"
      end
    end

    def gap_value
      case @gap
      when :sm
        "2"
      when :lg
        "6"
      else
        "4"
      end
    end

    attr_reader :variant, :rounded, :hover_effect
  end
end
