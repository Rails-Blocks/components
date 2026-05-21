# frozen_string_literal: true

module Dock
  class Component < ViewComponent::Base
    POSITIONS = %i[bottom top].freeze
    VARIANTS = %i[default rounded pill].freeze

    renders_many :items, lambda { |url:, tooltip:, icon: nil, hotkey: nil, active: false, classes: nil, &block|
      Dock::Component::ItemComponent.new(
        url: url,
        tooltip: tooltip,
        icon: icon,
        hotkey: hotkey,
        active: active,
        position: @position,
        classes: classes,
        &block
      )
    }

    # @param position [Symbol] Dock position: :bottom, :top
    # @param variant [Symbol] Style variant: :default, :rounded, :pill
    # @param show_mobile [Boolean] Show mobile menu toggle
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(position: :bottom, variant: :default, show_mobile: true, classes: nil)
      super()
      @position = POSITIONS.include?(position) ? position : :bottom
      @variant = VARIANTS.include?(variant) ? variant : :default
      @show_mobile = show_mobile
      @classes = classes
    end

    def position_bottom?
      @position == :bottom
    end

    def wrapper_classes
      base = "flex w-fit mx-auto items-center justify-center"
      [@classes, base].compact.reject(&:empty?).join(" ")
    end

    def dock_container_classes
      base = "mx-auto hidden h-16 gap-4 bg-neutral-50 px-4 md:flex dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-600/50"
      position_class = position_bottom? ? "items-end pb-3" : "items-start pt-3"

      variant_class = case @variant
                      when :pill
                        "rounded-full"
                      when :rounded
                        "rounded-xl"
                      else
                        "rounded-2xl"
                      end

      [base, position_class, variant_class].join(" ")
    end

    def mobile_menu_classes
      "absolute right-5 bottom-17 flex items-end flex-col gap-2 hidden md:hidden"
    end

    def mobile_button_classes
      "flex h-10 w-10 items-center justify-center border border-neutral-200/50 rounded-full bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-600/50"
    end

    def controller_data
      { data: { controller: "dock" } }
    end

    def show_mobile?
      @show_mobile
    end

    def chevron_svg
      <<~SVG.html_safe
        <svg class="size-5 rotate-0 text-neutral-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><polyline points="2.75 11.5 9 5.25 15.25 11.5"></polyline></g></svg>
      SVG
    end
  end
end
