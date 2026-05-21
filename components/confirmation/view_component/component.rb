# frozen_string_literal: true

module Confirmation
  class Component < ViewComponent::Base
    VARIANTS = %i[danger warning info neutral].freeze

    # @param title [String] The confirmation dialog title
    # @param message [String] Optional description/warning message
    # @param confirm_text [String] Text user must type to confirm (e.g., "DELETE")
    # @param confirm_button_text [String] Label for the confirm button
    # @param cancel_button_text [String] Label for the cancel button
    # @param variant [Symbol] Visual style: :danger, :warning, :info, :neutral
    # @param show_icon [Boolean] Whether to show the variant icon (default: true)
    # @param case_sensitive [Boolean] Whether confirm text matching is case-sensitive (default: false)
    # @param input_placeholder [String] Placeholder text for the confirmation input
    # @param input_label [String] Label above the confirmation input (supports HTML)
    # @param show_card [Boolean] Wrap in card styling (default: true)
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      title:,
      message: nil,
      confirm_text: nil,
      confirm_button_text: "Confirm",
      cancel_button_text: "Cancel",
      variant: :danger,
      show_icon: true,
      case_sensitive: false,
      input_placeholder: nil,
      input_label: nil,
      show_card: true,
      classes: nil
    )
      super()
      @title = title
      @message = message
      @confirm_text = confirm_text
      @confirm_button_text = confirm_button_text
      @cancel_button_text = cancel_button_text
      @variant = VARIANTS.include?(variant) ? variant : :danger
      @show_icon = show_icon
      @case_sensitive = case_sensitive
      @input_placeholder = input_placeholder || default_placeholder
      @input_label = input_label || default_label
      @show_card = show_card
      @classes = classes
    end

    def controller_data
      data = { controller: "confirmation" }
      data[:confirmation_confirm_text_value] = @confirm_text if @confirm_text.present?
      data[:confirmation_case_sensitive_value] = true if @case_sensitive
      { data: data }
    end

    def wrapper_classes
      if @show_card
        base = "max-w-md bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl shadow-xs overflow-hidden px-4 py-5 sm:p-6"
        [base, @classes].compact.reject(&:empty?).join(" ")
      else
        @classes.to_s
      end
    end

    def colors
      @colors ||= case @variant
                  when :danger
                    {
                      border: "border-red-200 dark:border-red-800",
                      bg: "bg-red-100 dark:bg-red-900/30",
                      icon: "text-red-600 dark:text-red-400",
                      icon_bg: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
                      button: "border-red-300/30 bg-red-600 hover:bg-red-500 text-white",
                      title: "text-red-800 dark:text-red-200",
                      text: "text-red-700 dark:text-red-300"
                    }
                  when :warning
                    {
                      border: "border-amber-200 dark:border-amber-800",
                      bg: "bg-amber-100 dark:bg-amber-900/30",
                      icon: "text-amber-600 dark:text-amber-400",
                      icon_bg: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
                      button: "border-amber-300/30 bg-amber-600 hover:bg-amber-500 text-white",
                      title: "text-amber-800 dark:text-amber-200",
                      text: "text-amber-700 dark:text-amber-300"
                    }
                  when :info
                    {
                      border: "border-blue-200 dark:border-blue-800",
                      bg: "bg-blue-100 dark:bg-blue-900/30",
                      icon: "text-blue-600 dark:text-blue-400",
                      icon_bg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
                      button: "border-blue-300/30 bg-blue-600 hover:bg-blue-500 text-white",
                      title: "text-blue-800 dark:text-blue-200",
                      text: "text-blue-700 dark:text-blue-300"
                    }
                  else # neutral
                    {
                      border: "border-neutral-200 dark:border-neutral-700",
                      bg: "bg-neutral-100 dark:bg-neutral-800/50",
                      icon: "text-neutral-600 dark:text-neutral-400",
                      icon_bg: "bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700",
                      button: "border-neutral-400/30 bg-neutral-800 hover:bg-neutral-700 text-white dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100",
                      title: "text-neutral-800 dark:text-neutral-200",
                      text: "text-neutral-600 dark:text-neutral-400"
                    }
                  end
    end

    def confirm_button_classes
      base = "flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium whitespace-nowrap shadow-sm transition-all duration-100 ease-in-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:outline-neutral-200"
      [base, colors[:button]].compact.join(" ")
    end

    def cancel_button_classes
      "flex items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white/90 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-neutral-800 shadow-xs transition-all duration-100 ease-in-out select-none hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-neutral-700/50 dark:text-neutral-50 dark:hover:bg-neutral-700/75 dark:focus-visible:outline-neutral-200"
    end

    def icon_wrapper_classes
      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border #{colors[:icon_bg]}"
    end

    def icon_svg
      case @variant
      when :danger then danger_icon
      when :warning then warning_icon
      when :info then info_icon
      else neutral_icon
      end
    end

    def unique_id
      @unique_id ||= "confirmation-#{SecureRandom.hex(4)}"
    end

    attr_reader :title, :message, :confirm_text, :confirm_button_text, :cancel_button_text,
                :variant, :show_icon, :case_sensitive, :input_placeholder, :input_label, :show_card

    private

    def default_placeholder
      return "Type to confirm" unless @confirm_text.present?

      "Type #{@confirm_text} to confirm"
    end

    def default_label
      return nil unless @confirm_text.present?

      "Type <span class=\"inline rounded-md border border-black/10 bg-white px-1 py-0.5 font-mono text-neutral-800 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200\">#{@confirm_text}</span> to confirm:"
    end

    def danger_icon
      tag.svg(
        xmlns: "http://www.w3.org/2000/svg",
        class: "size-5 #{colors[:icon]}",
        width: "20",
        height: "20",
        viewBox: "0 0 20 20"
      ) do
        tag.g(fill: "currentColor") do
          tag.path(
            'fill-rule': "evenodd",
            d: "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
            'clip-rule': "evenodd"
          )
        end
      end
    end

    def warning_icon
      tag.svg(
        xmlns: "http://www.w3.org/2000/svg",
        class: "size-5 #{colors[:icon]}",
        width: "18",
        height: "18",
        viewBox: "0 0 18 18"
      ) do
        tag.g(fill: "none", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "1.5", stroke: "currentColor") do
          safe_join([
                      tag.path(d: "M7.63796 3.48996L2.21295 12.89C1.60795 13.9399 2.36395 15.25 3.57495 15.25H14.425C15.636 15.25 16.392 13.9399 15.787 12.89L10.362 3.48996C9.75696 2.44996 8.24296 2.44996 7.63796 3.48996Z"),
                      tag.path(d: "M9 6.75V9.75"),
                      tag.path(d: "M9 13.5C8.448 13.5 8 13.05 8 12.5C8 11.95 8.448 11.5 9 11.5C9.552 11.5 10 11.9501 10 12.5C10 13.0499 9.552 13.5 9 13.5Z", fill: "currentColor", 'data-stroke': "none", stroke: "none")
                    ])
        end
      end
    end

    def info_icon
      tag.svg(
        xmlns: "http://www.w3.org/2000/svg",
        class: "size-5 #{colors[:icon]}",
        width: "18",
        height: "18",
        viewBox: "0 0 18 18"
      ) do
        tag.g(fill: "none", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "1.5", stroke: "currentColor") do
          safe_join([
                      tag.path(d: "M9 16.25C13.004 16.25 16.25 13.004 16.25 9C16.25 4.996 13.004 1.75 9 1.75C4.996 1.75 1.75 4.996 1.75 9C1.75 13.004 4.996 16.25 9 16.25Z"),
                      tag.path(d: "M9 12.75V9.25C9 8.9739 8.7761 8.75 8.5 8.75H7.75"),
                      tag.path(d: "M9 6.75C8.448 6.75 8 6.301 8 5.75C8 5.199 8.448 4.75 9 4.75C9.552 4.75 10 5.199 10 5.75C10 6.301 9.552 6.75 9 6.75Z", fill: "currentColor", 'data-stroke': "none", stroke: "none")
                    ])
        end
      end
    end

    def neutral_icon
      tag.svg(
        xmlns: "http://www.w3.org/2000/svg",
        class: "size-5 #{colors[:icon]}",
        width: "18",
        height: "18",
        viewBox: "0 0 18 18"
      ) do
        tag.g(fill: "none", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "1.5", stroke: "currentColor") do
          safe_join([
                      tag.circle(cx: "9", cy: "9", r: "7.25"),
                      tag.path(d: "M9 5.75V9.25"),
                      tag.path(d: "M9 12.5C8.448 12.5 8 12.05 8 11.5C8 10.95 8.448 10.5 9 10.5C9.552 10.5 10 10.95 10 11.5C10 12.05 9.552 12.5 9 12.5Z", fill: "currentColor", 'data-stroke': "none", stroke: "none")
                    ])
        end
      end
    end
  end
end
