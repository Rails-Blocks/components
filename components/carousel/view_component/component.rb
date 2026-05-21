# frozen_string_literal: true

module Carousel
  class Component < ViewComponent::Base
    AXES = %w[x y].freeze
    SLIDE_SIZES = %i[full three_quarters two_thirds half third quarter].freeze
    HORIZONTAL_EDGE_FADE_MASK_CLASSES = "md:[--carousel-fade-size:1.25rem] md:[mask-image:linear-gradient(to_right,transparent,black_var(--carousel-fade-size),black_calc(100%-var(--carousel-fade-size)),transparent)] md:[-webkit-mask-image:linear-gradient(to_right,transparent,black_var(--carousel-fade-size),black_calc(100%-var(--carousel-fade-size)),transparent)]".freeze
    VERTICAL_EDGE_FADE_MASK_CLASSES = "md:[--carousel-fade-size-y:1.25rem] md:[mask-image:linear-gradient(to_bottom,transparent,black_var(--carousel-fade-size-y),black_calc(100%-var(--carousel-fade-size-y)),transparent)] md:[-webkit-mask-image:linear-gradient(to_bottom,transparent,black_var(--carousel-fade-size-y),black_calc(100%-var(--carousel-fade-size-y)),transparent)]".freeze

    renders_many :slides, lambda { |classes: nil, &block|
      Carousel::Component::SlideComponent.new(
        classes: classes,
        slide_size: @slide_size,
        axis: @axis,
        &block
      )
    }

    # @param loop [Boolean] Enable infinite looping
    # @param drag_free [Boolean] Enable free dragging without snap points
    # @param dots [Boolean] Show navigation dots
    # @param buttons [Boolean] Show prev/next navigation buttons
    # @param axis [String] Carousel axis: "x" (horizontal) or "y" (vertical)
    # @param thumbnails [Boolean] Enable thumbnail navigation mode
    # @param main_carousel_id [String] ID of main carousel for thumbnail sync
    # @param wheel_gestures [Boolean] Enable mouse wheel navigation
    # @param slide_size [Symbol] Default slide width: :full, :three_quarters, :two_thirds, :half, :third, :quarter
    # @param show_gradients [Boolean] Show edge fade on desktop
    # @param height [String] Fixed height for vertical carousels (e.g., "h-96")
    # @param classes [String] Additional CSS classes for the wrapper
    # @param id [String] HTML ID attribute (required for thumbnail carousel connections)
    def initialize(
      loop: false,
      drag_free: false,
      dots: true,
      buttons: true,
      axis: "x",
      thumbnails: false,
      main_carousel_id: nil,
      wheel_gestures: false,
      slide_size: :half,
      show_gradients: true,
      height: nil,
      classes: nil,
      id: nil
    )
      super()
      @loop = loop
      @drag_free = drag_free
      @dots = dots
      @buttons = buttons
      @axis = AXES.include?(axis.to_s) ? axis.to_s : "x"
      @thumbnails = thumbnails
      @main_carousel_id = main_carousel_id
      @wheel_gestures = wheel_gestures
      @slide_size = SLIDE_SIZES.include?(slide_size) ? slide_size : :half
      @show_gradients = show_gradients
      @height = height
      @classes = classes
      @id = id
    end

    def wrapper_classes
      base = "overflow-hidden w-full"
      max_width = if vertical?
                    "max-w-xs sm:max-w-md md:max-w-lg mx-auto"
                  else
                    "max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto"
                  end
      [base, max_width, @classes].compact.reject(&:empty?).join(" ")
    end

    def controller_data
      data = { controller: "carousel" }
      data[:carousel_loop_value] = @loop if @loop
      data[:carousel_drag_free_value] = @drag_free if @drag_free
      data[:carousel_dots_value] = @dots
      data[:carousel_buttons_value] = @buttons
      data[:carousel_axis_value] = @axis if @axis != "x"
      data[:carousel_thumbnails_value] = @thumbnails if @thumbnails
      data[:carousel_main_carousel_value] = @main_carousel_id if @main_carousel_id
      data[:carousel_wheel_gestures_value] = @wheel_gestures if @wheel_gestures
      { data: data }
    end

    def wrapper_attributes
      attrs = controller_data
      attrs[:id] = @id if @id
      attrs
    end

    def viewport_classes
      base = "overflow-hidden outline-hidden mx-4 sm:mx-6 md:mx-8 cursor-grab active:cursor-grabbing"
      height_class = @axis == "y" ? (@height || "h-96") : ""
      edge_fade_class = show_gradients? ? edge_fade_mask_class : ""
      [base, height_class, edge_fade_class].reject(&:empty?).join(" ")
    end

    def slides_container_classes
      if @axis == "y"
        "flex flex-col h-full"
      else
        "flex"
      end
    end

    def show_gradients?
      @show_gradients
    end

    def show_dots?
      @dots
    end

    def show_buttons?
      @buttons
    end

    def vertical?
      @axis == "y"
    end

    def prev_icon_svg
      if vertical?
        # Up arrow for vertical carousel
        '<svg xmlns="http://www.w3.org/2000/svg" class="text-neutral-700 dark:text-neutral-300 size-4" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M9.52999 4.71999C9.23699 4.42699 8.76199 4.42699 8.46899 4.71999L2.21999 10.97C1.92699 11.263 1.92699 11.738 2.21999 12.031C2.51299 12.324 2.988 12.324 3.281 12.031L9.001 6.311L14.721 12.031C14.867 12.177 15.059 12.251 15.251 12.251C15.443 12.251 15.635 12.178 15.781 12.031C16.074 11.738 16.074 11.263 15.781 10.97L9.531 4.71999H9.52999Z"></path></g></svg>'
      else
        # Left arrow for horizontal carousel
        '<svg xmlns="http://www.w3.org/2000/svg" class="text-neutral-700 dark:text-neutral-300 size-4" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M11.5 16C11.308 16 11.116 15.9271 10.97 15.7801L4.71999 9.53005C4.42699 9.23705 4.42699 8.76202 4.71999 8.46902L10.97 2.21999C11.263 1.92699 11.738 1.92699 12.031 2.21999C12.324 2.51299 12.324 2.98803 12.031 3.28103L6.311 9.001L12.031 14.721C12.324 15.014 12.324 15.489 12.031 15.782C11.885 15.928 11.693 16.002 11.501 16.002L11.5 16Z"></path></g></svg>'
      end
    end

    def next_icon_svg
      if vertical?
        # Down arrow for vertical carousel
        '<svg xmlns="http://www.w3.org/2000/svg" class="text-neutral-700 dark:text-neutral-300 size-4" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M8.99999 13.5C8.80799 13.5 8.61599 13.4271 8.46999 13.2801L2.21999 7.03005C1.92699 6.73705 1.92699 6.26202 2.21999 5.96902C2.51299 5.67602 2.98799 5.67602 3.28099 5.96902L9.00099 11.689L14.721 5.96902C15.014 5.67602 15.489 5.67602 15.782 5.96902C16.075 6.26202 16.075 6.73705 15.782 7.03005L9.53199 13.2801C9.38599 13.4261 9.19399 13.5 9.00199 13.5H8.99999Z"></path></g></svg>'
      else
        # Right arrow for horizontal carousel
        '<svg xmlns="http://www.w3.org/2000/svg" class="text-neutral-700 dark:text-neutral-300 size-4" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M13.28 8.46999L7.03 2.21999C6.737 1.92699 6.262 1.92699 5.969 2.21999C5.676 2.51299 5.676 2.98803 5.969 3.28103L11.689 9.001L5.969 14.721C5.676 15.014 5.676 15.489 5.969 15.782C6.115 15.928 6.307 16.002 6.499 16.002C6.691 16.002 6.883 15.929 7.029 15.782L13.279 9.53201C13.572 9.23901 13.572 8.76403 13.279 8.47103L13.28 8.46999Z"></path></g></svg>'
      end
    end

    private

    def edge_fade_mask_class
      if vertical?
        VERTICAL_EDGE_FADE_MASK_CLASSES
      else
        HORIZONTAL_EDGE_FADE_MASK_CLASSES
      end
    end
  end
end
