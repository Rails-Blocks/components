# frozen_string_literal: true

module Sidebar
  class Component
    class ItemComponent < ViewComponent::Base
      # @param label [String] The display text for the nav item
      # @param href [String] The link URL
      # @param icon [String] SVG icon HTML (optional)
      # @param shortcut [String] Keyboard shortcut display (e.g., "⌘1")
      # @param active [Boolean] Whether this item is currently active
      # @param disabled [Boolean] Whether this item is disabled
      # @param badge [String] Optional badge text (e.g., count)
      # @param classes [String] Additional CSS classes
      def initialize(label:, href: "#", icon: nil, shortcut: nil, active: false, disabled: false, badge: nil, classes: nil)
        super()
        @label = label
        @href = href
        @icon = icon
        @shortcut = shortcut
        @active = active
        @disabled = disabled
        @badge = badge
        @classes = classes
      end

      def item_classes
        base = "group w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm"
        state_classes = if @disabled
                          "text-neutral-400 cursor-not-allowed opacity-50 dark:text-neutral-500"
                        elsif @active
                          "text-neutral-900 bg-neutral-100 dark:text-neutral-100 dark:bg-neutral-700/50"
                        else
                          "text-neutral-700 hover:bg-neutral-100 focus-visible:bg-neutral-100 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-100 dark:hover:bg-neutral-700/50 dark:focus-visible:bg-neutral-700/50"
                        end

        [base, state_classes, @classes].compact.reject(&:empty?).join(" ")
      end

      def collapsed_item_classes
        base = "flex h-8 w-8.5 items-center justify-center rounded-lg"
        state_classes = if @disabled
                          "text-neutral-400 cursor-not-allowed opacity-50 dark:text-neutral-500"
                        elsif @active
                          "text-neutral-900 bg-neutral-100 dark:text-neutral-100 dark:bg-neutral-800"
                        else
                          "text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:bg-neutral-100 disabled:opacity-50 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800"
                        end

        [base, state_classes].join(" ")
      end

      def render?
        @label.present?
      end

      def icon?
        @icon.present?
      end

      def shortcut?
        @shortcut.present?
      end

      def badge?
        @badge.present?
      end

      attr_reader :label, :href, :icon, :shortcut, :active, :disabled, :badge
    end
  end
end
