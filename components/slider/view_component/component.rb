# frozen_string_literal: true

module Slider
  # Slider and range slider driven by the `slider` Stimulus controller.
  #
  #   <%= render Slider::Component.new(name: "volume", value: 40, label: "Volume") %>
  #
  #   <%= render Slider::Component.new(form: f, attribute: :budget, label: "Monthly budget",
  #         min: 100, max: 2000, step: 50, format: { style: "currency", currency: "USD", maximumFractionDigits: 0 }) %>
  #
  #   <%= render Slider::Component.new(form: f, attribute: %i[price_min price_max], label: "Price",
  #         max: 1200, step: 50, min_distance: 50, thumb_labels: ["Minimum price", "Maximum price"]) %>
  #
  # Two values (or two names, or two attributes) make a range slider. The thumb
  # positions are rendered on the server, so the slider is drawn in place before
  # JavaScript loads, and each thumb writes to a hidden input that submits with
  # the form.
  class Component < ViewComponent::Base
    SIZES = %i[sm md lg].freeze
    VARIANTS = %i[default fluid].freeze
    ORIENTATIONS = %i[horizontal vertical].freeze
    TOOLTIPS = [false, true, :auto].freeze

    # Thumb size, rail thickness and the padding of half a thumb that keeps the
    # thumb inside the track at 0% and 100%. Full class names, so Tailwind sees them.
    SIZE_CLASSES = {
      sm: { thumb: "size-4", track: "h-4", rail: "h-1", pad: "px-2", rail_inset: "-inset-x-2", fill_start: "-start-2", marks: "mx-2",
            v_track: "w-4", v_rail: "w-1", v_pad: "py-2", v_rail_inset: "-inset-y-2", v_fill_start: "-bottom-2" },
      md: { thumb: "size-5", track: "h-5", rail: "h-1.5", pad: "px-2.5", rail_inset: "-inset-x-2.5", fill_start: "-start-2.5", marks: "mx-2.5",
            v_track: "w-5", v_rail: "w-1.5", v_pad: "py-2.5", v_rail_inset: "-inset-y-2.5", v_fill_start: "-bottom-2.5" },
      lg: { thumb: "size-6", track: "h-6", rail: "h-2", pad: "px-3", rail_inset: "-inset-x-3", fill_start: "-start-3", marks: "mx-3",
            v_track: "w-6", v_rail: "w-2", v_pad: "py-3", v_rail_inset: "-inset-y-3", v_fill_start: "-bottom-3" }
    }.freeze

    CURRENCY_UNITS = { "USD" => "$", "EUR" => "€", "GBP" => "£", "JPY" => "¥", "CAD" => "CA$", "AUD" => "A$" }.freeze
    ZERO_DECIMAL_CURRENCIES = %w[JPY KRW].freeze
    UNIT_SUFFIXES = {
      "percent" => "%", "degree" => "°", "celsius" => "°C", "fahrenheit" => "°F",
      "kilobyte" => " kB", "megabyte" => " MB", "gigabyte" => " GB", "terabyte" => " TB",
      "second" => " sec", "minute" => " min", "hour" => " hr", "day" => " days",
      "meter" => " m", "kilometer" => " km", "kilogram" => " kg", "pixel" => " px"
    }.freeze

    # Content before and after the track, such as icon buttons. Inside the
    # controller, so `data-action="click->slider#decrement"` works there.
    renders_one :leading
    renders_one :trailing

    # @param name [String, Array<String>] Input name, or two names for a range
    # @param value [Numeric, Array<Numeric>] Starting value, or two values for a range
    # @param form [ActionView::Helpers::FormBuilder] Builds the names and reads the values from the form object
    # @param attribute [Symbol, Array<Symbol>] Form attribute, or two for a range (with form:)
    # @param min [Numeric] Lowest value
    # @param max [Numeric] Highest value
    # @param step [Numeric] Values snap to multiples of the step
    # @param large_step [Numeric] Page Up / Page Down and Shift + arrows (default: 10% of the range)
    # @param min_distance [Numeric] Smallest gap between the two thumbs of a range
    # @param label [String] Visible label. Also names the thumb (single) or the group (range)
    # @param hide_label [Boolean] Keep the label for screen readers only
    # @param output [Boolean] Show the formatted value next to the label
    # @param format [Hash] Intl.NumberFormat options, e.g. { style: "currency", currency: "USD" }
    # @param labels [Array<String>] A name for each step, e.g. %w[Low Medium High]
    # @param marks [Boolean] Show the step labels under the track as clickable shortcuts
    # @param value_text [String] Screen reader text with {value}, e.g. "{value} decibels"
    # @param tooltip [Boolean, Symbol] true shows the value above each thumb, :auto only on hover, focus and drag
    # @param thumb_labels [Array<String>] Accessible names of the two thumbs of a range
    # @param hint [String] Help text under the slider, linked with aria-describedby
    # @param size [Symbol] :sm, :md or :lg
    # @param variant [Symbol] :default, or :fluid (a thick bar with the label inside, single value only)
    # @param orientation [Symbol] :horizontal or :vertical
    # @param track_length [String] Height class of a vertical track (default "h-40")
    # @param disabled [Boolean] Ignores input and leaves the inputs out of the form
    # @param rubber_band [Boolean] Stretch when dragged past an end (on by default for :fluid)
    # @param classes [String] Extra classes for the root element
    # Any other keyword (id:, data:, aria:…) goes on the root element; `data:` merges with the controller's attributes.
    def initialize(name: nil, value: nil, form: nil, attribute: nil, min: 0, max: 100, step: 1, large_step: nil,
                   min_distance: nil, label: nil, hide_label: false, output: true, format: nil, labels: nil,
                   marks: false, value_text: nil, tooltip: false, thumb_labels: nil, hint: nil, size: :md,
                   variant: :default, orientation: :horizontal, track_length: nil, disabled: false,
                   rubber_band: nil, classes: nil, **html_options)
      super()
      @size = validate!(:size, size, SIZES)
      @variant = validate!(:variant, variant, VARIANTS)
      @orientation = validate!(:orientation, orientation, ORIENTATIONS)
      @tooltip = tooltip.is_a?(Symbol) || tooltip.is_a?(String) ? tooltip.to_sym : tooltip
      raise ArgumentError, "Slider::Component tooltip must be true, false or :auto (got #{tooltip.inspect})" unless TOOLTIPS.include?(@tooltip)

      @min = min
      @max = max
      @step = step
      raise ArgumentError, "Slider::Component max (#{max}) must be greater than min (#{min})" unless max > min
      raise ArgumentError, "Slider::Component step must be positive (got #{step})" unless step.positive?

      @large_step = large_step
      @min_distance = min_distance
      @label = label
      @hide_label = hide_label
      @output = output
      @format = (format || {}).to_h.transform_keys(&:to_s)
      @labels = labels&.map(&:to_s)
      @marks = marks
      @value_text = value_text
      @thumb_labels = thumb_labels
      @hint = hint
      @track_length = track_length
      @disabled = disabled
      @rubber_band = rubber_band.nil? ? fluid? : rubber_band
      @classes = classes
      @html_options = html_options

      @names, values = resolve_fields(name: name, value: value, form: form, attribute: attribute)
      @values = normalize_values(values)
      raise ArgumentError, "Slider::Component :fluid is for a single value" if fluid? && range?
      raise ArgumentError, "Slider::Component :fluid is horizontal only" if fluid? && vertical?
      raise ArgumentError, "Slider::Component :fluid needs a label (it is drawn inside the bar)" if fluid? && @label.blank?
    end

    def range?
      @values.size == 2
    end

    def vertical?
      @orientation == :vertical
    end

    def fluid?
      @variant == :fluid
    end

    def disabled?
      @disabled
    end

    # The value as the first paint shows it. The controller re-formats it with
    # Intl.NumberFormat on connect; this Ruby version mirrors the common options.
    def display(value)
      if @labels.present?
        label = @labels[((value - @min) / @step.to_f).round]
        return label if label
      end

      format_number(value)
    end

    def output_text
      @values.map { |value| display(value) }.join(" – ")
    end

    private

    # ── Fields and values ──────────────────────────────────────────────────

    def resolve_fields(name:, value:, form:, attribute:)
      if form && attribute
        attributes = Array(attribute)
        names = attributes.map { |attr| form.field_name(attr) }
        values = value.nil? ? attributes.map { |attr| form.object&.public_send(attr) if form.object.respond_to?(attr) } : Array(value)
        [names, values]
      else
        [Array(name).compact.map(&:to_s), Array(value)]
      end
    end

    def normalize_values(values)
      count = [values.size, @names.size, 1].max
      raise ArgumentError, "Slider::Component takes one or two values (got #{count})" if count > 2

      defaults = count == 2 ? [@min, @max] : [@min]
      Array.new(count) { |index| snap(number(values[index]) || defaults[index]) }.sort
    end

    def number(value)
      return nil if value.nil? || value == ""

      result = value.is_a?(Numeric) ? value : Float(value.to_s, exception: false)
      result && (result.to_f % 1).zero? ? result.to_i : result&.to_f
    end

    def snap(value)
      snapped = @min + (((value - @min) / @step.to_f).round * @step)
      snapped = snapped.clamp(@min, @max)
      decimals = [decimals_of(@step), decimals_of(@min)].max
      decimals.zero? ? snapped.round.to_i : snapped.round(decimals)
    end

    def decimals_of(number)
      number.to_s.split(".")[1].to_s.length
    end

    def percent(value)
      ((value - @min) * 100.0 / (@max - @min)).round(4)
    end

    # ── Formatting (mirrors Intl.NumberFormat for the first paint) ─────────

    def format_number(value)
      style = @format["style"]
      currency = @format["currency"].to_s.upcase
      default_digits = if style == "currency"
                         ZERO_DECIMAL_CURRENCIES.include?(currency) ? 0 : 2
                       end
      max_digits = @format["maximumFractionDigits"] || default_digits || [decimals_of(@step), 3].min
      # Like Intl, a default minimum never exceeds the maximum that was asked for.
      min_digits = @format["minimumFractionDigits"] || [default_digits || 0, max_digits].min
      amount = style == "percent" ? value * 100 : value

      text = ActiveSupport::NumberHelper.number_to_rounded(amount.abs, precision: max_digits, delimiter: ",",
                                                                       strip_insignificant_zeros: min_digits < max_digits)
      text = pad_decimals(text, min_digits)
      text = case style
             when "currency" then "#{CURRENCY_UNITS.fetch(currency, "#{currency} ")}#{text}"
             when "percent" then "#{text}%"
             when "unit" then "#{text}#{UNIT_SUFFIXES.fetch(@format['unit'].to_s, " #{@format['unit']}")}"
             else text
             end
      "#{sign(amount)}#{text}"
    end

    def pad_decimals(text, min_digits)
      return text if min_digits.zero?

      whole, decimals = text.split(".")
      "#{whole}.#{decimals.to_s.ljust(min_digits, '0')}"
    end

    def sign(amount)
      return "-" if amount.negative? && @format["signDisplay"] != "never"
      return "+" if amount.positive? && %w[always exceptZero].include?(@format["signDisplay"])

      ""
    end

    # ── Root element ───────────────────────────────────────────────────────

    def validate!(name, value, allowed)
      symbol = value.to_s.to_sym
      return symbol if allowed.include?(symbol)

      raise ArgumentError, "Slider::Component #{name} must be one of #{allowed.map(&:inspect).join(', ')} (got #{value.inspect})"
    end

    def root_options
      user_data = (@html_options[:data] || {}).dup
      controllers = ["slider", user_data.delete(:controller)].compact.join(" ")
      options = @html_options.except(:data, :class, :style).merge(
        class: ["group/slider", root_layout, @classes, @html_options[:class]].compact_blank.join(" "),
        style: [root_style, @html_options[:style]].compact_blank.join("; "),
        data: controller_data.merge(user_data).merge(controller: controllers)
      )
      options["data-disabled"] = "" if disabled?
      if range?
        options[:role] = "group"
        options[:'aria-labelledby'] = label_id if @label.present?
      end
      options
    end

    def root_layout
      return "flex w-10 flex-col items-center gap-2" if vertical?

      "w-full"
    end

    def root_style
      start = range? ? percent(@values.first) : 0
      "--slider-start: #{start}%; --slider-end: #{percent(@values.last)}%"
    end

    def controller_data
      data = {}
      data[:slider_min_value] = @min unless @min.zero?
      data[:slider_max_value] = @max unless @max == 100
      data[:slider_step_value] = @step unless @step == 1
      data[:slider_large_step_value] = @large_step if @large_step
      data[:slider_min_distance_value] = @min_distance if @min_distance
      data[:slider_orientation_value] = "vertical" if vertical?
      data[:slider_disabled_value] = true if disabled?
      data[:slider_rubber_band_value] = true if @rubber_band
      data[:slider_format_value] = @format.to_json if @format.present?
      data[:slider_labels_value] = @labels.to_json if @labels.present?
      data[:slider_value_text_value] = @value_text if @value_text.present?
      data
    end

    # ── Ids and labels ─────────────────────────────────────────────────────

    def dom_key
      @dom_key ||= "slider-#{SecureRandom.hex(4)}"
    end

    def label_id
      "#{dom_key}-label"
    end

    def hint_id
      "#{dom_key}-hint"
    end

    def label_row?
      (@label.present? && !@hide_label && !fluid?) || (@output && !fluid? && !vertical?)
    end

    def label_classes
      base = "text-sm font-medium text-neutral-900 dark:text-neutral-100"
      @hide_label ? "sr-only" : base
    end

    def thumb_aria(index)
      aria = {}
      if range?
        aria[:label] = Array(@thumb_labels)[index] || (index.zero? ? "Minimum" : "Maximum")
      elsif @label.present?
        aria[:labelledby] = label_id
      end
      aria[:describedby] = hint_id if @hint.present?
      aria[:valuenow] = @values[index]
      aria
    end

    def mark_alignment(index)
      return "" if index.zero?
      return "-translate-x-full rtl:translate-x-full" if index == @labels.size - 1

      "-translate-x-1/2 rtl:translate-x-1/2"
    end

    def mark_position(index)
      (index * 100.0 / (@labels.size - 1)).round(4)
    end

    def show_marks?
      @marks && @labels.present? && @labels.size > 1 && !vertical? && !fluid?
    end

    # ── Classes ────────────────────────────────────────────────────────────

    def sizes
      SIZE_CLASSES.fetch(@size)
    end

    def row?
      leading? || trailing?
    end

    def track_classes
      common = "relative cursor-pointer group-data-[disabled]/slider:cursor-not-allowed group-data-[disabled]/slider:opacity-50"
      if vertical?
        [common, sizes[:v_track], @track_length.presence || "h-40", "touch-pan-x", sizes[:v_pad],
         "before:absolute before:-inset-x-3 before:inset-y-0"].join(" ")
      else
        [common, sizes[:track], "touch-pan-y", sizes[:pad], "before:absolute before:-inset-y-3 before:inset-x-0", ("min-w-0 flex-1" if row?)].compact.join(" ")
      end
    end

    def rail_classes
      colors = "rounded-full bg-neutral-200 dark:bg-neutral-700 forced-colors:forced-color-adjust-none forced-colors:bg-[GrayText]"
      if vertical?
        "absolute #{sizes[:v_rail_inset]} left-1/2 #{sizes[:v_rail]} -translate-x-1/2 #{colors}"
      else
        "absolute #{sizes[:rail_inset]} top-1/2 #{sizes[:rail]} -translate-y-1/2 #{colors}"
      end
    end

    def fill_classes
      colors = "bg-neutral-800 dark:bg-neutral-100 group-data-[jumping]/slider:[transition:inset_200ms_cubic-bezier(0.23,1,0.32,1)] " \
               "forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:group-data-[disabled]/slider:bg-[GrayText]"
      if vertical?
        from = range? ? "bottom-[var(--slider-start)]" : "#{sizes[:v_fill_start]} rounded-b-full"
        "absolute #{from} top-[calc(100%-var(--slider-end))] left-1/2 #{sizes[:v_rail]} -translate-x-1/2 #{colors}"
      else
        from = range? ? "start-[var(--slider-start)]" : "#{sizes[:fill_start]} rounded-s-full"
        "absolute #{from} end-[calc(100%-var(--slider-end))] top-1/2 #{sizes[:rail]} -translate-y-1/2 #{colors}"
      end
    end

    def thumb_classes
      position = if vertical?
                   "bottom-[var(--slider-position)] left-1/2 -translate-x-1/2 translate-y-1/2"
                 else
                   "start-[var(--slider-position)] top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
                 end
      "group/thumb absolute #{position} #{sizes[:thumb]} cursor-grab rounded-full outline-0 outline-offset-2 outline-neutral-600 " \
        "data-[active]:cursor-grabbing data-[focus-visible]:outline-2 group-data-[jumping]/slider:[transition:inset_200ms_cubic-bezier(0.23,1,0.32,1)] " \
        "group-data-[disabled]/slider:cursor-not-allowed dark:outline-neutral-200 forced-colors:outline-[CanvasText]"
    end

    # The knob scales on hover and press; the thumb around it (and a tooltip) does not.
    def knob_classes
      "block size-full rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25),0_0_0_1px_rgb(0_0_0/0.08)] " \
        "transition-[scale,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/thumb:scale-110 " \
        "group-data-[active]/thumb:scale-95 group-data-[active]/thumb:shadow-[0_1px_3px_rgb(0_0_0/0.25),0_0_0_1px_rgb(0_0_0/0.08),0_0_0_6px_rgb(0_0_0/0.08)] " \
        "dark:group-data-[active]/thumb:shadow-[0_1px_3px_rgb(0_0_0/0.25),0_0_0_1px_rgb(0_0_0/0.08),0_0_0_6px_rgb(255_255_255/0.14)] " \
        "group-data-[disabled]/slider:scale-100 motion-reduce:transition-none " \
        "forced-colors:forced-color-adjust-none forced-colors:bg-[CanvasText] forced-colors:group-data-[disabled]/slider:bg-[GrayText]"
    end

    def tooltip_classes
      visibility = if @tooltip == :auto
                     "opacity-0 transition-opacity duration-150 ease-out pointer-fine:group-hover/thumb:opacity-100 " \
                       "group-data-[active]/thumb:opacity-100 group-data-[focus-visible]/thumb:opacity-100 motion-reduce:transition-none"
                   else
                     ""
                   end
      "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-neutral-900 px-1.5 py-1 text-center " \
      "text-xs font-medium whitespace-nowrap text-white tabular-nums shadow-sm dark:bg-white dark:text-neutral-900 " \
      "forced-colors:border forced-colors:border-[CanvasText] #{visibility}".strip
    end
  end
end
