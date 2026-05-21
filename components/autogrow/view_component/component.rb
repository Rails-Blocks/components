# frozen_string_literal: true

module Autogrow
  class Component < ViewComponent::Base
    # @param placeholder [String] Placeholder text for the textarea
    # @param name [String] Name attribute for the textarea
    # @param id [String] ID attribute for the textarea
    # @param rows [Integer] Initial number of visible rows
    # @param min_height [String] Minimum height CSS value (e.g., "2.5rem", "40px")
    # @param max_height [String] Maximum height CSS value (e.g., "13rem", "208px")
    # @param value [String] Initial value for the textarea
    # @param required [Boolean] Whether the field is required
    # @param disabled [Boolean] Whether the field is disabled
    # @param resize [Boolean] Whether manual resize is allowed (false disables it)
    # @param classes [String] Additional CSS classes for the textarea
    # @param data [Hash] Additional data attributes
    def initialize(
      placeholder: nil,
      name: nil,
      id: nil,
      rows: 1,
      min_height: "2.5rem",
      max_height: "13rem",
      value: nil,
      required: false,
      disabled: false,
      resize: false,
      classes: nil,
      data: {}
    )
      super()
      @placeholder = placeholder
      @name = name
      @id = id
      @rows = rows
      @min_height = min_height
      @max_height = max_height
      @value = value
      @required = required
      @disabled = disabled
      @resize = resize
      @classes = classes
      @data = data
    end

    def textarea_classes
      base = "form-control small-scrollbar"
      resize_class = @resize ? "" : "resize-none"
      [base, resize_class, @classes].compact.reject(&:empty?).join(" ")
    end

    def textarea_style
      styles = []
      styles << "min-height: #{@min_height}" if @min_height.present?
      styles << "max-height: #{@max_height}" if @max_height.present?
      styles.join("; ")
    end

    def textarea_data
      {
        controller: "autogrow",
        action: "input->autogrow#autogrow"
      }.merge(@data)
    end

    def textarea_attributes
      attrs = {
        class: textarea_classes,
        style: textarea_style,
        data: textarea_data,
        rows: @rows
      }
      attrs[:placeholder] = @placeholder if @placeholder.present?
      attrs[:name] = @name if @name.present?
      attrs[:id] = @id if @id.present?
      attrs[:required] = true if @required
      attrs[:disabled] = true if @disabled
      attrs
    end
  end
end
