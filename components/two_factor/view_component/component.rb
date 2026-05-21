# frozen_string_literal: true

module TwoFactor
  class Component < ViewComponent::Base
    # @param length [Integer] Number of digits in the OTP code (default: 6)
    # @param name [String] Base name for inputs (will be suffixed with index)
    # @param id_prefix [String] Prefix for input IDs (auto-generated if not provided)
    # @param auto_submit [Boolean] Automatically submit form when all digits entered
    # @param autofocus [Boolean] Focus first input on mount
    # @param numeric_only [Boolean] Restrict input to digits only
    # @param separator [Boolean] Show separator between input groups
    # @param separator_position [Integer] Position after which to show separator (1-indexed)
    # @param size [Symbol] Input size: :sm, :md, :lg
    # @param disabled [Boolean] Disable all inputs
    # @param required [Boolean] Mark inputs as required
    # @param label [String] Optional label text
    # @param hint [String] Hint text below inputs
    # @param error [String] Error message to display
    # @param classes [String] Additional wrapper classes
    # @param input_classes [String] Additional input classes
    def initialize(
      length: 6,
      name: nil,
      id_prefix: nil,
      auto_submit: false,
      autofocus: true,
      numeric_only: true,
      separator: true,
      separator_position: 3,
      size: :md,
      disabled: false,
      required: true,
      label: nil,
      hint: nil,
      error: nil,
      classes: nil,
      input_classes: nil
    )
      super()
      @length = length.clamp(4, 8)
      @name = name
      @id_prefix = id_prefix || "otp_#{SecureRandom.hex(4)}"
      @auto_submit = auto_submit
      @autofocus = autofocus
      @numeric_only = numeric_only
      @separator = separator
      @separator_position = separator_position.clamp(1, @length - 1)
      @size = size
      @disabled = disabled
      @required = required
      @label = label
      @hint = hint
      @error = error
      @classes = classes
      @input_classes = input_classes
    end

    def wrapper_classes
      base = "w-full"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def inputs_wrapper_classes
      "inline-flex items-center gap-1.5"
    end

    def input_classes
      base = "block rounded-lg border text-center placeholder-neutral-500 focus:outline-neutral-800 focus:border-neutral-800 dark:focus:outline-neutral-50 dark:focus:border-neutral-50 dark:bg-neutral-800 dark:placeholder-neutral-400"
      border = @error.present? ? "border-red-500 dark:border-red-500" : "border-neutral-200 dark:border-neutral-600"
      disabled_class = @disabled ? "opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-700" : ""
      size_class = input_size_classes

      [base, border, size_class, disabled_class, @input_classes].compact.reject(&:empty?).join(" ")
    end

    def input_size_classes
      case @size
      when :sm
        "w-7 h-8 text-sm px-1.5 py-1"
      when :lg
        "w-12 h-14 text-xl px-3 py-2"
      else # :md
        "w-8 h-10 text-base px-2 py-1"
      end
    end

    def separator_classes
      case @size
      when :sm
        "text-xs text-neutral-400 dark:text-neutral-600"
      when :lg
        "text-lg text-neutral-400 dark:text-neutral-600"
      else
        "text-sm text-neutral-400 dark:text-neutral-600"
      end
    end

    def label_classes
      base = "label mb-2 text-sm block"
      color = @error.present? ? "text-red-700 dark:text-red-400" : ""
      [base, color].compact.reject(&:empty?).join(" ")
    end

    def hint_classes
      "text-xs text-neutral-500 dark:text-neutral-400 mt-2"
    end

    def error_classes
      "text-xs text-red-600 dark:text-red-400 mt-2"
    end

    def input_name(index)
      return "num#{index + 1}" unless @name

      "#{@name}[#{index}]"
    end

    def input_id(index)
      "#{@id_prefix}_#{index + 1}"
    end

    def show_separator_after?(index)
      @separator && (index + 1) == @separator_position
    end

    def autocomplete_value(index)
      index.zero? ? "one-time-code" : "off"
    end

    def input_mode
      @numeric_only ? "numeric" : "text"
    end

    attr_reader :length, :auto_submit, :autofocus, :numeric_only, :disabled, :required, :label, :hint, :error
  end
end
