# frozen_string_literal: true

module Radio
  class Component < ViewComponent::Base
    SIZES = %i[sm md lg].freeze

    # @param label [String] The radio button label text
    # @param name [String] The input name attribute for form submission (radios with same name form a group)
    # @param id [String] The input id attribute (auto-generated if not provided)
    # @param value [String] The input value attribute
    # @param checked [Boolean] Whether the radio button is selected
    # @param disabled [Boolean] Whether the radio button is disabled
    # @param required [Boolean] Whether the radio button is required
    # @param description [String] Optional description text below the label
    # @param size [Symbol] Size: :sm (small), :md (medium/default), :lg (large)
    # @param error [String] Error message to display
    # @param classes [String] Additional CSS classes for the wrapper
    # @param input_classes [String] Additional CSS classes for the input element
    # @param label_classes [String] Additional CSS classes for the label element
    def initialize(
      label:,
      name: nil,
      id: nil,
      value: nil,
      checked: false,
      disabled: false,
      required: false,
      description: nil,
      size: :md,
      error: nil,
      classes: nil,
      input_classes: nil,
      label_classes: nil
    )
      super()
      @label = label
      @name = name
      @id = id || generate_id
      @value = value
      @checked = checked
      @disabled = disabled
      @required = required
      @description = description
      @size = SIZES.include?(size) ? size : :md
      @error = error
      @classes = classes
      @input_classes = input_classes
      @label_classes = label_classes
    end

    def wrapper_classes
      base = supporting_text? ? "flex items-start gap-2.5" : "flex items-center gap-2.5"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def input_classes
      [
        base_input_classes,
        size_input_classes,
        state_classes,
        @input_classes
      ].compact.reject(&:empty?).join(" ")
    end

    def label_classes
      base = "font-medium"
      size_class = label_size_classes
      color_class = if @disabled
                      "text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                    elsif @error.present?
                      "text-red-700 dark:text-red-400"
                    else
                      "text-neutral-700 dark:text-neutral-300"
                    end

      [base, size_class, color_class, @label_classes].compact.reject(&:empty?).join(" ")
    end

    def description_classes
      size_class = case @size
                   when :sm then "text-[11px]"
                   when :lg then "text-sm"
                   else "text-xs"
                   end
      color_class = @disabled ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-500 dark:text-neutral-400"

      [size_class, color_class, "leading-normal"].join(" ")
    end

    def error_classes
      size_class = case @size
                   when :sm then "text-[11px]"
                   when :lg then "text-sm"
                   else "text-xs"
                   end

      [size_class, "text-red-600 dark:text-red-400 leading-normal"].join(" ")
    end

    def text_content_classes
      gap_class = supporting_text? ? "gap-0.5" : "gap-0"
      ["min-w-0 flex-1 flex flex-col leading-snug", gap_class].join(" ")
    end

    private

    def generate_id
      "radio_#{SecureRandom.hex(4)}"
    end

    def base_input_classes
      "rounded-full border-neutral-300 text-neutral-900 focus:ring-neutral-500 focus:ring-offset-0 " \
        "dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:ring-neutral-400 " \
        "dark:checked:bg-neutral-600 dark:checked:border-neutral-500"
    end

    def size_input_classes
      case @size
      when :sm then "size-3.5"
      when :lg then "size-5"
      else "size-4"
      end
    end

    def state_classes
      classes = []
      classes << "cursor-not-allowed opacity-50" if @disabled
      classes << "border-red-500 dark:border-red-400 focus:ring-red-500" if @error.present?
      classes << "mt-0.5" if supporting_text?
      classes.join(" ")
    end

    def supporting_text?
      @description.present? || @error.present?
    end

    def label_size_classes
      case @size
      when :sm then supporting_text? ? "text-xs leading-snug" : "text-xs leading-none"
      when :lg then supporting_text? ? "text-base leading-snug" : "text-base leading-none"
      else supporting_text? ? "text-sm leading-snug" : "text-sm leading-none"
      end
    end

    attr_reader :label, :name, :id, :value, :checked, :disabled, :required, :description, :size, :error
  end
end
