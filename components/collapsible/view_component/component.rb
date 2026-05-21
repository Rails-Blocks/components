# frozen_string_literal: true

module Collapsible
  class Component < ViewComponent::Base
    ICONS = %i[chevron plus_minus arrows].freeze

    # @param title [String] The collapsible header/trigger text
    # @param default_open [Boolean] Whether the collapsible starts expanded
    # @param icon [Symbol, String] Icon type: :chevron, :plus_minus, :arrows
    # @param animated [Boolean] Whether to animate the open/close transition
    # @param disabled [Boolean] Whether the collapsible is disabled
    # @param classes [String, nil] Additional CSS classes for the wrapper
    # @param trigger_classes [String, nil] Additional CSS classes for the trigger button
    # @param content_classes [String, nil] Additional CSS classes for the collapsible content area
    # @param visible_content [String, nil] Optional always-visible content shown before collapsible content
    # @param summary_content [String, nil] Backward-compatible alias for visible_content
    # @param summary_text [String, nil] Backward-compatible alias for visible_content
    def initialize(
      title:,
      default_open: false,
      icon: :chevron,
      animated: true,
      disabled: false,
      classes: nil,
      trigger_classes: nil,
      content_classes: nil,
      visible_content: nil,
      summary_content: nil,
      summary_text: nil
    )
      super()
      @title = title
      @default_open = default_open
      @icon = normalize_icon(icon)
      @animated = animated
      @disabled = disabled
      @classes = classes
      @trigger_classes = trigger_classes
      @content_classes = content_classes
      @visible_content = visible_content.presence || summary_content.presence || summary_text
    end

    private

    def normalize_icon(icon)
      normalized = icon.to_s.tr("-", "_").to_sym
      ICONS.include?(normalized) ? normalized : :chevron
    end
  end
end
