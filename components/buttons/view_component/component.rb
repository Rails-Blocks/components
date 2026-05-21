# frozen_string_literal: true

module Buttons
  class Component < ViewComponent::Base
    VARIANTS = %i[primary secondary outline ghost destructive].freeze
    SIZES = %i[xs sm md lg].freeze
    STYLES = %i[basic fancy].freeze

    # @param text [String] The button text content (can be nil for icon-only buttons)
    # @param variant [Symbol] Button variant: :primary, :secondary, :outline, :ghost, :destructive
    # @param size [Symbol] Size: :xs, :sm, :md (default), :lg
    # @param style [Symbol] Visual style: :basic (default), :fancy (with enhanced shadows)
    # @param pill [Boolean] Whether to use pill shape (rounded-full) instead of rounded corners
    # @param disabled [Boolean] Whether the button is disabled
    # @param loading [Boolean] Whether to show loading spinner
    # @param icon [String] Optional icon SVG HTML (placed before text by default)
    # @param icon_position [Symbol] Icon position: :left (default), :right
    # @param icon_only [Boolean] Whether this is an icon-only button (no text)
    # @param full_width [Boolean] Whether button should take full width
    # @param href [String] If provided, renders as an anchor tag instead of button
    # @param type [String] Button type attribute: "button" (default), "submit", "reset"
    # @param classes [String] Additional CSS classes for the wrapper
    # @param data [Hash] Data attributes for the button
    def initialize(
      text: nil,
      variant: :primary,
      size: :md,
      style: :basic,
      pill: false,
      disabled: false,
      loading: false,
      icon: nil,
      icon_position: :left,
      icon_only: false,
      full_width: false,
      href: nil,
      type: "button",
      classes: nil,
      data: {}
    )
      super()
      @text = text
      @variant = VARIANTS.include?(variant) ? variant : :primary
      @size = SIZES.include?(size) ? size : :md
      @style = STYLES.include?(style) ? style : :basic
      @pill = pill
      @disabled = disabled || loading
      @loading = loading
      @icon = icon
      @icon_position = icon_position
      @icon_only = icon_only
      @full_width = full_width
      @href = href
      @type = type
      @classes = classes
      @data = data
    end

    def button_classes
      [
        base_classes,
        size_classes,
        shape_classes,
        variant_classes,
        @full_width ? "w-full" : nil,
        @classes
      ].compact.reject(&:empty?).join(" ")
    end

    def tag_name
      @href.present? ? :a : :button
    end

    def tag_attributes
      attrs = {
        class: button_classes,
        data: @data
      }

      if @href.present?
        attrs[:href] = @href
        attrs[:role] = "button"
        attrs[:'aria-disabled'] = @disabled if @disabled
      else
        attrs[:type] = @type
        attrs[:disabled] = @disabled if @disabled
      end

      attrs
    end

    def icon_classes
      case @size
      when :xs then "size-3"
      when :sm then "size-3 sm:size-3.5"
      when :lg then "size-4 sm:size-5"
      else "size-3.5 sm:size-4" # md
      end
    end

    def loading_spinner
      <<~SVG.html_safe
        <svg class="animate-spin #{icon_classes}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      SVG
    end

    private

    def base_classes
      "inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-all duration-100 ease-in-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    end

    def size_classes
      if @icon_only
        case @size
        when :xs then "p-1.5 text-xs"
        when :sm then "p-2 text-xs"
        when :lg then "p-3 text-sm"
        else "p-2.5 text-xs" # md
        end
      else
        case @size
        when :xs then "px-2.5 py-1.5 text-xs"
        when :sm then "px-3 py-2 text-xs"
        when :lg then "px-4 py-2.5 text-base"
        else "px-3.5 py-2 text-sm" # md
        end
      end
    end

    def shape_classes
      @pill ? "rounded-full" : "rounded-lg"
    end

    def variant_classes
      @style == :fancy ? fancy_variant_classes : basic_variant_classes
    end

    def basic_variant_classes
      case @variant
      when :primary
        "border border-neutral-400/30 bg-neutral-800 text-white shadow-sm hover:bg-neutral-700 focus-visible:outline-neutral-600 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100 dark:focus-visible:outline-neutral-200"
      when :secondary
        "border border-black/10 bg-white/90 text-neutral-800 shadow-xs hover:bg-neutral-50 focus-visible:outline-neutral-600 dark:border-white/10 dark:bg-neutral-700/50 dark:text-neutral-50 dark:hover:bg-neutral-700/75 dark:focus-visible:outline-neutral-200"
      when :outline
        "border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-100 focus-visible:outline-neutral-600 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:outline-neutral-200"
      when :ghost
        "bg-transparent text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-neutral-600 dark:text-neutral-50 dark:hover:bg-neutral-600/50 dark:hover:text-white dark:focus-visible:outline-neutral-200"
      when :destructive
        "border border-red-300/30 bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:outline-neutral-600 dark:focus-visible:outline-neutral-200"
      else
        basic_variant_classes_for(:primary)
      end
    end

    def fancy_variant_classes
      case @variant
      when :primary
        "relative bg-neutral-900 text-white shadow-[0_4px_12px_0_rgb(from_theme(colors.neutral.900)_r_g_b_/_0.15),0_2px_4px_0_rgb(from_theme(colors.neutral.950)_r_g_b_/_0.2),0_0_0_1px_theme(colors.neutral.900),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.15),inset_0_0_0_1px_rgb(from_theme(colors.white)_r_g_b_/_0.03)] transition-all duration-200 ease-out before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/25 before:via-white/5 before:to-transparent before:p-px before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] hover:bg-neutral-800 hover:shadow-[0_4px_12px_0_rgb(from_theme(colors.neutral.900)_r_g_b_/_0.15),0_2px_4px_0_rgb(from_theme(colors.neutral.950)_r_g_b_/_0.2),0_0_0_1px_theme(colors.neutral.900),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.25),inset_0_0_0_1px_rgb(from_theme(colors.white)_r_g_b_/_0.03)] focus-visible:outline-neutral-600 dark:bg-neutral-100 dark:text-neutral-900 dark:shadow-[0_4px_12px_0_rgb(from_theme(colors.neutral.900)_r_g_b_/_0.15),0_2px_4px_0_rgb(from_theme(colors.black)_r_g_b_/_0.08),0_0_0_1px_theme(colors.neutral.200),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.8)] dark:before:from-white/20 dark:hover:bg-white dark:hover:shadow-[0_4px_12px_0_rgb(from_theme(colors.black)_r_g_b_/_0.2),0_2px_4px_0_rgb(from_theme(colors.black)_r_g_b_/_0.1),0_0_0_1px_theme(colors.white),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.9)] dark:focus-visible:outline-neutral-200"
      when :secondary
        "relative bg-white text-neutral-800 shadow-[0_4px_12px_0_rgb(from_theme(colors.neutral.900)_r_g_b_/_0.08),0_2px_4px_0_rgb(from_theme(colors.black)_r_g_b_/_0.06),0_0_0_1px_rgb(from_theme(colors.black)_r_g_b_/_0.1),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.8),inset_0_0_0_1px_rgb(from_theme(colors.white)_r_g_b_/_0.03)] transition-all duration-200 ease-out before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/15 before:to-white/5 before:p-px before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] hover:bg-neutral-50 hover:shadow-[0_4px_12px_0_rgb(from_theme(colors.neutral.900)_r_g_b_/_0.08),0_2px_4px_0_rgb(from_theme(colors.black)_r_g_b_/_0.08),0_0_0_1px_rgb(from_theme(colors.black)_r_g_b_/_0.12),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.9),inset_0_0_0_1px_rgb(from_theme(colors.white)_r_g_b_/_0.03)] focus-visible:outline-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:shadow-[0_4px_12px_0_rgb(from_theme(colors.black)_r_g_b_/_0.25),0_2px_4px_0_rgb(from_theme(colors.black)_r_g_b_/_0.3),0_0_0_1px_theme(colors.neutral.950),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.17),inset_0_0_0_1px_rgb(from_theme(colors.white)_r_g_b_/_0.01)] dark:before:from-white/10 dark:before:to-white/5 dark:hover:bg-neutral-900 dark:hover:shadow-[0_4px_12px_0_rgb(from_theme(colors.black)_r_g_b_/_0.45),0_2px_4px_0_rgb(from_theme(colors.black)_r_g_b_/_0.3),0_0_0_1px_theme(colors.neutral.950),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.20),inset_0_0_0_1px_rgb(from_theme(colors.white)_r_g_b_/_0.02)] dark:focus-visible:outline-neutral-200"
      when :destructive
        "relative bg-red-600 text-white shadow-[0_4px_12px_0_rgb(from_theme(colors.neutral.900)_r_g_b_/_0.15),0_2px_4px_0_rgb(from_theme(colors.zinc.950)_r_g_b_/_0.2),0_0_0_1px_theme(colors.red.600),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.25),inset_0_0_0_1px_rgb(from_theme(colors.white)_r_g_b_/_0.03)] transition-all duration-200 ease-out before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/25 before:via-white/5 before:to-transparent before:p-px before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] hover:bg-red-500 hover:shadow-[0_4px_12px_0_rgb(from_theme(colors.neutral.900)_r_g_b_/_0.15),0_2px_4px_0_rgb(from_theme(colors.zinc.950)_r_g_b_/_0.2),0_0_0_1px_theme(colors.red.600),inset_0_1px_0_0_rgb(from_theme(colors.white)_r_g_b_/_0.25),inset_0_0_0_1px_rgb(from_theme(colors.white)_r_g_b_/_0.03)] focus-visible:outline-neutral-600 dark:before:from-white/20 dark:focus-visible:outline-neutral-200"
      else
        # For outline and ghost, use basic styles even in fancy mode
        basic_variant_classes
      end
    end

    attr_reader :text, :icon, :icon_position, :icon_only, :loading, :disabled
  end
end
