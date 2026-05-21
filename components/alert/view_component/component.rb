# frozen_string_literal: true

module Alert
  class Component < ViewComponent::Base
    VARIANTS = %i[success error warning info neutral].freeze

    # @param title [String] The alert title/heading
    # @param description [String] Optional description text (can include HTML)
    # @param variant [Symbol] Alert type: :success, :error, :warning, :info, :neutral
    # @param show_icon [Boolean] Whether to show the icon
    # @param custom_icon [String] Optional custom icon HTML/SVG (overrides variant icon)
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(title:, description: nil, variant: :success, show_icon: true, custom_icon: nil, classes: nil)
      super()
      @title = title
      @description = description
      @variant = VARIANTS.include?(variant) ? variant : :success
      @show_icon = show_icon
      @custom_icon = custom_icon
      @classes = classes
    end

    def wrapper_classes
      base = "rounded-xl border p-4"
      [base, colors[:border], colors[:bg], @classes].compact.reject(&:empty?).join(" ")
    end

    def layout_classes
      @description.present? ? "grid grid-cols-[auto_1fr] gap-2 items-start" : "flex gap-2 items-center"
    end

    def colors
      @colors ||= case @variant
                  when :success
                    {
                      border: "border-green-200 dark:border-green-800",
                      bg: "bg-green-50 dark:bg-green-900/20",
                      icon: "text-green-500 dark:text-green-400",
                      title: "text-green-800 dark:text-green-200",
                      text: "text-green-700 dark:text-green-300"
                    }
                  when :error
                    {
                      border: "border-red-200 dark:border-red-800",
                      bg: "bg-red-50 dark:bg-red-900/20",
                      icon: "text-red-500 dark:text-red-400",
                      title: "text-red-800 dark:text-red-200",
                      text: "text-red-700 dark:text-red-300"
                    }
                  when :warning
                    {
                      border: "border-amber-200 dark:border-amber-800",
                      bg: "bg-amber-50 dark:bg-amber-900/20",
                      icon: "text-amber-500 dark:text-amber-400",
                      title: "text-amber-800 dark:text-amber-200",
                      text: "text-amber-700 dark:text-amber-300"
                    }
                  when :info
                    {
                      border: "border-blue-200 dark:border-blue-800",
                      bg: "bg-blue-50 dark:bg-blue-900/20",
                      icon: "text-blue-500 dark:text-blue-400",
                      title: "text-blue-800 dark:text-blue-200",
                      text: "text-blue-700 dark:text-blue-300"
                    }
                  when :neutral
                    {
                      border: "border-neutral-200 dark:border-neutral-700",
                      bg: "bg-neutral-50 dark:bg-neutral-800/50",
                      icon: "text-neutral-500 dark:text-neutral-400",
                      title: "text-neutral-800 dark:text-neutral-200",
                      text: "text-neutral-600 dark:text-neutral-400"
                    }
                  else
                    {
                      border: "border-neutral-200 dark:border-neutral-700",
                      bg: "bg-neutral-50 dark:bg-neutral-800",
                      icon: "text-neutral-500 dark:text-neutral-400",
                      title: "text-neutral-800 dark:text-neutral-200",
                      text: "text-neutral-700 dark:text-neutral-300"
                    }
                  end
    end

    def icon_svg
      return @custom_icon.html_safe if @custom_icon.present?

      case @variant
      when :success then success_icon
      when :error then error_icon
      when :warning then warning_icon
      when :info, :neutral then info_icon
      else ""
      end
    end

    private

    def svg_group_attrs
      { fill: "none", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "1.5", stroke: "currentColor" }
    end

    def success_icon
      tag.svg(xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 18 18") do
        tag.g(**svg_group_attrs) do
          concat tag.circle(cx: "9", cy: "9", r: "7.25")
          concat tag.polyline(points: "5.75 9.25 8 11.75 12.25 6.25")
        end
      end
    end

    def error_icon
      tag.svg(xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 18 18") do
        tag.g(**svg_group_attrs) do
          concat tag.circle(cx: "9", cy: "9", r: "7.25")
          concat tag.path(d: "M9 5.75V9.25")
          concat tag.path(d: "M9 12.5C8.448 12.5 8 12.05 8 11.5C8 10.95 8.448 10.5 9 10.5C9.552 10.5 10 10.95 10 11.5C10 12.05 9.552 12.5 9 12.5Z", fill: "currentColor", 'data-stroke': "none", stroke: "none")
        end
      end
    end

    def warning_icon
      tag.svg(xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 18 18") do
        tag.g(**svg_group_attrs) do
          concat tag.path(d: "M7.63796 3.48996L2.21295 12.89C1.60795 13.9399 2.36395 15.25 3.57495 15.25H14.425C15.636 15.25 16.392 13.9399 15.787 12.89L10.362 3.48996C9.75696 2.44996 8.24296 2.44996 7.63796 3.48996Z")
          concat tag.path(d: "M9 6.75V9.75")
          concat tag.path(d: "M9 13.5C8.448 13.5 8 13.05 8 12.5C8 11.95 8.448 11.5 9 11.5C9.552 11.5 10 11.9501 10 12.5C10 13.0499 9.552 13.5 9 13.5Z", fill: "currentColor", 'data-stroke': "none", stroke: "none")
        end
      end
    end

    def info_icon
      tag.svg(xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 18 18") do
        tag.g(**svg_group_attrs) do
          concat tag.path(d: "M9 16.25C13.004 16.25 16.25 13.004 16.25 9C16.25 4.996 13.004 1.75 9 1.75C4.996 1.75 1.75 4.996 1.75 9C1.75 13.004 4.996 16.25 9 16.25Z")
          concat tag.path(d: "M9 12.75V9.25C9 8.9739 8.7761 8.75 8.5 8.75H7.75")
          concat tag.path(d: "M9 6.75C8.448 6.75 8 6.301 8 5.75C8 5.199 8.448 4.75 9 4.75C9.552 4.75 10 5.199 10 5.75C10 6.301 9.552 6.75 9 6.75Z", fill: "currentColor", 'data-stroke': "none", stroke: "none")
        end
      end
    end
  end
end
