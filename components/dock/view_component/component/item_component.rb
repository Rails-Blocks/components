# frozen_string_literal: true

module Dock
  class Component
    class ItemComponent < ViewComponent::Base
      attr_reader :url, :tooltip, :hotkey, :active

      # @param url [String] Link URL for the dock item
      # @param tooltip [String] Tooltip text displayed on hover
      # @param icon [String] SVG icon HTML string (alternative to block content)
      # @param hotkey [String] Optional keyboard shortcut key
      # @param active [Boolean] Whether this item is currently active
      # @param position [Symbol] Inherited dock position for tooltip placement
      # @param classes [String] Additional CSS classes
      def initialize(url:, tooltip:, icon: nil, hotkey: nil, active: false, position: :bottom, classes: nil)
        super()
        @url = url
        @tooltip = tooltip
        @icon = icon
        @hotkey = hotkey
        @active = active
        @position = position
        @classes = classes
      end

      def tooltip_placement
        @position == :bottom ? "top" : "bottom"
      end

      def icon_box_classes
        base = "size-10 relative flex aspect-square items-center justify-center rounded-full border border-neutral-200/50 dark:border-neutral-600/50"
        state_class = if @active
                        "text-neutral-50 dark:text-neutral-800 bg-neutral-800 dark:bg-neutral-100 active:bg-neutral-700 dark:active:bg-neutral-200"
                      else
                        "text-neutral-500 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700"
                      end
        [@classes, base, state_class].compact.reject(&:empty?).join(" ")
      end

      def mobile_item_classes
        base = "opacity-0 px-3 no-underline gap-2 w-fit size-10 flex items-center justify-center rounded-full border border-neutral-200/50 dark:border-neutral-600/50"
        state_class = if @active
                        "text-neutral-50 dark:text-neutral-800 hover:text-neutral-50 dark:hover:text-neutral-800 bg-neutral-800 dark:bg-neutral-100 active:bg-neutral-700 dark:active:bg-neutral-200"
                      else
                        "text-neutral-500 dark:text-neutral-300 hover:text-neutral-500 dark:hover:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700"
                      end
        [base, state_class].join(" ")
      end

      def data_attributes
        attrs = {
          'dock-target': "icon",
          tooltip: @tooltip,
          'tooltip-placement': tooltip_placement
        }
        attrs["tooltip-hotkey"] = @hotkey if @hotkey.present?
        attrs
      end

      def hotkey_data_attributes
        return {} unless @hotkey.present?

        {
          controller: "hotkey",
          action: "keydown.#{@hotkey}@document->hotkey#click"
        }
      end

      def icon_content
        @icon.present? ? @icon.html_safe : content
      end

      def icon?
        @icon.present? || content.present?
      end

      def render_mobile
        render(Dock::Component::ItemMobileComponent.new(
                 url: @url,
                 tooltip: @tooltip,
                 icon: @icon,
                 active: @active
               )) { content }
      end
    end
  end
end
