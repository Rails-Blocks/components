# frozen_string_literal: true

module Banner
  class Component < ViewComponent::Base
    POSITIONS = %i[top bottom floating].freeze
    VARIANTS = %i[default info warning success promotional].freeze
    POSITION_CLASSES = {
      top: "fixed top-0 left-0 right-0 z-50 -translate-y-full",
      bottom: "fixed bottom-0 left-0 right-0 z-50 translate-y-full",
      floating: "fixed bottom-4 left-1/2 z-50 w-full max-w-2xl mx-auto px-4 -translate-x-1/2 translate-y-full"
    }.freeze

    # @param title [String] The banner title/message
    # @param description [String] Optional description text
    # @param position [Symbol] Banner position: :top, :bottom, :floating
    # @param variant [Symbol] Visual variant: :default, :info, :warning, :success, :promotional
    # @param dismissible [Boolean] Whether the banner can be dismissed
    # @param sticky [Boolean] Whether the banner is fixed position
    # @param show_icon [Boolean] Whether to show an icon
    # @param custom_icon [String] Optional custom icon HTML/SVG
    # @param action_text [String] Optional CTA button text
    # @param action_url [String] Optional CTA button URL
    # @param cookie_name [String] Cookie name for dismissal persistence
    # @param cookie_days [Integer] How long to persist dismissal (-1 = no cookie, 0 = session, >0 = days)
    # @param countdown_end_time [String] ISO 8601 date string for countdown timer
    # @param auto_hide [Boolean] Auto hide after countdown expires
    # @param classes [String] Additional CSS classes
    def initialize(
      title:,
      description: nil,
      position: :top,
      variant: :default,
      dismissible: true,
      sticky: true,
      show_icon: true,
      custom_icon: nil,
      action_text: nil,
      action_url: nil,
      cookie_name: "banner_dismissed",
      cookie_days: -1,
      countdown_end_time: nil,
      auto_hide: false,
      classes: nil
    )
      super()
      @title = title
      @description = description
      @position = POSITIONS.include?(position) ? position : :top
      @variant = VARIANTS.include?(variant) ? variant : :default
      @dismissible = dismissible
      @sticky = sticky
      @show_icon = show_icon
      @custom_icon = custom_icon
      @action_text = action_text
      @action_url = action_url
      @cookie_name = cookie_name
      @cookie_days = cookie_days
      @countdown_end_time = countdown_end_time
      @auto_hide = auto_hide
      @classes = classes
    end

    def wrapper_classes
      base = "hidden transition-all duration-300 ease-in-out opacity-0"
      position_classes = POSITION_CLASSES[@position]
      position_classes = "" unless @sticky

      [base, position_classes, variant_border_classes, variant_bg_classes, @classes].compact.reject(&:empty?).join(" ")
    end

    def inner_classes
      case @position
      when :floating
        "relative bg-gradient-to-br #{variant_gradient_classes} rounded-2xl shadow-lg overflow-hidden border #{variant_border_classes}"
      else
        "border-b #{variant_border_classes} shadow-xs"
      end
    end

    def variant_bg_classes
      return "" if @position == :floating

      case @variant
      when :info
        "bg-blue-50 dark:bg-blue-900/20"
      when :warning
        "bg-amber-50 dark:bg-amber-900/20"
      when :success
        "bg-green-50 dark:bg-green-900/20"
      when :promotional
        "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
      else
        "bg-white dark:bg-neutral-900"
      end
    end

    def variant_border_classes
      case @variant
      when :info
        "border-blue-200 dark:border-blue-800"
      when :warning
        "border-amber-200 dark:border-amber-800"
      when :success
        "border-green-200 dark:border-green-800"
      when :promotional
        "border-red-200 dark:border-red-800"
      else
        "border-black/10 dark:border-white/10"
      end
    end

    def variant_gradient_classes
      case @variant
      when :info
        "from-blue-50 via-blue-25 to-blue-100 dark:from-blue-900/50 dark:via-blue-950 dark:to-blue-900/30"
      when :warning
        "from-amber-50 via-amber-25 to-amber-100 dark:from-amber-900/50 dark:via-amber-950 dark:to-amber-900/30"
      when :success
        "from-green-50 via-green-25 to-green-100 dark:from-green-900/50 dark:via-green-950 dark:to-green-900/30"
      when :promotional
        "from-red-50 via-orange-25 to-orange-100 dark:from-red-900/50 dark:via-orange-950 dark:to-orange-900/30"
      else
        "from-white via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-black"
      end
    end

    def variant_text_classes
      case @variant
      when :info
        "text-blue-800 dark:text-blue-200"
      when :warning
        "text-amber-800 dark:text-amber-200"
      when :success
        "text-green-800 dark:text-green-200"
      when :promotional
        "text-red-800 dark:text-red-200"
      else
        "text-neutral-900 dark:text-white"
      end
    end

    def variant_description_classes
      case @variant
      when :info
        "text-blue-700 dark:text-blue-300"
      when :warning
        "text-amber-700 dark:text-amber-300"
      when :success
        "text-green-700 dark:text-green-300"
      when :promotional
        "text-red-700 dark:text-red-300"
      else
        "text-neutral-600 dark:text-neutral-400"
      end
    end

    def variant_icon_classes
      case @variant
      when :info
        "text-blue-500 dark:text-blue-400"
      when :warning
        "text-amber-500 dark:text-amber-400"
      when :success
        "text-green-500 dark:text-green-400"
      when :promotional
        "text-red-500 dark:text-red-400"
      else
        "text-neutral-700 dark:text-neutral-300"
      end
    end

    def icon_bg_classes
      case @variant
      when :info
        "bg-blue-100 dark:bg-blue-800/50"
      when :warning
        "bg-amber-100 dark:bg-amber-800/50"
      when :success
        "bg-green-100 dark:bg-green-800/50"
      when :promotional
        "bg-gradient-to-br from-red-500/20 to-orange-500/20"
      else
        "bg-neutral-100 dark:bg-neutral-800"
      end
    end

    def controller_data
      data_attributes = {
        controller: "banner",
        banner_cookie_name_value: @cookie_name,
        banner_cookie_days_value: @cookie_days
      }
      data_attributes[:banner_countdown_end_time_value] = @countdown_end_time if @countdown_end_time.present?
      data_attributes[:banner_auto_hide_value] = @auto_hide if @auto_hide

      { data: data_attributes }
    end

    def icon_svg
      return @custom_icon.html_safe if @custom_icon.present?

      case @variant
      when :info then info_icon
      when :warning then warning_icon
      when :success then success_icon
      when :promotional then promotional_icon
      else default_icon
      end
    end

    def countdown?
      @countdown_end_time.present?
    end

    def floating?
      @position == :floating
    end

    private

    def default_icon
      tag.svg(xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", 'stroke-width': "2", 'stroke-linecap': "round", 'stroke-linejoin': "round", class: "opacity-90") do
        safe_join([
                    tag.path(d: "M12 2L2 7l10 5 10-5-10-5z"),
                    tag.path(d: "m2 17 10 5 10-5"),
                    tag.path(d: "m2 12 10 5 10-5")
                  ])
      end
    end

    def info_icon
      tag.svg(xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 18 18", fill: "none", stroke: "currentColor", 'stroke-width': "1.5", 'stroke-linecap': "round", 'stroke-linejoin': "round", class: "opacity-90") do
        safe_join([
                    tag.path(d: "M9 16.25C13.004 16.25 16.25 13.004 16.25 9C16.25 4.996 13.004 1.75 9 1.75C4.996 1.75 1.75 4.996 1.75 9C1.75 13.004 4.996 16.25 9 16.25Z"),
                    tag.path(d: "M9 12.75V9.25C9 8.9739 8.7761 8.75 8.5 8.75H7.75"),
                    tag.path(d: "M9 6.75C8.448 6.75 8 6.301 8 5.75C8 5.199 8.448 4.75 9 4.75C9.552 4.75 10 5.199 10 5.75C10 6.301 9.552 6.75 9 6.75Z", fill: "currentColor", 'data-stroke': "none", stroke: "none")
                  ])
      end
    end

    def warning_icon
      tag.svg(xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 18 18", fill: "none", stroke: "currentColor", 'stroke-width': "1.5", 'stroke-linecap': "round", 'stroke-linejoin': "round", class: "opacity-90") do
        safe_join([
                    tag.path(d: "M7.63796 3.48996L2.21295 12.89C1.60795 13.9399 2.36395 15.25 3.57495 15.25H14.425C15.636 15.25 16.392 13.9399 15.787 12.89L10.362 3.48996C9.75696 2.44996 8.24296 2.44996 7.63796 3.48996Z"),
                    tag.path(d: "M9 6.75V9.75"),
                    tag.path(d: "M9 13.5C8.448 13.5 8 13.05 8 12.5C8 11.95 8.448 11.5 9 11.5C9.552 11.5 10 11.9501 10 12.5C10 13.0499 9.552 13.5 9 13.5Z", fill: "currentColor", 'data-stroke': "none", stroke: "none")
                  ])
      end
    end

    def success_icon
      tag.svg(xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 18 18", fill: "none", stroke: "currentColor", 'stroke-width': "1.5", 'stroke-linecap': "round", 'stroke-linejoin': "round", class: "opacity-90") do
        safe_join([
                    tag.circle(cx: "9", cy: "9", r: "7.25"),
                    tag.polyline(points: "5.75 9.25 8 11.75 12.25 6.25")
                  ])
      end
    end

    def promotional_icon
      tag.svg(xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 18 18", fill: "none", stroke: "currentColor", 'stroke-width': "1.5", 'stroke-linecap': "round", 'stroke-linejoin': "round", class: "opacity-90") do
        safe_join([
                    tag.circle(cx: "7", cy: "7", r: "1", fill: "currentColor", 'data-stroke': "none", stroke: "none"),
                    tag.circle(cx: "11", cy: "11", r: "1", fill: "currentColor", 'data-stroke': "none", stroke: "none"),
                    tag.line(x1: "6.75", y1: "11.25", x2: "11.25", y2: "6.75"),
                    tag.path(d: "M14.5,9c0-.967,.784-1.75,1.75-1.75v-1.5c0-1.104-.895-2-2-2H3.75c-1.105,0-2,.896-2,2v1.5c.966,0,1.75,.783,1.75,1.75s-.784,1.75-1.75,1.75v1.5c0,1.104,.895,2,2,2H14.25c1.105,0,2-.896,2-2v-1.5c-.966,0-1.75-.783-1.75-1.75Z")
                  ])
      end
    end
  end
end
