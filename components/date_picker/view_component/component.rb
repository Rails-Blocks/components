# frozen_string_literal: true

module DatePicker
  class Component < ViewComponent::Base
    PLACEMENTS = %w[top top-start top-end bottom bottom-start bottom-end left right].freeze
    START_VIEWS = %w[days months years].freeze
    MIN_VIEWS = %w[days months years].freeze

    # @param id [String] Unique identifier for the date picker input
    # @param name [String] Name attribute for the input field
    # @param value [String, Date, Time] Initial selected date value (YYYY-MM-DD or Date/Time object)
    # @param placeholder [String] Placeholder text for the input field
    # @param range [Boolean] Enable date range selection mode
    # @param timepicker [Boolean] Enable time selection alongside date
    # @param time_only [Boolean] Show only time picker (no date selection)
    # @param week_picker [Boolean] Enable week selection mode
    # @param inline [Boolean] Display calendar inline (always visible)
    # @param date_format [String] Date display format (e.g., 'MM/dd/yyyy')
    # @param time_format [String] Time display format (e.g., 'hh:mm AA' for 12-hour)
    # @param min_date [String, Date] Minimum selectable date (YYYY-MM-DD)
    # @param max_date [String, Date] Maximum selectable date (YYYY-MM-DD)
    # @param disabled_dates [Array<String>] Array of disabled dates (YYYY-MM-DD format)
    # @param start_view [String] Initial calendar view: 'days', 'months', 'years'
    # @param min_view [String] Minimum navigable view: 'days', 'months', 'years'
    # @param placement [String] Dropdown placement relative to input
    # @param show_today_button [Boolean] Show 'Today' button in calendar
    # @param show_clear_button [Boolean] Show 'Clear' button in calendar
    # @param show_this_month_button [Boolean] Show 'This month' button
    # @param show_this_year_button [Boolean] Show 'This year' button
    # @param min_hours [Integer] Minimum selectable hour (for timepicker)
    # @param max_hours [Integer] Maximum selectable hour (for timepicker)
    # @param minutes_step [Integer] Minutes increment step (for timepicker)
    # @param readonly [Boolean] Make input readonly (default: true)
    # @param required [Boolean] Make input required
    # @param disabled [Boolean] Disable the input
    # @param show_icon [Boolean] Show calendar icon in input
    # @param input_class [String] Additional CSS classes for the input
    # @param classes [String] Additional CSS classes for the wrapper
    def initialize(
      id: nil,
      name: nil,
      value: nil,
      placeholder: "Select date...",
      range: false,
      timepicker: false,
      time_only: false,
      week_picker: false,
      inline: false,
      date_format: nil,
      time_format: nil,
      min_date: nil,
      max_date: nil,
      disabled_dates: [],
      start_view: "days",
      min_view: "days",
      placement: "bottom-start",
      show_today_button: false,
      show_clear_button: false,
      show_this_month_button: false,
      show_this_year_button: false,
      min_hours: nil,
      max_hours: nil,
      minutes_step: nil,
      readonly: true,
      required: false,
      disabled: false,
      show_icon: true,
      input_class: nil,
      classes: nil
    )
      super()
      @id = id || "date_picker_#{SecureRandom.hex(4)}"
      @name = name
      @placeholder = placeholder
      @range = range
      @timepicker = timepicker
      @time_only = time_only
      @value = format_initial_value(value)
      @week_picker = week_picker
      @inline = inline
      @date_format = date_format
      @time_format = time_format
      @min_date = format_date_value(min_date)
      @max_date = format_date_value(max_date)
      @disabled_dates = disabled_dates
      @start_view = START_VIEWS.include?(start_view) ? start_view : "days"
      @min_view = MIN_VIEWS.include?(min_view) ? min_view : "days"
      @placement = PLACEMENTS.include?(placement) ? placement : "bottom-start"
      @show_today_button = show_today_button
      @show_clear_button = show_clear_button
      @show_this_month_button = show_this_month_button
      @show_this_year_button = show_this_year_button
      @min_hours = min_hours
      @max_hours = max_hours
      @minutes_step = minutes_step
      @readonly = readonly
      @required = required
      @disabled = disabled
      @show_icon = show_icon
      @input_class = input_class
      @classes = classes
    end

    def wrapper_classes
      base = "relative"
      width = @inline ? "" : "w-full max-w-sm"
      [base, width, @classes].compact.reject(&:empty?).join(" ")
    end

    def input_classes
      base = "block w-full rounded-lg border-0 px-3 py-2 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-500 focus:ring-2 focus:ring-neutral-600 outline-hidden dark:bg-neutral-700 dark:ring-neutral-600 dark:placeholder-neutral-300 dark:text-white dark:focus:ring-neutral-500 text-base/6 sm:text-sm/6"
      padding_right = @show_icon && !@inline ? "pr-10" : ""
      hidden = @inline ? "hidden" : ""
      [base, padding_right, hidden, @input_class].compact.reject(&:empty?).join(" ")
    end

    def controller_data
      data = {
        controller: "date-picker",
        date_picker_placement_value: @placement,
        date_picker_start_view_value: @start_view,
        date_picker_min_view_value: @min_view
      }

      # Boolean values
      data[:date_picker_range_value] = true if @range
      data[:date_picker_timepicker_value] = true if @timepicker
      data[:date_picker_time_only_value] = true if @time_only
      data[:date_picker_week_picker_value] = true if @week_picker
      data[:date_picker_inline_value] = true if @inline
      data[:date_picker_show_today_button_value] = true if @show_today_button
      data[:date_picker_show_clear_button_value] = true if @show_clear_button
      data[:date_picker_show_this_month_button_value] = true if @show_this_month_button
      data[:date_picker_show_this_year_button_value] = true if @show_this_year_button

      # String values
      data[:date_picker_initial_date_value] = @value if @value.present?
      data[:date_picker_date_format_value] = @date_format if @date_format.present?
      data[:date_picker_time_format_value] = @time_format if @time_format.present?
      data[:date_picker_min_date_value] = @min_date if @min_date.present?
      data[:date_picker_max_date_value] = @max_date if @max_date.present?
      data[:date_picker_disabled_dates_value] = @disabled_dates.to_json if @disabled_dates.any?

      # Integer values
      data[:date_picker_min_hours_value] = @min_hours if @min_hours.present?
      data[:date_picker_max_hours_value] = @max_hours if @max_hours.present?
      data[:date_picker_minutes_step_value] = @minutes_step if @minutes_step.present?

      { data: data }
    end

    private

    def format_initial_value(value)
      return nil if value.blank?

      case value
      when Date
        value.strftime("%Y-%m-%d")
      when Time, DateTime
        @timepicker || @time_only ? value.strftime("%Y-%m-%d %H:%M") : value.strftime("%Y-%m-%d")
      when Array
        # For range mode with array of dates
        value.map { |v| format_initial_value(v) }.compact.to_json
      else
        value.to_s
      end
    end

    def format_date_value(value)
      return nil if value.blank?

      case value
      when Date, Time, DateTime
        value.strftime("%Y-%m-%d")
      else
        value.to_s
      end
    end
  end
end
