# frozen_string_literal: true

module Accordion
  class Component < ViewComponent::Base
    ICONS = %i[chevron plus_minus left_arrow].freeze
    VARIANTS = %i[default bordered floating].freeze

    renders_many :items, lambda { |title:, default_open: false, disabled: false, icon_position: :right, classes: nil|
      Accordion::Component::ItemComponent.new(
        title: title,
        default_open: default_open,
        disabled: disabled,
        icon_position: icon_position,
        icon: @icon,
        variant: @variant,
        classes: classes
      )
    }

    # @param allow_multiple [Boolean] Allow multiple accordion items to be open simultaneously
    # @param icon [Symbol] Icon type: :chevron, :plus_minus, :left_arrow
    # @param variant [Symbol] Style variant: :default, :bordered, :floating
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(allow_multiple: false, icon: :chevron, variant: :default, classes: nil)
      super()
      @allow_multiple = allow_multiple
      @icon = ICONS.include?(icon) ? icon : :chevron
      @variant = VARIANTS.include?(variant) ? variant : :default
      @classes = classes
    end

    def wrapper_classes
      base = "w-full"
      variant_class = @variant == :bordered ? "flex flex-col gap-2" : ""
      [base, variant_class, @classes].compact.reject(&:empty?).join(" ")
    end

    def controller_data
      data = { controller: "accordion" }
      data[:accordion_allow_multiple_value] = true if @allow_multiple
      { data: data }
    end
  end
end
