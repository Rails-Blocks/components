# frozen_string_literal: true

module Breadcrumb
  class Component < ViewComponent::Base
    SEPARATORS = %i[slash chevron].freeze
    VARIANTS = %i[default with_background with_icons].freeze

    # @param items [Array<Hash>] Array of breadcrumb items with { label:, href:, icon: (optional) }
    # @param separator [Symbol] Separator type: :slash or :chevron
    # @param variant [Symbol] Style variant: :default, :with_background, :with_icons
    # @param show_home_icon [Boolean] Show home icon on first item (only for :with_icons variant)
    # @param truncate_at [Integer, nil] Max visible items before truncation (nil = show all)
    # @param current_max_width [String, nil] Max width for current page text (e.g., "200px")
    # @param classes [String] Additional CSS classes for the nav wrapper
    def initialize(
      items:,
      separator: :slash,
      variant: :default,
      show_home_icon: true,
      truncate_at: nil,
      current_max_width: nil,
      classes: nil
    )
      super()
      @items = items || []
      @separator = SEPARATORS.include?(separator) ? separator : :slash
      @variant = VARIANTS.include?(variant) ? variant : :default
      @show_home_icon = show_home_icon
      @truncate_at = truncate_at
      @current_max_width = current_max_width
      @classes = classes
    end

    def nav_classes
      base = "flex justify-center overflow-x-auto whitespace-nowrap"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def list_classes
      base = "flex items-center text-sm"
      spacing = @variant == :with_icons ? "space-x-1" : "space-x-2"
      bg = @variant == :with_background ? "bg-neutral-50 dark:bg-neutral-800/50 px-4 py-2 rounded-lg border border-black/10 dark:border-white/10" : ""
      [base, spacing, bg].compact.reject(&:empty?).join(" ")
    end

    def link_classes
      case @variant
      when :with_background
        "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors font-medium"
      when :with_icons
        "flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
      else
        "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
      end
    end

    def current_classes
      base_weight = @variant == :with_background ? "font-semibold" : "font-medium"
      base = "text-neutral-900 dark:text-neutral-100 #{base_weight}"
      padding = @variant == :with_icons ? "p-1.5" : ""
      truncate = @current_max_width.present? ? "truncate" : ""
      [base, padding, truncate].compact.reject(&:empty?).join(" ")
    end

    def current_style
      @current_max_width.present? ? "max-width: #{@current_max_width}" : nil
    end

    def separator_classes
      "text-neutral-400 dark:text-neutral-600"
    end

    def visible_items
      return @items if @truncate_at.nil? || @items.length <= @truncate_at

      # Show first item, ellipsis, and last (truncate_at - 1) items
      first = [@items.first]
      last_items = @items.last(@truncate_at - 1)
      first + [{ ellipsis: true }] + last_items
    end

    def separator_html
      if @separator == :chevron || @variant == :with_icons || @variant == :with_background
        chevron_svg
      else
        tag.span("/", class: separator_classes)
      end
    end

    def home_icon_svg
      tag.svg(
        xmlns: "http://www.w3.org/2000/svg",
        class: "size-4 shrink-0",
        width: "18",
        height: "18",
        viewBox: "0 0 18 18"
      ) do
        tag.g(fill: "currentColor") do
          tag.path(d: "M7.94127 1.36281C8.56694 0.887445 9.4333 0.886569 10.0591 1.36312L15.3088 5.35287C15.7448 5.68398 16 6.20008 16 6.746V14.25C16 15.7692 14.7692 17 13.25 17H10.75V13.251C10.75 12.699 10.302 12.251 9.75 12.251H8.25C7.698 12.251 7.25 12.699 7.25 13.251V17H4.75C3.23079 17 2 15.7692 2 14.25V6.746C2 6.19867 2.2559 5.68346 2.69155 5.3526L7.94127 1.36281Z")
        end
      end
    end

    def chevron_svg
      tag.svg(
        xmlns: "http://www.w3.org/2000/svg",
        class: "size-4 shrink-0 #{separator_classes}",
        viewBox: "0 0 20 20",
        fill: "currentColor"
      ) do
        tag.path(
          'fill-rule': "evenodd",
          d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",
          'clip-rule': "evenodd"
        )
      end
    end

    def render_item_icon(icon_html)
      return "" unless icon_html.present?

      icon_html.html_safe
    end

    def first_item?(index)
      index.zero?
    end

    def last_item?(index)
      index == visible_items.length - 1
    end

    def show_home_icon_for_item?(item, index)
      @show_home_icon && @variant == :with_icons && first_item?(index) && !item[:ellipsis]
    end
  end
end
