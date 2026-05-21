# frozen_string_literal: true

module ColorPicker
  class Component < ViewComponent::Base
    FORMATS = %w[hex rgb hsl hsv].freeze
    SIZES = %w[small medium large].freeze
    DEFAULT_SWATCHES = [
      "#1a202c", "#2d3748", "#4a5568", "#718096",
      "#a0aec0", "#cbd5e0", "#e2e8f0", "#f7fafc",
      "#fed7d7", "#fc8181", "#f56565", "#e53e3e"
    ].freeze

    attr_reader :id, :name, :value, :label, :show_value, :disabled, :required, :swatches

    # @param id [String] Unique identifier for the picker
    # @param name [String] Optional hidden input name for form submissions
    # @param value [String] Initial color value
    # @param label [String] Label text
    # @param format [Symbol, String] Output format (:hex, :rgb, :hsl, :hsv)
    # @param size [Symbol, String] Picker size (:small, :medium, :large)
    # @param opacity [Boolean] Enable alpha channel
    # @param no_format_toggle [Boolean] Hide Shoelace format toggle
    # @param swatches [Array<String>, String] Custom swatches
    # @param show_value [Boolean] Show selected value text
    # @param show_swatches [Boolean] Show custom swatch buttons
    # @param disabled [Boolean] Disable picker and swatches
    # @param required [Boolean] Mark picker as required
    # @param classes [String] Additional wrapper classes
    def initialize(
      id: nil,
      name: nil,
      value: "#3b82f6",
      label: "Color",
      format: :hex,
      size: :medium,
      opacity: false,
      no_format_toggle: false,
      swatches: nil,
      show_value: true,
      show_swatches: false,
      disabled: false,
      required: false,
      classes: nil
    )
      super()
      @id = id || "color_picker_#{SecureRandom.hex(4)}"
      @name = name
      @value = value
      @label = label
      @format = normalize_format(format)
      @size = normalize_size(size)
      @opacity = opacity
      @no_format_toggle = no_format_toggle
      @swatches = normalize_swatches(swatches)
      @show_value = show_value
      @show_swatches = show_swatches
      @disabled = disabled
      @required = required
      @classes = classes
    end

    def wrapper_classes
      ["inline-flex flex-col gap-3", @classes].compact.reject(&:blank?).join(" ")
    end

    def picker_format
      @format
    end

    def picker_size
      @size
    end

    def picker_opacity?
      @opacity
    end

    def no_format_toggle?
      @no_format_toggle
    end

    def swatches_attribute
      @swatches.join("; ")
    end

    def show_swatches?
      @show_swatches && @swatches.present?
    end

    def swatch_button_classes(color)
      selected = color.to_s.casecmp?(@value.to_s)
      base = "size-8 rounded-md border border-black/15 dark:border-white/20 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 dark:focus-visible:outline-neutral-200 ring-2 ring-offset-2 dark:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      selected_classes = selected ? "ring-neutral-500 dark:ring-neutral-400" : "ring-transparent"

      "#{base} #{selected_classes}"
    end

    private

    def normalize_format(format)
      candidate = format.to_s
      FORMATS.include?(candidate) ? candidate : "hex"
    end

    def normalize_size(size)
      candidate = size.to_s
      SIZES.include?(candidate) ? candidate : "medium"
    end

    def normalize_swatches(swatches)
      values = if swatches.nil?
                 DEFAULT_SWATCHES
               elsif swatches.is_a?(String)
                 swatches.split(";")
               else
                 Array(swatches)
               end

      values.compact.map(&:to_s).map(&:strip).reject(&:blank?)
    end
  end
end
