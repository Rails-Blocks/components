# frozen_string_literal: true

module Kbd
  class Component < ViewComponent::Base
    SIZES = %i[xs sm md lg].freeze
    VARIANTS = %i[default light dark outline].freeze

    # @param key [String, Array<String>] The key(s) to display. Can be a single key or array for combinations.
    # @param size [Symbol] Size modifier: :xs (extra small), :sm (small), :md (regular/default), :lg (large)
    # @param variant [Symbol] Color modifier: :default, :light, :dark, :outline
    # @param separator [String] The separator for key combinations (default: "+")
    # @param show_separator [Boolean] Whether to visually show the separator (default: true)
    # @param os_aware [Boolean] Whether to adapt for Mac/Windows display (uses os-detect controller)
    # @param mac_key [String] Key to show on Mac (e.g., "⌘") - only used with os_aware
    # @param non_mac_key [String] Key to show on non-Mac (e.g., "Ctrl") - only used with os_aware
    # @param classes [String] Additional CSS classes
    def initialize(
      key: nil,
      size: :md,
      variant: :default,
      separator: "+",
      show_separator: true,
      os_aware: false,
      mac_key: nil,
      non_mac_key: nil,
      classes: nil
    )
      super()
      @key = key
      @size = SIZES.include?(size) ? size : :md
      @variant = VARIANTS.include?(variant) ? variant : :default
      @separator = separator
      @show_separator = show_separator
      @os_aware = os_aware
      @mac_key = mac_key
      @non_mac_key = non_mac_key
      @classes = classes
    end

    def keys
      @keys ||= case @key
                when Array
                  @key.map(&:to_s)
                when String
                  @key.include?(@separator) ? @key.split(@separator).map(&:strip) : [@key]
                else
                  []
                end
    end

    def single_key?
      keys.length == 1 && !@os_aware
    end

    def kbd_classes
      [
        size_classes,
        variant_classes,
        @classes
      ].compact.reject(&:empty?).join(" ").presence
    end

    def hidden_kbd_classes
      ["hidden", kbd_classes].compact.join(" ")
    end

    def wrapper_classes
      "inline-flex items-center gap-1"
    end

    def separator_classes
      case @size
      when :xs
        "text-[10px] text-neutral-400 dark:text-neutral-500"
      when :sm
        "text-xs text-neutral-400 dark:text-neutral-500"
      when :lg
        "text-base text-neutral-400 dark:text-neutral-500"
      else # :md
        "text-sm text-neutral-400 dark:text-neutral-500"
      end
    end

    private

    def size_classes
      case @size
      when :xs
        "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px]"
      when :sm
        "inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs"
      when :md
        nil
      when :lg
        "inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 text-base"
      end
    end

    def variant_classes
      case @variant
      when :default
        nil
      when :light
        "bg-white dark:bg-neutral-800 dark:text-neutral-300"
      when :dark
        "bg-neutral-800 text-neutral-100 dark:bg-neutral-900"
      when :outline
        "bg-transparent text-neutral-600 dark:text-neutral-400"
      end
    end

    def render?
      @key.present? || @os_aware
    end

    attr_reader :key, :size, :variant, :separator, :show_separator, :os_aware, :mac_key, :non_mac_key
  end
end
