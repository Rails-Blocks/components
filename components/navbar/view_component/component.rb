# frozen_string_literal: true

module Navbar
  class Component < ViewComponent::Base
    VARIANTS = %i[default bordered transparent].freeze

    renders_one :logo
    renders_one :actions

    renders_many :items, lambda { |label:, href: nil, dropdown: false, content_id: nil, align: :center, mobile_hidden: false, classes: nil, &block|
      Navbar::Component::ItemComponent.new(
        label: label,
        href: href,
        dropdown: dropdown,
        content_id: content_id,
        align: align,
        mobile_hidden: mobile_hidden,
        classes: classes,
        &block
      )
    }

    renders_many :dropdown_contents, lambda { |id:, width: nil, columns: 1, classes: nil|
      Navbar::Component::DropdownContentComponent.new(
        id: id,
        width: width,
        columns: columns,
        classes: classes
      )
    }

    # @param variant [Symbol] Style variant: :default, :bordered, :transparent
    # @param sticky [Boolean] Whether navbar sticks to top on scroll
    # @param show_mobile_menu [Boolean] Whether to show mobile hamburger menu
    # @param mobile_menu_content_id [String] Content ID for mobile menu dropdown
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(variant: :default, sticky: false, show_mobile_menu: true, mobile_menu_content_id: "mobile-menu-content", classes: nil)
      super()
      @variant = VARIANTS.include?(variant) ? variant : :default
      @sticky = sticky
      @show_mobile_menu = show_mobile_menu
      @mobile_menu_content_id = mobile_menu_content_id
      @classes = classes
    end

    def nav_classes
      base = "flex w-fit justify-center"
      sticky_class = @sticky ? "sticky top-0 z-50" : ""
      [base, sticky_class, @classes].compact.reject(&:empty?).join(" ")
    end

    def menu_classes
      base = "m-0 flex list-none items-center gap-1 p-1"

      variant_class = case @variant
                      when :bordered
                        "rounded-lg border border-neutral-200 bg-white shadow dark:border-neutral-700 dark:bg-neutral-800"
                      when :transparent
                        "bg-transparent"
                      else
                        "rounded-lg border border-neutral-200 bg-white shadow dark:border-neutral-700 dark:bg-neutral-800"
                      end

      [base, variant_class].join(" ")
    end

    def viewport_classes
      "absolute top-full z-50 mt-2 origin-top transition-all duration-200 ease-out " \
        "data-[state=closed]:pointer-events-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 " \
        "data-[state=closing]:pointer-events-none data-[state=closing]:scale-95 data-[state=closing]:opacity-0 " \
        "data-[state=open]:pointer-events-auto data-[state=open]:scale-100 data-[state=open]:opacity-100 " \
        "left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0"
    end

    def indicator_classes
      "pointer-events-none absolute -top-1 z-10 flex h-2 w-10 items-end justify-center overflow-visible transition-opacity duration-200"
    end

    def background_classes
      "relative z-0 rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
    end

    def mobile_menu_button_classes
      "group flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-neutral-700 select-none " \
        "hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 " \
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 dark:focus-visible:outline-neutral-200"
    end

    def hamburger_icon
      tag.svg(
        xmlns: "http://www.w3.org/2000/svg",
        width: "18",
        height: "18",
        viewBox: "0 0 18 18"
      ) do
        tag.g(
          fill: "none",
          'stroke-linecap': "round",
          'stroke-linejoin': "round",
          'stroke-width': "1.5",
          stroke: "currentColor"
        ) do
          safe_join([
                      tag.line(x1: "2.25", y1: "9", x2: "15.75", y2: "9"),
                      tag.line(x1: "2.25", y1: "3.75", x2: "15.75", y2: "3.75"),
                      tag.line(x1: "2.25", y1: "14.25", x2: "15.75", y2: "14.25")
                    ])
        end
      end
    end

    def show_mobile_menu?
      @show_mobile_menu
    end

    attr_reader :mobile_menu_content_id
  end
end
