# frozen_string_literal: true

module Clipboard
  class Component < ViewComponent::Base
    VARIANTS = %i[primary secondary outline ghost].freeze
    SIZES = %i[sm md lg].freeze
    PLACEMENTS = %w[top top-start top-end bottom bottom-start bottom-end left left-start left-end right right-start right-end].freeze

    # @param text [String] The text content to copy to clipboard
    # @param button_text [String] Text displayed on the copy button
    # @param copied_text [String] Text displayed after successful copy
    # @param success_message [String] Tooltip message shown on successful copy
    # @param error_message [String] Tooltip message shown on copy failure
    # @param show_tooltip [Boolean] Whether to show the floating tooltip
    # @param tooltip_placement [String] Position of the tooltip (top, bottom, left, right, with -start/-end variants)
    # @param tooltip_offset [Integer] Distance of tooltip from trigger in pixels
    # @param tooltip_duration [Integer] How long tooltip stays visible in milliseconds
    # @param show_icon [Boolean] Whether to show the copy/check icons
    # @param show_copied_state [Boolean] Whether to show visual feedback when copied
    # @param variant [Symbol] Button style variant: :primary, :secondary, :outline, :ghost
    # @param size [Symbol] Button size: :sm, :md, :lg
    # @param icon_only [Boolean] Whether to show only the icon without text
    # @param classes [String] Additional CSS classes for the button
    def initialize(
      text: nil,
      button_text: "Copy",
      copied_text: "Copied!",
      success_message: "Copied!",
      error_message: "Failed to copy!",
      show_tooltip: true,
      tooltip_placement: "top",
      tooltip_offset: 8,
      tooltip_duration: 2000,
      show_icon: true,
      show_copied_state: true,
      variant: :primary,
      size: :md,
      icon_only: false,
      classes: nil,
      **kwargs
    )
      super()

      # `content` is a reserved ViewComponent method name, so keep `text` as the
      # public API and support `content` only as a backward-compatible alias.
      @text = text || kwargs.delete(:content)
      raise ArgumentError, "Clipboard::Component requires `text:`" if @text.blank?
      raise ArgumentError, "Unknown keywords: #{kwargs.keys.join(', ')}" if kwargs.any?

      @button_text = button_text
      @copied_text = copied_text
      @success_message = success_message
      @error_message = error_message
      @show_tooltip = show_tooltip
      @tooltip_placement = PLACEMENTS.include?(tooltip_placement) ? tooltip_placement : "top"
      @tooltip_offset = tooltip_offset
      @tooltip_duration = tooltip_duration
      @show_icon = show_icon
      @show_copied_state = show_copied_state
      @variant = VARIANTS.include?(variant) ? variant : :primary
      @size = SIZES.include?(size) ? size : :md
      @icon_only = icon_only
      @classes = classes
    end

    def button_classes
      [
        base_classes,
        size_classes,
        variant_classes,
        @classes
      ].compact.reject(&:empty?).join(" ")
    end

    def data_attributes
      {
        controller: "clipboard",
        clipboard_text: @text,
        clipboard_success_message_value: @success_message,
        clipboard_error_message_value: @error_message,
        clipboard_show_tooltip_value: @show_tooltip.to_s,
        clipboard_tooltip_placement_value: @tooltip_placement,
        clipboard_tooltip_offset_value: @tooltip_offset,
        clipboard_tooltip_duration_value: @tooltip_duration
      }
    end

    def button_attributes
      attrs = { data: data_attributes }

      return attrs unless @icon_only

      attrs[:aria] = { label: @button_text }
      attrs[:title] = @button_text
      attrs
    end

    def icon_size_class
      case @size
      when :sm
        "size-3"
      when :lg
        "size-5"
      else
        "size-3.5 sm:size-4"
      end
    end

    private

    def base_classes
      "inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-all duration-100 ease-in-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    end

    def size_classes
      if @icon_only
        case @size
        when :sm
          "p-1.5 text-xs"
        when :lg
          "p-3 text-base"
        else
          "p-2.5 text-sm"
        end
      else
        case @size
        when :sm
          "px-2.5 py-1.5 text-xs"
        when :lg
          "px-4 py-2.5 text-base"
        else
          "px-3.5 py-2 text-sm"
        end
      end
    end

    def variant_classes
      case @variant
      when :primary
        "rounded-lg border border-neutral-400/30 bg-neutral-800 text-white shadow-xs hover:bg-neutral-700 focus-visible:outline-neutral-600 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100 dark:focus-visible:outline-neutral-200"
      when :secondary
        "rounded-lg border border-black/10 bg-white/90 text-neutral-800 shadow-xs hover:bg-neutral-50 focus-visible:outline-neutral-600 dark:border-white/10 dark:bg-neutral-700/50 dark:text-neutral-50 dark:hover:bg-neutral-700/75 dark:focus-visible:outline-neutral-200"
      when :outline
        "rounded-lg border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 focus-visible:outline-neutral-600 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700/30 dark:focus-visible:outline-neutral-200"
      when :ghost
        "rounded-lg text-neutral-800 hover:bg-neutral-100 focus-visible:outline-neutral-600 dark:text-neutral-50 dark:hover:bg-neutral-700/50 dark:focus-visible:outline-neutral-200"
      else
        "rounded-lg border border-neutral-400/30 bg-neutral-800 text-white shadow-xs hover:bg-neutral-700 focus-visible:outline-neutral-600 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100 dark:focus-visible:outline-neutral-200"
      end
    end

    def render?
      @text.present?
    end

    attr_reader :button_text, :copied_text, :show_icon, :show_copied_state, :icon_only
  end
end
