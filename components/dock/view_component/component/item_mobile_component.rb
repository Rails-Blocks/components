# frozen_string_literal: true

module Dock
  class Component
    class ItemMobileComponent < ViewComponent::Base
      # @param url [String] Link URL for the dock item
      # @param tooltip [String] Label text displayed next to icon
      # @param icon [String] SVG icon HTML string (alternative to block content)
      # @param active [Boolean] Whether this item is currently active
      def initialize(url:, tooltip:, icon: nil, active: false)
        super()
        @url = url
        @tooltip = tooltip
        @icon = icon
        @active = active
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

      def icon_content
        @icon.present? ? @icon.html_safe : content
      end
    end
  end
end
