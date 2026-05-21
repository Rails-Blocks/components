# frozen_string_literal: true

module Sidebar
  class Component
    class SectionComponent < ViewComponent::Base
      renders_many :items, lambda { |label:, href: "#", icon: nil, badge: nil, active: false, disabled: false, classes: nil|
        Sidebar::Component::SectionItemComponent.new(
          label: label,
          href: href,
          icon: icon,
          badge: badge,
          active: active,
          disabled: disabled,
          classes: classes
        )
      }

      # @param title [String] Section header title
      # @param default_open [Boolean] Whether section is expanded by default
      # @param classes [String] Additional CSS classes
      def initialize(title:, default_open: true, classes: nil)
        super()
        @title = title
        @default_open = default_open
        @classes = classes
      end

      def section_classes
        base = "group/options mb-4 px-1.5 sm:px-2"
        [base, @classes].compact.reject(&:empty?).join(" ")
      end

      def summary_classes
        "flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 focus-visible:bg-neutral-100 focus:outline-hidden [&::-webkit-details-marker]:hidden dark:text-neutral-100 dark:hover:bg-neutral-700/50 dark:focus-visible:bg-neutral-700/50"
      end

      attr_reader :title, :default_open
    end
  end
end
