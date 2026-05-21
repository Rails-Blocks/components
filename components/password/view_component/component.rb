# frozen_string_literal: true

module Password
  class Component < ViewComponent::Base
    # @param label [String] The password field label text
    # @param name [String] The input name attribute for form submission
    # @param id [String] The input id attribute (auto-generated if not provided)
    # @param placeholder [String] Placeholder text for the input
    # @param value [String] The initial value (rarely used for security)
    # @param required [Boolean] Whether the input is required
    # @param disabled [Boolean] Whether the input is disabled
    # @param autocomplete [String] Autocomplete attribute value
    # @param show_toggle [Boolean] Show password visibility toggle button
    # @param show_strength [Boolean] Show password strength meter
    # @param show_requirements [Boolean] Show password requirements checklist
    # @param error [String] Error message to display
    # @param hint [String] Hint text below the input
    # @param classes [String] Additional CSS classes for the wrapper
    # @param input_classes [String] Additional CSS classes for the input element
    # @param label_classes [String] Additional CSS classes for the label element
    def initialize(
      label: "Password",
      name: nil,
      id: nil,
      placeholder: nil,
      value: nil,
      required: false,
      disabled: false,
      autocomplete: "current-password",
      show_toggle: true,
      show_strength: false,
      show_requirements: false,
      error: nil,
      hint: nil,
      classes: nil,
      input_classes: nil,
      label_classes: nil
    )
      super()
      @label = label
      @name = name
      @id = id || generate_id
      @placeholder = placeholder
      @value = value
      @required = required
      @disabled = disabled
      @autocomplete = autocomplete
      @show_toggle = show_toggle
      @show_strength = show_strength
      @show_requirements = show_requirements
      @error = error
      @hint = hint
      @classes = classes
      @input_classes = input_classes
      @label_classes = label_classes
    end

    def wrapper_classes
      base = "w-full"
      [base, @classes].compact.reject(&:empty?).join(" ")
    end

    def controller_wrapper_classes
      "relative"
    end

    def input_classes
      base = "form-control"
      padding = @show_toggle ? "!pr-12" : ""
      error_class = @error.present? ? "input-error" : ""
      disabled_class = @disabled ? "opacity-50 cursor-not-allowed" : ""

      [base, padding, error_class, disabled_class, @input_classes].compact.reject(&:empty?).join(" ")
    end

    def label_classes
      base = "label mb-1.5 text-sm"
      color_class = @error.present? ? "text-red-700 dark:text-red-400" : ""

      [base, color_class, @label_classes].compact.reject(&:empty?).join(" ")
    end

    def error_classes
      "text-xs text-red-600 dark:text-red-400 mt-1"
    end

    def hint_classes
      "text-xs text-neutral-500 dark:text-neutral-400 mt-1"
    end

    def controller_data_attributes
      attrs = {}
      attrs["password-strength-value"] = "true" if @show_strength
      attrs["password-requirements-value"] = "true" if @show_requirements
      attrs
    end

    def needs_handle_input?
      @show_strength || @show_requirements
    end

    private

    def generate_id
      "password_#{SecureRandom.hex(4)}"
    end

    attr_reader :label, :name, :id, :placeholder, :value, :required, :disabled,
                :autocomplete, :show_toggle, :show_strength, :show_requirements,
                :error, :hint
  end
end
