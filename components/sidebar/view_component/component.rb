# frozen_string_literal: true

module Sidebar
  class Component < ViewComponent::Base
    VARIANTS = %i[default bordered minimal].freeze
    POSITIONS = %i[left right].freeze

    renders_one :logo
    renders_one :footer
    renders_one :collapsed_footer

    renders_many :items, lambda { |label:, href: "#", icon: nil, shortcut: nil, active: false, disabled: false, badge: nil, classes: nil|
      Sidebar::Component::ItemComponent.new(
        label: label,
        href: href,
        icon: icon,
        shortcut: shortcut,
        active: active,
        disabled: disabled,
        badge: badge,
        classes: classes
      )
    }

    renders_many :sections, lambda { |title:, default_open: true, classes: nil, &block|
      Sidebar::Component::SectionComponent.new(
        title: title,
        default_open: default_open,
        classes: classes,
        &block
      )
    }

    # @param variant [Symbol] Style variant: :default, :bordered, :minimal
    # @param collapsible [Boolean] Whether sidebar can be collapsed
    # @param default_collapsed [Boolean] Default collapsed state (only applies if collapsible: true)
    # @param position [Symbol] Sidebar position: :left, :right
    # @param storage_key [String] LocalStorage key for persisting collapsed state
    # @param width [String] Width when expanded (e.g., "w-64", "w-72")
    # @param collapsed_width [String] Width when collapsed (e.g., "w-13", "w-16")
    # @param min_height_class [String] Min-height utility used by sidebar and content (e.g., "min-h-screen", "min-h-[600px]")
    # @param show_mobile_toggle [Boolean] Whether to show mobile menu button in main content
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      variant: :default,
      collapsible: true,
      default_collapsed: false,
      position: :left,
      storage_key: "sidebarOpen",
      width: "w-64",
      collapsed_width: "w-13",
      min_height_class: "min-h-screen",
      show_mobile_toggle: true,
      classes: nil
    )
      super()
      @variant = VARIANTS.include?(variant) ? variant : :default
      @collapsible = collapsible
      @default_collapsed = default_collapsed
      @position = POSITIONS.include?(position) ? position : :left
      @storage_key = storage_key
      @width = width
      @collapsed_width = collapsed_width
      @min_height_class = min_height_class
      @show_mobile_toggle = show_mobile_toggle
      @classes = classes
    end

    def wrapper_classes
      base = "flex h-full w-full flex-col relative"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def sidebar_classes
      base = "#{@collapsed_width} open:#{@width} group/sidebar relative z-20 h-full shrink-0 overflow-hidden max-md:hidden motion-safe:transition-all motion-safe:duration-300"

      variant_class = case @variant
                      when :bordered
                        "border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                      when :minimal
                        "bg-white dark:bg-neutral-950"
                      else
                        "border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                      end

      [base, variant_class].join(" ")
    end

    def mobile_panel_classes
      base = "absolute inset-y-0 w-64 shadow-xl transition-transform duration-300 ease-out"
      position_class = @position == :right ? "right-0" : "left-0"

      variant_class = case @variant
                      when :bordered
                        "bg-neutral-50 border-r border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800"
                      when :minimal
                        "bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800"
                      else
                        "bg-neutral-50 border-r border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800"
                      end

      [base, position_class, variant_class].join(" ")
    end

    def nav_classes
      base = "#{@min_height_class} relative flex h-full w-full flex-1 flex-col overflow-y-auto select-none"

      bg_class = case @variant
                 when :minimal
                   "bg-white dark:bg-neutral-950"
                 else
                   "bg-neutral-50 dark:bg-neutral-900"
                 end

      [base, bg_class].join(" ")
    end

    def header_classes
      base = "sticky top-0 z-30"

      bg_class = case @variant
                 when :minimal
                   "bg-white dark:bg-neutral-950"
                 else
                   "bg-neutral-50 dark:bg-neutral-900"
                 end

      [base, bg_class].join(" ")
    end

    def footer_classes
      base = "sticky bottom-0 z-30 p-1.5 empty:hidden sm:p-2"

      bg_class = case @variant
                 when :minimal
                   "bg-white dark:bg-neutral-950"
                 else
                   "bg-neutral-50 dark:bg-neutral-900"
                 end

      [base, bg_class].join(" ")
    end

    def collapsed_footer_classes
      "sticky bottom-0 z-30 py-1.5 empty:hidden sm:py-2"
    end

    def content_classes
      base = "h-full overflow-x-clip overflow-y-auto text-clip whitespace-nowrap"

      bg_class = case @variant
                 when :minimal
                   "bg-white dark:bg-neutral-950"
                 else
                   "bg-neutral-50 dark:bg-neutral-900"
                 end

      [@width.to_s, base, bg_class].join(" ")
    end

    def controller_data
      {
        data: {
          controller: "sidebar",
          sidebar_storage_key_value: @storage_key
        }
      }
    end

    def collapsible?
      @collapsible
    end

    def show_mobile_toggle?
      @show_mobile_toggle
    end

    attr_reader :variant, :position, :storage_key, :width, :collapsed_width, :min_height_class
  end
end
